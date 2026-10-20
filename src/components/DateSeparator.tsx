import React from 'react';
import { formatDateSeparator } from '../lib/dateFormatter';

interface DateSeparatorProps {
  date: Date | null;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const label = formatDateSeparator(date);

  return (
    <div className="flex justify-center my-4 select-none sticky top-2 z-10">
      <span className="bg-white/90 dark:bg-[#182229]/90 text-gray-600 dark:text-gray-300 backdrop-blur-sm text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-sm border border-gray-200/60 dark:border-gray-800/60 tracking-wide uppercase text-[11px]">
        {label}
      </span>
    </div>
  );
};

