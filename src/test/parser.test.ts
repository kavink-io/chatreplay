import { describe, it, expect } from 'vitest';
import { parseWhatsAppChat, identifyMedia, detectDateFormatOrder } from '../lib/whatsappParser';

describe('WhatsApp Parser', () => {
  it('parses standard Android export format (24-hour time)', () => {
    const raw = `20/10/2026, 14:30 - Kavin: Hello world!
20/10/2026, 14:31 - Alex: Hey Kavin!`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].sender).toBe('Kavin');
    expect(result.messages[0].content).toBe('Hello world!');
    expect(result.messages[0].timestamp?.getHours()).toBe(14);
    expect(result.messages[0].timestamp?.getMinutes()).toBe(30);
    expect(result.messages[1].sender).toBe('Alex');
    expect(result.participants).toEqual(['Kavin', 'Alex']);
  });

  it('parses Android export format with 12-hour AM/PM time', () => {
    const raw = `20/10/2026, 2:30 pm - Kavin: Testing afternoon message
20/10/2026, 8:15 am - Sarah: Good morning!`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].timestamp?.getHours()).toBe(14);
    expect(result.messages[1].timestamp?.getHours()).toBe(8);
  });

  it('parses iPhone/iOS export format with brackets and seconds', () => {
    const raw = `[20/10/2026, 10:30:45 AM] Maya: Checking in from iOS!
[20/10/2026, 10:31:02 AM] Kavin: Received loud and clear.`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].sender).toBe('Maya');
    expect(result.messages[0].content).toBe('Checking in from iOS!');
    expect(result.messages[0].timestamp?.getSeconds()).toBe(45);
    expect(result.messages[1].sender).toBe('Kavin');
  });

  it('handles multiline messages cleanly', () => {
    const raw = `20/10/2026, 10:00 - Kavin: Here is the agenda:
Line 1: Planning
Line 2: Development
Line 3: Launch
20/10/2026, 10:05 - Sarah: Looks great!`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].content).toBe(
      `Here is the agenda:\nLine 1: Planning\nLine 2: Development\nLine 3: Launch`
    );
    expect(result.messages[1].content).toBe('Looks great!');
  });

  it('preserves emojis and special Unicode characters', () => {
    const raw = `20/10/2026, 12:00 - Kavin: 🚀 Rocket launch! 🎉 Celebrations 🌟
20/10/2026, 12:01 - Maya: 👍 Super! ❤️`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].content).toContain('🚀');
    expect(result.messages[0].content).toContain('🎉');
    expect(result.messages[1].content).toContain('👍');
    expect(result.messages[1].content).toContain('❤️');
  });

  it('detects group system messages correctly', () => {
    const raw = `20/10/2026, 09:00 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
20/10/2026, 09:01 - Kavin created group "Launch Squad"
20/10/2026, 09:02 - Kavin added Sarah
20/10/2026, 09:05 - Sarah: Hello everyone!
20/10/2026, 09:10 - Sarah left`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(5);
    expect(result.messages[0].isSystemMessage).toBe(true);
    expect(result.messages[0].type).toBe('system');
    expect(result.messages[1].isSystemMessage).toBe(true);
    expect(result.messages[2].isSystemMessage).toBe(true);
    expect(result.messages[3].isSystemMessage).toBe(false);
    expect(result.messages[3].sender).toBe('Sarah');
    expect(result.messages[4].isSystemMessage).toBe(true);
  });

  it('identifies media attachment placeholders and types', () => {
    const imgMsg = identifyMedia('IMG-20261020-WA0001.jpg (file attached)');
    expect(imgMsg.type).toBe('image');
    expect(imgMsg.mediaFilename).toBe('IMG-20261020-WA0001.jpg');

    const iosAttach = identifyMedia('<attached: voice_note.opus>');
    expect(iosAttach.type).toBe('audio');
    expect(iosAttach.mediaFilename).toBe('voice_note.opus');

    const vidMsg = identifyMedia('recording.mp4 (file attached)');
    expect(vidMsg.type).toBe('video');

    const docMsg = identifyMedia('Report.pdf (file attached)');
    expect(docMsg.type).toBe('document');

    const omittedMsg = identifyMedia('<Media omitted>');
    expect(omittedMsg.type).toBe('image');
  });

  it('detects deleted messages correctly', () => {
    const deleted1 = identifyMedia('This message was deleted');
    expect(deleted1.isDeleted).toBe(true);

    const deleted2 = identifyMedia('You deleted this message');
    expect(deleted2.isDeleted).toBe(true);
  });

  it('preserves unparsed lines prior to messages', () => {
    const raw = `Some random notes at the top of file
Another non-chat line
20/10/2026, 10:00 - Kavin: Real message`;

    const result = parseWhatsAppChat(raw);
    expect(result.messages.length).toBe(1);
    expect(result.unparsedLines.length).toBe(2);
    expect(result.unparsedLines[0].text).toBe('Some random notes at the top of file');
    expect(result.unparsedLines[0].lineNumber).toBe(1);
  });

  it('accurately disambiguates DD/MM/YYYY vs MM/DD/YYYY', () => {
    const lines1 = ['25/03/2026, 10:00 - Kavin: Hi'];
    expect(detectDateFormatOrder(lines1)).toBe('DD/MM/YYYY');

    const lines2 = ['03/25/2026, 10:00 - Kavin: Hi'];
    expect(detectDateFormatOrder(lines2)).toBe('MM/DD/YYYY');

    const lines3 = ['2026/03/25, 10:00 - Kavin: Hi'];
    expect(detectDateFormatOrder(lines3)).toBe('YYYY/MM/DD');
  });
});

