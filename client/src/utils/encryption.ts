// client/src/utils/encryption.ts
import CryptoJS from 'crypto-js';

// IMPORTANT: In a real production app, this key should be managed more securely,
// for example, derived from a shared secret established upon login.
// For this implementation, we'll use a static key from environment variables.
const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY || 'default-secret-key-for-chat';

export const encryptMessage = (text: string): string => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};