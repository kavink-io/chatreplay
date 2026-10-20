import { ChatMessage, ChatStats, MediaFileEntry } from '../types/chat';

export interface MatchResult {
  messages: ChatMessage[];
  stats: ChatStats;
}

/**
 * Normalizes filenames for resilient matching against ZIP entries
 */
function cleanNameForMatching(name: string): string {
  return name.trim().toLowerCase().replace(/^[0-9]+-/, ''); // strips iOS index prefix e.g. 00000001-
}

/**
 * Matches extracted media files from ZIP with references in parsed messages
 */
export function matchMediaWithMessages(
  messages: ChatMessage[],
  mediaFiles: Map<string, MediaFileEntry>
): MatchResult {
  let matchedCount = 0;
  let missingCount = 0;
  let textCount = 0;
  let mediaTotal = 0;
  let systemCount = 0;

  const participantCounts: Record<string, number> = {};
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  // Build clean lookup map for fallback fuzzy matching
  const fallbackMap = new Map<string, MediaFileEntry>();
  mediaFiles.forEach((entry, key) => {
    fallbackMap.set(cleanNameForMatching(key), entry);
  });

  const updatedMessages = messages.map((msg) => {
    // Participant counting
    if (msg.sender) {
      participantCounts[msg.sender] = (participantCounts[msg.sender] || 0) + 1;
    }

    // Date range tracking
    if (msg.timestamp) {
      if (!startDate || msg.timestamp < startDate) startDate = msg.timestamp;
      if (!endDate || msg.timestamp > endDate) endDate = msg.timestamp;
    }

    if (msg.isSystemMessage) {
      systemCount++;
      return msg;
    }

    if (msg.type === 'text') {
      textCount++;
      return msg;
    }

    // It's a media type (image, video, audio, sticker, document)
    mediaTotal++;

    if (msg.mediaFilename) {
      const cleanRef = msg.mediaFilename.trim();
      let matchedEntry =
        mediaFiles.get(cleanRef) ||
        mediaFiles.get(cleanRef.toLowerCase()) ||
        fallbackMap.get(cleanNameForMatching(cleanRef));

      if (matchedEntry) {
        matchedCount++;
        return {
          ...msg,
          mediaUrl: matchedEntry.url,
          mediaMimeType: matchedEntry.mimeType,
          mediaSize: matchedEntry.size
        };
      } else {
        missingCount++;
        return msg;
      }
    } else {
      // Media was marked omitted in export without filename
      missingCount++;
      return msg;
    }
  });

  const stats: ChatStats = {
    totalMessages: messages.length,
    textCount,
    mediaCount: mediaTotal,
    systemCount,
    matchedMediaCount: matchedCount,
    missingMediaCount: missingCount,
    participantMessageCounts: participantCounts,
    startDate,
    endDate
  };

  return {
    messages: updatedMessages,
    stats
  };
}

