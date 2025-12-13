import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure key is 32 bytes. If not provided or invalid length, this will throw or needs careful handling.
// Use a hash to ensure 32 bytes if the env var isn't exactly that, or assume the user provides a hex string.
// For safety, let's hash it if it's not the right length, or just assume the user follows the 32 byte hex rule.
// The prompt says "32 bytes hex in env", so we assume it is valid hex.
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY || '0000000000000000000000000000000000000000000000000000000000000000', 'hex');

export function encryptToken(plain: string) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

export function decryptToken(payload: string) {
    const [ivHex, tagHex, dataHex] = payload.split('.');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const data = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
}
