import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MatrixWelcomeProps {
  onPillChoice: (choice: 'red' | 'blue') => void
  onGamingMode?: () => void
}

const MatrixWelcome: React.FC<MatrixWelcomeProps> = ({ onPillChoice, onGamingMode }) => {
  const [showPills, setShowPills] = useState(false)
  const [matrixRain, setMatrixRain] = useState<string[]>([])

  useEffect(() => {
    // Matrix digital rain effect
    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン1234567890'
    const newRain: string[] = []
    
    for (let i = 0; i < 20; i++) {
      let column = ''
      for (let j = 0; j < 30; j++) {
        column += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      newRain.push(column)
    }
    setMatrixRain(newRain)

    // Show pills after intro animation
    const timer = setTimeout(() => setShowPills(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const matrixVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut" as const
      }
    }
  }

  const textVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1,
        delay: 1
      }
    }
  }

  const pillVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        delay: 0.5,
        type: "spring" as const,
        stiffness: 100
      }
    },
    hover: { 
      scale: 1.1,
      boxShadow: "0 0 30px currentColor",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Matrix Rain Background */}
      <motion.div 
        className="absolute inset-0"
        variants={matrixVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex justify-between h-full opacity-20">
          {matrixRain.map((column, index) => (
            <motion.div
              key={index}
              className="text-green-400 text-xs font-mono leading-tight whitespace-pre"
              animate={{
                y: ['-100%', '100vh'],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2
              }}
            >
              {column}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8">
        {/* Matrix Quote */}
        <motion.div
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 mb-6 font-mono">
            THE MATRIX
          </h1>
          <div className="text-white text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            <p className="mb-4">
              "This is your last chance. After this, there is no going back."
            </p>
            <p className="mb-6">
              "You take the blue pill — the story ends, you wake up in your bed and believe whatever you want to believe."
            </p>
            <p className="mb-8">
              "You take the red pill — you stay in Wonderland, and I show you how deep the rabbit hole goes."
            </p>
          </div>
        </motion.div>

        {/* Pills Choice */}
        <AnimatePresence>
          {showPills && (
            <motion.div 
              className="flex flex-col items-center justify-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* First Row: Blue and Red Pills */}
              <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
                {/* Blue Pill */}
                <motion.div
                  variants={pillVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  className="cursor-pointer group"
                  onClick={() => onPillChoice('blue')}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shadow-2xl">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-300 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full opacity-90"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-blue-400 text-xl md:text-2xl font-bold mb-2">BLUE PILL</h3>
                    <p className="text-gray-300 text-sm md:text-base max-w-xs">
                      Return to the ordinary world. Standard secure chat with classical encryption.
                    </p>
                  </div>
                </motion.div>

                {/* VS Text */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="text-white text-2xl md:text-3xl font-bold font-mono"
                >
                  VS
                </motion.div>

                {/* Red Pill */}
                <motion.div
                  variants={pillVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  className="cursor-pointer group"
                  onClick={() => onPillChoice('red')}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-br from-red-400 to-red-600 rounded-full w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shadow-2xl">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-red-300 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full opacity-90"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-red-400 text-xl md:text-2xl font-bold mb-2">RED PILL</h3>
                    <p className="text-gray-300 text-sm md:text-base max-w-xs">
                      Enter the rabbit hole. Quantum-safe E2EE chat with post-quantum cryptography.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Gaming Mode Button */}
              {onGamingMode && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGamingMode}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl border border-purple-400/30 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600 transition-all duration-300 transform hover:shadow-purple-500/30 hover:shadow-2xl"
                  >
                    🎮 GAMING MODE
                  </motion.button>
                  <p className="text-purple-300 text-sm mt-3 max-w-xs mx-auto">
                    Enhanced gaming UI with Matrix aesthetics
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <p className="text-green-400 text-sm font-mono">
            "Remember... all I'm offering is the truth, nothing more."
          </p>
        </motion.div>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl"></div>
    </div>
  )
}

export default MatrixWelcome
