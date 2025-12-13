"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOCR = runOCR;
exports.isImageMimeType = isImageMimeType;
async function runOCR(buffer) {
    console.log('OCR not implemented yet. Buffer size:', buffer.length);
    return '';
}
function isImageMimeType(mimeType) {
    return mimeType.startsWith('image/');
}
//# sourceMappingURL=ocr.util.js.map