import { GoogleGenAI, Type } from "@google/genai";
import { AIFixSuggestion } from '../types';

// Initialize the Gemini API client
// Note: In a real app, ensure process.env.API_KEY is defined in your build environment.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeBrokenEquipment = async (base64Image: string): Promise<AIFixSuggestion | null> => {
  if (!ai) {
    console.warn('Gemini API key not configured. Using fallback response.');
    return {
      issue: "AI analysis unavailable (API key not configured)",
      confidence: 0,
      steps: ["Check power connection.", "Inspect for physical damage.", "Consult equipment manual."]
    };
  }
  
  try {
    const modelId = 'gemini-2.5-flash-image';
    const prompt = `
      You are an expert hotel maintenance technician AI.
      Analyze the provided image of broken hotel equipment.
      Identify the likely issue and provide 3 specific, actionable repair steps.
      Also provide a confidence score (0-100) and a short summary of the issue.
      
      Return the response in JSON format matching this structure:
      {
        "issue": "Short description of the problem",
        "confidence": 95,
        "steps": ["Step 1...", "Step 2...", "Step 3..."]
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIFixSuggestion;
    }
    return null;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a mock fallback if API fails (for demo resilience)
    return {
      issue: "Unable to analyze image via AI (API Error).",
      confidence: 0,
      steps: ["Check power connection.", "Inspect for physical damage.", "Consult manual."]
    };
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export const sendMessageToAssistant = async (
  history: ChatMessage[],
  newMessage: string,
  newImage?: string,
  language: string = 'English'
): Promise<string> => {
  if (!ai) {
    console.warn('Gemini API key not configured. Using fallback response.');
    return "I'm currently unavailable because the API key is not configured. Please add your Gemini API key to enable AI assistance.";
  }
  
  try {
    const modelId = 'gemini-2.5-flash-latest'; // Supports multimodal input
    
    const contents = history.map(msg => {
      const parts: any[] = [];
      if (msg.image) {
        // Only sending the image data if it's not too old? 
        // For simplicity, send all history images. 
        // Note: Gemini has token limits, but for this demo it's likely fine.
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: msg.image } });
      }
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      return { role: msg.role, parts };
    });

    const currentParts: any[] = [];
    if (newImage) {
      currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: newImage } });
    }
    if (newMessage) {
      currentParts.push({ text: newMessage });
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: `You are 'MT', Maintech's AI Assistant. You are an expert in hotel operations, maintenance, and repair. Help technicians troubleshoot issues, find parts, and follow safety protocols. Be concise, professional, and helpful. If an image is provided, analyze it for faults. Respond in ${language}.`,
      }
    });

    return response.text || "I didn't catch that. Could you try again?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the network right now. Please try again later.";
  }
};
