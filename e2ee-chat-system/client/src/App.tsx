import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './components/LoginForm'
import ChatInterface from './components/ChatInterface'
import MatrixWelcome from './components/MatrixWelcome'
import SecurityDashboard from './components/security/SecurityDashboard-simple'
import { chatService } from './lib/chatService'
import type { User } from './shared/types'

type AppMode = 'matrix-welcome' | 'login' | 'chat' | 'security'
type PillChoice = 'red' | 'blue' | null

function App() {
  const [mode, setMode] = useState<AppMode>('matrix-welcome')
  const [pillChoice, setPillChoice] = useState<PillChoice>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false)

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
      setMode('chat')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await chatService.logout()
    setUser(null)
    setError(null)
    setShowSecurityDashboard(false)
    setMode('matrix-welcome')
    setPillChoice(null)
  }

  const handleThreatAlert = (threatLevel: number) => {
    console.warn(`High threat level detected: ${threatLevel}%`)
    // Could show notification or auto-open dashboard
  }

  const handlePillChoice = (choice: 'red' | 'blue') => {
    setPillChoice(choice)
    if (choice === 'red') {
      setMode('security')
    } else if (choice === 'blue') {
      setMode('login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/20 to-transparent"></div>
      </div>
      
      {/* Security Dashboard Modal */}
      <AnimatePresence>
        {showSecurityDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSecurityDashboard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Security Dashboard
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Quantum-ready security monitoring</p>
                </div>
                <button
                  onClick={() => setShowSecurityDashboard(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                  aria-label="Close security dashboard"
                  title="Close"
                >
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SecurityDashboard 
                refreshInterval={5000}
                onThreatAlert={handleThreatAlert}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Button - Floating */}
      {user && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", damping: 15, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={() => setShowSecurityDashboard(true)}
            className="group relative w-14 h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center transform hover:scale-110 hover:-translate-y-1"
            title="Security Dashboard"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </button>
        </motion.div>
      )}
      
      <div className="relative z-10 h-full">
        <AnimatePresence mode="wait">
          {mode === 'matrix-welcome' && (
            <motion.div
              key="matrix-welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0"
            >
              <MatrixWelcome onPillChoice={handlePillChoice} />
            </motion.div>
          )}
          
          {mode === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="min-h-screen p-6"
            >
              <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                      Red Pill: Truth Mode
                    </h1>
                    <p className="text-xl text-gray-300 mb-4">
                      Welcome to the Security Matrix
                    </p>
                    <button
                      onClick={() => setMode('matrix-welcome')}
                      className="px-6 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      Back to Matrix
                    </button>
                  </motion.div>
                </div>
                <SecurityDashboard 
                  refreshInterval={5000}
                  onThreatAlert={handleThreatAlert}
                />
              </div>
            </motion.div>
          )}
          
          {(mode === 'login' || mode === 'chat') && !user && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center min-h-screen p-6"
            >
              <div className="w-full max-w-md">
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                  className="text-center mb-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", damping: 15, stiffness: 300 }}
                    className="relative inline-flex items-center justify-center w-20 h-20 mb-6 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-4 shadow-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </motion.div>
                  {pillChoice === 'blue' && (
                    <div className="mb-4">
                      <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        Blue Pill: Chat Mode
                      </h1>
                      <p className="text-xl text-gray-300 mb-2">
                        Welcome to the Matrix
                      </p>
                      <button
                        onClick={() => setMode('matrix-welcome')}
                        className="px-6 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors mb-4"
                      >
                        Back to Matrix
                      </button>
                    </div>
                  )}
                  <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    SecureChat
                  </h1>
                  <p className="text-xl text-gray-300 mb-2">
                    Quantum-Ready Messaging
                  </p>
                  <p className="text-sm text-gray-400">
                    End-to-end encrypted with post-quantum cryptography
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                >
                  <LoginForm 
                    onLogin={handleLogin} 
                    isLoading={isLoading}
                    error={error}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {user && mode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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
