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
exports.getMimeType = getMimeType;
exports.getExtension = getExtension;
exports.isAllowedMimeType = isAllowedMimeType;
exports.validateFileSize = validateFileSize;
const mime = __importStar(require("mime-types"));
const ALLOWED_MIME_TYPES = {
    candidate: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg',
    ],
    interview: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg',
    ],
    user: [
        'image/png',
        'image/jpeg',
        'image/jpg',
    ],
};
function getMimeType(filename) {
    return mime.lookup(filename) || 'application/octet-stream';
}
function getExtension(mimeType) {
    return mime.extension(mimeType) || '';
}
function isAllowedMimeType(mimeType, linkedType) {
    if (!linkedType)
        return true;
    const allowed = ALLOWED_MIME_TYPES[linkedType];
    if (!allowed)
        return true;
    return allowed.includes(mimeType);
}
function validateFileSize(size, maxSizeMB = 100) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size <= maxBytes;
}
//# sourceMappingURL=mime.util.js.map