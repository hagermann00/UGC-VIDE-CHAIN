import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

interface SequencePlayerProps {
  videos: string[];
  onClose: () => void;
}

const SequencePlayer: React.FC<SequencePlayerProps> = ({ videos, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else {
      // Close the player when the last video finishes
      onClose();
    }
  };

  // Autoplay video when currentIndex changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Autoplay was prevented:", e));
    }
  }, [currentIndex]);
  
  // Handle Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!videos.length) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
        <div 
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                onClick={onClose} 
                className="absolute -top-2 -right-2 md:-top-4 md:-right-10 text-white hover:text-gray-300 z-10 bg-black/30 rounded-full p-1" 
                aria-label="Close sequence player"
            >
                <CloseIcon />
            </button>
            <video
                ref={videoRef}
                key={videos[currentIndex]}
                src={videos[currentIndex]}
                onEnded={handleVideoEnd}
                controls
                autoPlay
                className="w-full h-auto max-h-[calc(90vh-80px)] rounded-lg shadow-2xl border border-gray-700"
            >
                Your browser does not support the video tag.
            </video>
            <div className="text-center text-white bg-black/30 rounded-full py-1 px-4 self-center">
                <p>Playing Scene {currentIndex + 1} of {videos.length}</p>
            </div>
        </div>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
    </div>
  );
};

export default SequencePlayer;