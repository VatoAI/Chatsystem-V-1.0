/**
 * Post-Quantum Cryptography Core Types
 * Defines abstractions for crypto-agile implementation
 * Following NIST PQC standards and Google's hybrid approach
 */

export interface CryptoKeyPair {
  publicKey: CryptoKey | Uint8Array
  privateKey: CryptoKey | Uint8Array
}

export interface SerializedKeyPair {
  publicKey: string
  privateKey: string
  keyType: CryptoAlgorithmType
  quantumSafe: boolean
}

export type CryptoAlgorithmType = 
  // Classical algorithms (quantum-vulnerable)
  | 'RSA-OAEP'
  | 'ECDH'
  // Post-quantum algorithms (quantum-safe)
  | 'ML-KEM-512'
  | 'ML-KEM-768'
  | 'ML-KEM-1024'
  | 'CRYSTALS-Dilithium'
  | 'SPHINCS+'
  // Hybrid algorithms (best of both worlds)
  | 'Hybrid-RSA-ML-KEM'
  | 'Hybrid-ECDH-ML-KEM'
  | 'Hybrid-RSAOAEP-MLKEM512'
  | 'Hybrid-RSAOAEP-MLKEM1024'

export type SecurityLevel = 
  | 'quantum-vulnerable'
  | 'quantum-resistant'
  | 'quantum-safe'
  | 'hybrid'
  | 'low'
  | 'medium'
  | 'high'
  | 'maximum'

export interface CryptoMetadata {
  algorithm: CryptoAlgorithmType
  securityLevel: SecurityLevel
  keySize: number
  created: Date
  expiresAt?: Date
  quantumResistant: boolean
  nistApproved: boolean
}

export interface EncryptedMessage {
  data: string
  algorithm: CryptoAlgorithmType
  securityLevel: SecurityLevel
  timestamp: number
  metadata?: CryptoMetadata
}

export interface CryptoProvider {
  readonly algorithmType?: CryptoAlgorithmType
  readonly algorithm: CryptoAlgorithmType  // For compatibility
  readonly securityLevel: SecurityLevel
  readonly quantumSafe?: boolean
  readonly isQuantumSafe: boolean  // For compatibility
  
  generateKeyPair(): Promise<CryptoKeyPair>
  encrypt(data: string | ArrayBuffer, publicKey: CryptoKey | Uint8Array): Promise<string | ArrayBuffer>
  decrypt(encryptedData: string | ArrayBuffer, privateKey: CryptoKey | Uint8Array): Promise<string | ArrayBuffer>
  
  // Optional methods for compatibility
  sign?(data: ArrayBuffer, privateKey: CryptoKey): Promise<ArrayBuffer>
  verify?(data: ArrayBuffer, signature: ArrayBuffer, publicKey: CryptoKey): Promise<boolean>
  
  exportKey?(key: CryptoKey | Uint8Array): Promise<string>
  importKey?(keyData: string): Promise<CryptoKey | Uint8Array>
  
  isSupported(): boolean
  getConfig(): CryptoConfig
  
  // Quantum readiness assessment
  getQuantumReadinessScore?(): number
  canUpgradeTo?(algorithm: CryptoAlgorithmType): boolean
}

export interface HybridCryptoProvider extends CryptoProvider {
  readonly classicalProvider: CryptoProvider
  readonly quantumProvider: CryptoProvider
  
  migrateToQuantumSafe(): Promise<void>
  validateHybridEncryption(encrypted: EncryptedMessage): Promise<boolean>
}

export interface KeyManager {
  generateKey(algorithm: CryptoAlgorithmType): Promise<string>
  rotateKey(keyId: string): Promise<string>
  revokeKey(keyId: string): Promise<void>
  getKey(keyId: string): Promise<CryptoKey | null>
  getPublicKey(keyId: string): Promise<CryptoKey | null>
}

export interface SecurityMonitor {
  assessQuantumThreat(): Promise<number> // 0-100 threat level
  recommendAlgorithm(): Promise<CryptoAlgorithmType>
  auditCryptoUsage(): Promise<CryptoAuditReport>
  trackKeyLifecycle(keyId: string): Promise<KeyLifecycleEvent[]>
}

export interface CryptoAuditReport {
  totalMessages: number
  quantumVulnerableMessages: number
  quantumSafeMessages: number
  hybridMessages: number
  recommendations: string[]
  threatLevel: number
  lastAssessment: Date
}

export interface KeyLifecycleEvent {
  keyId: string
  type: 'created' | 'used' | 'rotated' | 'expired' | 'revoked' // Updated for key manager compatibility
  event?: 'generated' | 'used' | 'rotated' | 'expired' | 'compromised' // Legacy support
  timestamp: Date
  algorithm: CryptoAlgorithmType
  details?: string
  previousKeyId?: string
  metadata?: Record<string, unknown>
}

export interface CryptoConfig {
  algorithm?: CryptoAlgorithmType
  keySize?: number
  securityLevel?: SecurityLevel
  isQuantumSafe?: boolean
  
  // Factory config fields
  preferredAlgorithm?: CryptoAlgorithmType
  fallbackAlgorithms?: CryptoAlgorithmType[]
  keyRotationInterval?: number // hours
  enableHybridMode?: boolean
  quantumThresholdScore?: number // 0-100
  nistComplianceRequired?: boolean
  
  // Provider feature flags
  features?: {
    encryption?: boolean
    decryption?: boolean
    signing?: boolean
    verification?: boolean
    keyGeneration?: boolean
  }
  
  // Hybrid-specific config
  hybridComponents?: {
    classical?: CryptoConfig
    postQuantum?: CryptoConfig
  }
}

// Error types for crypto operations
export class CryptoError extends Error {
  public readonly code: CryptoErrorCode
  public readonly algorithm?: CryptoAlgorithmType

  constructor(
    message: string,
    code: CryptoErrorCode,
    algorithm?: CryptoAlgorithmType
  ) {
    super(message)
    this.name = 'CryptoError'
    this.code = code
    this.algorithm = algorithm
  }
}

export type CryptoErrorCode = 
  | 'ALGORITHM_NOT_SUPPORTED'
  | 'KEY_GENERATION_FAILED'
  | 'ENCRYPTION_FAILED'
  | 'DECRYPTION_FAILED'
  | 'QUANTUM_THREAT_DETECTED'
  | 'NIST_COMPLIANCE_VIOLATION'
  | 'HYBRID_MODE_FAILURE'
  | 'NOT_IMPLEMENTED'
  | 'INVALID_OPERATION'
  | 'SIGNATURE_FAILED'
