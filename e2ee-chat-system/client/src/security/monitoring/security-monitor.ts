/**
 * Security Monitor Service
 * Assesses quantum threats and provides crypto recommendations
 * Based on NIST guidelines and current threat landscape
 */

import type { 
  SecurityMonitor, 
  CryptoAuditReport, 
  CryptoAlgorithmType, 
  KeyLifecycleEvent 
} from '../../crypto/core/types'

export class SecurityMonitorService implements SecurityMonitor {
  private static readonly QUANTUM_TIMELINE_ESTIMATE = 2030 // Conservative estimate
  private static readonly CURRENT_YEAR = new Date().getFullYear()
  
  private auditHistory: CryptoAuditReport[] = []
  private keyEvents: Map<string, KeyLifecycleEvent[]> = new Map()

  async assessQuantumThreat(): Promise<number> {
    const factors = await this.gatherThreatFactors()
    return this.calculateThreatScore(factors)
  }

  async recommendAlgorithm(): Promise<CryptoAlgorithmType> {
    const threatLevel = await this.assessQuantumThreat()
    
    if (threatLevel >= 90) {
      // Imminent quantum threat - use strongest PQC
      return 'ML-KEM-1024'
    } else if (threatLevel >= 70) {
      // High threat - use standard PQC
      return 'ML-KEM-768'
    } else if (threatLevel >= 50) {
      // Medium threat - hybrid approach
      return 'Hybrid-RSA-ML-KEM'
    } else if (threatLevel >= 25) {
      // Low-medium threat - lighter PQC
      return 'ML-KEM-512'
    } else {
      // Low threat - classical still acceptable for short term
      return 'RSA-OAEP'
    }
  }

  async auditCryptoUsage(): Promise<CryptoAuditReport> {
    const report: CryptoAuditReport = {
      totalMessages: 0,
      quantumVulnerableMessages: 0,
      quantumSafeMessages: 0,
      hybridMessages: 0,
      recommendations: [],
      threatLevel: await this.assessQuantumThreat(),
      lastAssessment: new Date()
    }

    // Simulate message analysis (in real app, would query database)
    report.totalMessages = this.getMessageCount()
    report.quantumVulnerableMessages = Math.floor(report.totalMessages * 0.7) // Estimate
    report.quantumSafeMessages = Math.floor(report.totalMessages * 0.2)
    report.hybridMessages = report.totalMessages - report.quantumVulnerableMessages - report.quantumSafeMessages

    report.recommendations = this.generateRecommendations(report)
    
    this.auditHistory.push(report)
    return report
  }

  async trackKeyLifecycle(keyId: string): Promise<KeyLifecycleEvent[]> {
    return this.keyEvents.get(keyId) || []
  }

  // Record key lifecycle events
  recordKeyEvent(event: KeyLifecycleEvent): void {
    const events = this.keyEvents.get(event.keyId) || []
    events.push(event)
    this.keyEvents.set(event.keyId, events)
  }

  // Get quantum readiness score for the entire system
  async getSystemQuantumReadiness(): Promise<{
    score: number,
    status: 'critical' | 'warning' | 'good' | 'excellent',
    details: string[]
  }> {
    const auditReport = await this.auditCryptoUsage()
    const threatLevel = auditReport.threatLevel
    
    const quantumSafePercentage = (auditReport.quantumSafeMessages + auditReport.hybridMessages) / auditReport.totalMessages * 100
    
    const score = quantumSafePercentage
    let status: 'critical' | 'warning' | 'good' | 'excellent'
    const details: string[] = []

    if (score >= 90) {
      status = 'excellent'
      details.push('🟢 Excellent quantum readiness')
    } else if (score >= 70) {
      status = 'good' 
      details.push('🟡 Good quantum readiness, consider full migration')
    } else if (score >= 50) {
      status = 'warning'
      details.push('🟠 Moderate quantum readiness, migration recommended')
    } else {
      status = 'critical'
      details.push('🔴 Critical: Low quantum readiness, immediate action needed')
    }

    // Add threat-specific warnings
    if (threatLevel >= 75) {
      details.push('⚠️ High quantum threat detected - accelerate migration')
    }

    // Add specific recommendations
    details.push(...auditReport.recommendations)

    return { score, status, details }
  }

