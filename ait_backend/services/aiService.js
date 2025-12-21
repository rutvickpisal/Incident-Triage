import "dotenv/config";
import OpenAI from "openai";

// const HF_API_URL =
//   "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

export async function analyzeIncident(description, context) {

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a backend service. You must return ONLY valid JSON."
        },
        {
          role: "user",
          content: `
            Return a STRICT JSON object with:
            {
              "severity": "P0 | P1 | P2 | P3",
              "possibleCauses": string[],
              "nextSteps": string[],
              "AISummary": string,
              "confidence": number (0 to 1)
            }

            AISummary is the only field where you should provide a detailed explanation of the incident in at least 3 and at max 5 lines per your understanding.
            No markdown.
            No extra text.
            Past similar incidents for your context if provided:
            ${context}
            current Incident:
            ${description}
            `
        }
      ]
    });

    console.log("GROQ RESPONSE RECEIVED");
    return completion.choices[0].message.content;

  } catch (err) {
    console.error("GROQ CALL FAILED:", err);
    throw err;
  }
}
