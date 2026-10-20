export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'system'
  | 'unknown';

export interface ChatMessage {
  id: string;
  timestamp: Date | null;
  sender: string | null;
  content: string;
  type: MessageType;
  mediaFilename?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  isSystemMessage: boolean;
  rawLine: string;
  isDeleted?: boolean;
}

export interface ChatStats {
  totalMessages: number;
  textCount: number;
  mediaCount: number;
  systemCount: number;
  matchedMediaCount: number;
  missingMediaCount: number;
  participantMessageCounts: Record<string, number>;
  startDate: Date | null;
  endDate: Date | null;
}

export interface UnparsedLine {
  lineNumber: number;
  text: string;
}

export interface MediaFileEntry {
  filename: string;
  blob: Blob;
  url: string;
  size: number;
  mimeType: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  isGroup: boolean;
  participants: string[];
  messages: ChatMessage[];
  unparsedLines: UnparsedLine[];
  stats: ChatStats;
  mediaFiles: Map<string, MediaFileEntry>;
  detectedDateFormat?: string;
  sourceType: 'txt' | 'zip' | 'demo';
  originalBlob?: Blob;
}

export type DateFormatPreference = 'auto' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD';

export interface ParseOptions {
  dateFormatPreference?: DateFormatPreference;
  onProgress?: (progress: number, status: string) => void;
}

export interface ImportSummary {
  fileName: string;
  fileSize: number;
  parsedMessages: number;
  unparsedLines: number;
  matchedMedia: number;
  missingMedia: number;
  participants: string[];
  durationMs: number;
}

export type MessageFilterType = MessageType | 'all' | 'media';

export interface SearchFilters {
  query: string;
  sender: string;
  type: MessageFilterType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}
