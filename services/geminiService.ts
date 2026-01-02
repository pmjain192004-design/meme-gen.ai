
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MemeCaptionPair } from "../types";

// Ensure process.env.API_KEY is handled externally as per instructions
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Analyzes an image and suggests 5 funny caption pairs (top & bottom) using Gemini 3 Pro Preview.
   */
  async generateMagicCaptions(base64Image: string): Promise<MemeCaptionPair[]> {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: "Analyze the context of this image and provide 5 hilarious, witty, and trendy meme suggestions. Each suggestion MUST include a 'top' text (setup) and a 'bottom' text (punchline) appropriate for a standard meme format. Return them in a JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  top: { type: Type.STRING, description: "The setup text for the top of the meme." },
                  bottom: { type: Type.STRING, description: "The punchline text for the bottom of the meme." }
                },
                required: ["top", "bottom"]
              },
              description: "A list of 5 funny meme caption pairs.",
            },
          },
          required: ["captions"],
        },
      },
    });

    try {
      const data = JSON.parse(response.text || '{"captions": []}');
      return data.captions || [];
    } catch (e) {
      console.error("Failed to parse magic captions", e);
      return [];
    }
  },

  /**
   * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
   */
  async editImage(base64Image: string, prompt: string): Promise<string | null> {
    const ai = getAI();
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  }
};
