/**
 * Crypto Provider Factory
 * Central factory for creating crypto providers with quantum-safe defaults
 * Implements crypto-agility pattern for easy algorithm switching
 */

import type { 
  CryptoProvider, 
  CryptoAlgorithmType, 
  SecurityLevel, 
  CryptoConfig
} from './types'
import { CryptoError } from './types'

export class CryptoProviderFactory {
  private static instance: CryptoProviderFactory
  private config: CryptoConfig
  private cache = new Map<CryptoAlgorithmType, CryptoProvider>()

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): CryptoProviderFactory {
    if (!CryptoProviderFactory.instance) {
      CryptoProviderFactory.instance = new CryptoProviderFactory()
    }
    return CryptoProviderFactory.instance
  }

  private getDefaultConfig(): CryptoConfig {
    return {
      preferredAlgorithm: 'Hybrid-RSA-ML-KEM',
      fallbackAlgorithms: ['RSA-OAEP', 'ML-KEM-768'],
      keyRotationInterval: 24, // 24 hours
      enableHybridMode: true,
      quantumThresholdScore: 75, // High security threshold
      nistComplianceRequired: true
    }
  }

  updateConfig(newConfig: Partial<CryptoConfig>): void {
    this.config = { ...this.config, ...newConfig }
    // Clear cache to force recreation with new config
    this.cache.clear()
  }

  getConfig(): CryptoConfig {
    return { ...this.config }
  }

  async createProvider(algorithm?: CryptoAlgorithmType): Promise<CryptoProvider> {
    const selectedAlgorithm = algorithm || this.config?.preferredAlgorithm || 'RSA-OAEP'
    
    // Return cached provider if available
    const cached = this.cache.get(selectedAlgorithm)
    if (cached) return cached

    let provider: CryptoProvider

    try {
      provider = await this.instantiateProvider(selectedAlgorithm)
      this.cache.set(selectedAlgorithm, provider)
      return provider
    } catch (error) {
      console.warn(`Failed to create provider for ${selectedAlgorithm}:`, error)
      
      // Try fallback algorithms
      const fallbacks = this.config?.fallbackAlgorithms || ['RSA-OAEP']
      for (const fallback of fallbacks) {
        try {
          provider = await this.instantiateProvider(fallback)
          this.cache.set(fallback, provider)
          console.info(`Using fallback algorithm: ${fallback}`)
          return provider
        } catch (fallbackError) {
          console.warn(`Fallback ${fallback} also failed:`, fallbackError)
        }
      }
      
      throw new CryptoError(
        `Unable to create crypto provider. All algorithms failed.`,
        'ALGORITHM_NOT_SUPPORTED'
      )
    }
  }

  private async instantiateProvider(algorithm: CryptoAlgorithmType): Promise<CryptoProvider> {
    switch (algorithm) {
      case 'RSA-OAEP': {
        const { RSAProvider } = await import('../classical/rsa-provider')
        return new RSAProvider()
      }
        
      case 'ML-KEM-512':
      case 'ML-KEM-768':
      case 'ML-KEM-1024': {
        const { MLKEMProvider } = await import('../pqc/ml-kem-provider')
        return new MLKEMProvider(algorithm)
      }
        
      case 'CRYSTALS-Dilithium': {
        const { DilithiumProvider } = await import('../pqc/dilithium-provider')
        return new DilithiumProvider()
      }
        
      case 'Hybrid-RSA-ML-KEM':
      case 'Hybrid-ECDH-ML-KEM': {
        const { HybridCryptoProvider } = await import('../hybrid/hybrid-provider')
        return new HybridCryptoProvider()
      }
        
      default:
        throw new CryptoError(
          `Unsupported algorithm: ${algorithm}`,
          'ALGORITHM_NOT_SUPPORTED',
          algorithm
        )
    }
  }

  // Get recommended algorithm based on current quantum threat level
  async getRecommendedAlgorithm(): Promise<CryptoAlgorithmType> {
    // Simulate threat assessment (in production would use actual SecurityMonitorService)
    const threatLevel = 60 + Math.random() * 30 // Simulated threat level 60-90
    
    if (threatLevel >= (this.config?.quantumThresholdScore || 50)) {
      // High quantum threat - use pure PQC
      return 'ML-KEM-768'
    } else if (threatLevel >= 50) {
      // Medium threat - use hybrid
      return this.config.enableHybridMode ? 'Hybrid-RSA-ML-KEM' : 'ML-KEM-768'
    } else {
      // Low threat - classical is still acceptable but hybrid preferred
      return this.config.enableHybridMode ? 'Hybrid-RSA-ML-KEM' : 'RSA-OAEP'
    }
  }

  // Check if algorithm is quantum-safe
  isQuantumSafe(algorithm: CryptoAlgorithmType): boolean {
    const quantumSafeAlgorithms: CryptoAlgorithmType[] = [
      'ML-KEM-512',
      'ML-KEM-768', 
      'ML-KEM-1024',
      'CRYSTALS-Dilithium',
      'SPHINCS+',
      'Hybrid-RSA-ML-KEM',
      'Hybrid-ECDH-ML-KEM'
    ]
    return quantumSafeAlgorithms.includes(algorithm)
  }

  // Get security level for algorithm
  getSecurityLevel(algorithm: CryptoAlgorithmType): SecurityLevel {
    const levelMap: Record<CryptoAlgorithmType, SecurityLevel> = {
      'RSA-OAEP': 'quantum-vulnerable',
      'ECDH': 'quantum-vulnerable',
      'ML-KEM-512': 'quantum-safe',
      'ML-KEM-768': 'quantum-safe',
      'ML-KEM-1024': 'quantum-safe',
      'CRYSTALS-Dilithium': 'quantum-safe',
      'SPHINCS+': 'quantum-safe',
      'Hybrid-RSA-ML-KEM': 'hybrid',
      'Hybrid-ECDH-ML-KEM': 'hybrid',
      'Hybrid-RSAOAEP-MLKEM512': 'hybrid',
      'Hybrid-RSAOAEP-MLKEM1024': 'hybrid'
    }
    return levelMap[algorithm] || 'quantum-vulnerable'
  }

  // Check NIST compliance
  isNISTApproved(algorithm: CryptoAlgorithmType): boolean {
    const nistApproved: CryptoAlgorithmType[] = [
      'ML-KEM-512',
      'ML-KEM-768',
      'ML-KEM-1024', 
      'CRYSTALS-Dilithium',
      'SPHINCS+'
    ]
    return nistApproved.includes(algorithm)
  }

  // Migration utilities
  async migrateFromAlgorithm(from: CryptoAlgorithmType, to: CryptoAlgorithmType): Promise<{
    oldProvider: CryptoProvider,
    newProvider: CryptoProvider,
    migrationPlan: string[]
  }> {
    const oldProvider = await this.createProvider(from)
    const newProvider = await this.createProvider(to)
    
    const migrationPlan = [
      `1. Generate new ${to} key pair`,
      `2. Re-encrypt existing messages with ${to}`,
      `3. Share new public key with contacts`,
      `4. Deprecate ${from} keys after grace period`
    ]

    if (this.getSecurityLevel(from) === 'quantum-vulnerable' && 
        this.getSecurityLevel(to) === 'quantum-safe') {
      migrationPlan.push('⚠️  Critical: Old messages remain quantum-vulnerable until re-encrypted')
    }

    return { oldProvider, newProvider, migrationPlan }
  }

  // Clear all cached providers (useful for config changes)
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const cryptoFactory = CryptoProviderFactory.getInstance()
