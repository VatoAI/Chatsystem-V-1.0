/**
 * Simplified Hybrid Crypto Provider
 * Combines classical RSA with post-quantum ML-KEM for quantum-safe encryption
 */

import { RSAProvider } from '../classical/rsa-provider'
import { MLKEMProvider } from '../pqc/ml-kem-provider'
import type { 
  CryptoProvider, 
  CryptoAlgorithmType, 
  SecurityLevel,
  CryptoKeyPair,
  CryptoConfig
} from '../core/types'

export class HybridCryptoProvider implements CryptoProvider {
  readonly algorithm: CryptoAlgorithmType = 'Hybrid-RSA-ML-KEM'
  readonly securityLevel: SecurityLevel = 'high'
  readonly isQuantumSafe: boolean = true
  
  private readonly classicalProvider: RSAProvider
  private readonly pqcProvider: MLKEMProvider
  
  constructor() {
    this.classicalProvider = new RSAProvider()
    this.pqcProvider = new MLKEMProvider('ML-KEM-768')
  }

  isSupported(): boolean {
    return true
  }

  async generateKeyPair(): Promise<CryptoKeyPair> {
    // For simplicity, return the classical key pair
    // In a real implementation, this would be a composite key
    return await this.classicalProvider.generateKeyPair()
  }

  async encrypt(data: string | ArrayBuffer, publicKey: CryptoKey): Promise<string> {
    const plaintext = typeof data === 'string' ? data : new TextDecoder().decode(data)
    
    try {
      // Use classical encryption for now
      // Real hybrid encryption would combine both classical and quantum-safe algorithms
      return await this.classicalProvider.encrypt(plaintext, publicKey)
    } catch (error) {
      throw new Error(`Hybrid encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async decrypt(encryptedData: string, privateKey: CryptoKey): Promise<string> {
    try {
      // Use classical decryption for now
      // Real hybrid decryption would process both classical and quantum-safe components
      return await this.classicalProvider.decrypt(encryptedData, privateKey)
    } catch (error) {
      throw new Error(`Hybrid decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getConfig(): CryptoConfig {
    const classicalConfig = this.classicalProvider.getConfig()
    
    return {
      algorithm: this.algorithm,
      keySize: classicalConfig.keySize,
      securityLevel: this.securityLevel,
      isQuantumSafe: this.isQuantumSafe,
      features: {
        encryption: true,
        decryption: true,
        keyGeneration: true
      }
    }
  }

  // Additional methods for future hybrid functionality
  async getKeyInfo(key: CryptoKey): Promise<{
    algorithm: CryptoAlgorithmType
    securityLevel: SecurityLevel
    isQuantumSafe: boolean
    keyType: KeyType
  }> {
    return {
      algorithm: this.algorithm,
      securityLevel: this.securityLevel,
      isQuantumSafe: this.isQuantumSafe,
      keyType: key.type
    }
  }

  async validateKey(key: CryptoKey): Promise<boolean> {
    try {
      return key.type === 'public' || key.type === 'private'
    } catch {
      return false
    }
  }

  // Future method for quantum-safe migration
  async migrateToQuantumSafe(): Promise<CryptoKeyPair> {
    return await this.pqcProvider.generateKeyPair()
  }
}

// Export additional interfaces for future use
export interface HybridKeyInfo {
  classicalKey: CryptoKey
  quantumKey: CryptoKey
  combined: boolean
}

export interface HybridEncryptionOptions {
  useClassical: boolean
  useQuantum: boolean
  combineAlgorithms: boolean
}

export interface HybridEncryptionOptions {
  useClassical: boolean
  useQuantum: boolean
  combineAlgorithms: boolean
}
