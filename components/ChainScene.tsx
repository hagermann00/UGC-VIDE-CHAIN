import React from 'react';
import { ChainItem } from '../types';
import VideoInputForm from './VideoInputForm';
import VideoPlayer from './VideoPlayer';
import Loader from './Loader';

interface ChainSceneProps {
    chain: ChainItem;
    sceneIndex: number;
    isChainLimitReached: boolean;
    isApiKeySet: boolean;
    onPromptChange: (prompt: string) => void;
    onDurationChange: (duration: number) => void;
    onStartImageChange: (file: File | null) => void;
    onEndImageChange: (file: File | null) => void;
    onSubmit: (shouldChain: boolean) => void;
    onReverseEngineer: () => void;
}

const MAX_CHAINS = 5;

const ChainScene: React.FC<ChainSceneProps> = ({
    chain,
    sceneIndex,
    isChainLimitReached,
    isApiKeySet,
    onPromptChange,
    onDurationChange,
    onStartImageChange,
    onEndImageChange,
    onSubmit,
    onReverseEngineer,
}) => {
    const remaining = MAX_CHAINS - (sceneIndex + 1);

    return (
        <div className="h-full bg-gray-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700 flex flex-col">
             <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h2 className="text-xl font-bold text-white">Scene {sceneIndex + 1}</h2>
                <div className="text-sm font-medium text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                    {sceneIndex + 1} / {MAX_CHAINS}
                    {remaining > 0 && ` (${remaining} remaining)`}
                    {remaining === 0 && ' (Final Scene)'}
                </div>
            </div>

            <VideoInputForm 
                id={chain.id}
                onSubmit={onSubmit} 
                isLoading={chain.isLoading}
                prompt={chain.prompt}
                onPromptChange={onPromptChange}
                duration={chain.duration}
                onDurationChange={onDurationChange}
                startImageFile={chain.startImageFile}
                startImagePreview={chain.startImagePreview}
                onStartImageChange={onStartImageChange}
                endImageFile={chain.endImageFile}
                endImagePreview={chain.endImagePreview}
                onEndImageChange={onEndImageChange}
                isChainLimitReached={isChainLimitReached}
                isApiKeySet={isApiKeySet}
            />

            <div className="mt-8 flex-grow min-h-[300px] flex items-center justify-center bg-gray-900/40 rounded-xl border border-dashed border-gray-600 p-4">
              {chain.isLoading && <Loader message={chain.loadingMessage} />}
              {chain.error && !chain.isLoading && (
                <div className="text-center text-red-400">
                  <p className="font-bold">Generation Failed</p>
                  <p>{chain.error}</p>
                </div>
              )}
              {!chain.isLoading && !chain.error && chain.generatedVideoUrl && (
                <VideoPlayer 
                    videoUrl={chain.generatedVideoUrl} 
                    onReverseEngineer={onReverseEngineer}
                />
              )}
              {!chain.isLoading && !chain.error && !chain.generatedVideoUrl && (
                <div className="text-center text-gray-500">
                  <p>Your generated video will appear here.</p>
                  <p className="text-sm">Describe a scene, add an image, and let the magic happen.</p>
                </div>
              )}
            </div>
        </div>
    );
};

export default ChainScene;