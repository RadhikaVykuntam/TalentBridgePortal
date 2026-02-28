import type { Message, GrokResponse } from "./TalentBridgeChatbot.types";

const GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROK_MODEL = "llama-3.1-8b-instant";

export async function askGrok(
  messages: Message[],
  resumeText: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;

  if (!apiKey) {
    throw new Error("VITE_GROK_API_KEY is not set in your .env file.");
  }

  const systemPrompt = resumeText
    ? `You are a professional career advisor and resume expert integrated into Talent Bridge, a job search platform.
You have been given the user's resume below. Analyze it thoroughly and answer questions about improvements, skill gaps, job fit, certifications, ATS optimization, and career growth.
Be specific, actionable, and encouraging. Reference actual content from their resume when giving advice.

USER'S RESUME:
${resumeText}`
    : `You are a professional career advisor integrated into Talent Bridge, a job search platform.
No resume has been uploaded yet. Encourage the user to upload their resume for personalized advice, but still answer general career questions helpfully.`;

  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  const data: GrokResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Grok API request failed.");
  }

  return (
    data.choices?.[0]?.message?.content ??
    "Sorry, I couldn't process that. Please try again."
  );
}
