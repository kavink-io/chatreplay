import { ChatMessage, SearchFilters } from '../types/chat';

export interface SearchResult {
  filteredMessages: ChatMessage[];
  matchIndices: number[]; // Index inside filtered messages or original
  totalMatches: number;
}

/**
 * Filter chat messages based on multi-criteria search filters
 */
export function filterMessages(
  messages: ChatMessage[],
  filters: SearchFilters
): ChatMessage[] {
  const query = filters.query.trim().toLowerCase();
  const senderFilter = filters.sender.trim();
  const typeFilter = filters.type;
  const startTimestamp = filters.startDate ? new Date(filters.startDate).setHours(0, 0, 0, 0) : null;
  const endTimestamp = filters.endDate ? new Date(filters.endDate).setHours(23, 59, 59, 999) : null;

  return messages.filter((msg) => {
    // 1. Sender filter
    if (senderFilter && senderFilter !== 'all') {
      if (senderFilter === '__system__') {
        if (!msg.isSystemMessage) return false;
      } else {
        if (msg.sender !== senderFilter) return false;
      }
    }

    // 2. Type filter
    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'media') {
        if (!['image', 'video', 'audio', 'document', 'sticker'].includes(msg.type)) {
          return false;
        }
      } else if (msg.type !== typeFilter) {
        return false;
      }
    }

    // 3. Date range filter
    if (msg.timestamp) {
      const msgTime = msg.timestamp.getTime();
      if (startTimestamp && msgTime < startTimestamp) return false;
      if (endTimestamp && msgTime > endTimestamp) return false;
    }

    // 4. Keyword search
    if (query) {
      const inContent = msg.content.toLowerCase().includes(query);
      const inSender = msg.sender ? msg.sender.toLowerCase().includes(query) : false;
      const inMediaFilename = msg.mediaFilename ? msg.mediaFilename.toLowerCase().includes(query) : false;

      if (!inContent && !inSender && !inMediaFilename) {
        return false;
      }
    }

    return true;
  });
}

