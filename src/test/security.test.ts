import { describe, it, expect } from 'vitest';
import { isSafeUrl, parseMessageSegments, cleanWhatsAppText, sanitizeFilename } from '../lib/security';

describe('Security & Sanitization', () => {
  it('validates safe web URLs (http and https)', () => {
    expect(isSafeUrl('https://whatsapp.com')).toBe(true);
    expect(isSafeUrl('http://example.com/test?q=1')).toBe(true);
    expect(isSafeUrl('https://sub.domain.org/path/to/page#hash')).toBe(true);
  });

  it('rejects unsafe protocols and XSS vectors', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeUrl('about:blank')).toBe(false);
  });

  it('safely extracts URLs without breaking surrounding text', () => {
    const text = 'Check out https://github.com and let me know!';
    const segments = parseMessageSegments(text);

    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({ type: 'text', value: 'Check out ' });
    expect(segments[1]).toEqual({
      type: 'link',
      value: 'https://github.com',
      url: 'https://github.com'
    });
    expect(segments[2]).toEqual({ type: 'text', value: ' and let me know!' });
  });

  it('does not turn javascript: injections into clickable links', () => {
    const text = 'Click here: javascript:alert(document.cookie)';
    const segments = parseMessageSegments(text);

    const hasDangerousLink = segments.some((s) => s.type === 'link' && s.url?.includes('javascript:'));
    expect(hasDangerousLink).toBe(false);
  });

  it('cleans invisible WhatsApp Unicode formatting characters', () => {
    const dirty = '\u200e[20/10/2026, 10:00\u202fAM] Kavin:\u200e Hello';
    const cleaned = cleanWhatsAppText(dirty);

    expect(cleaned).not.toContain('\u200e');
    expect(cleaned).not.toContain('\u202f');
    expect(cleaned).toBe('[20/10/2026, 10:00 AM] Kavin: Hello');
  });

  it('sanitizes dangerous filenames against directory traversal', () => {
    expect(sanitizeFilename('../../secrets.txt')).toBe('.._.._secrets.txt');
    expect(sanitizeFilename('my<file>:name?.jpg')).toBe('my_file__name_.jpg');
  });
});

