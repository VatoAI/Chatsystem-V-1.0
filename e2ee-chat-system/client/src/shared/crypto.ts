import type { KeyPair } from '../shared/types';

export class CryptoManager {
  /**
   * Generates a new ECDH key pair using Web Crypto API
   */
  static async generateKeyPair(): Promise<KeyPair> {
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256'
        },
        true, // extractable
        ['deriveKey', 'deriveBits']
      );

      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      return {
        publicKey: this.bufferToBase64(publicKeyBuffer),
        privateKey: this.bufferToBase64(privateKeyBuffer)
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate cryptographic key pair');
    }
  }

  /**
   * Derives a shared secret from private and public keys
   */
  static async deriveSharedSecret(privateKeyBase64: string, publicKeyBase64: string): Promise<CryptoKey> {
    try {
      const privateKeyBuffer = this.base64ToBuffer(privateKeyBase64);
      const publicKeyBuffer = this.base64ToBuffer(publicKeyBase64);

      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveKey', 'deriveBits']
      );

      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        []
      );

      return await crypto.subtle.deriveKey(
        { name: 'ECDH', public: publicKey },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Error deriving shared secret:', error);
      throw new Error('Failed to derive shared secret');
    }
  }

  /**
   * Encrypts a message using AES-GCM with derived shared secret
   */
  static async encryptMessage(
    message: string,
    privateKeyBase64: string,
    publicKeyBase64: string
  ): Promise<string> {
    try {
      const sharedSecret = await this.deriveSharedSecret(privateKeyBase64, publicKeyBase64);
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        sharedSecret,
        data
      );

      // Combine IV + encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      return this.bufferToBase64(combined.buffer);
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypts a message using AES-GCM with derived shared secret
   */
  static async decryptMessage(
    encryptedMessageBase64: string,
    privateKeyBase64: string,
    publicKeyBase64: string
  ): Promise<string> {
    try {
      const sharedSecret = await this.deriveSharedSecret(privateKeyBase64, publicKeyBase64);
      const combined = this.base64ToBuffer(encryptedMessageBase64);
      
      const iv = combined.slice(0, 12); // First 12 bytes are IV
      const encryptedData = combined.slice(12); // Rest is encrypted data

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        sharedSecret,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Converts ArrayBuffer to Base64 string
   */
  private static bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts Base64 string to ArrayBuffer
   */
  private static base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
