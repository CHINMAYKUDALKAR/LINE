"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateState = generateState;
exports.parseState = parseState;
exports.computeExpiry = computeExpiry;
exports.isExpired = isExpired;
exports.buildAuthUrl = buildAuthUrl;
exports.extractCodeFromCallback = extractCodeFromCallback;
const crypto = __importStar(require("crypto"));
function generateState(tenantId) {
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const payload = JSON.stringify({ tenantId, timestamp, nonce: randomBytes });
    return Buffer.from(payload).toString('base64url');
}
function parseState(state) {
    try {
        const payload = Buffer.from(state, 'base64url').toString('utf8');
        const parsed = JSON.parse(payload);
        const age = Date.now() - parsed.timestamp;
        if (age > 15 * 60 * 1000) {
            throw new Error('State parameter expired');
        }
        return parsed;
    }
    catch (error) {
        throw new Error(`Invalid state parameter: ${error.message}`);
    }
}
function computeExpiry(expiresIn) {
    return Date.now() + expiresIn * 1000;
}
function isExpired(tokenSet) {
    if (!tokenSet.expiresAt) {
        return false;
    }
    const bufferMs = 5 * 60 * 1000;
    return Date.now() >= (tokenSet.expiresAt - bufferMs);
}
function buildAuthUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    return url.toString();
}
function extractCodeFromCallback(callbackUrl) {
    try {
        const url = new URL(callbackUrl);
        return url.searchParams.get('code');
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=oauth.util.js.map