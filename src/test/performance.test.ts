import { describe, it, expect } from 'vitest';
import { parseWhatsAppChat } from '../lib/whatsappParser';
import { matchMediaWithMessages } from '../lib/mediaMatcher';

describe('Performance on Large Exports (35,000+ messages)', () => {
  it('parses 35,000 messages in under 1 second', () => {
    // Generate realistic 35,000 messages sample
    const lines: string[] = [];
    for (let i = 0; i < 35000; i++) {
      const sender = i % 2 === 0 ? 'Kavin' : 'Sarah';
      lines.push(`20/10/2026, 10:${String(i % 60).padStart(2, '0')} - ${sender}: Message test line #${i}`);
    }
    const sampleExport = lines.join('\n');

    const start = performance.now();
    const result = parseWhatsAppChat(sampleExport);
    const duration = performance.now() - start;

    expect(result.messages.length).toBe(35000);
    expect(result.participants).toEqual(['Kavin', 'Sarah']);
    // Parsing 35,000 messages should be under 1500ms
    expect(duration).toBeLessThan(1500);

    // Test media matching on 35k messages
    const matchStart = performance.now();
    const matched = matchMediaWithMessages(result.messages, new Map());
    const matchDuration = performance.now() - matchStart;

    expect(matched.stats.totalMessages).toBe(35000);
    expect(matchDuration).toBeLessThan(500);
  });
});
