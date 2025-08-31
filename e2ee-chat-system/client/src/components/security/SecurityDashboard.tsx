/**
 * Quantum Security Dashboard Component
 * Real-time quantum threat monitoring and crypto recommendations
 */

import { useState, useEffect, useMemo } from 'react'
import { ExclamationTriangleIcon, ShieldCheckIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline'
import { SecurityMonitorService } from '../../security/monitoring/security-monitor'
import { KeyManagementService } from '../../security/key-mgmt/key-manager'
import type { CryptoAuditReport } from '../../crypto/core/types'

export interface SecurityDashboardProps {
  refreshInterval?: number // milliseconds
  showAdvancedMetrics?: boolean
  onThreatAlert?: (level: number) => void
}

export function SecurityDashboard({
  refreshInterval = 30000, // 30 seconds
  showAdvancedMetrics = false,
  onThreatAlert
}: SecurityDashboardProps) {
  const [securityReport, setSecurityReport] = useState<CryptoAuditReport | null>(null)
  const [quantumReadiness, setQuantumReadiness] = useState<{
    score: number
    status: 'critical' | 'warning' | 'good' | 'excellent'
    details: string[]
  } | null>(null)
  const [keyHealthReport, setKeyHealthReport] = useState<{
    total: number
    active: number
    quantumSafe: number
    quantumVulnerable: number
    expiringSoon: number
    needRotation: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const securityMonitor = useMemo(() => new SecurityMonitorService(), [])
  const keyManager = useMemo(() => new KeyManagementService(), [])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)
      
      const [audit, readiness, keyHealth] = await Promise.all([
        securityMonitor.auditCryptoUsage(),
        securityMonitor.getSystemQuantumReadiness(), 
        keyManager.getKeyHealthReport()
      ])
      
      setSecurityReport(audit)
      setQuantumReadiness(readiness)
      setKeyHealthReport(keyHealth)
      setLastUpdate(new Date())
      
      // Trigger alert if threat level is high
      if (onThreatAlert && audit.threatLevel >= 75) {
        onThreatAlert(audit.threatLevel)
      }
    } catch (error) {
      console.error('Error fetching security data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    const loadSecurityData = async () => {
      if (!mounted) return
      
      try {
        setLoading(true)
        
        const [audit, readiness, keyHealth] = await Promise.all([
          securityMonitor.auditCryptoUsage(),
          securityMonitor.getSystemQuantumReadiness(), 
          keyManager.getKeyHealthReport()
        ])
        
        if (mounted) {
          setSecurityReport(audit)
          setQuantumReadiness(readiness)
          setKeyHealthReport(keyHealth)
          setLastUpdate(new Date())
          
          // Trigger alert if threat level is high
          if (onThreatAlert && audit.threatLevel >= 75) {
            onThreatAlert(audit.threatLevel)
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Error fetching security data:', error)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSecurityData()
    
    const interval = setInterval(loadSecurityData, refreshInterval)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [refreshInterval, onThreatAlert, keyManager, securityMonitor])

  if (loading && !securityReport) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'good':
      case 'excellent':
        return <ShieldCheckIcon className="h-5 w-5 text-green-500" />
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quantum Security Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdate?.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchSecurityData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ClockIcon className="h-4 w-4 mr-1" />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Quantum Readiness Score */}
      {quantumReadiness && (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${getStatusColor(quantumReadiness.status).split(' ').slice(1).join(' ')}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getStatusIcon(quantumReadiness.status)}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                System Quantum Readiness: {Math.round(quantumReadiness.score)}%
              </h3>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    quantumReadiness.status === 'excellent' ? 'bg-green-600' :
                    quantumReadiness.status === 'good' ? 'bg-blue-600' :
                    quantumReadiness.status === 'warning' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${quantumReadiness.score}%` }}
                ></div>
              </div>
              <div className="mt-3">
                {quantumReadiness.details.map((detail, index) => (
                  <p key={index} className="text-sm text-gray-600">{detail}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Health Overview */}
      {keyHealthReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            Key Management Health
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{keyHealthReport.total}</div>
              <div className="text-sm text-gray-500">Total Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{keyHealthReport.quantumSafe}</div>
              <div className="text-sm text-gray-500">Quantum Safe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{keyHealthReport.quantumVulnerable}</div>
              <div className="text-sm text-gray-500">Vulnerable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{keyHealthReport.active}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{keyHealthReport.expiringSoon}</div>
              <div className="text-sm text-gray-500">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{keyHealthReport.needRotation}</div>
              <div className="text-sm text-gray-500">Need Rotation</div>
            </div>
          </div>
        </div>
      )}

      {/* Security Audit Report */}
      {securityReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cryptographic Usage Audit</h3>
          
          <div className="space-y-4">
            {/* Threat Level */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Threat Level</span>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  securityReport.threatLevel >= 75 ? 'bg-red-100 text-red-800' :
                  securityReport.threatLevel >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {securityReport.threatLevel}%
                </div>
              </div>
            </div>

            {/* Message Breakdown */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-red-700">Quantum Vulnerable</div>
                  <div className="text-2xl font-bold text-red-900">
                    {securityReport.quantumVulnerableMessages}
                  </div>
                  <div className="text-xs text-red-600">
                    {((securityReport.quantumVulnerableMessages / securityReport.totalMessages) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-700">Quantum Safe</div>
                  <div className="text-2xl font-bold text-green-900">
                    {securityReport.quantumSafeMessages}
                  </div>
                  <div className="text-xs text-green-600">
                    {((securityReport.quantumSafeMessages / securityReport.totalMessages) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-700">Hybrid Encrypted</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {securityReport.hybridMessages}
                  </div>
                  <div className="text-xs text-blue-600">
                    {((securityReport.hybridMessages / securityReport.totalMessages) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Security Recommendations</h4>
              <ul className="space-y-2">
                {securityReport.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Metrics (Optional) */}
      {showAdvancedMetrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Security Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Threat Timeline */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">30-Day Threat Trend</h4>
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Chart visualization would go here</span>
              </div>
            </div>
            
            {/* Algorithm Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Algorithm Usage</h4>
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Algorithm pie chart would go here</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityDashboard
