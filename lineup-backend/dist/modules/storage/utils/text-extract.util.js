"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractText = extractText;
const pdfParse = require('pdf-parse');
const mammoth_1 = __importDefault(require("mammoth"));
async function extractText(buffer, mimeType) {
    if (mimeType === 'application/pdf') {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        }
        catch (error) {
            console.error('PDF text extraction failed:', error);
            return '';
        }
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword') {
        try {
            const result = await mammoth_1.default.extractRawText({ buffer });
            return result.value;
        }
        catch (error) {
            console.error('DOCX text extraction failed:', error);
            return '';
        }
    }
    if (mimeType === 'text/plain') {
        return buffer.toString('utf-8');
    }
    return '';
}
//# sourceMappingURL=text-extract.util.js.map