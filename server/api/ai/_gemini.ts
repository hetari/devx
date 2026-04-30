import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRuntimeConfig } from "#imports";
import { createError } from "h3";

let geminiClient: GoogleGenerativeAI | null = null;

const fallbackModel = "gemini-2.5-flash";

function getGeminiModelName() {
  const config = useRuntimeConfig();
  const configuredModel = String(config.geminiModel || "").trim();

  return configuredModel || fallbackModel;
}

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const config = useRuntimeConfig();
    const apiKey = String(config.geminiApiKey || "").trim();

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Gemini API key not configured",
      });
    }

    geminiClient = new GoogleGenerativeAI(apiKey);
  }

  return geminiClient;
}

export function getGeminiModel() {
  return getGeminiClient().getGenerativeModel({
    model: getGeminiModelName(),
  });
}

export async function generateGeminiText(prompt: string) {
  const result = await getGeminiModel().generateContent(prompt);
  const response = await result.response;

  return response.text();
}
