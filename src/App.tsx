import React, { useState, useEffect } from 'react';
import { useChatImport } from './hooks/useChatImport';
import { HomePage } from './pages/HomePage';
import { ViewerPage } from './pages/ViewerPage';
import { ZipTxtSelectorModal } from './components/ZipTxtSelectorModal';
import { ImportSummaryModal } from './components/ImportSummaryModal';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('chatreplay_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chatreplay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chatreplay_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const {
    conversation,
    isLoading,
    progress,
    statusText,
    error,
    importSummary,
    pendingZip,
    dateFormatPref,
    setDateFormatPref,
    importFile,
    chooseTxtFromZip,
    loadDemo,
    clearSession,
    dismissSummary,
    clearError
  } = useChatImport();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c1317]">
      {/* Either HomePage or ViewerPage */}
      {!conversation ? (
        <HomePage
          onFileSelected={importFile}
          isLoading={isLoading}
          progress={progress}
          statusText={statusText}
          error={error}
          onClearError={clearError}
          onTryDemo={loadDemo}
          dateFormatPref={dateFormatPref}
          onDateFormatChange={setDateFormatPref}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      ) : (
        <ViewerPage
          conversation={conversation}
          onNewChat={clearSession}
          onClearChat={clearSession}
          onTryDemo={loadDemo}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}

      {/* Multiple TXT selector modal for ZIP archives */}
      {pendingZip && (
        <ZipTxtSelectorModal
          pendingZip={pendingZip}
          onSelect={chooseTxtFromZip}
          onCancel={clearSession}
        />
      )}

      {/* Post-import metrics summary modal */}
      {importSummary && conversation && (
        <ImportSummaryModal
          summary={importSummary}
          unparsedLines={conversation.unparsedLines}
          onDismiss={dismissSummary}
        />
      )}
    </div>
  );
};

export default App;

