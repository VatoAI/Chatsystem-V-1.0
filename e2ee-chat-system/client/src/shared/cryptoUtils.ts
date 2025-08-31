/**
 * Generates a new ECDH key pair for end-to-end encryption
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  )
}

/**
 * Exports a public key to base64 string format
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const buffer = await crypto.subtle.exportKey('spki', publicKey)
  return bufferToBase64(buffer)
}

/**
 * Imports a public key from base64 string format
 */
export async function importPublicKey(publicKeyString: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(publicKeyString)
  return crypto.subtle.importKey(
    'spki',
    buffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    false,
    []
  )
}

/**
 * Encrypts a message using the recipient's public key
 */
export async function encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<string> {
  // Generate ephemeral key pair for this message
  const ephemeralKeyPair = await generateKeyPair()
  
  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: recipientPublicKey
    },
    ephemeralKeyPair.privateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt']
  )

  // Encrypt the message
  const encoder = new TextEncoder()
  const messageBuffer = encoder.encode(message)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    sharedSecret,
    messageBuffer
  )

  // Export ephemeral public key
  const ephemeralPublicKeyBuffer = await crypto.subtle.exportKey('spki', ephemeralKeyPair.publicKey)
  
  // Combine ephemeral public key, IV, and encrypted message
  const combined = new Uint8Array(
    ephemeralPublicKeyBuffer.byteLength + iv.byteLength + encryptedBuffer.byteLength
  )
  
  combined.set(new Uint8Array(ephemeralPublicKeyBuffer), 0)
  combined.set(iv, ephemeralPublicKeyBuffer.byteLength)
  combined.set(new Uint8Array(encryptedBuffer), ephemeralPublicKeyBuffer.byteLength + iv.byteLength)

  return bufferToBase64(combined.buffer)
}

/**
 * Decrypts a message using the recipient's private key
 */
export async function decryptMessage(encryptedMessage: string, privateKey: CryptoKey): Promise<string> {
  const combinedBuffer = base64ToBuffer(encryptedMessage)
  const combined = new Uint8Array(combinedBuffer)
  
  // Extract components
  const ephemeralPublicKeyBuffer = combined.slice(0, 91) // SPKI format for P-256 is 91 bytes
  const iv = combined.slice(91, 103) // 12 bytes IV
  const encryptedBuffer = combined.slice(103)
  
  // Import ephemeral public key
  const ephemeralPublicKey = await crypto.subtle.importKey(
    'spki',
    ephemeralPublicKeyBuffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    false,
    []
  )
  
  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: ephemeralPublicKey
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  )
  
  // Decrypt the message
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    sharedSecret,
    encryptedBuffer
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

/**
 * Converts ArrayBuffer to base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Converts base64 string to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
