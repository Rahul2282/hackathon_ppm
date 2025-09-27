import { HermesClient } from "@pythnetwork/hermes-client";
import OpenAI from "openai";
import axios from "axios";
import fs from "fs";
import "dotenv/config";

// ------------------------------
// 1. Load feeds & unique bases
// ------------------------------
const feeds = JSON.parse(fs.readFileSync("crypto_feeds.json", "utf-8"));
const uniqueBases = [...new Set(feeds.map(item => item.base))];
const connection = new HermesClient("https://hermes.pyth.network", {});

// ------------------------------
// 2. Helper: split array into chunks
// ------------------------------
function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

// ------------------------------
// 3. Fetch Pyth prices (only selected bases)
// ------------------------------
async function fetchPythPrices(bases, batchSize = 50) {
  const priceIds = feeds.filter(f => bases.includes(f.base)).map(f => f.id);
  const chunks = chunkArray(priceIds, batchSize);

  let allParsed = [];
  for (const chunk of chunks) {
    const priceUpdates = await connection.getLatestPriceUpdates(chunk);
    allParsed = allParsed.concat(priceUpdates.parsed);
  }

  return allParsed.map(feed => {
    const actualPrice = feed.price.price * 10 ** feed.price.expo;
    const conf = feed.price.conf * 10 ** feed.price.expo;
    const matched = feeds.find(f => f.id === feed.id);

    return {
      source: "Pyth",
      base: matched ? matched.base : feed.id,
      symbol: matched ? matched.symbol : feed.id,
      price: actualPrice,
      conf: conf,
      quote: matched ? matched.quote : "USD"
    };
  });
}

// ------------------------------
// 4. Fetch DIA quotations
// ------------------------------
async function fetchDIAQuotations(bases) {
  const results = [];
  for (const sym of bases) {
    try {
      const url = `https://api.diadata.org/v1/quotation/${sym}`;
      const res = await axios.get(url);
      const data = res.data;
      console.log('data-->',data)

      results.push({
        source: "DIA",
        base: sym,
        symbol: `${sym}/USD`,
        price: data.Price,
        exchange: data.Exchange,
        volume: data.Volume,
        time: data.Time,
      });
    } catch (err) {
      console.error(`❌ Failed to fetch DIA for ${sym}:`, err.message);
    }
  }
  return results;
}

// ------------------------------
// 5. OpenAI client
// ------------------------------
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ------------------------------
// 6. AI-powered Base Extraction
// ------------------------------
async function extractBasesAI(question) {
  const prompt = `
You are a crypto symbol extractor.

User question: "${question}"

Valid bases you can choose from:
${uniqueBases.join(", ")}

Task:
- Identify which of the valid bases are mentioned (directly or via common names like "bitcoin" = BTC, "ether" = ETH, "solana" = SOL).
- Return ONLY the matching bases in a JSON array format, e.g.:
["BTC","SOL"]
`;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  try {
    return JSON.parse(response.output_text);
  } catch (err) {
    console.error("❌ Failed to parse base extraction:", response.output_text);
    return [];
  }
}

// ------------------------------
// 7. AI Agent (reasoning)
// ------------------------------
async function askAgent(question) {
  // 1. Identify relevant bases
  const bases = await extractBasesAI(question);
  if (bases.length === 0) {
    return { error: "No matching bases found in question" };
  }

  // 2. Fetch prices only for those bases
  const pythPrices = await fetchPythPrices(bases);
  const diaPrices = await fetchDIAQuotations(bases);
  const allPrices = [...pythPrices, ...diaPrices];

  const prompt = `
You are a crypto price reasoning agent.

Here are the latest prices from two sources:

${allPrices.map(p =>
  `${p.source}: ${p.symbol} = ${p.price}${p.conf ? `, conf ±${p.conf}` : ""}${p.exchange ? `, exchange=${p.exchange}` : ""}`
).join("\n")}

User question: ${question}

Validate across both sources and return a JSON like:
{
  "answer": true or false,
  "confidence": 0.0-1.0,
  "explanation": "short reasoning comparing DIA and Pyth"
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  try {
    return JSON.parse(response.output_text);
  } catch (err) {
    console.error("❌ Failed to parse AI response:", response.output_text);
    return null;
  }
}

// ------------------------------
// 8. Run Example
// ------------------------------
(async () => {
  const result = await askAgent("Will eth price goes beyond 6k dollars");
  console.log("Agent Response:", result);
})();
