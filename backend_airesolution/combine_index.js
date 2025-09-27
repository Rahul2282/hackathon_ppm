// unified_oracle.js
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
// 6. Classifier: crypto or sports?
// ------------------------------
async function classifyQuestion(question) {
  const prompt = `
You are a classifier.

User question: "${question}"

Decide category:
- "crypto" if about tokens, prices, ETH, BTC, markets, DIA, Pyth, ROI, etc.
- "sports" if about teams, matches, scores, goals, who won, etc.
- "unknown" if neither.

Return STRICT JSON ONLY:
{"category": "crypto" | "sports" | "unknown"}
`;

  const resp = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  try {
    const parsed = JSON.parse(resp.output_text);
    return parsed.category;
  } catch {
    return "unknown";
  }
}

// ------------------------------
// 7. Crypto: AI-powered Base Extraction
// ------------------------------
async function extractBasesAI(question) {
  const prompt = `
You are a crypto symbol extractor.

User question: "${question}"

Valid bases you can choose from:
${uniqueBases.join(", ")}

Task:
- Identify which of the valid bases are mentioned (directly or via common names like "bitcoin" = BTC, "ether" = ETH, "solana" = SOL).
- Return ONLY the matching bases in JSON array format, e.g.:
["BTC","SOL"]
`;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: prompt,
  });

  try {
    return JSON.parse(response.output_text);
  } catch {
    return [];
  }
}

// ------------------------------
// 8. Crypto Oracle
// ------------------------------
async function askCryptoOracle(question) {
  const bases = await extractBasesAI(question);
  if (bases.length === 0) {
    return {
      answer: false,
      confidence: 0.3,
      explanation: "No matching crypto bases found in question"
    };
  }

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

Validate across both sources and return STRICT JSON ONLY:
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
  } catch {
    return null;
  }
}

// ------------------------------
// 9. Sports Oracle (web search)
// ------------------------------
async function askSportsOracle(question) {
  const prompt = `
You are a sports result oracle.

User question: "${question}"

Use web search to check the official match result.
Bases on question you need to give answer for example if the question is did india won against pak if it is true then answer should be true if it is false then answer should false
Return STRICT JSON ONLY:
{
  "answer": true or false,
  "confidence": 0.0-1.0,
  "explanation": "short reasoning based on the searched result"
}
`;

  const resp = await client.responses.create({
    model: "gpt-4.1",
    tools: [{ type: "web_search" }],
    input: prompt,
  });
  console.log(resp.output_text)

  try {
    return JSON.parse(resp.output_text);
  } catch {
    return null;
  }
}

// ------------------------------
// 10. Router
// ------------------------------
async function askOracle(question) {
  const category = await classifyQuestion(question);

  if (category === "crypto") {
    return await askCryptoOracle(question);
  } else if (category === "sports") {
    return await askSportsOracle(question);
  } else {
    return {
      answer: false,
      confidence: 0.2,
      explanation: "Could not classify the question as crypto or sports"
    };
  }
}

// ------------------------------
// Example run
// ------------------------------
(async () => {
  // const q1 = "Will btc price beyond 120k on 25th september 2025?";
  const q2 = "Did Man city beats Arsenal in latest match?";

  // console.log("Q1:", await askOracle(q1));
  console.log("Q2:", await askOracle(q2));
})();
