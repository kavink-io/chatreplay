import React from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Image,
  Search,
  Sparkles,
  ArrowRight,
  Printer,
  Zap,
  Lock,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { UploadProgress } from '../components/UploadProgress';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { DateFormatPreference } from '../types/chat';

interface HomePageProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  progress: number;
  statusText: string;
  error: string | null;
  onClearError: () => void;
  onTryDemo: (type: 'group' | 'ios') => void;
  dateFormatPref: DateFormatPreference;
  onDateFormatChange: (pref: DateFormatPreference) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onFileSelected,
  isLoading,
  progress,
  statusText,
  error,
  onClearError,
  onTryDemo,
  dateFormatPref,
  onDateFormatChange,
  isDarkMode,
  onToggleDarkMode
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c1317] text-[#111b21] dark:text-[#e9edef] flex flex-col transition-colors">
      {/* Top Navigation */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#111b21]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-wa-green flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
            ChatReplay
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTryDemo('group')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-wa-green/10 text-wa-green hover:bg-wa-green/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try Demo
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs flex items-center gap-1.5"
            title="Toggle theme"
          >
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-16 flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-wa-green" />
          <span>100% Client-Side • No Data Leaves Your Browser</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white mb-4">
          Your conversations,{' '}
          <span className="bg-gradient-to-r from-wa-green via-teal-500 to-emerald-400 bg-clip-text text-transparent">
            replayed.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-10 leading-relaxed">
          View your exported WhatsApp chats in a familiar, beautiful interface. Supports Android & iPhone exports, media attachments, and fast offline search.
        </p>

        {/* Error Notification */}
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 flex items-start gap-3 animate-fade-in text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold">Import Failed</strong>
              <span>{error}</span>
            </div>
            <button
              onClick={onClearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dropzone or Upload Progress */}
        <div className="w-full mb-12">
          {isLoading ? (
            <UploadProgress progress={progress} statusText={statusText} />
          ) : (
            <FileDropzone
              onFileSelected={onFileSelected}
              isLoading={isLoading}
              onTryDemo={onTryDemo}
              dateFormatPref={dateFormatPref}
              onDateFormatChange={onDateFormatChange}
            />
          )}
        </div>

        {/* Privacy Card Guarantee */}
        <div className="w-full max-w-2xl mb-16">
          <PrivacyNotice variant="card" />
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-[#111b21] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-wa-green flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2">
              Private by Design
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Files are parsed directly in your browser's memory using JavaScript. Chat history is never stored on a server or transferred across the network.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-[#111b21] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Image className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2">
              Media & Lightbox
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Exported ZIP archives are unpacked on the fly. View images with an interactive lightbox (zoom, rotate), play videos, and listen to voice notes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-[#111b21] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2">
              Powerful Search & Print
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Search messages by keyword, sender, or date range with real-time match jumping. Export to JSON, CSV, or generate a clean print format.
            </p>
          </div>
        </div>

        {/* How to Export Instructions */}
        <div className="w-full max-w-3xl bg-white dark:bg-[#111b21] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 mb-12">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-wa-green" />
            How to export your chat from WhatsApp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-300">
            <div className="bg-gray-50 dark:bg-[#182229] p-4 rounded-xl">
              <strong className="block text-gray-900 dark:text-gray-100 font-semibold mb-1">
                Android:
              </strong>
              <ol className="list-decimal list-inside space-y-1 text-gray-500 dark:text-gray-400">
                <li>Open the chat in WhatsApp</li>
                <li>Tap the three dots (⋮) &gt; More &gt; Export chat</li>
                <li>Choose "Include Media" for a .ZIP or "Without Media" for a .TXT</li>
                <li>Save or share the file to your computer</li>
              </ol>
            </div>

            <div className="bg-gray-50 dark:bg-[#182229] p-4 rounded-xl">
              <strong className="block text-gray-900 dark:text-gray-100 font-semibold mb-1">
                iPhone:
              </strong>
              <ol className="list-decimal list-inside space-y-1 text-gray-500 dark:text-gray-400">
                <li>Open the chat and tap the contact/group name at top</li>
                <li>Scroll down and tap "Export Chat"</li>
                <li>Choose "Attach Media" (generates ZIP) or "Without Media"</li>
                <li>Save to Files or AirDrop to your computer</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6 text-center text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-[#111b21]/50">
        <p className="mb-2">
          ChatReplay is an independent chat viewer tool. Not affiliated with, endorsed, or sponsored by WhatsApp or Meta.
        </p>
        <p className="text-[11px] text-gray-400">
          This application operates purely as an offline archive reader and does not restore or import conversations back into the WhatsApp application.
        </p>
      </footer>
    </div>
  );
};

