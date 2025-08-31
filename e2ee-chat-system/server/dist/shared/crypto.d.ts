import { KeyPair } from '../shared/types';
export declare class CryptoManager {
    /**
     * Generates a new ECDH key pair using Web Crypto API
     */
    static generateKeyPair(): Promise<KeyPair>;
    /**
     * Derives a shared secret from private and public keys
     */
    static deriveSharedSecret(privateKeyBase64: string, publicKeyBase64: string): Promise<CryptoKey>;
    /**
     * Encrypts a message using AES-GCM with derived shared secret
     */
    static encryptMessage(message: string, privateKeyBase64: string, publicKeyBase64: string): Promise<string>;
    /**
     * Decrypts a message using AES-GCM with derived shared secret
     */
    static decryptMessage(encryptedMessageBase64: string, privateKeyBase64: string, publicKeyBase64: string): Promise<string>;
    /**
     * Converts ArrayBuffer to Base64 string
     */
    private static bufferToBase64;
    /**
     * Converts Base64 string to ArrayBuffer
     */
    private static base64ToBuffer;
}
//# sourceMappingURL=crypto.d.ts.map