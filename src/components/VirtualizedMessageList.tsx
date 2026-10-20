import React, {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Lock, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { getDateKey } from '../lib/dateFormatter';

export type ChatRenderItem =
  | {
      type: 'date-separator';
      id: string;
      date: Date | null;
    }
  | {
      type: 'message';
      id: string;
      message: ChatMessage;
    };

export interface VirtualizedMessageListHandle {
  scrollToBottom: (smooth?: boolean) => void;
  jumpToMessage: (msgId: string) => void;
}

interface VirtualizedMessageListProps {
  messages: ChatMessage[];
  currentUser: string;
  isGroup: boolean;
  isDarkMode: boolean;
  searchQuery: string;
  onMediaClick: (msg: ChatMessage) => void;
  onScrollStateChange?: (showScrollBottom: boolean) => void;
}

export const VirtualizedMessageList = forwardRef<
  VirtualizedMessageListHandle,
  VirtualizedMessageListProps
>(
  (
    {
      messages,
      currentUser,
      isGroup,
      isDarkMode,
      searchQuery,
      onMediaClick,
      onScrollStateChange
    },
    ref
  ) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const isInitialScrollDone = useRef(false);

    // Pre-process messages into a flattened list with date separators
    const items = useMemo(() => {
      const result: ChatRenderItem[] = [];
      let lastDateKey = '';

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const dateKey = getDateKey(msg.timestamp);

        if (dateKey !== lastDateKey) {
          result.push({
            type: 'date-separator',
            id: `date-sep-${dateKey}-${i}`,
            date: msg.timestamp
          });
          lastDateKey = dateKey;
        }

        result.push({
          type: 'message',
          id: msg.id,
          message: msg
        });
      }

      return result;
    }, [messages]);

    // Setup TanStack virtualizer for virtual scrolling
    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: (index) => {
        const item = items[index];
        if (!item) return 60;
        if (item.type === 'date-separator') return 48;
        if (item.message.isSystemMessage) return 40;
        if (item.message.type === 'image' || item.message.type === 'video') return 240;
        if (item.message.type === 'audio') return 76;
        if (item.message.type === 'document') return 70;
        // Text messages: estimate based on length
        const len = item.message.content.length;
        if (len > 300) return 140;
        if (len > 100) return 90;
        return 60;
      },
      overscan: 20
    });

    // Scroll to bottom implementation
    const scrollToBottom = useCallback(
      (smooth = false) => {
        if (items.length === 0) return;
        virtualizer.scrollToIndex(items.length - 1, {
          align: 'end',
          behavior: smooth ? 'smooth' : 'auto'
        });

        // Fallback check on container directly
        requestAnimationFrame(() => {
          if (parentRef.current) {
            parentRef.current.scrollTo({
              top: parentRef.current.scrollHeight,
              behavior: smooth ? 'smooth' : 'auto'
            });
          }
        });
      },
      [items.length, virtualizer]
    );

    // Jump to specific message by ID
    const jumpToMessage = useCallback(
      (msgId: string) => {
        const targetIndex = items.findIndex(
          (it) => it.type === 'message' && it.message.id === msgId
        );

        if (targetIndex !== -1) {
          virtualizer.scrollToIndex(targetIndex, {
            align: 'center',
            behavior: 'smooth'
          });

          // Trigger pulse animation
          setTimeout(() => {
            const el = document.getElementById(`msg-${msgId}`);
            if (el) {
              el.classList.add('highlight-jump');
              setTimeout(() => el.classList.remove('highlight-jump'), 2000);
            }
          }, 150);
        }
      },
      [items, virtualizer]
    );

    // Expose methods to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
        jumpToMessage
      }),
      [scrollToBottom, jumpToMessage]
    );

    // Initial scroll to bottom when chat opens
    useEffect(() => {
      isInitialScrollDone.current = false;
    }, [messages.length > 0 ? messages[0].id : null]);

    useEffect(() => {
      if (!isInitialScrollDone.current && items.length > 0) {
        scrollToBottom(false);
        isInitialScrollDone.current = true;
      }
    }, [items.length, scrollToBottom]);

    // Handle user scrolling to toggle "scroll to bottom" button
    const handleScroll = useCallback(() => {
      const el = parentRef.current;
      if (!el) return;
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      onScrollStateChange?.(distanceToBottom > 350);
    }, [onScrollStateChange]);

    if (items.length === 0) {
      return (
        <div
          className={`flex-1 flex flex-col items-center justify-center py-20 text-gray-500 text-center ${
            isDarkMode ? 'wa-wallpaper-dark' : 'wa-wallpaper-light'
          }`}
        >
          <MessageSquare className="w-12 h-12 text-gray-400 mb-2" />
          <p className="font-semibold text-sm">No messages match your criteria</p>
        </div>
      );
    }

    return (
      <div
        ref={parentRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto px-2 sm:px-4 py-3 print-container relative ${
          isDarkMode ? 'wa-wallpaper-dark' : 'wa-wallpaper-light'
        }`}
        style={{ contain: 'strict' }}
      >
        {/* Encryption & Archive Notice at Top */}
        <div className="flex justify-center mb-4 no-print">
          <div className="max-w-md bg-amber-50 dark:bg-[#182229] border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 text-center text-xs text-amber-800 dark:text-amber-300 shadow-sm flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Offline Archive:</strong> This is a read-only viewer for exported WhatsApp conversations. Messages cannot be sent.
            </span>
          </div>
        </div>

        {/* Virtualized Inner Track */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            if (!item) return null;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                {item.type === 'date-separator' ? (
                  <DateSeparator date={item.date} />
                ) : (
                  <MessageBubble
                    message={item.message}
                    isOutgoing={Boolean(currentUser && item.message.sender === currentUser)}
                    isGroup={isGroup}
                    searchQuery={searchQuery}
                    onMediaClick={onMediaClick}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

VirtualizedMessageList.displayName = 'VirtualizedMessageList';
