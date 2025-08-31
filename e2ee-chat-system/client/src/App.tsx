import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './components/LoginForm'
import ChatInterface from './components/ChatInterface'
import { chatService } from './lib/chatService'
import type { User } from './shared/types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = chatService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const handleLogin = async (username: string) => {
    setIsLoading(true)
    setError(null)
    
    const result = await chatService.login(username)
    
    if (result.success && result.user) {
      setUser(result.user)
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await chatService.logout()
    setUser(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gray-900/20" />
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-screen p-4"
            >
              <div className="w-full max-w-md">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-xl shadow-purple-500/25">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    SecureChat
                  </h1>
                  <p className="text-gray-300">
                    End-to-end encrypted messaging
                  </p>
                </motion.div>
                
                <LoginForm 
                  onLogin={handleLogin} 
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="h-screen"
            >
              <ChatInterface 
                currentUser={user} 
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
