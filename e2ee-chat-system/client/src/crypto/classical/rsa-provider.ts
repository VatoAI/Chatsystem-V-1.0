/**
 * RSA-OAEP Crypto Provider
 * Classical encryption (quantum-vulnerable but widely supported)
 * Maintains compatibility with existing Web Crypto API
 */

import type { CryptoProvider, CryptoKeyPair, CryptoAlgorithmType, SecurityLevel } from '../core/types'
import { CryptoError } from '../core/types'

export class RSAProvider implements CryptoProvider {
  readonly algorithm: CryptoAlgorithmType = 'RSA-OAEP'
  readonly securityLevel: SecurityLevel = 'quantum-vulnerable' 
  readonly isQuantumSafe: boolean = false

  private readonly keyParams: RsaHashedKeyGenParams = {
    name: 'RSA-OAEP',
    modulusLength: 2048, // Can be upgraded to 4096 for stronger security
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  }

  async generateKeyPair(): Promise<CryptoKeyPair> {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        this.keyParams,
        true,
        ['encrypt', 'decrypt']
      )

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
      }
    } catch (error) {
      throw new CryptoError(
        `RSA key generation failed: ${error}`,
        'KEY_GENERATION_FAILED',
        this.algorithm
      )
    }
  }

  async encrypt(data: string, publicKey: CryptoKey | Uint8Array): Promise<string> {
    try {
      const cryptoKey = await this.ensureCryptoKey(publicKey)
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      // RSA-OAEP has message length limits, for larger messages we'd need hybrid encryption
      if (dataBuffer.length > 190) { // Conservative limit for 2048-bit RSA
        throw new CryptoError(
          'Message too large for RSA encryption. Consider using hybrid encryption.',
          'ENCRYPTION_FAILED',
          this.algorithm
        )
      }

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        cryptoKey,
        dataBuffer
      )

      return this.arrayBufferToBase64(encryptedBuffer)
    } catch (error) {
      if (error instanceof CryptoError) throw error
      throw new CryptoError(
        `RSA encryption failed: ${error}`,
        'ENCRYPTION_FAILED',
        this.algorithm
      )
    }
  }

  async decrypt(encryptedData: string, privateKey: CryptoKey | Uint8Array): Promise<string> {
    try {
      const cryptoKey = await this.ensureCryptoKey(privateKey)
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData)

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        cryptoKey,
        encryptedBuffer
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedBuffer)
    } catch (error) {
      throw new CryptoError(
        `RSA decryption failed: ${error}`,
        'DECRYPTION_FAILED',
        this.algorithm
      )
    }
  }

  async exportKey(key: CryptoKey | Uint8Array): Promise<string> {
    try {
      if (key instanceof Uint8Array) {
        const bytes = new Uint8Array(key.buffer, key.byteOffset, key.byteLength)
        return this.arrayBufferToBase64(bytes.buffer as ArrayBuffer)
      }

      const exported = await window.crypto.subtle.exportKey(
        key.type === 'private' ? 'pkcs8' : 'spki',
        key
      )
      
      return this.arrayBufferToBase64(exported)
    } catch (error) {
      throw new CryptoError(
        `RSA key export failed: ${error}`,
        'KEY_GENERATION_FAILED',
        this.algorithm
      )
    }
  }

  async importKey(keyData: string): Promise<CryptoKey> {
    try {
      const keyBuffer = this.base64ToArrayBuffer(keyData)
      
      // Try to import as public key first
      try {
        return await window.crypto.subtle.importKey(
          'spki',
          keyBuffer,
          { name: 'RSA-OAEP', hash: 'SHA-256' },
          true,
          ['encrypt']
        )
      } catch {
        // If that fails, try as private key
        return await window.crypto.subtle.importKey(
          'pkcs8',
          keyBuffer,
          { name: 'RSA-OAEP', hash: 'SHA-256' },
          true,
          ['decrypt']
        )
      }
    } catch (error) {
      throw new CryptoError(
        `RSA key import failed: ${error}`,
        'KEY_GENERATION_FAILED',
        this.algorithm
      )
    }
  }

  getQuantumReadinessScore(): number {
    // RSA is completely vulnerable to quantum attacks
    return 0
  }

  canUpgradeTo(algorithm: CryptoAlgorithmType): boolean {
    // RSA can upgrade to any other algorithm
    return algorithm !== this.algorithm
  }

  // Utility methods
  private async ensureCryptoKey(key: CryptoKey | Uint8Array): Promise<CryptoKey> {
    if (key instanceof CryptoKey) {
      return key
    }
    
    // Convert Uint8Array to CryptoKey
    const bytes = new Uint8Array(key.buffer, key.byteOffset, key.byteLength)
    const keyData = this.arrayBufferToBase64(bytes.buffer as ArrayBuffer)
    return await this.importKey(keyData)
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Enhanced security methods
  async generateStrongerKey(): Promise<CryptoKeyPair> {
    const strongerParams: RsaHashedKeyGenParams = {
      ...this.keyParams,
      modulusLength: 4096 // Stronger against classical attacks
    }

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        strongerParams,
        true,
        ['encrypt', 'decrypt']
      )

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
      }
    } catch (error) {
      throw new CryptoError(
        `Strong RSA key generation failed: ${error}`,
        'KEY_GENERATION_FAILED',
        this.algorithm
      )
    }
  }

  // Check if browser supports required crypto features
  static isSupported(): boolean {
    return !!(
      window.crypto?.subtle &&
      typeof window.crypto.subtle.generateKey === 'function' &&
      typeof window.crypto.subtle.encrypt === 'function' &&
      typeof window.crypto.subtle.decrypt === 'function' &&
      typeof window.crypto.subtle.exportKey === 'function' &&
      typeof window.crypto.subtle.importKey === 'function'
    )
  }

  // Instance method for interface compliance
  isSupported(): boolean {
    return RSAProvider.isSupported()
  }

  // Get configuration details
  getConfig() {
    return {
      algorithm: this.algorithm,
      keySize: this.keyParams.modulusLength,
      hash: this.keyParams.hash,
      securityLevel: this.securityLevel,
      quantumSafe: this.isQuantumSafe,
      warnings: this.getSecurityWarnings()
    }
  }

  // Get key size information
  getKeySize(): number {
    return this.keyParams.modulusLength
  }

  // Security warnings
  getSecurityWarnings(): string[] {
    return [
      '⚠️ RSA-OAEP is vulnerable to quantum computer attacks',
      '⚠️ Consider upgrading to post-quantum cryptography',
      '⚠️ Message size limited to ~190 bytes for 2048-bit keys',
      'ℹ️ Suitable for key exchange and short messages only'
    ]
  }
}
