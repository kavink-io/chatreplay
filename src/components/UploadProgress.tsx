import React from 'react';
import { Loader2 } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  statusText: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress, statusText }) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-center animate-fade-in">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-wa-green/10 flex items-center justify-center text-wa-green animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
        Processing Conversation
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 min-h-[20px]">
        {statusText || 'Analyzing export structure...'}
      </p>

      {/* Progress track */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden mb-2">
        <div
          className="bg-wa-green h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>Processing client-side</span>
        <span className="font-medium text-wa-green">{progress}%</span>
      </div>
    </div>
  );
};

