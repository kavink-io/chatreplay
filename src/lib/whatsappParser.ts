import { ChatMessage, DateFormatPreference, MessageType, UnparsedLine } from '../types/chat';
import { cleanWhatsAppText } from './security';

export interface ParseResult {
  messages: ChatMessage[];
  unparsedLines: UnparsedLine[];
  detectedDateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'unknown';
  participants: string[];
}

/**
 * Common system message triggers across Android and iOS WhatsApp
 */
const SYSTEM_PATTERNS = [
  /Messages and calls are end-to-end encrypted/i,
  /created group/i,
  /created this group/i,
  /added you/i,
  /added/i,
  /removed/i,
  /left/i,
  /changed the group/i,
  /changed the subject/i,
  /changed this group's/i,
  /changed their phone number/i,
  /security code changed/i,
  /You were added/i,
  /You joined using this group's invite link/i,
  /joined using this group's invite link/i,
  /pinned a message/i,
  /started a call/i,
  /missed voice call/i,
  /missed video call/i,
  /disappearing messages/i,
  /turned off disappearing messages/i,
  /turned on disappearing messages/i,
  /waiting for this message/i
];

/**
 * Detect media type and extract filename if present
 */
export function identifyMedia(content: string): {
  type: MessageType;
  mediaFilename?: string;
  isDeleted?: boolean;
} {
  const trimmed = content.trim();

  // Deleted messages
  if (
    /^(this message was deleted|you deleted this message|ce message a été supprimé|este mensaje fue eliminado)\.?$/i.test(trimmed)
  ) {
    return { type: 'text', isDeleted: true };
  }

  // iOS format: <attached: filename>
  const iosAttachMatch = trimmed.match(/<attached:\s*([^>]+)>/i);
  if (iosAttachMatch) {
    const filename = iosAttachMatch[1].trim();
    return {
      type: getMediaTypeFromFilename(filename),
      mediaFilename: filename
    };
  }

  // Android format: filename (file attached)
  const androidAttachMatch = trimmed.match(/^([^\n]+?)\s*\((?:file attached|archivo adjunto|fichier joint)\)$/i);
  if (androidAttachMatch) {
    const filename = androidAttachMatch[1].trim();
    return {
      type: getMediaTypeFromFilename(filename),
      mediaFilename: filename
    };
  }

  // Media omitted (WhatsApp export without media)
  if (
    /<Media omitted>|<media omitted>|image omitted|video omitted|audio omitted|sticker omitted|document omitted|GIF omitted/i.test(
      trimmed
    )
  ) {
    if (/image|gif/i.test(trimmed)) return { type: 'image' };
    if (/video/i.test(trimmed)) return { type: 'video' };
    if (/audio|voice/i.test(trimmed)) return { type: 'audio' };
    if (/sticker/i.test(trimmed)) return { type: 'sticker' };
    if (/document/i.test(trimmed)) return { type: 'document' };
    return { type: 'image' }; // Default generic media
  }

  return { type: 'text' };
}

/**
 * Infer media category from file extension
 */
export function getMediaTypeFromFilename(filename: string): MessageType {
  const extMatch = filename.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
  if (!extMatch) return 'document';

  const ext = extMatch[1].toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'heic', 'webp'].includes(ext)) {
    // If filename explicitly includes STK or sticker, treat as sticker
    if (/stk|sticker/i.test(filename)) {
      return 'sticker';
    }
    return 'image';
  }

  if (['mp4', 'mov', 'avi', 'mkv', '3gp', 'webm'].includes(ext)) {
    return 'video';
  }

  if (['mp3', 'opus', 'ogg', 'wav', 'm4a', 'aac', 'flac'].includes(ext)) {
    return 'audio';
  }

  if (['webp'].includes(ext)) {
    return 'sticker';
  }

  return 'document';
}

/**
 * Robust regex patterns for detecting message start lines
 */
// 1. Android style: "20/10/2026, 10:30 - Sender: Message" or "20/10/2026, 10:30:15 - ..."
// Date separators can be /, ., or -
const ANDROID_REGEX =
  /^(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?)\s+-\s+(.+)$/;

// 2. iOS style: "[20/10/2026, 10:30:00 AM] Sender: Message" or "[20/10/26, 10:30:00] Sender: Message"
const IOS_REGEX =
  /^\[(\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[aApP][mM])?)\]\s+(.+)$/;

/**
 * Detect date format (DD/MM vs MM/DD) by inspecting numeric values across all timestamps
 */
export function detectDateFormatOrder(rawLines: string[]): 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'unknown' {
  let sawFirstNumGreaterThan12 = false; // e.g. 25/03 -> DD/MM
  let sawSecondNumGreaterThan12 = false; // e.g. 03/25 -> MM/DD
  let sawYearFirst = false; // e.g. 2026/03/25

  for (let i = 0; i < Math.min(rawLines.length, 500); i++) {
    const cleaned = cleanWhatsAppText(rawLines[i]).trim();
    const match = cleaned.match(ANDROID_REGEX) || cleaned.match(IOS_REGEX);
    if (!match) continue;

    const datePart = match[1];
    const parts = datePart.split(/[/.-]/).map((n) => parseInt(n, 10));

    if (parts.length === 3) {
      // Check if first part is a 4-digit year (YYYY/MM/DD)
      if (parts[0] > 1000) {
        sawYearFirst = true;
        break;
      }

      const p1 = parts[0];
      const p2 = parts[1];

      if (p1 > 12 && p2 <= 12) {
        sawFirstNumGreaterThan12 = true;
        break;
      }
      if (p2 > 12 && p1 <= 12) {
        sawSecondNumGreaterThan12 = true;
        break;
      }
    }
  }

  if (sawYearFirst) return 'YYYY/MM/DD';
  if (sawFirstNumGreaterThan12) return 'DD/MM/YYYY';
  if (sawSecondNumGreaterThan12) return 'MM/DD/YYYY';

  return 'unknown';
}

