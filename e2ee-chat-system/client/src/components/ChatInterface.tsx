import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  UserIcon,
  PowerIcon,
  EllipsisVerticalIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { chatService } from '../lib/chatService'
import type { User, Message } from '../shared/types'

interface ChatInterfaceProps {
  currentUser: User
  onLogout: () => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentUser,
  onLogout,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load users and set up real-time listeners
  useEffect(() => {
    loadUsers()
    
    // Listen for new messages
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail as Message
      setMessages(prev => [...prev, message])
    }

    // Listen for user status changes
    const handleUserStatusChange = (event: CustomEvent) => {
      const { id, isOnline } = event.detail
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, isOnline } : user
      ))
    }

    window.addEventListener('newMessage', handleNewMessage as EventListener)
    window.addEventListener('userStatusChange', handleUserStatusChange as EventListener)

    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener)
      window.removeEventListener('userStatusChange', handleUserStatusChange as EventListener)
    }
  }, [])

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id)
    }
  }, [selectedUser])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUsers = async () => {
    const onlineUsers = await chatService.getOnlineUsers()
    setUsers(onlineUsers)
  }

  const loadMessages = async (userId: string) => {
    setIsLoading(true)
    const conversationMessages = await chatService.getMessages(userId)
    setMessages(conversationMessages)
    setIsLoading(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newMessage.trim()) return

    const result = await chatService.sendMessage(selectedUser.id, newMessage.trim())
    
    if (result.success) {
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        timestamp: new Date(),
        messageType: 'text'
      }
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
    } else {
      alert(`Failed to send message: ${result.error}`)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return messageDate.toLocaleDateString()
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:relative lg:translate-x-0 z-30 w-80 bg-slate-800/90 backdrop-blur-lg border-r border-slate-700/50 h-full"
      >
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">{currentUser.username}</h3>
                <p className="text-sm text-green-400">Online</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <PowerIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-300">Online Users</h4>
            <span className="text-xs text-slate-500">{users.length}</span>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No other users online</p>
              </div>
            ) : (
              users.map((user) => (
                <motion.button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user)
                    setIsSidebarOpen(false)
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-purple-600/20 border border-purple-500/30'
                      : 'hover:bg-slate-700/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.username}</p>
                      <p className="text-slate-400 text-sm">{user.isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Toggle sidebar"
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
              
              {selectedUser ? (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {selectedUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedUser.username}</h3>
                    <p className="text-sm text-slate-400">{selectedUser.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              ) : (
                <h3 className="text-white font-medium">Select a user to chat</h3>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          {selectedUser ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-400">No messages yet</p>
                      <p className="text-slate-500 text-sm">Start the conversation with {selectedUser.username}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isOwnMessage = message.senderId === currentUser.id
                      const showDate = index === 0 || 
                        formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center mb-4">
                              <span className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                  : 'bg-slate-700 text-slate-100'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-purple-100' : 'text-slate-400'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-700/50">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedUser.username}...`}
                      className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e)
                        }
                      }}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Welcome to SecureChat</h3>
                <p className="text-slate-400 mb-4">Select a user from the sidebar to start chatting</p>
                <p className="text-sm text-slate-500">🔒 All messages are end-to-end encrypted</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
