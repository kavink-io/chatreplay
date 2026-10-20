import React from 'react';
import { FileText, ArrowRight, X } from 'lucide-react';
import { PendingZipChoice } from '../hooks/useChatImport';
import { ZipTxtFileEntry } from '../lib/zipExtractor';
import { formatFileSize } from '../lib/dateFormatter';

interface ZipTxtSelectorModalProps {
  pendingZip: PendingZipChoice;
  onSelect: (entry: ZipTxtFileEntry) => void;
  onCancel: () => void;
}

export const ZipTxtSelectorModal: React.FC<ZipTxtSelectorModalProps> = ({
  pendingZip,
  onSelect,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111b21] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              Multiple Chats Found in Archive
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Found {pendingZip.txtFiles.length} conversation exports. Which one would you like to view?
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {pendingZip.txtFiles.map((txt, index) => (
            <button
              key={index}
              onClick={() => onSelect(txt)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-wa-green dark:hover:border-wa-green hover:bg-wa-green/5 dark:hover:bg-wa-green/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-wa-green/10 text-wa-green flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {txt.filename}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {txt.size > 0 ? formatFileSize(txt.size) : 'Text Export'}
                  </span>
                </div>
              </div>

              <div className="text-wa-green opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

