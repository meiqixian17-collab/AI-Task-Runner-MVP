const DEFAULT_DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";
const DEFAULT_TIMEOUT_MS = 10000;

export async function callDeepSeek(userPrompt, options = {}) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Missing DEEPSEEK_API_KEY. Please set it in server/.env.");
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(
      process.env.DEEPSEEK_API_URL || DEFAULT_DEEPSEEK_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                options.systemPrompt ||
                "You are a task progress assistant. Return exactly one immediately executable next step. Respond in the same language as the user's task."
            },
            {
              role: "user",
              content: userPrompt
            }
          ]
        })
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("DeepSeek API request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const responseText = await response.text();
  const data = parseJsonOrFallback(responseText);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `DeepSeek API request failed with status ${response.status}.`;

    throw new Error(message);
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek API did not return valid message content.");
  }

  return content;
}

function parseJsonOrFallback(responseText) {
  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      message: responseText
    };
  }
}
