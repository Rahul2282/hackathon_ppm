import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askSportsOracle(question) {
  const prompt = `
You are a sports result oracle.

User question: "${question}"

Use web search to check the official match result.
Return STRICT JSON ONLY in this format:

{
  "answer": true or false,
  "confidence": 0.0-1.0,
  "explanation": "short reasoning based on the searched result"
}
`;

  const resp = await client.responses.create({
    model: "gpt-4.1",
    tools: [{ type: "web_search" }], // enables live lookup
    input: prompt,
  });

  try {
    return JSON.parse(resp.output_text);
  } catch (e) {
    console.error("❌ Failed to parse:", resp.output_text);
    return null;
  }
}

// ------------------------------
// Example run
// ------------------------------
(async () => {
  const result = await askSportsOracle("Barcelona won against madrid by 5-2 in latest match?");
  console.log("Oracle Result:", result);
})();
