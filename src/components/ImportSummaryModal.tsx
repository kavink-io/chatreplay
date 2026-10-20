import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Image,
  AlertTriangle,
  Users,
  Clock,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ImportSummary, UnparsedLine } from '../types/chat';
import { formatFileSize } from '../lib/dateFormatter';

interface ImportSummaryModalProps {
  summary: ImportSummary;
  unparsedLines: UnparsedLine[];
  onDismiss: () => void;
}

export const ImportSummaryModal: React.FC<ImportSummaryModalProps> = ({
  summary,
  unparsedLines,
  onDismiss
}) => {
  const [showUnparsed, setShowUnparsed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111b21] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-wa-green/10 text-wa-green flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                Import Summary
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {summary.fileName} ({formatFileSize(summary.fileSize)})
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FileText className="w-4 h-4 text-wa-green" />
              <span>Parsed Messages</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {summary.parsedMessages.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Participants</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {summary.participants.length}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Image className="w-4 h-4 text-emerald-500" />
              <span>Matched Media</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.matchedMedia.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#182229] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Missing Media</span>
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {summary.missingMedia.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Processing duration */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 px-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Processed in {summary.durationMs}ms
          </span>
          <span>Client-side memory</span>
        </div>

        {/* Unparsed lines inspection */}
        {unparsedLines.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowUnparsed(!showUnparsed)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium"
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {unparsedLines.length} unparsed lines preserved (click to review)
              </span>
              {showUnparsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showUnparsed && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-gray-900 text-gray-200 text-xs p-3 rounded-lg font-mono">
                {unparsedLines.map((ul, idx) => (
                  <div key={idx} className="border-b border-gray-800 pb-1 mb-1 last:border-0">
                    <span className="text-gray-500 mr-2">Line {ul.lineNumber}:</span>
                    <span>{ul.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onDismiss}
          className="w-full py-2.5 px-4 rounded-xl bg-wa-green hover:bg-wa-green-hover text-white font-medium text-sm transition-colors"
        >
          Open Chat Viewer
        </button>
      </div>
    </div>
  );
};

