import { HistoryItem } from '../types';

const HISTORY_KEY = 'ugc-video-history';

export const getHistory = (): HistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
};

export const saveVideoToHistory = (prompt: string, videoDataUrl: string): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    prompt,
    videoUrl: videoDataUrl,
    timestamp: Date.now(),
  };

  const updatedHistory = [newItem, ...history];

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save to localStorage. It might be full.", error);
    // Here you could implement logic to prune old history items if storage is full
    throw error; // re-throw to notify the caller (e.g., to show an error in the UI)
  }

  return newItem;
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};
