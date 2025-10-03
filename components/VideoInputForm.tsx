import React, { useRef, useState, useEffect } from 'react';
import { FilmIcon, CameraIcon, PlusIcon } from './icons';

interface VideoInputFormProps {
  id: string;
  onSubmit: (shouldChain: boolean) => void;
  isLoading: boolean;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  startImageFile: File | null;
  startImagePreview: string | null;
  onStartImageChange: (file: File | null) => void;
  endImageFile: File | null;
  endImagePreview: string | null;
  onEndImageChange: (file: File | null) => void;
  isChainLimitReached: boolean;
}

const ImageUploader: React.FC<{
    label: string;
    imagePreview: string | null;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    id: string;
    isLoading: boolean;
}> = ({ label, imagePreview, onImageChange, onRemoveImage, fileInputRef, id, isLoading }) => {
    return (
        <div className="flex flex-col gap-2">
             <label htmlFor={id} className="block text-sm font-medium text-gray-300">
                {label}
            </label>
            <div className="relative w-full h-32 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Preview" className="h-full w-full rounded-md object-cover" />
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            disabled={isLoading}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                            aria-label="Remove image"
                        >
                            &times;
                        </button>
                    </>
                ) : (
                    <label htmlFor={id} className={`flex flex-col items-center justify-center text-gray-400 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}>
                        <CameraIcon />
                        <span className="text-xs mt-1">Upload Image</span>
                    </label>
                )}
                 <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    ref={fileInputRef}
                    className="hidden"
                    id={id}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};


const VideoInputForm: React.FC<VideoInputFormProps> = ({ 
    id,
    onSubmit, 
    isLoading, 
    prompt, 
    onPromptChange,
    duration,
    onDurationChange,
    startImageFile,
    startImagePreview,
    onStartImageChange,
    endImageFile,
    endImagePreview,
    onEndImageChange,
    isChainLimitReached,
}) => {
  const startFileInputRef = useRef<HTMLInputElement>(null);
  const endFileInputRef = useRef<HTMLInputElement>(null);

  const [showStartUploader, setShowStartUploader] = useState(!!startImageFile);
  const [showEndUploader, setShowEndUploader] = useState(!!endImageFile);

  useEffect(() => {
    if (startImageFile) {
      setShowStartUploader(true);
    }
  }, [startImageFile]);

  useEffect(() => {
    if (endImageFile) {
      setShowEndUploader(true);
    }
  }, [endImageFile]);


  const handleImageChange = (
      event: React.ChangeEvent<HTMLInputElement>, 
      handler: (file: File | null) => void
    ) => {
    const file = event.target.files?.[0];
    handler(file || null);
  };

  const handleRemoveImage = (
      handler: (file: File | null) => void, 
      ref: React.RefObject<HTMLInputElement>
    ) => {
    handler(null);
    if(ref.current) {
        ref.current.value = "";
    }
  };

   const handleToggleStartUploader = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowStartUploader(e.target.checked);
    if (!e.target.checked) {
        handleRemoveImage(onStartImageChange, startFileInputRef);
    }
  };

  const handleToggleEndUploader = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowEndUploader(e.target.checked);
    if (!e.target.checked) {
        handleRemoveImage(onEndImageChange, endFileInputRef);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div>
        <label htmlFor={`prompt-${id}`} className="block text-sm font-medium text-gray-300 mb-2">
          Video Prompt
        </label>
        <textarea
          id={`prompt-${id}`}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., A neon hologram of a cat driving at top speed"
          rows={3}
          className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor={`duration-${id}`} className="block text-sm font-medium text-gray-300 mb-2">
          Video Duration <span className="text-gray-400 font-normal">({duration}s)</span>
        </label>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">1s</span>
            <input
              id={`duration-${id}`}
              type="range"
              min="1"
              max="8"
              step="1"
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-xs text-gray-400">8s</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div className="flex items-center">
                <input
                    id={`show-start-image-${id}`}
                    type="checkbox"
                    checked={showStartUploader}
                    onChange={handleToggleStartUploader}
                    disabled={isLoading}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor={`show-start-image-${id}`} className="ml-2 text-sm font-medium text-gray-300 select-none cursor-pointer">
                    Add Start Image
                </label>
            </div>
             <div className="flex items-center">
                <input
                    id={`show-end-image-${id}`}
                    type="checkbox"
                    checked={showEndUploader}
                    onChange={handleToggleEndUploader}
                    disabled={isLoading}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor={`show-end-image-${id}`} className="ml-2 text-sm font-medium text-gray-300 select-none cursor-pointer">
                    Add End Image
                </label>
            </div>
        </div>

        {(showStartUploader || showEndUploader) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {showStartUploader && (
                    <ImageUploader 
                        label="Start Image"
                        imagePreview={startImagePreview}
                        onImageChange={(e) => handleImageChange(e, onStartImageChange)}
                        onRemoveImage={() => handleRemoveImage(onStartImageChange, startFileInputRef)}
                        fileInputRef={startFileInputRef}
                        id={`start-image-upload-${id}`}
                        isLoading={isLoading}
                    />
                )}
                {showEndUploader && (
                    <ImageUploader 
                        label="End Image"
                        imagePreview={endImagePreview}
                        onImageChange={(e) => handleImageChange(e, onEndImageChange)}
                        onRemoveImage={() => handleRemoveImage(onEndImageChange, endFileInputRef)}
                        fileInputRef={endFileInputRef}
                        id={`end-image-upload-${id}`}
                        isLoading={isLoading}
                    />
                )}
            </div>
        )}
      </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
            type="button"
            onClick={() => onSubmit(false)}
            disabled={isLoading || !prompt.trim()}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
                </>
            ) : (
                <>
                <FilmIcon />
                Generate Scene
                </>
            )}
            </button>
            {!isChainLimitReached ? (
                <button
                    type="button"
                    onClick={() => onSubmit(true)}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-purple-400 rounded-lg shadow-sm text-base font-medium text-purple-300 bg-purple-900/30 hover:bg-purple-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed transition duration-200"
                >
                    <PlusIcon />
                    Generate & Add Next
                </button>
            ) : (
                 <div className="flex items-center justify-center text-center text-yellow-400 bg-yellow-900/50 p-3 rounded-lg">
                    <p className="font-semibold text-sm">Chain Limit Reached</p>
                </div>
            )}
       </div>
    </form>
  );
};

export default VideoInputForm;