  private async gatherThreatFactors(): Promise<{
    timeToQuantum: number,
    quantumProgress: number, 
    industryReadiness: number,
    regulatoryPressure: number
  }> {
    // Time factor - how close are we to quantum computers?
    const yearsRemaining = SecurityMonitorService.QUANTUM_TIMELINE_ESTIMATE - SecurityMonitorService.CURRENT_YEAR
    const timeToQuantum = Math.max(0, Math.min(100, 100 - (yearsRemaining / 20) * 100))
    
    // Quantum progress factor (simulated - would be from threat intelligence feeds)
    const quantumProgress = this.assessQuantumProgress()
    
    // Industry readiness factor 
    const industryReadiness = this.assessIndustryReadiness()
    
    // Regulatory pressure (NIST standards, compliance requirements)
    const regulatoryPressure = this.assessRegulatoryPressure()

    return {
      timeToQuantum,
      quantumProgress,
      industryReadiness, 
      regulatoryPressure
    }
  }

  private calculateThreatScore(factors: {
    timeToQuantum: number,
    quantumProgress: number,
    industryReadiness: number, 
    regulatoryPressure: number
  }): number {
    // Weighted threat score calculation
    const weights = {
      timeToQuantum: 0.4,      // Temporal urgency
      quantumProgress: 0.3,     // Technical advancement
      industryReadiness: 0.2,   // Ecosystem readiness
      regulatoryPressure: 0.1   // Compliance requirements
    }

    const score = 
      factors.timeToQuantum * weights.timeToQuantum +
      factors.quantumProgress * weights.quantumProgress +
      factors.industryReadiness * weights.industryReadiness +
      factors.regulatoryPressure * weights.regulatoryPressure

    return Math.round(Math.min(100, Math.max(0, score)))
  }

  private assessQuantumProgress(): number {
    // Simulate quantum computer advancement assessment
    // In real implementation, would integrate with threat intelligence
    const currentYear = new Date().getFullYear()
    const baseProgress = Math.min(90, (currentYear - 2020) * 10)
    
    // Add some randomization to simulate real-world uncertainty
    const variation = Math.random() * 20 - 10 // ±10
    return Math.max(0, Math.min(100, baseProgress + variation))
  }

  private assessIndustryReadiness(): number {
    // Simulate industry PQC adoption assessment
    // Based on NIST standardization timeline
    const nistFinalizedDate = new Date('2024-08-13')
    const monthsSinceFinalization = (Date.now() - nistFinalizedDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    // Readiness increases gradually after NIST finalization
    return Math.min(100, Math.max(0, monthsSinceFinalization * 10))
  }

  private assessRegulatoryPressure(): number {
    // Simulate regulatory compliance pressure
    // Higher as we approach quantum threat timeline
    const yearsToQuantum = SecurityMonitorService.QUANTUM_TIMELINE_ESTIMATE - SecurityMonitorService.CURRENT_YEAR
    return Math.min(100, Math.max(0, 100 - yearsToQuantum * 10))
  }

  private getMessageCount(): number {
    // In real implementation, would query message database
    return Math.floor(Math.random() * 1000) + 100
  }

  private generateRecommendations(report: CryptoAuditReport): string[] {
    const recommendations: string[] = []
    
    const vulnerablePercentage = (report.quantumVulnerableMessages / report.totalMessages) * 100

    if (vulnerablePercentage > 80) {
      recommendations.push('🔴 Urgent: Migrate to post-quantum cryptography immediately')
      recommendations.push('📋 Plan: Implement hybrid encryption for new messages')
      recommendations.push('🔄 Action: Re-encrypt critical historical messages')
    } else if (vulnerablePercentage > 60) {
      recommendations.push('🟡 Warning: High percentage of quantum-vulnerable messages')
      recommendations.push('📈 Accelerate PQC adoption timeline')  
    } else if (vulnerablePercentage > 40) {
      recommendations.push('🟢 Good progress on PQC migration')
      recommendations.push('🎯 Continue migrating remaining classical encryption')
    } else {
      recommendations.push('✅ Excellent PQC adoption')
      recommendations.push('🔍 Monitor for new quantum developments')
    }

    if (report.threatLevel > 75) {
      recommendations.push('⚡ Consider emergency quantum threat protocols')
    }

    // Add NIST compliance recommendations
    recommendations.push('📜 Ensure NIST-approved algorithms are prioritized')
    recommendations.push('🔐 Implement key rotation policies')

    return recommendations
  }

  // Get historical trend data
  getSecurityTrends(days: number = 30): {
    threatLevels: number[],
    quantumReadiness: number[],
    dates: Date[]
  } {
    const trends = {
      threatLevels: [] as number[],
      quantumReadiness: [] as number[], 
      dates: [] as Date[]
    }

    // Generate historical data (simulated)
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      trends.dates.push(date)
      trends.threatLevels.push(Math.min(100, Math.max(0, 30 + Math.random() * 40)))
      trends.quantumReadiness.push(Math.min(100, Math.max(0, 20 + Math.random() * 60)))
    }

    return trends
  }
}
