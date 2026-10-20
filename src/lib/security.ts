/**
 * Security and sanitization utilities for ChatReplay.
 * Ensures zero XSS, safe URL protocols, and ZIP safety limits.
 */

// Max limits for safe in-browser processing
export const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB
export const MAX_TXT_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_ZIP_ENTRIES = 3000;
export const MAX_TOTAL_UNCOMPRESSED_SIZE = 600 * 1024 * 1024; // 600MB

/**
 * Validates if a URL is safe to open (only http: and https: protocols).
 */
export function isSafeUrl(urlStr: string): boolean {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return false;
    }
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parses message text and splits it into safe text and safe link segments.
 */
export interface TextSegment {
  type: 'text' | 'link';
  value: string;
  url?: string;
}

export function parseMessageSegments(text: string): TextSegment[] {
  if (!text) return [];

  // Match URLs starting with http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+)/gi;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: text.substring(lastIndex, match.index)
      });
    }

    const matchedUrl = match[0];
    const fullUrl = matchedUrl.startsWith('www.') ? `https://${matchedUrl}` : matchedUrl;

    if (isSafeUrl(fullUrl)) {
      segments.push({
        type: 'link',
        value: matchedUrl,
        url: fullUrl
      });
    } else {
      segments.push({
        type: 'text',
        value: matchedUrl
      });
    }

    lastIndex = match.index + matchedUrl.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.substring(lastIndex)
    });
  }

  return segments;
}

/**
 * Strips invisible Unicode control characters (like \u200e LTR mark, \u200f RTL mark,
 * \u202a-\u202e, \u202f narrow no-break space, \ufeff BOM) commonly inserted by iOS/Android WhatsApp.
 */
export function cleanWhatsAppText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, '')
    .replace(/\u202f/g, ' ')
    .replace(/\u00a0/g, ' ');
}

/**
 * Sanitizes filenames to prevent path traversal or special character attacks.
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

