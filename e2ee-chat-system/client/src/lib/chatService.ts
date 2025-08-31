import { supabase, type SupabaseUser, type SupabaseMessage } from './supabase'
import { generateKeyPair, encryptMessage, decryptMessage, exportPublicKey, importPublicKey } from '../shared/cryptoUtils'
import type { User, Message } from '../shared/types'

class ChatService {
  private currentUser: User | null = null
  private keyPair: CryptoKeyPair | null = null
  private publicKeys = new Map<string, CryptoKey>()

  // Authentication
  async login(username: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Generate key pair for this session
      this.keyPair = await generateKeyPair()
      const publicKeyString = await exportPublicKey(this.keyPair.publicKey)

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      let user: SupabaseUser

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            public_key: publicKeyString,
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('username', username)
          .select()
          .single()

        if (error) throw error
        user = updatedUser
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{
            username,
            public_key: publicKeyString,
            is_online: true,
            last_seen: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        user = newUser
      }

      this.currentUser = {
        id: user.id,
        username: user.username,
        publicKey: user.public_key,
        isOnline: user.is_online,
        lastSeen: new Date(user.last_seen)
      }

      // Set up real-time subscriptions
      this.setupRealtimeSubscriptions()

      return { success: true, user: this.currentUser }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  async logout(): Promise<void> {
    if (this.currentUser) {
      await supabase
        .from('users')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', this.currentUser.id)
    }

    this.currentUser = null
    this.keyPair = null
    this.publicKeys.clear()
  }

  // User management
  async getOnlineUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true)
      .neq('id', this.currentUser?.id)

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data.map(user => ({
      id: user.id,
      username: user.username,
      publicKey: user.public_key,
      isOnline: user.is_online,
      lastSeen: new Date(user.last_seen)
    }))
  }

  // Messaging
  async sendMessage(receiverId: string, content: string): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser || !this.keyPair) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Get receiver's public key
      let receiverPublicKey = this.publicKeys.get(receiverId)
      if (!receiverPublicKey) {
        const { data: receiver } = await supabase
          .from('users')
          .select('public_key')
          .eq('id', receiverId)
          .single()

        if (!receiver) {
          return { success: false, error: 'Receiver not found' }
        }

        receiverPublicKey = await importPublicKey(receiver.public_key)
        this.publicKeys.set(receiverId, receiverPublicKey)
      }

      // Encrypt message
      const encryptedContent = await encryptMessage(content, receiverPublicKey)

      // Save to database
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: this.currentUser.id,
          receiver_id: receiverId,
          encrypted_content: encryptedContent,
          message_type: 'text'
        }])

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Send message error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send message' }
    }
  }

  async getMessages(otherUserId: string): Promise<Message[]> {
    if (!this.currentUser || !this.keyPair) return []

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(username),
          receiver:receiver_id(username)
        `)
        .or(`and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${this.currentUser.id})`)
        .order('timestamp', { ascending: true })

      if (error) throw error

      const messages: Message[] = []
      for (const msg of data) {
        try {
          // All messages are decrypted using our private key
          const decryptedContent = await decryptMessage(msg.encrypted_content, this.keyPair.privateKey)

          messages.push({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: decryptedContent,
            timestamp: new Date(msg.timestamp),
            messageType: msg.message_type
          })
        } catch (decryptError) {
          console.error('Failed to decrypt message:', decryptError)
          // Add as encrypted message
          messages.push({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: '[Encrypted message - failed to decrypt]',
            timestamp: new Date(msg.timestamp),
            messageType: msg.message_type
          })
        }
      }

      return messages
    } catch (error) {
      console.error('Get messages error:', error)
      return []
    }
  }

  // Real-time subscriptions
  private setupRealtimeSubscriptions() {
    if (!this.currentUser) return

    // Subscribe to new messages
    supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${this.currentUser.id}`
      }, (payload) => {
        this.handleNewMessage(payload.new as SupabaseMessage)
      })
      .subscribe()

    // Subscribe to user status changes
    supabase
      .channel('users')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users'
      }, (payload) => {
        this.handleUserStatusChange(payload.new as SupabaseUser)
      })
      .subscribe()
  }

  private async handleNewMessage(message: SupabaseMessage) {
    if (!this.keyPair) return

    try {
      const decryptedContent = await decryptMessage(message.encrypted_content, this.keyPair.privateKey)
      const messageEvent = new CustomEvent('newMessage', {
        detail: {
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: decryptedContent,
          timestamp: new Date(message.timestamp),
          messageType: message.message_type
        }
      })
      window.dispatchEvent(messageEvent)
    } catch (error) {
      console.error('Failed to decrypt incoming message:', error)
    }
  }

  private handleUserStatusChange(user: SupabaseUser) {
    const userStatusEvent = new CustomEvent('userStatusChange', {
      detail: {
        id: user.id,
        username: user.username,
        isOnline: user.is_online
      }
    })
    window.dispatchEvent(userStatusEvent)
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }
}

export const chatService = new ChatService()
