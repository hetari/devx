import { createError, readBody } from "h3";
import { generateGeminiText } from "../ai/_gemini";

function getGeminiStatusMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Failed to generate response from Gemini";

  if (message.includes("503") || message.toLowerCase().includes("high demand")) {
    return {
      statusCode: 503,
      statusMessage: "Gemini is temporarily busy. Please try again in a moment.",
    };
  }

  return {
    statusCode: 500,
    statusMessage: message,
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ prompt?: unknown }>(event);
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Prompt is required",
    });
  }

  try {
    const text = await generateGeminiText(`
You are Atule, an AI co-founder for a small owner-led business.
The user is speaking by voice, so keep the answer natural, concise, and easy to hear.

User voice command: ${prompt}
`);

    return { text };
  } catch (error: unknown) {
    const { statusCode, statusMessage } = getGeminiStatusMessage(error);

    throw createError({
      statusCode,
      statusMessage,
    });
  }
});
