import { chatService } from '../lib/chatService'
import { generateKeyPair, encryptMessage, decryptMessage, exportPublicKey, importPublicKey } from '../shared/cryptoUtils'

// Test E2EE functionality
export async function testE2EEChat() {
  console.log('🔧 Starting E2EE Chat Tests...')

  try {
    // Test 1: Key generation
    console.log('📋 Test 1: Key Generation')
    const keyPair1 = await generateKeyPair()
    const keyPair2 = await generateKeyPair()
    console.log('✅ Key pairs generated successfully')

    // Test 2: Key export/import
    console.log('📋 Test 2: Key Export/Import')
    const publicKeyString = await exportPublicKey(keyPair1.publicKey)
    const importedKey = await importPublicKey(publicKeyString)
    console.log('✅ Key export/import successful:', importedKey.type)

    // Test 3: Encryption/Decryption
    console.log('📋 Test 3: Encryption/Decryption')
    const testMessage = 'Hello, this is a test message! 🔒'
    const encryptedMessage = await encryptMessage(testMessage, keyPair2.publicKey)
    const decryptedMessage = await decryptMessage(encryptedMessage, keyPair2.privateKey)
    
    if (decryptedMessage === testMessage) {
      console.log('✅ Encryption/Decryption successful')
    } else {
      console.error('❌ Encryption/Decryption failed - messages dont match')
      return false
    }

    // Test 4: Cross-key encryption (Alice->Bob)
    console.log('📋 Test 4: Cross-key Encryption (Alice encrypts for Bob)')
    const aliceMessage = 'Hi Bob! This is from Alice 👋'
    const encryptedForBob = await encryptMessage(aliceMessage, keyPair2.publicKey)
    const decryptedByBob = await decryptMessage(encryptedForBob, keyPair2.privateKey)
    
    if (decryptedByBob === aliceMessage) {
      console.log('✅ Cross-key encryption successful')
    } else {
      console.error('❌ Cross-key encryption failed')
      return false
    }

    console.log('🎉 All E2EE tests passed!')
    return true

  } catch (error) {
    console.error('❌ E2EE Test Error:', error)
    return false
  }
}

// Test Supabase connection
export async function testSupabaseConnection() {
  console.log('🔧 Starting Supabase Connection Tests...')

  try {
    // Test login with a test user
    console.log('📋 Test 1: User Login')
    const loginResult = await chatService.login('TestUser1')
    
    if (loginResult.success) {
      console.log('✅ Login successful:', loginResult.user?.username)
    } else {
      console.error('❌ Login failed:', loginResult.error)
      return false
    }

    // Test getting online users
    console.log('📋 Test 2: Get Online Users')
    const users = await chatService.getOnlineUsers()
    console.log('✅ Online users retrieved:', users.length, 'users')

    // Test logout
    console.log('📋 Test 3: Logout')
    await chatService.logout()
    console.log('✅ Logout successful')

    console.log('🎉 All Supabase tests passed!')
    return true

  } catch (error) {
    console.error('❌ Supabase Test Error:', error)
    return false
  }
}

// Run full integration test
export async function runFullIntegrationTest() {
  console.log('🚀 Starting Full Integration Test...')
  
  const e2eeResult = await testE2EEChat()
  const supabaseResult = await testSupabaseConnection()
  
  if (e2eeResult && supabaseResult) {
    console.log('🎉 All integration tests passed! Your E2EE chat system is ready! 🔒✨')
    return true
  } else {
    console.error('❌ Some tests failed. Please check the errors above.')
    return false
  }
}
