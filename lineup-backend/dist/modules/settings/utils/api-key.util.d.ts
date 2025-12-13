export declare function generateApiKey(): string;
export declare function hashApiKey(key: string): Promise<string>;
export declare function verifyApiKey(plain: string, hash: string): Promise<boolean>;
