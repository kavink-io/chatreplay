import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChatMessage, SearchFilters } from '../types/chat';
import { filterMessages } from '../lib/messageSearch';

export function useChatSearch(messages: ChatMessage[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sender: 'all',
    type: 'all',
    startDate: '',
    endDate: ''
  });

  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  // Debounce the text query by 150ms to keep typing 60fps on 35k+ messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 150);
    return () => clearTimeout(timer);
  }, [filters.query]);

  const effectiveFilters = useMemo(() => {
    return {
      ...filters,
      query: debouncedQuery
    };
  }, [filters, debouncedQuery]);

  const filteredMessages = useMemo(() => {
    return filterMessages(messages, effectiveFilters);
  }, [messages, effectiveFilters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.query.trim() !== '' ||
      filters.sender !== 'all' ||
      filters.type !== 'all' ||
      filters.startDate !== '' ||
      filters.endDate !== ''
    );
  }, [filters]);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setActiveMatchIndex(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      sender: 'all',
      type: 'all',
      startDate: '',
      endDate: ''
    });
    setDebouncedQuery('');
    setActiveMatchIndex(0);
    setHighlightedMsgId(null);
  }, []);

  const jumpToMessage = useCallback((msgId: string) => {
    setHighlightedMsgId(msgId);
    const element = document.getElementById(`msg-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-jump');
      setTimeout(() => {
        element.classList.remove('highlight-jump');
      }, 2000);
    }
  }, []);

  const nextMatch = useCallback(() => {
    if (filteredMessages.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % filteredMessages.length;
    setActiveMatchIndex(nextIdx);
    jumpToMessage(filteredMessages[nextIdx].id);
  }, [activeMatchIndex, filteredMessages, jumpToMessage]);

  const prevMatch = useCallback(() => {
    if (filteredMessages.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + filteredMessages.length) % filteredMessages.length;
    setActiveMatchIndex(prevIdx);
    jumpToMessage(filteredMessages[prevIdx].id);
  }, [activeMatchIndex, filteredMessages, jumpToMessage]);

  return {
    filters,
    filteredMessages,
    hasActiveFilters,
    activeMatchIndex,
    highlightedMsgId,
    updateFilters,
    resetFilters,
    jumpToMessage,
    nextMatch,
    prevMatch
  };
}
