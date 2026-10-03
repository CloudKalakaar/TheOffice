// ============================================
// THE OFFICE — API Key Encryption (PIN-based)
// ============================================

const SALT = 'TheOffice_2024_Salt';
const IV_LENGTH = 12;

/**
 * Derive a CryptoKey from a PIN
 * @param {string} pin
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(pin) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin + SALT),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string with a PIN
 * @param {string} plaintext
 * @param {string} pin
 * @returns {Promise<string>} Base64 encoded encrypted data
 */
export async function encrypt(plaintext, pin = 'default') {
  try {
    const key = await deriveKey(pin);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('[Crypto] Encryption failed:', e);
    // Fallback: simple base64 encoding (not secure, but works)
    return btoa(plaintext);
  }
}

/**
 * Decrypt a string with a PIN
 * @param {string} ciphertext - Base64 encoded
 * @param {string} pin
 * @returns {Promise<string>}
 */
export async function decrypt(ciphertext, pin = 'default') {
  try {
    const key = await deriveKey(pin);
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('[Crypto] Decryption failed:', e);
    // Fallback: try simple base64 decode
    try { return atob(ciphertext); } catch { return ''; }
  }
}

/**
 * Simple obfuscation for localStorage (no crypto API needed)
 * @param {string} text
 * @returns {string}
 */
export function obfuscate(text) {
  return btoa(encodeURIComponent(text).split('').reverse().join(''));
}

/**
 * Deobfuscate
 * @param {string} encoded
 * @returns {string}
 */
export function deobfuscate(encoded) {
  try {
    return decodeURIComponent(atob(encoded).split('').reverse().join(''));
  } catch {
    return '';
  }
}

/**
 * Save an API key to localStorage (obfuscated)
 * @param {string} provider
 * @param {string} apiKey
 */
export function saveApiKey(provider, apiKey) {
  const key = `theoffice_key_${provider}`;
  localStorage.setItem(key, obfuscate(apiKey));
}

/**
 * Load an API key from localStorage
 * @param {string} provider
 * @returns {string|null}
 */
export function loadApiKey(provider) {
  const key = `theoffice_key_${provider}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  return deobfuscate(stored);
}

/**
 * Remove an API key
 * @param {string} provider
 */
export function removeApiKey(provider) {
  localStorage.removeItem(`theoffice_key_${provider}`);
}

/**
 * Get all stored provider keys
 * @returns {Object} { providerName: apiKey }
 */
export function getAllApiKeys() {
  const keys = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('theoffice_key_')) {
      const provider = k.replace('theoffice_key_', '');
      keys[provider] = deobfuscate(localStorage.getItem(k));
    }
  }
  return keys;
}

/**
 * Mask an API key for display
 * @param {string} key
 * @returns {string}
 */
export function maskApiKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}

export default { encrypt, decrypt, obfuscate, deobfuscate, saveApiKey, loadApiKey, removeApiKey, getAllApiKeys, maskApiKey };
