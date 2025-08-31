/**
 * Key Management Service
 * Handles key rotation, storage, and lifecycle management
 * Supports both classical and post-quantum keys
 */

import type { 
  KeyManager, 
  CryptoAlgorithmType, 
  KeyLifecycleEvent, 
  SecurityLevel 
} from '../../crypto/core/types'

export interface KeyMetadata {
  id: string
  algorithm: CryptoAlgorithmType
  created: Date
  lastUsed?: Date
  rotatedAt?: Date
  expiresAt?: Date
  isQuantumSafe: boolean
  securityLevel: SecurityLevel
  usage: 'encryption' | 'signing' | 'kex' // Key exchange
  status: 'active' | 'rotating' | 'revoked' | 'expired'
}

export interface KeyRotationPolicy {
  algorithm: CryptoAlgorithmType
  maxAge: number // milliseconds
  maxUsage: number // max number of operations
  autoRotate: boolean
  quantumThreatThreshold: number // trigger rotation at this threat level
}

export class KeyManagementService implements KeyManager {
  private keys: Map<string, KeyMetadata> = new Map()
  private keyStore: Map<string, CryptoKey> = new Map()
  private rotationPolicies: Map<CryptoAlgorithmType, KeyRotationPolicy> = new Map()
  private eventListeners: Array<(event: KeyLifecycleEvent) => void> = []

  constructor() {
    this.initializeDefaultPolicies()
  }

  async generateKey(algorithm: CryptoAlgorithmType): Promise<string> {
    const keyId = this.generateKeyId()
    const keyPair = await this.createKeyPair(algorithm)
    
    const metadata: KeyMetadata = {
      id: keyId,
      algorithm,
      created: new Date(),
      isQuantumSafe: this.isQuantumSafeAlgorithm(algorithm),
      securityLevel: this.getAlgorithmSecurityLevel(algorithm),
      usage: this.getKeyUsage(algorithm),
      status: 'active'
    }

    // Set expiration based on policy
    const policy = this.rotationPolicies.get(algorithm)
    if (policy) {
      metadata.expiresAt = new Date(Date.now() + policy.maxAge)
    }

    this.keys.set(keyId, metadata)
    this.keyStore.set(keyId, keyPair.privateKey)
    this.keyStore.set(`${keyId}_pub`, keyPair.publicKey)

    this.emitEvent({
      keyId,
      type: 'created',
      timestamp: new Date(),
      algorithm,
      details: `Key generated with ${algorithm}`
    })

    return keyId
  }

  async rotateKey(keyId: string): Promise<string> {
    const oldMetadata = this.keys.get(keyId)
    if (!oldMetadata) {
      throw new Error(`Key ${keyId} not found`)
    }

    // Mark old key as rotating
    oldMetadata.status = 'rotating'
    oldMetadata.rotatedAt = new Date()

    // Generate new key with same algorithm
    const newKeyId = await this.generateKey(oldMetadata.algorithm)

    this.emitEvent({
      keyId: newKeyId,
      type: 'rotated', 
      timestamp: new Date(),
      algorithm: oldMetadata.algorithm,
      details: `Key rotated from ${keyId}`,
      previousKeyId: keyId
    })

    return newKeyId
  }

  async revokeKey(keyId: string): Promise<void> {
    const metadata = this.keys.get(keyId)
    if (!metadata) {
      throw new Error(`Key ${keyId} not found`)
    }

    metadata.status = 'revoked'
    
    // Remove from active keystore but keep metadata for audit
    this.keyStore.delete(keyId)
    this.keyStore.delete(`${keyId}_pub`)

    this.emitEvent({
      keyId,
      type: 'revoked',
      timestamp: new Date(),
      algorithm: metadata.algorithm,
      details: 'Key manually revoked'
    })
  }

  getKey(keyId: string): Promise<CryptoKey | null> {
    const key = this.keyStore.get(keyId)
    return Promise.resolve(key || null)
  }

  getPublicKey(keyId: string): Promise<CryptoKey | null> {
    const key = this.keyStore.get(`${keyId}_pub`)
    return Promise.resolve(key || null)
  }

  // Check if keys need rotation based on policies
  async checkKeyRotationNeeds(): Promise<string[]> {
    const keysNeedingRotation: string[] = []
    const now = new Date()

    for (const [keyId, metadata] of this.keys.entries()) {
      if (metadata.status !== 'active') continue

      const policy = this.rotationPolicies.get(metadata.algorithm)
      if (!policy) continue

      let needsRotation = false

      // Check age-based rotation
      if (metadata.expiresAt && now > metadata.expiresAt) {
        needsRotation = true
      }

      // Check if quantum threat level exceeds threshold
      // (Would integrate with SecurityMonitorService in real app)
      const currentThreatLevel = await this.getCurrentQuantumThreatLevel()
      if (currentThreatLevel >= policy.quantumThreatThreshold && !metadata.isQuantumSafe) {
        needsRotation = true
      }

      if (needsRotation) {
        keysNeedingRotation.push(keyId)
      }
    }

    return keysNeedingRotation
  }

