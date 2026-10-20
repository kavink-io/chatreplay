import { useState, useCallback, useEffect } from 'react';
import {
  ChatConversation,
  DateFormatPreference,
  ImportSummary,
  MediaFileEntry
} from '../types/chat';
import { parseWhatsAppChat } from '../lib/whatsappParser';
import { extractZipArchive, revokeMediaUrls, ZipTxtFileEntry } from '../lib/zipExtractor';
import { matchMediaWithMessages } from '../lib/mediaMatcher';
import { MAX_FILE_SIZE, MAX_TXT_SIZE } from '../lib/security';
import { loadDemoConversation } from '../lib/demoData';

export interface PendingZipChoice {
  file: File;
  txtFiles: ZipTxtFileEntry[];
  mediaFiles: Map<string, MediaFileEntry>;
  archiveTotal: number;
}

export function useChatImport() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [pendingZip, setPendingZip] = useState<PendingZipChoice | null>(null);
  const [dateFormatPref, setDateFormatPref] = useState<DateFormatPreference>('auto');

  // Cleanup object URLs when conversation changes or unmounts
  useEffect(() => {
    return () => {
      if (conversation?.mediaFiles) {
        revokeMediaUrls(conversation.mediaFiles);
      }
    };
  }, [conversation]);

  const clearSession = useCallback(() => {
    if (conversation?.mediaFiles) {
      revokeMediaUrls(conversation.mediaFiles);
    }
    if (pendingZip?.mediaFiles) {
      revokeMediaUrls(pendingZip.mediaFiles);
    }
    setConversation(null);
    setImportSummary(null);
    setPendingZip(null);
    setError(null);
    setProgress(0);
    setStatusText('');
  }, [conversation, pendingZip]);

  const processTextChat = useCallback(
    async (
      text: string,
      fileName: string,
      fileSize: number,
      sourceType: 'txt' | 'zip',
      mediaFiles: Map<string, MediaFileEntry> = new Map(),
      originalBlob?: Blob,
      preferredFormat: DateFormatPreference = dateFormatPref
    ) => {
      const startTime = performance.now();
      setIsLoading(true);
      setError(null);
      setProgress(50);
      setStatusText('Parsing WhatsApp messages...');

      // Small tick to allow UI to render spinner
      await new Promise((r) => setTimeout(r, 20));

      try {
        if (!text.trim()) {
          throw new Error('The selected text file is completely empty.');
        }

        const parseResult = parseWhatsAppChat(text, preferredFormat);

        if (parseResult.messages.length === 0) {
          throw new Error(
            'No valid WhatsApp messages found. Please ensure this file is an authentic exported chat from WhatsApp (Android or iPhone).'
          );
        }

        setProgress(80);
        setStatusText('Matching media attachments...');

        const matchResult = matchMediaWithMessages(parseResult.messages, mediaFiles);

        // Derive chat title from filename or participants
        let title = fileName.replace(/\.[^/.]+$/, '').replace(/^WhatsApp Chat - /i, '').replace(/^WhatsApp Chat with /i, '');
        if (!title.trim() || title === 'chat' || title === '_chat') {
          title = parseResult.participants.length > 0 ? parseResult.participants.join(', ') : 'WhatsApp Chat';
        }

        const isGroup = parseResult.participants.length > 2;

        const newConversation: ChatConversation = {
          id: `chat-${Date.now()}`,
          title,
          fileName,
          fileSize,
          isGroup,
          participants: parseResult.participants,
          messages: matchResult.messages,
          unparsedLines: parseResult.unparsedLines,
          stats: matchResult.stats,
          mediaFiles,
          detectedDateFormat: parseResult.detectedDateFormat,
          sourceType,
          originalBlob
        };

        const durationMs = Math.round(performance.now() - startTime);

        const summary: ImportSummary = {
          fileName,
          fileSize,
          parsedMessages: matchResult.messages.length,
          unparsedLines: parseResult.unparsedLines.length,
          matchedMedia: matchResult.stats.matchedMediaCount,
          missingMedia: matchResult.stats.missingMediaCount,
          participants: parseResult.participants,
          durationMs
        };

        setConversation(newConversation);
        setImportSummary(summary);
        setProgress(100);
        setStatusText('Complete!');
      } catch (err: any) {
        setError(err?.message || 'Failed to parse chat export.');
      } finally {
        setIsLoading(false);
      }
    },
    [dateFormatPref]
  );

  const importFile = useCallback(
    async (file: File) => {
      setError(null);
      setImportSummary(null);
      setPendingZip(null);

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds the maximum allowed limit of ${Math.round(
            MAX_FILE_SIZE / (1024 * 1024)
          )}MB.`
        );
        return;
      }

      const lowerName = file.name.toLowerCase();
      const isZip = lowerName.endsWith('.zip');
      const isTxt = lowerName.endsWith('.txt');

      if (!isZip && !isTxt) {
        setError('Unsupported file type. Please upload a .txt export or a .zip archive from WhatsApp.');
        return;
      }

      setIsLoading(true);
      setProgress(10);
      setStatusText('Reading file...');

      try {
        if (isTxt) {
          if (file.size > MAX_TXT_SIZE) {
            throw new Error(`Text file exceeds maximum limit of ${Math.round(MAX_TXT_SIZE / (1024 * 1024))}MB.`);
          }
          const text = await file.text();
          await processTextChat(text, file.name, file.size, 'txt', new Map(), file);
        } else if (isZip) {
          setStatusText('Extracting ZIP archive...');
          const extraction = await extractZipArchive(file, (pct, status) => {
            setProgress(pct);
            setStatusText(status);
          });

          if (extraction.txtFiles.length === 0) {
            throw new Error('No .txt chat export file found inside this ZIP archive.');
          }

          if (extraction.txtFiles.length > 1) {
            // Ask user which chat to open
            setPendingZip({
              file,
              txtFiles: extraction.txtFiles,
              mediaFiles: extraction.mediaFiles,
              archiveTotal: extraction.totalFiles
            });
            setIsLoading(false);
            return;
          }

          // Single TXT file found
          const singleTxt = extraction.txtFiles[0];
          setProgress(75);
          setStatusText(`Reading chat text from ${singleTxt.filename}...`);
          const text = await singleTxt.readText();
          await processTextChat(text, file.name, file.size, 'zip', extraction.mediaFiles, file);
        }
      } catch (err: any) {
        setError(err?.message || 'An error occurred while importing the file.');
        setIsLoading(false);
      }
    },
    [processTextChat]
  );

  const chooseTxtFromZip = useCallback(
    async (txtEntry: ZipTxtFileEntry) => {
      if (!pendingZip) return;
      try {
        setIsLoading(true);
        setProgress(70);
        setStatusText(`Loading ${txtEntry.filename}...`);
        const text = await txtEntry.readText();
        await processTextChat(
          text,
          txtEntry.filename,
          pendingZip.file.size,
          'zip',
          pendingZip.mediaFiles,
          pendingZip.file
        );
        setPendingZip(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load selected chat text.');
        setIsLoading(false);
      }
    },
    [pendingZip, processTextChat]
  );

  const loadDemo = useCallback(
    (type: 'group' | 'ios' = 'group') => {
      clearSession();
      setIsLoading(true);
      setStatusText('Loading demo conversation...');
      setTimeout(() => {
        const demoConv = loadDemoConversation(type);
        setConversation(demoConv);
        setImportSummary({
          fileName: demoConv.fileName,
          fileSize: demoConv.fileSize,
          parsedMessages: demoConv.messages.length,
          unparsedLines: demoConv.unparsedLines.length,
          matchedMedia: demoConv.stats.matchedMediaCount,
          missingMedia: demoConv.stats.missingMediaCount,
          participants: demoConv.participants,
          durationMs: 12
        });
        setIsLoading(false);
      }, 150);
    },
    [clearSession]
  );

  return {
    conversation,
    isLoading,
    progress,
    statusText,
    error,
    importSummary,
    pendingZip,
    dateFormatPref,
    setDateFormatPref,
    importFile,
    chooseTxtFromZip,
    loadDemo,
    clearSession,
    dismissSummary: () => setImportSummary(null),
    clearError: () => setError(null)
  };
}

