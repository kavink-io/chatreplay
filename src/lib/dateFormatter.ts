/**
 * Format a Date object into human-readable separator strings:
 * - "Today"
 * - "Yesterday"
 * - "Friday, 16 October 2026" (within current year)
 * - "16 October 2025" (different year)
 */
export function formatDateSeparator(date: Date | null): string {
  if (!date) return 'Unknown Date';

  const now = new Date();
  const target = new Date(date);

  // Normalize to midnight for accurate day comparison
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  const diffDays = Math.round((nowDay - targetDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: target.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  };

  return target.toLocaleDateString(undefined, options);
}

/**
 * Format message timestamp into standard WhatsApp clock format: "10:30 AM" or "22:30"
 */
export function formatMessageTime(date: Date | null): string {
  if (!date) return '';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Generates a consistent date key for grouping messages by day
 */
export function getDateKey(date: Date | null): string {
  if (!date) return 'unknown-date';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date range e.g. "Oct 12, 2026 – Oct 20, 2026"
 */
export function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start && !end) return 'Unknown';
  if (start && !end) return start.toLocaleDateString();
  if (!start && end) return end.toLocaleDateString();

  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  return `${start!.toLocaleDateString(undefined, opts)} – ${end!.toLocaleDateString(undefined, opts)}`;
}

/**
 * Human readable file size formatter (e.g. "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

