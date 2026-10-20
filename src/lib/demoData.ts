import { ChatConversation, MediaFileEntry } from '../types/chat';
import { parseWhatsAppChat } from './whatsappParser';
import { matchMediaWithMessages } from './mediaMatcher';

/**
 * Creates sample SVG data URLs for realistic media testing in demo mode
 */
function createSvgDataUrl(title: string, color: string, iconType: 'photo' | 'chart' | 'doc'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:#111b21;stop-opacity:0.95" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#grad)" rx="16"/>
    <circle cx="300" cy="170" r="60" fill="rgba(255,255,255,0.15)"/>
    <text x="300" y="180" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="44" fill="#ffffff" text-anchor="middle">📷</text>
    <text x="300" y="270" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="bold" font-size="22" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="300" y="305" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle">ChatReplay Demo Media Preview • 1920x1080</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Demo 1: Android Format - "Project Alpha Core Team" (Group Chat)
 */
export const DEMO_GROUP_CHAT_TEXT = `20/10/2026, 09:00 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
20/10/2026, 09:01 - Kavin created group "Project Alpha — Launch Squad"
20/10/2026, 09:02 - Kavin added Sarah Chen, Alex Rivera and Emily Watson
20/10/2026, 09:05 - Kavin: Good morning team! Welcome to the final sprint planning group. 🚀
20/10/2026, 09:06 - Sarah Chen: Morning Kavin! Excited to get this across the finish line.
Here is the revised launch checklist:
1. Finalize mobile responsive QA
2. Verify WhatsApp export parser compatibility
3. Benchmark ZIP extraction on 10k messages
4. Prepare social media assets
20/10/2026, 09:08 - Alex Rivera: Thanks Sarah! The initial performance tests look solid. Memory consumption remains under 35MB even with 5,000 messages.
20/10/2026, 09:10 - Emily Watson: That's awesome Alex! Check out the updated dashboard mockup I just exported from Figma:
20/10/2026, 09:11 - Emily Watson: dashboard_preview_v2.png (file attached)
20/10/2026, 09:12 - Kavin: Wow, the dark mode palette looks incredibly authentic to WhatsApp Web! 😍
20/10/2026, 09:14 - Alex Rivera: Let's also check the API documentation here: https://github.com/developer/docs
20/10/2026, 09:15 - Sarah Chen: This message was deleted
20/10/2026, 09:16 - Sarah Chen: Sorry sent the wrong draft! Here is the official specification:
20/10/2026, 09:17 - Sarah Chen: Project_Alpha_Technical_Specs.pdf (file attached)
20/10/2026, 09:20 - Kavin: Perfect. Let's make sure audio notes also have a smooth fallback when missing.
20/10/2026, 09:22 - Emily Watson: voice_note_briefing.opus (file attached)
20/10/2026, 09:25 - Alex Rivera: <Media omitted>
20/10/2026, 09:28 - Kavin changed the subject to: Project Alpha — Ready for Launch! 🎯
20/10/2026, 09:30 - Sarah Chen: Let's ship it! Fantastic work everyone. 🎉`;

/**
 * Demo 2: iOS Format - "Weekend Mountain Cabin" (Individual / Trip Chat)
 */
export const DEMO_IOS_CHAT_TEXT = `[10/18/26, 14:15:22] Maya Lin: Hey! Are you all packed for the mountain cabin this weekend? 🏔️
[10/18/26, 14:16:05] Kavin: Almost! Got the hiking boots and camera gear ready.
[10/18/26, 14:17:40] Maya Lin: Amazing! Look at the weather forecast view from the summit:
[10/18/26, 14:18:10] Maya Lin: <attached: mountain_view.jpg>
[10/18/26, 14:19:30] Kavin: That view looks breathtaking! What time should we meet at the trail base?
[10/18/26, 14:21:00] Maya Lin: Let's aim for 7:30 AM so we catch the morning sunrise over the ridges.
Don't forget to download the offline trail map from https://alltrails.com
[10/18/26, 14:22:15] Kavin: Got it bookmarked! See you Saturday morning bright and early. ☕`;

/**
 * Builds a ready-to-render ChatConversation object from demo presets
 */
export function loadDemoConversation(type: 'group' | 'ios' = 'group'): ChatConversation {
  const isGroup = type === 'group';
  const rawText = isGroup ? DEMO_GROUP_CHAT_TEXT : DEMO_IOS_CHAT_TEXT;
  const fileName = isGroup ? 'WhatsApp Chat - Project Alpha.txt' : 'WhatsApp Chat with Maya Lin.txt';
  const title = isGroup ? 'Project Alpha — Launch Squad' : 'Maya Lin';

  const parseResult = parseWhatsAppChat(rawText, 'auto');

  // Create mock media files for demo
  const mediaFiles = new Map<string, MediaFileEntry>();

  const demoMedia1Url = createSvgDataUrl('Dashboard UI Preview', '#00a884', 'photo');
  mediaFiles.set('dashboard_preview_v2.png', {
    filename: 'dashboard_preview_v2.png',
    blob: new Blob(['mock'], { type: 'image/png' }),
    url: demoMedia1Url,
    size: 245000,
    mimeType: 'image/png'
  });

  const demoMedia2Url = createSvgDataUrl('Mountain Ridge Sunset', '#3b82f6', 'photo');
  mediaFiles.set('mountain_view.jpg', {
    filename: 'mountain_view.jpg',
    blob: new Blob(['mock'], { type: 'image/jpeg' }),
    url: demoMedia2Url,
    size: 512000,
    mimeType: 'image/jpeg'
  });

  // Attach PDF doc
  mediaFiles.set('Project_Alpha_Technical_Specs.pdf', {
    filename: 'Project_Alpha_Technical_Specs.pdf',
    blob: new Blob(['PDF Document Content'], { type: 'application/pdf' }),
    url: '#',
    size: 1420000,
    mimeType: 'application/pdf'
  });

  const matchResult = matchMediaWithMessages(parseResult.messages, mediaFiles);

  return {
    id: `demo-${type}-${Date.now()}`,
    title,
    fileName,
    fileSize: new Blob([rawText]).size,
    isGroup,
    participants: parseResult.participants,
    messages: matchResult.messages,
    unparsedLines: parseResult.unparsedLines,
    stats: matchResult.stats,
    mediaFiles,
    detectedDateFormat: parseResult.detectedDateFormat,
    sourceType: 'demo'
  };
}

