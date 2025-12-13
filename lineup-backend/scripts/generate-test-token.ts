/**
 * Quick Auth Token Generator
 * This creates a simple test token for development
 * 
 * IMPORTANT: This is for TESTING ONLY
 * In production, use proper authentication
 */

import * as jwt from 'jsonwebtoken';

// This MUST match your JWT_SECRET in backend .env
const JWT_SECRET = 'supersecretkey';

const payload = {
    sub: 'test-user-123',
    email: 'test@example.com',
    tenantId: 'tenant_123',
    role: 'ADMIN',
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('\n=== TEST AUTH TOKEN ===\n');
console.log('Copy this token and use it in your browser:\n');
console.log(token);
console.log('\n=== USAGE ===\n');
console.log('In browser console, run:');
console.log(`localStorage.setItem('auth_token', '${token}');\n`);
console.log('Then refresh the page and try uploading!\n');
