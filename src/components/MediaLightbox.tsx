import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { ChatMessage } from '../types/chat';

interface MediaLightboxProps {
  currentMessage: ChatMessage;
  allMediaMessages: ChatMessage[];
  onClose: () => void;
  onNavigate: (msg: ChatMessage) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  currentMessage,
  allMediaMessages,
  onClose,
  onNavigate
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const currentIndex = allMediaMessages.findIndex((m) => m.id === currentMessage.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allMediaMessages.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setScale(1);
      setRotation(0);
      onNavigate(allMediaMessages[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, allMediaMessages, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setScale(1);
      setRotation(0);
      onNavigate(allMediaMessages[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, allMediaMessages, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  const handleDownload = () => {
    if (!currentMessage.mediaUrl) return;
    const a = document.createElement('a');
    a.href = currentMessage.mediaUrl;
    a.download = currentMessage.mediaFilename || 'whatsapp_image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none animate-fade-in">
      {/* Top action bar */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-20 text-white">
        <div className="truncate max-w-md">
          <p className="font-medium text-sm truncate">
            {currentMessage.mediaFilename || 'Media Preview'}
          </p>
          <p className="text-xs text-gray-400">
            {currentMessage.sender ? `Sent by ${currentMessage.sender}` : 'Media attachment'} •{' '}
            {currentIndex + 1} of {allMediaMessages.length}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setScale(1);
              setRotation(0);
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-2"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden">
        {currentMessage.mediaUrl ? (
          <img
            src={currentMessage.mediaUrl}
            alt={currentMessage.mediaFilename || 'Media attachment'}
            className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`
            }}
          />
        ) : (
          <div className="text-gray-400 text-center">
            <p className="text-lg">Media not available</p>
            <p className="text-sm">This media was not included in the export archive</p>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm z-20"
          title="Previous (Left arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm z-20"
          title="Next (Right arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

