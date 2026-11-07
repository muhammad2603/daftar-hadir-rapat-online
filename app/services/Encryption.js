import * as crypto from 'node:crypto';
import 'dotenv/config';

const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

/**
 * Enkripsi data text menggunakan AES-256-GCM
 * 
 * @param {string} text Text yang akan dienkripsi
 * 
 * @returns {string}
 * Format final enkripsi "IV:AuthTag:Encrypted"
 */
export const encryptData = (text) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Dekripsi data text yang telah dienkripsi
 * 
 * @param {string} encryptedData Data yang telah dienkripsi
 */
export const decryptData = (encryptedData) => {
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}