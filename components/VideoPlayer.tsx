import React, { useState } from 'react';
import { DownloadIcon, WandIcon } from './icons';

interface VideoPlayerProps {
  videoUrl: string;
  onReverseEngineer: () => void;
}

const filters = [
    { name: 'None', class: '' },
    { name: 'Vintage', class: 'sepia-[.6] brightness-110 contrast-75' },
    { name: 'Grayscale', class: 'grayscale' },
    { name: 'Sepia', class: 'sepia' },
    { name: 'Invert', class: 'invert' },
    { name: 'Saturate', class: 'saturate-200' },
    { name: 'Dreamy', class: 'contrast-125 saturate-150 hue-rotate-[-15deg]' },
];

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onReverseEngineer }) => {
  const [activeFilter, setActiveFilter] = useState(filters[0].class);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <video
        src={videoUrl}
        controls
        className={`w-full max-w-lg rounded-lg shadow-lg border border-gray-700 transition-all duration-300 ${activeFilter}`}
        autoPlay
        loop
        key={videoUrl} // Add key to force re-render on new video
      >
        Your browser does not support the video tag.
      </video>
      <div className="w-full max-w-lg space-y-4">
        <div className="flex flex-wrap justify-center gap-3">
            <a
                href={videoUrl}
                download="generated-video.mp4"
                className="inline-flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition duration-200"
            >
                <DownloadIcon />
                Download Video
            </a>
            <button
                onClick={onReverseEngineer}
                className="inline-flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition duration-200"
            >
                <WandIcon />
                Reverse Engineer Prompt
            </button>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 w-full">
            <label htmlFor="filter-select" className="block text-sm font-medium text-gray-300 mb-2 text-center">Video Filters</label>
            <div className="flex gap-2">
                <select
                    id="filter-select"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                >
                    {filters.map(filter => (
                        <option key={filter.name} value={filter.class}>{filter.name}</option>
                    ))}
                </select>
                <button 
                    onClick={() => setActiveFilter(filters[0].class)}
                    className="py-2 px-3 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-md transition"
                >
                    Reset
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;