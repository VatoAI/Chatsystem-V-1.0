export interface User {
  id: string;
  username: string;
  publicKey: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string; // This is the decrypted content for UI display
  timestamp: Date;
  messageType: 'text' | 'file';
}

export interface ChatRoom {
  id: string;
  participants: string[];
  isGroup: boolean;
  name?: string;
  createdAt: Date;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface SocketEvents {
  // Client to Server
  'user:join': (userData: { username: string; publicKey: string }) => void;
  'message:send': (messageData: Omit<Message, 'id' | 'timestamp'>) => void;
  'user:typing': (data: { receiverId: string; isTyping: boolean }) => void;
  
  // Server to Client
  'user:joined': (user: User) => void;
  'user:left': (userId: string) => void;
  'message:received': (message: Message) => void;
  'user:typing:update': (data: { senderId: string; isTyping: boolean }) => void;
  'users:online': (users: User[]) => void;
}

export interface CryptoUtils {
  generateKeyPair(): Promise<KeyPair>;
  encryptMessage(message: string, publicKey: string, privateKey: string): Promise<string>;
  decryptMessage(encryptedMessage: string, publicKey: string, privateKey: string): Promise<string>;
}
