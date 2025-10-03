import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-300">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg font-medium">{message}</p>
      <p className="text-sm text-gray-500 mt-1">Video generation can take a few minutes. Please be patient.</p>
    </div>
  );
};

export default Loader;
