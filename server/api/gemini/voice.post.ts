import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { prompt } = body;

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Prompt is required",
    });
  }

  // Log the request
  console.log("[Gemini Voice] Request:", prompt);

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Log the response
    console.log("[Gemini Voice] Response:", text);

    return { text };
  } catch (error: unknown) {
    const typedError = error as ErrorEvent;
    console.error("[Gemini Voice] Error:", typedError);
    throw createError({
      statusCode: 500,
      statusMessage: typedError?.message || "Failed to generate response from Gemini",
    });
  }
});
