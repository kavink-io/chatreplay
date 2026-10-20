import { describe, it, expect } from 'vitest';
import { matchMediaWithMessages } from '../lib/mediaMatcher';
import { ChatMessage, MediaFileEntry } from '../types/chat';

describe('Media Matcher', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      timestamp: new Date('2026-10-20T10:00:00Z'),
      sender: 'Kavin',
      content: 'IMG-001.jpg (file attached)',
      type: 'image',
      mediaFilename: 'IMG-001.jpg',
      isSystemMessage: false,
      rawLine: 'line 1'
    },
    {
      id: '2',
      timestamp: new Date('2026-10-20T10:05:00Z'),
      sender: 'Sarah',
      content: 'MissingDoc.pdf (file attached)',
      type: 'document',
      mediaFilename: 'MissingDoc.pdf',
      isSystemMessage: false,
      rawLine: 'line 2'
    },
    {
      id: '3',
      timestamp: new Date('2026-10-20T10:10:00Z'),
      sender: 'Kavin',
      content: 'Regular text message',
      type: 'text',
      isSystemMessage: false,
      rawLine: 'line 3'
    }
  ];

  it('matches existing media files and counts missing ones accurately', () => {
    const mediaFiles = new Map<string, MediaFileEntry>();
    mediaFiles.set('IMG-001.jpg', {
      filename: 'IMG-001.jpg',
      blob: new Blob(),
      url: 'blob:http://localhost/mock-url',
      size: 1024,
      mimeType: 'image/jpeg'
    });

    const result = matchMediaWithMessages(mockMessages, mediaFiles);

    expect(result.stats.matchedMediaCount).toBe(1);
    expect(result.stats.missingMediaCount).toBe(1);
    expect(result.stats.textCount).toBe(1);
    expect(result.stats.totalMessages).toBe(3);

    // Verify mediaUrl attached
    expect(result.messages[0].mediaUrl).toBe('blob:http://localhost/mock-url');
    expect(result.messages[1].mediaUrl).toBeUndefined();

    // Verify participant counts
    expect(result.stats.participantMessageCounts['Kavin']).toBe(2);
    expect(result.stats.participantMessageCounts['Sarah']).toBe(1);
  });
});

