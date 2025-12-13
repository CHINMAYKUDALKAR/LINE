import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
    const key = process.env.TOKEN_ENCRYPTION_KEY || 'default-insecure-key-32-bytes-lng!'; // In prod, fail if missing
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv.tag.ciphertext
    return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted}`;
}

export function decrypt(ciphertext: string): string {
    const key = process.env.TOKEN_ENCRYPTION_KEY || 'default-insecure-key-32-bytes-lng!';
    const parts = ciphertext.split('.');
    if (parts.length !== 3) throw new Error('Invalid ciphertext format');

    const [ivHex, tagHex, contentHex] = parts;

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
