import { ChatMessage } from '../types/chat';

/**
 * Trigger file download in browser safely
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export parsed messages to JSON format
 */
export function exportToJson(messages: ChatMessage[], filename: string): void {
  const jsonContent = JSON.stringify(
    messages.map((m) => ({
      id: m.id,
      timestamp: m.timestamp ? m.timestamp.toISOString() : null,
      sender: m.sender,
      type: m.type,
      content: m.content,
      mediaFilename: m.mediaFilename || null,
      isSystemMessage: m.isSystemMessage,
      isDeleted: m.isDeleted || false
    })),
    null,
    2
  );

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadFile(blob, `${filename.replace(/\.[^/.]+$/, '')}_ChatReplay.json`);
}

/**
 * Export parsed messages to CSV format (properly escaped)
 */
export function exportToCsv(messages: ChatMessage[], filename: string): void {
  const headers = ['Timestamp', 'Sender', 'Type', 'Content', 'Media File', 'Is System Message'];

  const rows = messages.map((m) => {
    const timeStr = m.timestamp ? m.timestamp.toISOString() : '';
    const senderStr = m.sender || '';
    const typeStr = m.type;
    const contentStr = m.content.replace(/"/g, '""'); // CSV quote escape
    const mediaStr = m.mediaFilename || '';
    const isSys = m.isSystemMessage ? 'true' : 'false';

    return `"${timeStr}","${senderStr}","${typeStr}","${contentStr}","${mediaStr}","${isSys}"`;
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename.replace(/\.[^/.]+$/, '')}_ChatReplay.csv`);
}

