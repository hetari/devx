import { createError, readBody } from "h3";
import { generateGeminiText } from "../ai/_gemini";

type ChatRole = "user" | "assistant";

interface ChatRequestBody {
  message?: unknown;
  businessContext?: unknown;
  history?: Array<{
    role?: unknown;
    content?: unknown;
  }>;
}

interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

const maxHistoryItems = 8;

function sanitizeHistory(history: ChatRequestBody["history"] = []): ChatHistoryItem[] {
  return history
    .filter((item): item is ChatHistoryItem => {
      const role = item.role;
      const content = item.content;

      return (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      );
    })
    .slice(-maxHistoryItems)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));
}

function serializeBusinessContext(context: unknown) {
  if (!context || typeof context !== "object") {
    return "No structured business context was provided.";
  }

  return JSON.stringify(context, null, 2).slice(0, 4000);
}

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

function buildPrompt(
  message: string,
  history: ChatHistoryItem[],
  businessContext: string,
) {
  const conversation = history
    .map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.content}`)
    .join("\n");

  return `
You are Atule, an AI co-founder for a small owner-led business.
Use the business context below when it is relevant. Be practical, direct, and concise.
Answer in plain text. Prefer 2-4 short sentences unless the user asks for more detail.
If the user asks for data you do not have, say what data is missing instead of inventing it.

Business context from the app:
${businessContext}

Recent conversation:
${conversation || "No previous messages."}

User: ${message}
Assistant:
`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequestBody>(event);
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message is required",
    });
  }

  try {
    const history = sanitizeHistory(body.history);
    const businessContext = serializeBusinessContext(body.businessContext);
    const text = await generateGeminiText(
      buildPrompt(message, history, businessContext),
    );

    return { text };
  } catch (error: unknown) {
    const { statusCode, statusMessage } = getGeminiStatusMessage(error);

    throw createError({
      statusCode,
      statusMessage,
    });
  }
});
