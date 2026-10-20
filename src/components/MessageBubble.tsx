import React from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  Play,
  Volume2,
  Ban,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { formatMessageTime, formatFileSize } from '../lib/dateFormatter';
import { parseMessageSegments } from '../lib/security';

interface MessageBubbleProps {
  message: ChatMessage;
  isOutgoing: boolean;
  isGroup: boolean;
  searchQuery?: string;
  onMediaClick?: (msg: ChatMessage) => void;
}

// Consistent participant colors for group chats (inspired by WhatsApp)
const SENDER_COLORS = [
  'text-emerald-600 dark:text-emerald-400',
  'text-blue-600 dark:text-blue-400',
  'text-purple-600 dark:text-purple-400',
  'text-amber-600 dark:text-amber-400',
  'text-pink-600 dark:text-pink-400',
  'text-indigo-600 dark:text-indigo-400',
  'text-teal-600 dark:text-teal-400',
  'text-rose-600 dark:text-rose-400'
];

function getSenderColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SENDER_COLORS.length;
  return SENDER_COLORS[index];
}

export const MessageBubble = React.memo<MessageBubbleProps>(({
  message,
  isOutgoing,
  isGroup,
  searchQuery,
  onMediaClick
}) => {
  // 1. System notification rendering (centered pill)
  if (message.isSystemMessage) {
    return (
      <div id={`msg-${message.id}`} className="flex justify-center my-2.5 px-4">
        <div className="bg-white/80 dark:bg-[#182229]/80 text-[#54656f] dark:text-[#8696a0] border border-black/5 dark:border-white/5 rounded-lg px-3 py-1.5 text-xs text-center max-w-lg shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // 2. Highlight text matches safely
  const renderHighlightedText = (text: string) => {
    const segments = parseMessageSegments(text);

    return segments.map((seg, sIdx) => {
      if (seg.type === 'link' && seg.url) {
        return (
          <a
            key={sIdx}
            href={seg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-wa-text-link hover:underline break-all inline-flex items-baseline gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{seg.value}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0 opacity-70" />
          </a>
        );
      }

      // Plain text: if query exists, highlight matches
      if (!searchQuery || !searchQuery.trim()) {
        return <span key={sIdx}>{seg.value}</span>;
      }

      const q = searchQuery.trim();
      const parts = seg.value.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

      return (
        <span key={sIdx}>
          {parts.map((p, pIdx) =>
            p.toLowerCase() === q.toLowerCase() ? (
              <mark key={pIdx} className="bg-amber-300 dark:bg-amber-500/50 text-black dark:text-white rounded-sm px-0.5 font-medium">
                {p}
              </mark>
            ) : (
              p
            )
          )}
        </span>
      );
    });
  };

  const senderName = message.sender || 'Unknown';
  const senderColor = isGroup ? getSenderColor(senderName) : '';
  const timeFormatted = formatMessageTime(message.timestamp);

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex w-full mb-1 px-2 sm:px-6 print-message ${
        isOutgoing ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl p-2.5 sm:px-3 sm:py-2 text-sm shadow-sm transition-all duration-150 ${
          isOutgoing
            ? 'bg-wa-bubble-outgoingLight dark:bg-wa-bubble-outgoingDark text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
            : 'bg-wa-bubble-incomingLight dark:bg-wa-bubble-incomingDark text-[#111b21] dark:text-[#e9edef] rounded-tl-none'
        }`}
      >
        {/* Sender name in group chats */}
        {isGroup && !isOutgoing && message.sender && (
          <div className={`text-xs font-semibold mb-1 truncate ${senderColor}`}>
            {message.sender}
          </div>
        )}

        {/* Deleted message */}
        {message.isDeleted ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 italic py-1">
            <Ban className="w-4 h-4 shrink-0 text-gray-400" />
            <span>This message was deleted</span>
          </div>
        ) : (
          <>
            {/* Image attachment */}
            {message.type === 'image' && (
              <div className="mb-1.5">
                {message.mediaUrl ? (
                  <div
                    onClick={() => onMediaClick?.(message)}
                    className="relative cursor-pointer rounded-xl overflow-hidden group max-h-80 bg-black/5 dark:bg-black/20"
                  >
                    <img
                      src={message.mediaUrl}
                      alt={message.mediaFilename || 'Image attachment'}
                      className="w-full h-auto object-cover max-h-80 rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    <div>
                      <div className="font-medium">Image not found</div>
                      <div className="text-[11px] opacity-80">
                        {message.mediaFilename || 'Exported without media files'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video attachment */}
            {message.type === 'video' && (
              <div className="mb-1.5">
                {message.mediaUrl ? (
                  <div className="rounded-xl overflow-hidden bg-black max-h-80">
                    <video
                      src={message.mediaUrl}
                      controls
                      preload="metadata"
                      className="w-full max-h-80 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                    <Play className="w-4 h-4 shrink-0 text-amber-500" />
                    <div>
                      <div className="font-medium">Video omitted / not found in archive</div>
                      <div className="text-[11px] opacity-80">{message.mediaFilename}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audio / Voice note attachment */}
            {message.type === 'audio' && (
              <div className="mb-1.5">
                {message.mediaUrl ? (
                  <div className="flex items-center gap-2 py-1 min-w-[220px]">
                    <audio src={message.mediaUrl} controls className="w-full h-8" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 min-w-[200px]">
                    <Volume2 className="w-4 h-4 shrink-0 text-amber-500" />
                    <div className="truncate">
                      <div className="font-medium">Voice note / Audio omitted</div>
                      <div className="text-[10px] opacity-80 truncate">{message.mediaFilename}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sticker */}
            {message.type === 'sticker' && (
              <div className="mb-1.5 max-w-[140px]">
                {message.mediaUrl ? (
                  <img
                    src={message.mediaUrl}
                    alt="Sticker"
                    className="w-28 h-28 object-contain cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => onMediaClick?.(message)}
                  />
                ) : (
                  <div className="p-2 border border-dashed border-gray-400/50 rounded-xl text-center text-xs text-gray-500">
                    Sticker omitted
                  </div>
                )}
              </div>
            )}

            {/* Document attachment */}
            {message.type === 'document' && (
              <div className="mb-1.5">
                <div className="flex items-center gap-3 p-2.5 bg-black/5 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-wa-green/10 text-wa-green flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                      {message.mediaFilename || 'Document attachment'}
                    </div>
                    {message.mediaSize && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {formatFileSize(message.mediaSize)}
                      </div>
                    )}
                  </div>
                  {message.mediaUrl && (
                    <a
                      href={message.mediaUrl}
                      download={message.mediaFilename || 'document'}
                      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Text message content */}
            {message.content &&
              message.type !== 'system' &&
              !message.content.match(/^([^\n]+?)\s*\((?:file attached|archivo adjunto|fichier joint)\)$/i) &&
              !message.content.match(/<attached:\s*([^>]+)>/i) &&
              message.content !== '<Media omitted>' && (
                <div className="whitespace-pre-wrap break-words leading-relaxed text-sm select-text">
                  {renderHighlightedText(message.content)}
                </div>
              )}
          </>
        )}

        {/* Message timestamp and read checkmarks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-[#667781] dark:text-[#8696a0] select-none float-right ml-3 pt-0.5">
          <span>{timeFormatted}</span>
          {isOutgoing && (
            <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-wa-text-link inline" />
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

