import React, { useState } from 'react';
import {
  X,
  Users,
  Image,
  FileText,
  Calendar,
  AlertTriangle,
  HardDrive,
  BarChart2
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '../types/chat';
import { formatDateRange, formatFileSize } from '../lib/dateFormatter';

interface ChatDetailsProps {
  conversation: ChatConversation;
  onClose: () => void;
  onMediaClick: (msg: ChatMessage) => void;
  onSelectParticipant?: (sender: string) => void;
}

export const ChatDetails: React.FC<ChatDetailsProps> = ({
  conversation,
  onClose,
  onMediaClick,
  onSelectParticipant
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'unparsed'>('info');

  const { stats } = conversation;
  const mediaMessages = conversation.messages.filter((m) =>
    ['image', 'video', 'audio', 'document', 'sticker'].includes(m.type)
  );

  return (
    <div className="w-80 md:w-96 bg-white dark:bg-[#111b21] border-l border-gray-200 dark:border-gray-800 flex flex-col h-full select-none z-20 animate-fade-in shrink-0">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>Conversation Info</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-wa-green text-wa-green font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            activeTab === 'media'
              ? 'border-wa-green text-wa-green font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Media ({mediaMessages.length})
        </button>
        {conversation.unparsedLines.length > 0 && (
          <button
            onClick={() => setActiveTab('unparsed')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'unparsed'
                ? 'border-wa-green text-wa-green font-semibold'
                : 'border-transparent text-amber-500 hover:text-amber-600'
            }`}
          >
            Raw ({conversation.unparsedLines.length})
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'info' && (
          <>
            {/* Conversation Title & File info */}
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-wa-green/15 text-wa-green flex items-center justify-center font-bold text-xl mx-auto mb-2">
                {conversation.isGroup ? <Users className="w-8 h-8" /> : conversation.title.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                {conversation.title}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {conversation.fileName} • {formatFileSize(conversation.fileSize)}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="text-gray-400 mb-0.5">Total Messages</div>
                <div className="font-bold text-base text-gray-900 dark:text-gray-100">
                  {stats.totalMessages.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="text-gray-400 mb-0.5">Media Files</div>
                <div className="font-bold text-base text-wa-green">
                  {stats.mediaCount}
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date Span</span>
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {formatDateRange(stats.startDate, stats.endDate)}
              </div>
            </div>

            {/* Participants list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Participants ({conversation.participants.length})
                </span>
                <Users className="w-3.5 h-3.5 text-gray-400" />
              </div>

              <div className="space-y-1.5">
                {conversation.participants.map((p) => {
                  const count = stats.participantMessageCounts[p] || 0;
                  const pct = Math.round((count / (stats.totalMessages || 1)) * 100);

                  return (
                    <div
                      key={p}
                      onClick={() => onSelectParticipant?.(p)}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#182229] hover:bg-gray-100 dark:hover:bg-[#202c33] cursor-pointer transition-colors text-xs flex items-center justify-between"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate pr-2">
                        {p}
                      </div>
                      <div className="text-gray-400 text-[11px] shrink-0">
                        <span className="font-semibold text-wa-green">{count}</span> ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Media Gallery Tab */}
        {activeTab === 'media' && (
          <div>
            {mediaMessages.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No media attachments found in this conversation.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => m.mediaUrl && onMediaClick(m)}
                    className={`aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative cursor-pointer group border border-gray-200 dark:border-gray-700 ${
                      !m.mediaUrl ? 'opacity-50' : ''
                    }`}
                  >
                    {m.type === 'image' && m.mediaUrl ? (
                      <img
                        src={m.mediaUrl}
                        alt="attachment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                        <FileText className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[9px] text-gray-400 truncate w-full px-1">
                          {m.mediaFilename || m.type}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Raw / Unparsed Lines Tab */}
        {activeTab === 'unparsed' && (
          <div>
            <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg mb-3">
              These {conversation.unparsedLines.length} lines did not match standard WhatsApp header timestamps and occurred before the first message.
            </div>
            <div className="space-y-2 font-mono text-xs">
              {conversation.unparsedLines.map((ul, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400">Line {ul.lineNumber}:</span> {ul.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

