import * as jwt from 'jsonwebtoken';
export declare function createSignedLink(payload: Record<string, any>, expiresIn?: string): string;
export declare function verifySignedToken(token: string): string | jwt.JwtPayload;
