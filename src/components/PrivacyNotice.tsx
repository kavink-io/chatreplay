import React from 'react';
import { ShieldCheck, Lock, EyeOff, HardDrive } from 'lucide-react';

interface PrivacyNoticeProps {
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ variant = 'banner', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-2 text-xs text-wa-green-dark dark:text-wa-green font-medium ${className}`}>
        <ShieldCheck className="w-4 h-4 text-wa-green shrink-0" />
        <span>100% Private & Client-Side. No chats are uploaded to any server.</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-950 dark:text-emerald-100 text-base">
              Private by Design
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Zero server uploads. Zero analytics. 100% in-browser processing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-900/80 dark:text-emerald-200/80 mt-4">
          <div className="flex items-start gap-2 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="block text-emerald-950 dark:text-emerald-100 font-medium">Local Browser Sandbox</strong>
              Files are parsed directly in your device's memory and never leave your computer.
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="block text-emerald-950 dark:text-emerald-100 font-medium">No Message Tracking</strong>
              No telemetry, tracking pixels, or third-party APIs have access to message contents.
            </div>
          </div>
          <div className="flex items-start gap-2 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <strong className="block text-emerald-950 dark:text-emerald-100 font-medium">Ephemeral Sessions</strong>
              Conversations are discarded immediately when you clear the session or close the tab.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default banner
  return (
    <div
      role="region"
      aria-label="Privacy Guarantee"
      className={`bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Privacy Guarantee:</strong> Your conversations are processed locally in your browser. Chat contents are not uploaded to our servers.
        </span>
      </div>
    </div>
  );
};

