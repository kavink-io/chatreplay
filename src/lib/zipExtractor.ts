import JSZip from 'jszip';
import { MediaFileEntry } from '../types/chat';
import { MAX_TOTAL_UNCOMPRESSED_SIZE, MAX_ZIP_ENTRIES } from './security';

export interface ZipTxtFileEntry {
  filename: string;
  size: number;
  readText: () => Promise<string>;
}

export interface ZipExtractionResult {
  txtFiles: ZipTxtFileEntry[];
  mediaFiles: Map<string, MediaFileEntry>;
  totalFiles: number;
}

/**
 * Common MIME types for WhatsApp media
 */
const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  '3gp': 'video/3gpp',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  opus: 'audio/ogg; codecs=opus',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  vcf: 'text/vcard',
  txt: 'text/plain'
};

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return MIME_MAP[ext] || 'application/octet-stream';
}

/**
 * Extracts a ZIP archive safely and categorizes text chats and media files.
 */
export async function extractZipArchive(
  file: File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<ZipExtractionResult> {
  onProgress?.(10, 'Opening ZIP archive...');

  const zip = new JSZip();
  let zipContent: JSZip;

  try {
    zipContent = await zip.loadAsync(file);
  } catch (err: any) {
    throw new Error(
      `Failed to open ZIP archive: ${err?.message || 'File may be corrupted or password protected.'}`
    );
  }

  const entries = Object.keys(zipContent.files);
  if (entries.length > MAX_ZIP_ENTRIES) {
    throw new Error(
      `ZIP contains too many files (${entries.length}). Maximum allowed is ${MAX_ZIP_ENTRIES} to protect browser memory.`
    );
  }

  let totalUncompressedSize = 0;
  const txtFiles: ZipTxtFileEntry[] = [];
  const mediaFiles = new Map<string, MediaFileEntry>();

  let processedCount = 0;
  const totalEntries = entries.length;

  for (const relativePath of entries) {
    const zipEntry = zipContent.files[relativePath];

    // Skip directories and macOS hidden files like __MACOSX
    if (zipEntry.dir || relativePath.includes('__MACOSX') || relativePath.startsWith('.')) {
      continue;
    }

    const baseName = relativePath.split('/').pop() || relativePath;
    const isTxt = baseName.toLowerCase().endsWith('.txt');

    if (isTxt) {
      txtFiles.push({
        filename: baseName,
        size: (zipEntry as any)._data?.uncompressedSize || 0,
        readText: async () => {
          return await zipEntry.async('string');
        }
      });
    } else {
      // It's a media or document file
      // Check size before decompression
      const estimatedSize = (zipEntry as any)._data?.uncompressedSize || 0;
      totalUncompressedSize += estimatedSize;

      if (totalUncompressedSize > MAX_TOTAL_UNCOMPRESSED_SIZE) {
        throw new Error(
          `Total uncompressed media size exceeds maximum safe limit (${Math.round(
            MAX_TOTAL_UNCOMPRESSED_SIZE / (1024 * 1024)
          )}MB).`
        );
      }

      // Read as blob
      const mimeType = getMimeType(baseName);
      const blob = await zipEntry.async('blob');
      const typedBlob = new Blob([blob], { type: mimeType });
      const url = URL.createObjectURL(typedBlob);

      const mediaEntry: MediaFileEntry = {
        filename: baseName,
        blob: typedBlob,
        url,
        size: blob.size,
        mimeType
      };

      // Store by both exact baseName and lowercase baseName for robust lookup
      mediaFiles.set(baseName, mediaEntry);
      mediaFiles.set(baseName.toLowerCase(), mediaEntry);
      mediaFiles.set(relativePath, mediaEntry);
      mediaFiles.set(relativePath.toLowerCase(), mediaEntry);
    }

    processedCount++;
    if (processedCount % 10 === 0 || processedCount === totalEntries) {
      const pct = 10 + Math.floor((processedCount / totalEntries) * 80);
      onProgress?.(pct, `Extracting media files (${processedCount}/${totalEntries})...`);
    }
  }

  onProgress?.(95, 'Finalizing archive extraction...');

  return {
    txtFiles,
    mediaFiles,
    totalFiles: totalEntries
  };
}

/**
 * Revokes all object URLs created during ZIP extraction to prevent browser memory leaks.
 */
export function revokeMediaUrls(mediaFiles: Map<string, MediaFileEntry>): void {
  const revokedUrls = new Set<string>();
  mediaFiles.forEach((entry) => {
    if (entry.url && !revokedUrls.has(entry.url)) {
      URL.revokeObjectURL(entry.url);
      revokedUrls.add(entry.url);
    }
  });
  mediaFiles.clear();
}

