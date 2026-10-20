import React, { useState } from 'react';
import {
  Search,
  Info,
  MoreVertical,
  Printer,
  FileJson,
  FileSpreadsheet,
  Download,
  Users,
  ChevronLeft,
  X,
  UserCheck
} from 'lucide-react';
import { ChatConversation } from '../types/chat';

interface ChatHeaderProps {
  conversation: ChatConversation;
  currentUser: string;
  onCurrentUserChange: (user: string) => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  onToggleDetails: () => void;
  isDetailsOpen: boolean;
  onPrint: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onDownloadOriginal: () => void;
  onCloseChat: () => void;
  onBackToSidebar?: () => void;
  showMobileBack?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUser,
  onCurrentUserChange,
  onToggleSearch,
  isSearchOpen,
  onToggleDetails,
  isDetailsOpen,
  onPrint,
  onExportJson,
  onExportCsv,
  onDownloadOriginal,
  onCloseChat,
  onBackToSidebar,
  showMobileBack
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSenderMenu, setShowSenderMenu] = useState(false);

  const participantSummary =
    conversation.participants.length > 0
      ? conversation.participants.slice(0, 4).join(', ') +
        (conversation.participants.length > 4 ? ` +${conversation.participants.length - 4}` : '')
      : `${conversation.messages.length} messages`;

  return (
    <header className="h-16 px-4 bg-white dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between select-none z-20 shrink-0">
      {/* Left side: Back button (mobile), Avatar, Chat Title, Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        {showMobileBack && (
          <button
            onClick={onBackToSidebar}
            className="md:hidden p-1.5 -ml-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-full"
            title="Back to Chats"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Avatar */}
        <div
          onClick={onToggleDetails}
          className="w-10 h-10 rounded-full bg-wa-green/15 dark:bg-wa-green/25 text-wa-green flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {conversation.isGroup ? (
            <Users className="w-5 h-5 text-wa-green" />
          ) : (
            conversation.title.slice(0, 2).toUpperCase()
          )}
        </div>

        {/* Title and metadata */}
        <div
          onClick={onToggleDetails}
          className="min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
              {conversation.title}
            </h1>
            <span className="hidden sm:inline-block text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
              Read-Only
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
            {participantSummary}
          </p>
        </div>
      </div>

      {/* Right side: Action icons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* "Who am I" (Outgoing message sender selector) */}
        {conversation.participants.length > 0 && (
          <div className="relative">
            <button
              onClick={() => {
                setShowSenderMenu(!showSenderMenu);
                setShowMenu(false);
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              title="Select which participant you are (aligns messages to right)"
            >
              <UserCheck className="w-3.5 h-3.5 text-wa-green" />
              <span>Me:</span>
              <span className="font-semibold text-wa-green truncate max-w-[80px]">
                {currentUser || 'Auto'}
              </span>
            </button>

            {showSenderMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111b21] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-30 animate-fade-in text-xs">
                <div className="px-3 py-1 font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  Select your profile:
                </div>
                {conversation.participants.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      onCurrentUserChange(p);
                      setShowSenderMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      currentUser === p ? 'text-wa-green font-semibold bg-wa-green/10' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="truncate">{p}</span>
                    {currentUser === p && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search button */}
        <button
          onClick={onToggleSearch}
          className={`p-2 rounded-full transition-colors ${
            isSearchOpen
              ? 'bg-wa-green/15 text-wa-green'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Search messages"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Details button */}
        <button
          onClick={onToggleDetails}
          className={`p-2 rounded-full transition-colors ${
            isDetailsOpen
              ? 'bg-wa-green/15 text-wa-green'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Chat info & media"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Export and more menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMenu(!showMenu);
              setShowSenderMenu(false);
            }}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Export options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#111b21] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1.5 z-30 animate-fade-in text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onPrint();
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>Print Conversation</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onExportJson();
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <FileJson className="w-4 h-4 text-blue-500" />
                <span>Export as JSON</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onExportCsv();
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Export as CSV</span>
              </button>
              {conversation.originalBlob && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDownloadOriginal();
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Download Original File</span>
                </button>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  onCloseChat();
                }}
                className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <X className="w-4 h-4" />
                <span>Close Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

