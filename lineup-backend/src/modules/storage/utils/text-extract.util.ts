const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        } catch (error) {
            console.error('PDF text extraction failed:', error);
            return '';
        }
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword') {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } catch (error) {
            console.error('DOCX text extraction failed:', error);
            return '';
        }
    }

    if (mimeType === 'text/plain') {
        return buffer.toString('utf-8');
    }

    return '';
}
