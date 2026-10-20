import React from 'react';
import {
  MessageSquare,
  Upload,
  Moon,
  Sun,
  Users,
  Image,
  Trash2,
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';
import { ChatConversation, MessageFilterType } from '../types/chat';
import { formatMessageTime, formatFileSize } from '../lib/dateFormatter';
import { PrivacyNotice } from './PrivacyNotice';

interface ChatSidebarProps {
  conversation: ChatConversation | null;
  onNewChat: () => void;
  onClearChat: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onTryDemo: (type: 'group' | 'ios') => void;
  activeFilterType: MessageFilterType;
  onFilterTypeChange: (type: MessageFilterType) => void;
  selectedParticipant: string;
  onSelectParticipant: (sender: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversation,
  onNewChat,
  onClearChat,
  isDarkMode,
  onToggleDarkMode,
  onTryDemo,
  activeFilterType,
  onFilterTypeChange,
  selectedParticipant,
  onSelectParticipant
}) => {
  const lastMessage =
    conversation && conversation.messages.length > 0
      ? conversation.messages[conversation.messages.length - 1]
      : null;

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full select-none shrink-0 z-20">
      {/* Sidebar Top Header */}
      <div className="h-16 px-4 bg-gray-50 dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-wa-green flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base tracking-tight">
              ChatReplay
            </span>
            <span className="block text-[10px] text-gray-500 dark:text-gray-400 -mt-1">
              WhatsApp Archive
            </span>
          </div>
        </div>

        {/* Header icons: New Chat & Dark Mode toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>

          <button
            onClick={onNewChat}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Import another chat"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {conversation ? (
          <div>
            {/* Active Conversation Card */}
            <div className="p-3 bg-wa-green/10 dark:bg-wa-green/15 border-b border-wa-green/20">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-wa-green/20 dark:bg-wa-green/30 text-wa-green flex items-center justify-center font-bold text-base shrink-0">
                  {conversation.isGroup ? <Users className="w-6 h-6" /> : conversation.title.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {conversation.title}
                    </h3>
                    {lastMessage?.timestamp && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0 ml-1">
                        {formatMessageTime(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {lastMessage?.content || 'Exported conversation'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                    <span className="bg-white/80 dark:bg-black/30 px-2 py-0.5 rounded-full font-medium">
                      {conversation.messages.length} messages
                    </span>
                    <span>{formatFileSize(conversation.fileSize)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Filter by Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'text', 'media', 'document'] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => onFilterTypeChange(ft)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeFilterType === ft
                        ? 'bg-wa-green text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {ft === 'all' ? 'All' : ft.charAt(0).toUpperCase() + ft.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants Filter List */}
            {conversation.participants.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Participants ({conversation.participants.length})
                  </span>
                  {selectedParticipant !== 'all' && (
                    <button
                      onClick={() => onSelectParticipant('all')}
                      className="text-[11px] text-wa-green hover:underline"
                    >
                      Show All
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {conversation.participants.map((p) => {
                    const count = conversation.stats.participantMessageCounts[p] || 0;
                    const isSelected = selectedParticipant === p;

                    return (
                      <button
                        key={p}
                        onClick={() => onSelectParticipant(isSelected ? 'all' : p)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-wa-green text-white font-medium shadow-sm'
                            : 'hover:bg-gray-100 dark:hover:bg-[#202c33] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="truncate pr-2">{p}</span>
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State in Sidebar */
          <div className="p-6 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No chat imported</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Upload a .txt or .zip file to view messages</p>
            <div className="space-y-2">
              <button
                onClick={() => onTryDemo('group')}
                className="w-full py-2 px-3 text-xs rounded-xl bg-wa-green/10 text-wa-green font-medium hover:bg-wa-green/20 transition-colors"
              >
                Try Group Demo
              </button>
              <button
                onClick={() => onTryDemo('ios')}
                className="w-full py-2 px-3 text-xs rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Try iOS Demo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111b21] space-y-2 shrink-0">
        <PrivacyNotice variant="compact" />
        {conversation && (
          <button
            onClick={onClearChat}
            className="w-full py-2 px-3 rounded-xl border border-red-200 dark:border-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Session & Free Memory
          </button>
        )}
      </div>
    </aside>
  );
};
