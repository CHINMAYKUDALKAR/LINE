import * as jwt from 'jsonwebtoken';
import ms from 'ms';

export function signAccessToken(payload: object) {
    const ttl = process.env.ACCESS_TOKEN_TTL || '15m';
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: ttl as any });
}

export function signRefreshToken(payload: object) {
    const ttl = process.env.REFRESH_TOKEN_TTL || '7d';
    return jwt.sign(payload, (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string, { expiresIn: ttl as any });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string);
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string);
}