/**
 * Parse date and time string into a valid JavaScript Date object
 */
export function parseDateTime(
  dateStr: string,
  timeStr: string,
  preferredFormat: DateFormatPreference,
  detectedFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'unknown'
): Date | null {
  try {
    const dateParts = dateStr.split(/[/.-]/).map((n) => parseInt(n, 10));
    if (dateParts.length !== 3) return null;

    let day = 1;
    let month = 1;
    let year = 2026;

    // Format determination: user preference -> detected format -> fallback to DD/MM/YYYY
    let effectiveFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' = 'DD/MM/YYYY';

    if (preferredFormat && preferredFormat !== 'auto') {
      effectiveFormat = preferredFormat;
    } else if (detectedFormat !== 'unknown') {
      effectiveFormat = detectedFormat;
    }

    if (dateParts[0] > 1000) {
      // YYYY/MM/DD
      year = dateParts[0];
      month = dateParts[1];
      day = dateParts[2];
    } else if (effectiveFormat === 'MM/DD/YYYY') {
      month = dateParts[0];
      day = dateParts[1];
      year = dateParts[2];
    } else {
      // DD/MM/YYYY
      day = dateParts[0];
      month = dateParts[1];
      year = dateParts[2];
    }

    // Two-digit year normalization (e.g. 26 -> 2026, 99 -> 1999)
    if (year < 100) {
      year = year >= 70 ? 1900 + year : 2000 + year;
    }

    // Time parsing
    const timeClean = timeStr.trim().replace(/\s+/g, ' ');
    const isPM = /[pP][mM]/.test(timeClean);
    const isAM = /[aA][mM]/.test(timeClean);

    const timeDigits = timeClean.replace(/[^\d:]/g, '').split(':').map((n) => parseInt(n, 10));
    let hours = timeDigits[0] || 0;
    const minutes = timeDigits[1] || 0;
    const seconds = timeDigits[2] || 0;

    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    const d = new Date(year, month - 1, day, hours, minutes, seconds);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Main parser function: converts raw WhatsApp chat text into structured messages
 */
export function parseWhatsAppChat(
  text: string,
  preferredFormat: DateFormatPreference = 'auto'
): ParseResult {
  const lines = text.split(/\r?\n/);
  const detectedDateFormat = detectDateFormatOrder(lines);

  const messages: ChatMessage[] = [];
  const unparsedLines: UnparsedLine[] = [];
  const participantsSet = new Set<string>();

  let currentMessage: ChatMessage | null = null;
  let messageCounter = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    const cleaned = cleanWhatsAppText(rawLine).trim();

    if (!cleaned) {
      // If inside an existing multiline message, keep the empty line
      if (currentMessage) {
        currentMessage.content += '\n';
      }
      continue;
    }

    // Try matching Android or iOS header
    const androidMatch = cleaned.match(ANDROID_REGEX);
    const iosMatch = cleaned.match(IOS_REGEX);
    const match = androidMatch || iosMatch;

    if (match) {
      // Save previous message if active
      if (currentMessage) {
        messages.push(currentMessage);
        currentMessage = null;
      }

      const dateStr = match[1];
      const timeStr = match[2];
      const rest = match[3];

      const timestamp = parseDateTime(dateStr, timeStr, preferredFormat, detectedDateFormat);

      // Check if line is sender: content OR a system message
      // A sender format typically has "Sender Name: message..."
      // But beware: system messages might contain colons (e.g., "changed the subject to: XYZ")
      let sender: string | null = null;
      let content = rest;
      let isSystem = false;

      const colonIndex = rest.indexOf(':');

      if (colonIndex !== -1) {
        const potentialSender = rest.substring(0, colonIndex).trim();
        const potentialContent = rest.substring(colonIndex + 1).trim();

        // Check if the potentialSender is actually a system message phrase
        const isSystemPhrase = SYSTEM_PATTERNS.some((pat) => pat.test(potentialSender));

        if (!isSystemPhrase && potentialSender.length > 0 && potentialSender.length < 50) {
          sender = potentialSender;
          content = potentialContent;
          participantsSet.add(sender);
        } else {
          isSystem = true;
          content = rest;
        }
      } else {
        // No colon at all -> System notification
        isSystem = true;
        content = rest;
      }

      // If it contains known system patterns even with colon
      if (!isSystem && SYSTEM_PATTERNS.some((pat) => pat.test(content))) {
        // Double check if sender was falsely detected
        if (content.startsWith('changed the group') || content.startsWith('created group')) {
          isSystem = true;
          sender = null;
          content = rest;
        }
      }

      const mediaInfo = identifyMedia(content);

      messageCounter++;
      currentMessage = {
        id: `msg-${messageCounter}-${Date.now().toString(36)}`,
        timestamp,
        sender,
        content,
        type: isSystem ? 'system' : mediaInfo.type,
        mediaFilename: mediaInfo.mediaFilename,
        isSystemMessage: isSystem,
        rawLine,
        isDeleted: mediaInfo.isDeleted
      };
    } else {
      // Continuation of a multiline message
      if (currentMessage) {
        currentMessage.content += '\n' + rawLine;
      } else {
        // Unparsed line before any valid message
        unparsedLines.push({
          lineNumber: lineIndex + 1,
          text: rawLine
        });
      }
    }
  }

  // Push the final message
  if (currentMessage) {
    messages.push(currentMessage);
  }

  return {
    messages,
    unparsedLines,
    detectedDateFormat,
    participants: Array.from(participantsSet)
  };
}
