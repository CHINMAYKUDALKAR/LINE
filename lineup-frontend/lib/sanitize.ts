/**
 * HTML Sanitization Utility
 * Uses DOMPurify to prevent XSS attacks when rendering HTML content
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string that may contain malicious content
 * @returns Sanitized HTML string safe to render with dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') {
        // Server-side: return empty or original (will be sanitized on client)
        return '';
    }
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a', 'span', 'div',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'blockquote', 'pre', 'code',
            'img',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Create props object for dangerouslySetInnerHTML with sanitized HTML
 * @param html - Raw HTML string
 * @returns Object suitable for spreading onto an element
 */
export function createSanitizedHtmlProps(html: string): { dangerouslySetInnerHTML: { __html: string } } {
    return {
        dangerouslySetInnerHTML: { __html: sanitizeHtml(html) },
    };
}