  // Auto-rotate keys based on policies
  async performScheduledRotations(): Promise<{
    rotated: string[],
    failed: Array<{ keyId: string, error: string }>
  }> {
    const keysToRotate = await this.checkKeyRotationNeeds()
    const rotated: string[] = []
    const failed: Array<{ keyId: string, error: string }> = []

    for (const keyId of keysToRotate) {
      try {
        const newKeyId = await this.rotateKey(keyId)
        rotated.push(newKeyId)
      } catch (error) {
        failed.push({
          keyId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { rotated, failed }
  }

  // Get key metadata
  getKeyMetadata(keyId: string): KeyMetadata | null {
    return this.keys.get(keyId) || null
  }

  // List all keys with optional filtering
  listKeys(filter?: {
    algorithm?: CryptoAlgorithmType,
    status?: KeyMetadata['status'],
    isQuantumSafe?: boolean
  }): KeyMetadata[] {
    let keys = Array.from(this.keys.values())

    if (filter) {
      if (filter.algorithm) {
        keys = keys.filter(k => k.algorithm === filter.algorithm)
      }
      if (filter.status) {
        keys = keys.filter(k => k.status === filter.status)
      }
      if (filter.isQuantumSafe !== undefined) {
        keys = keys.filter(k => k.isQuantumSafe === filter.isQuantumSafe)
      }
    }

    return keys.sort((a, b) => b.created.getTime() - a.created.getTime())
  }

  // Update key usage timestamp
  recordKeyUsage(keyId: string): void {
    const metadata = this.keys.get(keyId)
    if (metadata) {
      metadata.lastUsed = new Date()
      
      this.emitEvent({
        keyId,
        type: 'used',
        timestamp: new Date(),
        algorithm: metadata.algorithm,
        details: 'Key used for operation'
      })
    }
  }

  // Set rotation policy for algorithm
  setRotationPolicy(algorithm: CryptoAlgorithmType, policy: KeyRotationPolicy): void {
    this.rotationPolicies.set(algorithm, policy)
  }

  // Get rotation policy
  getRotationPolicy(algorithm: CryptoAlgorithmType): KeyRotationPolicy | null {
    return this.rotationPolicies.get(algorithm) || null
  }

  // Event listener management
  addEventListener(listener: (event: KeyLifecycleEvent) => void): void {
    this.eventListeners.push(listener)
  }

  removeEventListener(listener: (event: KeyLifecycleEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  // Get system key health report
  getKeyHealthReport(): {
    total: number,
    active: number,
    quantumSafe: number,
    quantumVulnerable: number,
    expiringSoon: number,
    needRotation: number
  } {
    const keys = Array.from(this.keys.values())
    const now = new Date()
    const soonThreshold = 7 * 24 * 60 * 60 * 1000 // 7 days

    return {
      total: keys.length,
      active: keys.filter(k => k.status === 'active').length,
      quantumSafe: keys.filter(k => k.isQuantumSafe).length,
      quantumVulnerable: keys.filter(k => !k.isQuantumSafe && k.status === 'active').length,
      expiringSoon: keys.filter(k => 
        k.expiresAt && 
        k.status === 'active' && 
        k.expiresAt.getTime() - now.getTime() < soonThreshold
      ).length,
      needRotation: keys.filter(k => 
        k.status === 'active' && 
        k.expiresAt && 
        now > k.expiresAt
      ).length
    }
  }

  private initializeDefaultPolicies(): void {
    // Classical algorithm policies - shorter lifetimes due to quantum threat
    this.rotationPolicies.set('RSA-OAEP', {
      algorithm: 'RSA-OAEP',
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      maxUsage: 10000,
      autoRotate: true,
      quantumThreatThreshold: 50
    })

    // PQC algorithm policies - longer lifetimes
    this.rotationPolicies.set('ML-KEM-512', {
      algorithm: 'ML-KEM-512', 
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      maxUsage: 100000,
      autoRotate: true,
      quantumThreatThreshold: 95
    })

    this.rotationPolicies.set('ML-KEM-768', {
      algorithm: 'ML-KEM-768',
      maxAge: 365 * 24 * 60 * 60 * 1000,
      maxUsage: 100000, 
      autoRotate: true,
      quantumThreatThreshold: 95
    })

    this.rotationPolicies.set('ML-KEM-1024', {
      algorithm: 'ML-KEM-1024',
      maxAge: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      maxUsage: 500000,
      autoRotate: true,
      quantumThreatThreshold: 98
    })

    // Hybrid policies
    this.rotationPolicies.set('Hybrid-RSA-ML-KEM', {
      algorithm: 'Hybrid-RSA-ML-KEM',
      maxAge: 180 * 24 * 60 * 60 * 1000, // 6 months
      maxUsage: 50000,
      autoRotate: true,
      quantumThreatThreshold: 70
    })
  }

  private generateKeyId(): string {
    return 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  private async createKeyPair(algorithm: CryptoAlgorithmType): Promise<CryptoKeyPair> {
    // This would normally delegate to appropriate crypto providers
    // For now, simulate with basic RSA (real implementation would use factory)
    if (algorithm === 'RSA-OAEP') {
      return await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      )
    }
    
    // For PQC algorithms, would use appropriate implementations
    throw new Error(`Key generation for ${algorithm} not implemented yet`)
  }

  private isQuantumSafeAlgorithm(algorithm: CryptoAlgorithmType): boolean {
    return algorithm.startsWith('ML-KEM') || 
           algorithm.startsWith('Dilithium') ||
           algorithm.startsWith('Hybrid')
  }

  private getAlgorithmSecurityLevel(algorithm: CryptoAlgorithmType): SecurityLevel {
    if (algorithm.includes('1024')) return 'maximum'
    if (algorithm.includes('768')) return 'high'
    if (algorithm.includes('512')) return 'medium'
    if (algorithm.includes('RSA')) return 'low'
    return 'medium'
  }

  private getKeyUsage(algorithm: CryptoAlgorithmType): 'encryption' | 'signing' | 'kex' {
    if (algorithm.includes('KEM')) return 'kex'
    if (algorithm.includes('Dilithium')) return 'signing'
    return 'encryption'
  }

  private async getCurrentQuantumThreatLevel(): Promise<number> {
    // Would integrate with SecurityMonitorService
    // For now, return simulated value
    return 45 + Math.random() * 20
  }

  private emitEvent(event: KeyLifecycleEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in key lifecycle event listener:', error)
      }
    }
  }
}
