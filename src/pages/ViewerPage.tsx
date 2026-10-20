import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  Lock,
  Smile,
  Paperclip,
  Mic
} from 'lucide-react';
import {
  ChatConversation,
  ChatMessage,
  MessageFilterType
} from '../types/chat';
import { ChatHeader } from '../components/ChatHeader';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatDetails } from '../components/ChatDetails';
import { MessageSearch } from '../components/MessageSearch';
import { MediaLightbox } from '../components/MediaLightbox';
import {
  VirtualizedMessageList,
  VirtualizedMessageListHandle
} from '../components/VirtualizedMessageList';
import { exportToJson, exportToCsv, downloadFile } from '../lib/exportUtils';
import { formatMessageTime } from '../lib/dateFormatter';
import { useChatSearch } from '../hooks/useChatSearch';

interface ViewerPageProps {
  conversation: ChatConversation;
  onNewChat: () => void;
  onClearChat: () => void;
  onTryDemo: (type: 'group' | 'ios') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ViewerPage: React.FC<ViewerPageProps> = ({
  conversation,
  onNewChat,
  onClearChat,
  onTryDemo,
  isDarkMode,
  onToggleDarkMode
}) => {
  // Mobile screen view state: 'sidebar' | 'chat' | 'details'
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat' | 'details'>('chat');
  const [isDetailsOpenDesktop, setIsDetailsOpenDesktop] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<MessageFilterType>('all');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all');

  // "Me" profile selection for message bubble alignment
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return conversation.participants[0] || '';
  });

  // Lightbox state
  const [lightboxMessage, setLightboxMessage] = useState<ChatMessage | null>(null);

  // Scroll tracking state
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const virtualListRef = useRef<VirtualizedMessageListHandle>(null);

  // Search hook
  const {
    filters,
    filteredMessages,
    hasActiveFilters,
    activeMatchIndex,
    updateFilters,
    resetFilters,
    nextMatch,
    prevMatch
  } = useChatSearch(conversation.messages);

  // Sync sidebar quick filters with search hook
  const handleSidebarFilterTypeChange = useCallback(
    (type: MessageFilterType) => {
      setActiveFilterType(type);
      updateFilters({ type });
    },
    [updateFilters]
  );

  const handleSidebarParticipantSelect = useCallback(
    (sender: string) => {
      setSelectedParticipant(sender);
      updateFilters({ sender });
    },
    [updateFilters]
  );

  const handleNextMatch = useCallback(() => {
    if (filteredMessages.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % filteredMessages.length;
    nextMatch();
    virtualListRef.current?.jumpToMessage(filteredMessages[nextIdx].id);
  }, [activeMatchIndex, filteredMessages, nextMatch]);

  const handlePrevMatch = useCallback(() => {
    if (filteredMessages.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + filteredMessages.length) % filteredMessages.length;
    prevMatch();
    virtualListRef.current?.jumpToMessage(filteredMessages[prevIdx].id);
  }, [activeMatchIndex, filteredMessages, prevMatch]);

  const handleScrollToBottom = useCallback(() => {
    virtualListRef.current?.scrollToBottom(true);
  }, []);

  // Filtered media list for lightbox gallery navigation
  const allMediaMessages = useMemo(() => {
    return conversation.messages.filter((m) => m.type === 'image' && m.mediaUrl);
  }, [conversation.messages]);

  // Messages to print: safe slice (last 500 messages) to prevent Chrome print crash on 35k messages
  const printMessages = useMemo(() => {
    return filteredMessages.slice(-500);
  }, [filteredMessages]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    exportToJson(conversation.messages, conversation.fileName);
  };

  const handleExportCsv = () => {
    exportToCsv(conversation.messages, conversation.fileName);
  };

  const handleDownloadOriginal = () => {
    if (conversation.originalBlob) {
      downloadFile(conversation.originalBlob, conversation.fileName);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-[#0c1317]">
      {/* 1. Left Sidebar (Desktop always, Mobile conditional) */}
      <div
        className={`${
          mobileView === 'sidebar' ? 'flex' : 'hidden'
        } md:flex h-full w-full md:w-80 lg:w-96 shrink-0 z-20`}
      >
        <ChatSidebar
          conversation={conversation}
          onNewChat={onNewChat}
          onClearChat={onClearChat}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          onTryDemo={onTryDemo}
          activeFilterType={activeFilterType}
          onFilterTypeChange={handleSidebarFilterTypeChange}
          selectedParticipant={selectedParticipant}
          onSelectParticipant={handleSidebarParticipantSelect}
        />
      </div>

      {/* 2. Main Conversation Area */}
      <div
        className={`${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col h-full min-w-0 relative`}
      >
        {/* Chat Header */}
        <ChatHeader
          conversation={conversation}
          currentUser={currentUser}
          onCurrentUserChange={setCurrentUser}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
          isSearchOpen={isSearchOpen}
          onToggleDetails={() => {
            setIsDetailsOpenDesktop(!isDetailsOpenDesktop);
            if (mobileView === 'chat') {
              setMobileView('details');
            }
          }}
          isDetailsOpen={isDetailsOpenDesktop}
          onPrint={handlePrint}
          onExportJson={handleExportJson}
          onExportCsv={handleExportCsv}
          onDownloadOriginal={handleDownloadOriginal}
          onCloseChat={onClearChat}
          onBackToSidebar={() => setMobileView('sidebar')}
          showMobileBack={true}
        />

        {/* Message Search Bar dropdown */}
        {isSearchOpen && (
          <MessageSearch
            filters={filters}
            participants={conversation.participants}
            totalMatches={filteredMessages.length}
            currentMatchIndex={activeMatchIndex}
            hasActiveFilters={hasActiveFilters}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            onNextMatch={handleNextMatch}
            onPrevMatch={handlePrevMatch}
            onClose={() => setIsSearchOpen(false)}
          />
        )}

        {/* Virtualized Message List (Ultra-High Performance 60fps on 35,000+ messages) */}
        <VirtualizedMessageList
          ref={virtualListRef}
          messages={filteredMessages}
          currentUser={currentUser}
          isGroup={conversation.isGroup}
          isDarkMode={isDarkMode}
          searchQuery={filters.query}
          onMediaClick={(m) => setLightboxMessage(m)}
          onScrollStateChange={setShowScrollBottom}
        />

        {/* Floating Scroll-to-Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={handleScrollToBottom}
            className="absolute right-6 bottom-20 p-2.5 rounded-full bg-white dark:bg-[#202c33] text-gray-600 dark:text-gray-300 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-10 animate-fade-in group cursor-pointer"
            title="Scroll to latest message"
          >
            <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        )}

        {/* Visual Message Input (Read-Only Archive Disclaimer) */}
        <div className="p-3 bg-white dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-800 flex items-center gap-3 no-print select-none shrink-0">
          <div className="flex items-center gap-2 text-gray-400">
            <Smile className="w-6 h-6 hover:text-gray-600 dark:hover:text-gray-300 cursor-not-allowed opacity-50" />
            <Paperclip className="w-5 h-5 hover:text-gray-600 dark:hover:text-gray-300 cursor-not-allowed opacity-50" />
          </div>

          <div className="flex-1 bg-gray-100 dark:bg-[#2a3942] rounded-xl px-4 py-2.5 text-xs text-gray-400 dark:text-gray-400 flex items-center justify-between cursor-not-allowed border border-transparent select-none">
            <span className="truncate">
              Archive viewer mode — Messaging is disabled for imported exports.
            </span>
            <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-2" />
          </div>

          <button
            disabled
            className="w-10 h-10 rounded-full bg-wa-green/40 text-white flex items-center justify-center cursor-not-allowed shrink-0"
            title="Messaging disabled"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Printable section (rendered only during browser print to prevent Chrome print buffer crash) */}
        <div className="hidden print:block print-container p-6 bg-white text-black">
          <div className="border-b-2 border-emerald-600 pb-3 mb-4">
            <h1 className="text-xl font-bold">{conversation.title}</h1>
            <p className="text-xs text-gray-600">
              WhatsApp Export • {printMessages.length} of {conversation.messages.length} messages printed • ChatReplay
            </p>
          </div>
          <div className="space-y-2">
            {printMessages.map((m) => (
              <div key={m.id} className="print-message text-xs py-1 border-b border-gray-100 flex justify-between items-baseline">
                <div>
                  <strong className="text-gray-800">{m.sender || 'System'}: </strong>
                  <span>{m.content}</span>
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-4">
                  {formatMessageTime(m.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Right Details Panel (Desktop: toggled; Mobile: full screen view) */}
      {(isDetailsOpenDesktop || mobileView === 'details') && (
        <div
          className={`${
            mobileView === 'details' ? 'fixed inset-0 z-40' : 'hidden md:flex'
          } h-full shrink-0`}
        >
          <ChatDetails
            conversation={conversation}
            onClose={() => {
              setIsDetailsOpenDesktop(false);
              if (mobileView === 'details') {
                setMobileView('chat');
              }
            }}
            onMediaClick={(m) => setLightboxMessage(m)}
            onSelectParticipant={(sender) => {
              handleSidebarParticipantSelect(sender);
              if (mobileView === 'details') {
                setMobileView('chat');
              }
            }}
          />
        </div>
      )}

      {/* 4. Fullscreen Media Lightbox */}
      {lightboxMessage && (
        <MediaLightbox
          currentMessage={lightboxMessage}
          allMediaMessages={allMediaMessages}
          onClose={() => setLightboxMessage(null)}
          onNavigate={(nextMsg) => setLightboxMessage(nextMsg)}
        />
      )}
    </div>
  );
};
