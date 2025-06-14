// Simple encryption/decryption utilities for client-side use
// Note: This is not meant for high-security applications
// For production, consider using a server-side encryption solution

// A simple encryption key (in production, this would be environment-specific)
const ENCRYPTION_KEY = 'locafyr-client-side-encryption-key-2025';

/**
 * Encrypts a string using a simple XOR cipher
 * This is a basic implementation and should be replaced with a more secure solution in production
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  // Convert the text to a byte array
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  
  // XOR each byte with the corresponding byte from the key
  const encryptedBytes = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode.apply(null, Array.from(encryptedBytes)));
}

/**
 * Decrypts a string that was encrypted with the encrypt function
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    // Convert from base64 to byte array
    const encryptedBytes = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    
    // XOR each byte with the corresponding byte from the key
    const decryptedBytes = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert back to string
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('Error decrypting text:', error);
    return '';
  }
}