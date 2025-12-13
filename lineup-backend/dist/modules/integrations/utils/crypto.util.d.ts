export declare function encrypt(plaintext: string): string;
export declare function decrypt(ciphertext: string): string;
export declare function encryptObject(obj: any): string;
export declare function decryptObject<T = any>(ciphertext: string): T;
