# ChatReplay 💬

> **Your conversations, replayed.**
> A modern, responsive, privacy-first web application to view exported WhatsApp chat files (`.txt` and `.zip`) in an authentic WhatsApp Web-inspired interface.

![ChatReplay Banner](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/message-square.svg)

---

## 🔒 Privacy & Security Guarantee

**100% Client-Side Processing.**
- Chat conversations and media attachments are processed entirely inside your local browser memory using the native File API and JSZip.
- **No backend, no database, no third-party APIs, and zero telemetry/analytics.**
- All temporary object URLs are strictly revoked upon clearing the session or closing the tab.
- Built-in protection against HTML injection (XSS), URL scheme attacks (`javascript:`, `data:` blocked), and ZIP bomb safeguards.

> *"Your conversations are processed locally in your browser. Chat contents are not uploaded to our servers."*

---

## 🚀 Key Features

### 📁 1. File Import & ZIP Handling
- **Drag & Drop / File Picker:** Supports `.txt` (text-only) and `.zip` (with media).
- **Automatic Discovery:** Automatically locates the chat export file and matching media inside ZIP archives.
- **Multi-Chat Disambiguation:** When an archive contains multiple `.txt` exports, a selection modal lets you pick which conversation to view.
- **Sample Demos Included:** Immediate 1-click testing with both **Android Group Chat** (with images, documents, audio notes) and **iOS 12-Hour Chat** presets.
- **Import Summary:** Detailed report showing total messages parsed, unparsed lines, matched media files, and missing media files.

### 🧠 2. WhatsApp Export Parser
- **Android Format:** `20/10/2026, 14:30 - Sender: Message`
- **iOS Format:** `[20/10/2026, 10:30:00 AM] Sender: Message`
- **Flexible Time:** Full support for both 12-hour (AM/PM) and 24-hour clocks.
- **Date Disambiguation:** Automatic detection of `DD/MM/YYYY` vs `MM/DD/YYYY`, with manual override fallback.
- **Multiline & Emojis:** Preserves multiline paragraphs, lists, Unicode emojis, and symbols.
- **Group System Events:** Centered pill styling for group creation, participant additions/removals, encryption notices, and subject changes.
- **Deleted Messages:** Authentic placeholder styling for *"This message was deleted"*.
- **Preserved Unparsed Lines:** Does not silently drop lines; preserves unparsed lines with line numbers for inspection.

### 💬 3. WhatsApp Web-Inspired Interface
- **Authentic Styling:** Authentic WhatsApp Web doodle wallpaper, message bubbles, tails, and typography.
- **Outgoing vs Incoming:** Dynamic sender alignment selector (*"Me: Select Profile"*) to align your messages to the right with blue double checkmarks.
- **Participant Colors:** Deterministic WhatsApp-style participant name colors in group chats.
- **Date Separators:** Centered sticky date pills (*Today*, *Yesterday*, *20 October 2026*).
- **Responsive Layout:** Desktop three-column/two-column layout; collapses cleanly to mobile screens with a back button.
- **Dark & Light Modes:** Tailored color palettes with instant toggle and persistence.
- **Read-Only Mode:** Clearly labeled viewer with decorative message input bar.

### 🖼️ 4. Media Viewer & Lightbox
- **Images:** Lazy-loaded inline thumbnails with full-screen Lightbox (zoom in/out, rotate, keyboard arrow navigation, download).
- **Videos:** Native HTML5 video player with controls.
- **Voice Notes & Audio:** Audio playback player.
- **Documents:** PDF and office document cards with filename, file size, and 1-click download.
- **Missing Media Handling:** Clear notification badges when media was omitted during WhatsApp export.

### 🔍 5. Search, Filter & Navigation
- **Real-Time Keyword Search:** Highlight matched terms directly inside message text.
- **Multi-Filter Support:** Filter by sender, message type (All, Text, Media, Documents), and date range (Start to End).
- **Match Jumping:** Navigate forward and backward through search results with pulse scroll animations.
- **Scroll to Latest:** Floating button with smooth scroll to the bottom.

### 📤 6. Import & Export
- **Print Conversation:** Dedicated `@media print` stylesheet that removes navigation, buttons, and backgrounds for clean PDF generation.
- **Export to JSON:** Export structured message objects.
- **Export to CSV:** Spreadsheet-ready format with escaped fields.
- **Download Original:** Re-download the uploaded file without modifications.

---

## 🛠️ Technology Stack

- **React 18** with **TypeScript**
- **Vite 6** (lightning-fast build tool)
- **Tailwind CSS 3** (custom WhatsApp theme palettes)
- **Lucide React** (icons)
- **JSZip** (in-browser ZIP extraction)
- **Vitest** (comprehensive automated test suite)

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v24 LTS)
- npm or pnpm

### Installation

```bash
# Clone the repository (or navigate to project directory)
cd chatreplay

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

ChatReplay includes 20 comprehensive unit tests covering parsing, security, media matching, and ZIP extraction:

```bash
# Run Vitest unit tests
npm test
```

Test coverage includes:
- Android (24h & 12h) and iPhone formats
- Multiline messages & emoji preservation
- Group system notifications & deleted message detection
- Date format order disambiguation (DD/MM vs MM/DD)
- XSS prevention and dangerous protocol rejection (`javascript:`, `data:`)
- Invisible WhatsApp Unicode control character stripping (`\u200e`, `\u202f`)
- Filename sanitization against directory traversal
- ZIP extraction with multiple text files

---

## 📦 Building for Production

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

The compiled output is located in the `dist/` directory.

---

## 🚀 Deployment Instructions

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the CLI prompts. Framework preset: **Vite**. Output directory: `dist`.

Alternatively, import your Git repository directly via the [Vercel Dashboard](https://vercel.com/new).

### Deploy to Netlify
1. Connect repository in [Netlify Dashboard](https://app.netlify.com/).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`

Or deploy via Netlify CLI:
```bash
npx netlify-cli deploy --prod --dir=dist
```

### Deploy to GitHub Pages
Add `base: '/<repo-name>/'` to `vite.config.ts`, build with `npm run build`, and deploy the `dist` folder to your `gh-pages` branch.

---

## 📱 How to Export WhatsApp Chats

### Android
1. Open any WhatsApp chat.
2. Tap the three dots (**⋮**) > **More** > **Export chat**.
3. Choose **"Include Media"** (to export as `.zip`) or **"Without Media"** (to export as `.txt`).
4. Transfer the file to your computer and drop it into ChatReplay.

### iPhone
1. Open the WhatsApp conversation and tap the contact/group name at the top.
2. Scroll to the bottom and select **"Export Chat"**.
3. Choose **"Attach Media"** (exports as `.zip`) or **"Without Media"** (exports as `.txt`).
4. Save to Files or AirDrop to your computer.

---

## 📄 License
MIT License. Built for personal conversation archiving, research, and legal review.
ChatReplay is not affiliated with WhatsApp or Meta.

