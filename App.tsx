import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateVideo } from './services/geminiService';
import { fileToBase64, blobToBase64, dataUrlToFile } from './utils/fileUtils';
import { getHistory, saveVideoToHistory, clearHistory } from './utils/historyUtils';
import ChainScene from './components/ChainScene';
import HistoryPanel from './components/HistoryPanel';
import SequencePlayer from './components/SequencePlayer';
import { SparklesIcon, PlayIcon } from './components/icons';
import { HistoryItem, ImageInput, ChainItem } from './types';

const MAX_CHAINS = 5;

const createNewChainItem = (): ChainItem => ({
  id: `${Date.now()}-${Math.random()}`,
  prompt: '',
  duration: 3,
  startImageFile: null,
  startImagePreview: null,
  endImageFile: null,
  endImagePreview: null,
  generatedVideoUrl: null,
  finalPrompt: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
});

const App: React.FC = () => {
  const [chains, setChains] = useState<ChainItem[]>([createNewChainItem()]);
  const [history, setHistory] = useState<HistoryItem[]>(getHistory());
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const chainsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the end when a new chain is added
    if (chainsContainerRef.current) {
      chainsContainerRef.current.scrollTo({
        left: chainsContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [chains.length]);

  const updateChain = (id: string, updates: Partial<ChainItem>) => {
    setChains(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleProgress = (id: string, message: string) => {
    updateChain(id, { loadingMessage: message });
  };

  const captureLastFrameAsFile = (videoBlob: Blob): Promise<File> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoBlob);
        video.muted = true;

        video.onloadedmetadata = () => {
            video.currentTime = video.duration;
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context.'));
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            
            URL.revokeObjectURL(video.src);

            dataUrlToFile(dataUrl, 'last-frame.jpg')
                .then(resolve)
                .catch(reject);
        };

        video.onerror = (e) => {
            reject(new Error('Failed to load video for frame capture.'));
        };
    });
  };

  const handleGenerateVideo = useCallback(async (id: string, shouldChain: boolean) => {
    const chain = chains.find(c => c.id === id);
    if (!chain || !chain.prompt.trim()) {
      updateChain(id, { error: 'Please enter a prompt.' });
      return;
    }

    updateChain(id, { 
        isLoading: true, 
        error: null, 
        generatedVideoUrl: null, 
        finalPrompt: null,
        loadingMessage: 'Initializing video generation...',
    });
    setSelectedHistoryId(null);

    try {
      let startImageInput: ImageInput | null = null;
      if (chain.startImageFile) {
        handleProgress(id, 'Processing start image...');
        const base64 = await fileToBase64(chain.startImageFile);
        startImageInput = { base64, mimeType: chain.startImageFile.type };
      }
      
      let endImageInput: ImageInput | null = null;
      if (chain.endImageFile) {
        handleProgress(id, 'Processing end image...');
        const base64 = await fileToBase64(chain.endImageFile);
        endImageInput = { base64, mimeType: chain.endImageFile.type };
      }

      const { videoBlob, finalPrompt } = await generateVideo(
        chain.prompt,
        chain.duration, 
        startImageInput, 
        endImageInput, 
        (msg) => handleProgress(id, msg)
      );

      const videoDataUrl = await blobToBase64(videoBlob);
      const objectUrl = URL.createObjectURL(videoBlob);
      
      updateChain(id, { generatedVideoUrl: objectUrl, finalPrompt });
      
      try {
        const newHistoryItem = saveVideoToHistory(finalPrompt, videoDataUrl);
        setHistory(prev => [newHistoryItem, ...prev]);
        setSelectedHistoryId(newHistoryItem.id);
      } catch (e) {
        console.error("Failed to save to history, local storage might be full.", e);
        updateChain(id, { error: "Video generated, but failed to save to history. Local storage might be full." });
      }

      if (shouldChain) {
        if (chains.length < MAX_CHAINS) {
            handleProgress(id, 'Capturing final frame for next scene...');
            const nextStartFile = await captureLastFrameAsFile(videoBlob);
            const newChain = createNewChainItem();
            newChain.startImageFile = nextStartFile;
            newChain.startImagePreview = URL.createObjectURL(nextStartFile);
            setChains(prev => [...prev, newChain]);
        } else {
            console.warn(`Chain limit of ${MAX_CHAINS} reached. Cannot add new chain.`);
        }
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during video generation.';
      updateChain(id, { error: errorMessage });
    } finally {
      updateChain(id, { isLoading: false, loadingMessage: '' });
    }
  }, [chains]);

  const handleSelectHistoryItem = (item: HistoryItem) => {
    const lastChain = chains[chains.length - 1];
    if (lastChain) {
        updateChain(lastChain.id, {
            generatedVideoUrl: item.videoUrl,
            finalPrompt: item.prompt,
            prompt: item.prompt,
            error: null,
            isLoading: false,
        });
        setSelectedHistoryId(item.id);
    }
  };
  
  const handleReverseEngineer = (id: string) => {
    const chain = chains.find(c => c.id === id);
    if (chain?.finalPrompt) {
      updateChain(id, { prompt: chain.finalPrompt });
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setSelectedHistoryId(null);
  };

  const handleImageChange = (id: string, type: 'start' | 'end', file: File | null) => {
    if (type === 'start') {
        const preview = file ? URL.createObjectURL(file) : null;
        updateChain(id, { startImageFile: file, startImagePreview: preview });
    } else {
        const preview = file ? URL.createObjectURL(file) : null;
        updateChain(id, { endImageFile: file, endImagePreview: preview });
    }
  };

  const handleDurationChange = (id: string, duration: number) => {
    updateChain(id, { duration });
  };
  
  const sequenceVideos = chains
    .map(c => c.generatedVideoUrl)
    .filter((url): url is string => !!url);


  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
        <header className="text-center mb-6 flex-shrink-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center gap-3">
            <SparklesIcon />
            UGC Video Generator
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Create captivating video sequences with Gemini.
          </p>
           {sequenceVideos.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => setIsPlayingSequence(true)}
                        className="inline-flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition duration-200"
                    >
                        <PlayIcon />
                        Play Sequence ({sequenceVideos.length})
                    </button>
                </div>
            )}
        </header>
        
        <main className="flex-grow flex flex-col w-full min-h-0">
          <div ref={chainsContainerRef} className="flex-1 flex flex-row items-stretch gap-6 overflow-x-auto overflow-y-hidden p-2 -m-2">
              {chains.map((chain, index) => (
                  <div key={chain.id} className="w-[calc(100vw-2.5rem)] md:w-[44rem] lg:w-[48rem] flex-shrink-0 h-full">
                      <ChainScene
                          chain={chain}
                          sceneIndex={index}
                          isChainLimitReached={chains.length >= MAX_CHAINS}
                          onPromptChange={(p) => updateChain(chain.id, { prompt: p })}
                          onDurationChange={(d) => handleDurationChange(chain.id, d)}
                          onStartImageChange={(f) => handleImageChange(chain.id, 'start', f)}
                          onEndImageChange={(f) => handleImageChange(chain.id, 'end', f)}
                          onSubmit={(shouldChain) => handleGenerateVideo(chain.id, shouldChain)}
                          onReverseEngineer={() => handleReverseEngineer(chain.id)}
                      />
                  </div>
              ))}
          </div>
          <div className="flex-shrink-0 pt-8">
            <HistoryPanel
                history={history}
                onSelectItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
                selectedId={selectedHistoryId}
              />
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm flex-shrink-0">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
      {isPlayingSequence && (
        <SequencePlayer 
            videos={sequenceVideos}
            onClose={() => setIsPlayingSequence(false)}
        />
      )}
    </>
  );
};

export default App;