import { GoogleGenAI } from "@google/genai";
import { ImageInput } from '../types';

const POLLING_INTERVAL_MS = 10000; // 10 seconds

const loadingMessages = [
    "Warming up the creative engines...",
    "Gathering pixels and inspiration...",
    "Directing the digital actors...",
    "Rendering the first few frames...",
    "Applying cinematic magic...",
    "Polishing the final cut...",
    "Almost there, the premiere is near!"
];

const describeImage = async (apiKey: string, image: ImageInput): Promise<string> => {
  if (!apiKey) throw new Error("API key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: 'Describe this image in a concise and vivid way for a video generation prompt. Focus on key objects, atmosphere, and style.' },
          { inlineData: { data: image.base64, mimeType: image.mimeType } },
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error describing image:", error);
    throw new Error("Failed to analyze the end image.");
  }
};


export const generateVideo = async (
  apiKey: string,
  prompt: string,
  duration: number,
  startImage: ImageInput | null,
  endImage: ImageInput | null,
  onProgress: (message: string) => void
): Promise<{ videoBlob: Blob; finalPrompt: string }> => {
    if (!apiKey) throw new Error("API key is missing.");
    const ai = new GoogleGenAI({ apiKey });
    try {
        let finalPrompt = prompt;
        let imageForGeneration: ImageInput | null = startImage;

        if (startImage && endImage) {
            onProgress('Analyzing end image...');
            const endImageDescription = await describeImage(apiKey, endImage);
            finalPrompt = `A video that starts resembling the provided image and transitions to a scene described as: "${endImageDescription}". The overall theme is: "${prompt}".`;
            imageForGeneration = startImage;
        } else if (endImage && !startImage) {
            finalPrompt = `A video that culminates in a scene resembling the provided image, based on the theme: "${prompt}".`;
            imageForGeneration = endImage;
        }

        const generateVideosParams: any = {
            model: 'veo-2.0-generate-001',
            prompt: finalPrompt,
            config: {
                numberOfVideos: 1,
                durationSeconds: duration,
            },
        };

        if (imageForGeneration) {
            generateVideosParams.image = {
                imageBytes: imageForGeneration.base64,
                mimeType: imageForGeneration.mimeType,
            };
        }
        
        onProgress('Starting video generation...');
        let operation = await ai.models.generateVideos(generateVideosParams);

        let messageIndex = 0;
        onProgress(loadingMessages[messageIndex]);
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
            
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            onProgress(loadingMessages[messageIndex]);

            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        onProgress("Video generation complete!");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error('Video generation succeeded, but no download link was found.');
        }

        const response = await fetch(`${downloadLink}&key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`Failed to download video. Status: ${response.status}`);
        }
        
        const videoBlob = await response.blob();
        return { videoBlob, finalPrompt };
    } catch (error) {
        console.error("Error in generateVideo service:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate video. Please check the console for more details.");
    }
};