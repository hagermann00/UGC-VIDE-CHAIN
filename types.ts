export interface HistoryItem {
  id: string;
  prompt: string;
  videoUrl: string; // This will be a data URL for persistence
  timestamp: number;
}

export interface ImageInput {
  base64: string;
  mimeType: string;
}

export interface ChainItem {
  id: string;
  prompt: string;
  duration: number;
  startImageFile: File | null;
  startImagePreview: string | null;
  endImageFile: File | null;
  endImagePreview: string | null;
  generatedVideoUrl: string | null;
  finalPrompt: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}