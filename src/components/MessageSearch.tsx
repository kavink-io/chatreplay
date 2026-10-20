import React from 'react';
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Filter,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { MessageFilterType, SearchFilters } from '../types/chat';

interface MessageSearchProps {
  filters: SearchFilters;
  participants: string[];
  totalMatches: number;
  currentMatchIndex: number;
  hasActiveFilters: boolean;
  onUpdateFilters: (updates: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onClose: () => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  filters,
  participants,
  totalMatches,
  currentMatchIndex,
  hasActiveFilters,
  onUpdateFilters,
  onResetFilters,
  onNextMatch,
  onPrevMatch,
  onClose
}) => {
  return (
    <div className="bg-white dark:bg-[#111b21] border-b border-gray-200 dark:border-gray-800 p-3 sm:px-4 text-xs select-none animate-fade-in shadow-sm z-20">
      {/* Top Search Input Row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onUpdateFilters({ query: e.target.value })}
            placeholder="Search within messages..."
            className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-[#202c33] rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-wa-green text-xs"
            autoFocus
          />
          {filters.query && (
            <button
              onClick={() => onUpdateFilters({ query: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Match counter & Navigation */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1 shrink-0 text-gray-500 dark:text-gray-400">
            <span className="font-medium text-wa-green px-1">
              {totalMatches > 0 ? `${currentMatchIndex + 1} of ${totalMatches}` : '0 results'}
            </span>
            <button
              onClick={onPrevMatch}
              disabled={totalMatches === 0}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
              title="Previous match"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMatch}
              disabled={totalMatches === 0}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
              title="Next match"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Close search button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
          title="Close search"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/60">
        <span className="flex items-center gap-1 text-gray-400 font-medium text-[11px]">
          <Filter className="w-3 h-3" /> Filters:
        </span>

        {/* Sender filter */}
        <select
          value={filters.sender}
          onChange={(e) => onUpdateFilters({ sender: e.target.value })}
          className="bg-gray-100 dark:bg-[#202c33] text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 text-[11px] border-none focus:ring-1 focus:ring-wa-green"
        >
          <option value="all">All Senders</option>
          {participants.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value="__system__">System Notices Only</option>
        </select>

        {/* Message type filter */}
        <select
          value={filters.type}
          onChange={(e) => onUpdateFilters({ type: e.target.value as MessageFilterType })}
          className="bg-gray-100 dark:bg-[#202c33] text-gray-700 dark:text-gray-200 rounded-md px-2 py-1 text-[11px] border-none focus:ring-1 focus:ring-wa-green"
        >
          <option value="all">All Types</option>
          <option value="text">Text only</option>
          <option value="media">All Media</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Voice / Audio</option>
          <option value="document">Documents</option>
        </select>

        {/* Date filters */}
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <Calendar className="w-3 h-3 text-gray-400" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onUpdateFilters({ startDate: e.target.value })}
            className="bg-gray-100 dark:bg-[#202c33] text-gray-700 dark:text-gray-200 rounded-md px-1.5 py-0.5 text-[10px]"
            title="Start date"
          />
          <span>–</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onUpdateFilters({ endDate: e.target.value })}
            className="bg-gray-100 dark:bg-[#202c33] text-gray-700 dark:text-gray-200 rounded-md px-1.5 py-0.5 text-[10px]"
            title="End date"
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="ml-auto text-wa-green hover:underline flex items-center gap-1 text-[11px] font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
