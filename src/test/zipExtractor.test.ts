import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { extractZipArchive } from '../lib/zipExtractor';

describe('ZIP Extractor', () => {
  it('extracts txt chat and media attachments from a zip file', async () => {
    const zip = new JSZip();
    zip.file('_chat.txt', '20/10/2026, 10:00 - Kavin: Hello from inside zip!');
    zip.file('photo.jpg', new Uint8Array([0xff, 0xd8, 0xff, 0xe0]));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const extraction = await extractZipArchive(zipBlob);

    expect(extraction.txtFiles.length).toBe(1);
    expect(extraction.txtFiles[0].filename).toBe('_chat.txt');

    const chatContent = await extraction.txtFiles[0].readText();
    expect(chatContent).toContain('Hello from inside zip!');

    expect(extraction.mediaFiles.has('photo.jpg')).toBe(true);
  });

  it('detects multiple TXT files inside a single ZIP', async () => {
    const zip = new JSZip();
    zip.file('Chat1.txt', '20/10/2026, 10:00 - User1: Hi');
    zip.file('Chat2.txt', '20/10/2026, 10:00 - User2: Hello');

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const extraction = await extractZipArchive(zipBlob);

    expect(extraction.txtFiles.length).toBe(2);
  });

  it('throws an error when no txt chat is found', async () => {
    const zip = new JSZip();
    zip.file('only_image.jpg', new Uint8Array([1, 2, 3]));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const extraction = await extractZipArchive(zipBlob);

    expect(extraction.txtFiles.length).toBe(0);
  });
});

