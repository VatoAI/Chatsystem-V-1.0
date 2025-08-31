/**
 * Simple Security Dashboard
 * Displays quantum threat monitoring and security status
 * Modern, beautiful design with enhanced visuals
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SecurityStatus {
  quantumReadiness: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  lastUpdate: Date
  activeConnections: number
  messagesEncrypted: number
  keyRotations: number
}

interface SecurityDashboardProps {
  refreshInterval?: number
  onThreatAlert?: (level: number) => void
}

export default function SecurityDashboard({ 
  refreshInterval = 5000,
  onThreatAlert 
}: SecurityDashboardProps) {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    quantumReadiness: 75,
    threatLevel: 'medium',
    recommendations: [
      'Consider upgrading to post-quantum cryptography',
      'Regular key rotation is recommended',
      'Monitor quantum computing developments'
    ],
    lastUpdate: new Date(),
    activeConnections: 3,
    messagesEncrypted: 127,
    keyRotations: 8
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const updateSecurityData = () => {
      if (!mounted) return
      
      // Simulate security assessment with more realistic data
      const baseReadiness = 65
      const variation = (Math.sin(Date.now() / 10000) * 15) + (Math.random() - 0.5) * 5
      const newReadiness = Math.max(0, Math.min(100, baseReadiness + variation))
      
      let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
      
      if (newReadiness < 30) threatLevel = 'critical'
      else if (newReadiness < 50) threatLevel = 'high'
      else if (newReadiness < 75) threatLevel = 'medium'
      
      const newStatus = {
        quantumReadiness: newReadiness,
        threatLevel,
        recommendations: [
          newReadiness > 80 ? '✓ Quantum resistance excellent' : 'Consider upgrading to post-quantum cryptography',
          'Regular key rotation is active',
          'Monitoring quantum computing developments',
          newReadiness < 50 ? '⚠️ Urgent: Enhanced security protocols recommended' : 'Security protocols optimal'
        ],
        lastUpdate: new Date(),
        activeConnections: Math.floor(Math.random() * 5) + 1,
        messagesEncrypted: securityStatus.messagesEncrypted + Math.floor(Math.random() * 3),
        keyRotations: securityStatus.keyRotations + (Math.random() > 0.9 ? 1 : 0)
      }
      
      setSecurityStatus(newStatus)
      setLoading(false)
      
      // Trigger alert if needed
      if (onThreatAlert && newReadiness < 50) {
        onThreatAlert(100 - newReadiness)
      }
    }

    updateSecurityData()
    const interval = setInterval(updateSecurityData, refreshInterval)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [refreshInterval, onThreatAlert, securityStatus.messagesEncrypted, securityStatus.keyRotations])

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'low': return 'from-green-500 to-emerald-600'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'high': return 'from-orange-500 to-red-500'
      case 'critical': return 'from-red-500 to-red-700'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getThreatTextColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-700'
      case 'medium': return 'text-yellow-700'
      case 'high': return 'text-orange-700'
      case 'critical': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500'
    if (score >= 60) return 'from-yellow-400 to-orange-400'
    if (score >= 30) return 'from-orange-400 to-red-400'
    return 'from-red-400 to-red-600'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mx-auto mb-4 border-4 border-blue-300 border-t-blue-600 rounded-full"
          />
          <p className="text-gray-600">Initializing quantum threat assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-[500px]">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Connections</p>
              <p className="text-2xl font-bold text-blue-900">{securityStatus.activeConnections}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Messages Encrypted</p>
              <p className="text-2xl font-bold text-green-900">{securityStatus.messagesEncrypted}</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Key Rotations</p>
              <p className="text-2xl font-bold text-purple-900">{securityStatus.keyRotations}</p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2a2 2 0 00-2-2M9 7a2 2 0 00-2 2m0 0a2 2 0 00-2 2m2-2a2 2 0 012 2m-2-2a2 2 0 012-2" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantum Readiness Score */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Quantum Readiness Score
          </h3>
          
          <div className="relative">
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-bold text-gray-900">
                {Math.round(securityStatus.quantumReadiness)}
              </span>
              <span className="text-xl text-gray-500 ml-1">%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${securityStatus.quantumReadiness}%` }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${getReadinessColor(securityStatus.quantumReadiness)} rounded-full relative`}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Threat Level */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Current Threat Level
          </h3>
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", damping: 15 }}
              className={`inline-flex px-6 py-3 rounded-full text-white font-bold text-lg bg-gradient-to-r ${getThreatColor(securityStatus.threatLevel)} shadow-lg`}
            >
              {securityStatus.threatLevel.toUpperCase()}
            </motion.div>
            
            <p className={`mt-3 text-sm font-medium ${getThreatTextColor(securityStatus.threatLevel)}`}>
              {securityStatus.threatLevel === 'low' && 'System is secure and operating normally'}
              {securityStatus.threatLevel === 'medium' && 'Moderate security considerations detected'}
              {securityStatus.threatLevel === 'high' && 'Enhanced security measures recommended'}
              {securityStatus.threatLevel === 'critical' && 'Immediate security action required'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Security Recommendations
        </h3>
        
        <div className="space-y-3">
          {securityStatus.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex-shrink-0 mt-0.5">
                {recommendation.includes('✓') ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : recommendation.includes('⚠️') ? (
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-700 font-medium">{recommendation}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4"
      >
        Last updated: {securityStatus.lastUpdate.toLocaleTimeString()} • 
        Refreshing every {refreshInterval / 1000} seconds
      </motion.div>
    </div>
  )
}
