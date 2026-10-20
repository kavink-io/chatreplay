import React, { useState, useRef } from 'react';
import { Upload, FileText, Archive, Sparkles, AlertCircle, Settings2 } from 'lucide-react';
import { DateFormatPreference } from '../types/chat';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  onTryDemo: (type: 'group' | 'ios') => void;
  dateFormatPref: DateFormatPreference;
  onDateFormatChange: (pref: DateFormatPreference) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  isLoading,
  onTryDemo,
  dateFormatPref,
  onDateFormatChange
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
          isDragOver
            ? 'border-wa-green bg-wa-green/10 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111b21] hover:border-wa-green dark:hover:border-wa-green hover:shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.zip"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-wa-green/10 dark:bg-wa-green/20 text-wa-green flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Upload className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Import WhatsApp Chat
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mb-6">
            Drag and drop your exported <span className="font-semibold text-wa-green">.txt</span> or{' '}
            <span className="font-semibold text-wa-green">.zip</span> file here, or click to browse
          </p>

          <button
            type="button"
            className="px-6 py-3 rounded-full bg-wa-green hover:bg-wa-green-hover text-white font-medium shadow-md transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="w-4 h-4" />
            Browse Files
          </button>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              .TXT (Chat Only)
            </span>
            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <Archive className="w-3.5 h-3.5 text-amber-500" />
              .ZIP (With Media)
            </span>
            <span className="text-gray-400">Max size: 250MB</span>
          </div>
        </div>
      </div>

      {/* Demo conversations & Advanced fallback options */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Try Demo buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Test with Demo:
          </span>
          <button
            type="button"
            onClick={() => onTryDemo('group')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          >
            Team Group Chat
          </button>
          <button
            type="button"
            onClick={() => onTryDemo('ios')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          >
            iOS Trip Chat
          </button>
        </div>

        {/* Date format preference toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Date Format: <span className="font-semibold text-wa-green">{dateFormatPref}</span>
          </button>

          {showAdvanced && (
            <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-[#111b21] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-3 z-30 text-xs">
              <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-wa-green" />
                Date Parsing Rule
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Automatic detection works for 99% of exports. You can force a specific order if ambiguous:
              </p>
              <div className="space-y-1">
                {(['auto', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'] as DateFormatPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => {
                      onDateFormatChange(pref);
                      setShowAdvanced(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      dateFormatPref === pref
                        ? 'bg-wa-green/10 text-wa-green font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{pref === 'auto' ? 'Auto Detect (Recommended)' : pref}</span>
                    {dateFormatPref === pref && <span className="text-wa-green font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

