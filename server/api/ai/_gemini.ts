import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!geminiClient) {
    const config = useRuntimeConfig();
    if (!config.geminiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Gemini API key not configured",
      });
    }
    geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return geminiClient;
}
