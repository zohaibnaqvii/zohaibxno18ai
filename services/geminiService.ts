
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIPersona, Message } from "../types";
import { SYSTEM_PROMPTS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async *generateChatStream(
    persona: AIPersona,
    history: Message[],
    userInput: string,
    useSearch: boolean
  ): AsyncGenerator<{ text: string; groundingLinks?: { title: string; uri: string }[] }> {
    const modelName = 'gemini-3-flash-preview';
    
    const contents = history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: userInput }] });

    const config: any = {
      systemInstruction: SYSTEM_PROMPTS[persona] + "\n\nCRITICAL: Use Roman Urdu (Hinglish) naturally. Be extremely fast and solid. No apologies.",
      thinkingConfig: { thinkingBudget: 0 }
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      const result = await this.ai.models.generateContentStream({
        model: modelName,
        contents,
        config,
      });

      let fullText = "";
      for await (const chunk of result) {
        const text = chunk.text || "";
        fullText += text;
        
        const groundingLinks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || 'Intel',
          uri: c.web?.uri || '#'
        })).filter((l: any) => l.uri !== '#');

        yield { text: fullText, groundingLinks };
      }
    } catch (error) {
      console.error("Streaming Failure:", error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64 = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!base64) throw new Error("Synthesis failed");
      return base64;
    } catch (error) {
      console.error("Image Error:", error);
      throw error;
    }
  }
}
