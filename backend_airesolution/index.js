import OpenAI from "openai";
import "dotenv/config";


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // load from .env
});

async function askYesNo(question) {
  const response = await client.responses.create({
    model: "gpt-5", // or "gpt-4.1" if gpt-5 not enabled
    tools: [{ type: "web_search" }],
    input: `
Answer the following question with ONLY JSON in this format:
{
  "answer": true or false,
  "confidence": 0.0-1.0
}

Question: ${question}
    `,
  });

  console.log("Raw output:", response.output_text);

  try {
    let parsed = JSON.parse(response.output_text);

    // Ensure "answer" is a boolean
    if (typeof parsed.answer === "string") {
      parsed.answer = parsed.answer.toLowerCase() === "yes";
    }

    // Ensure confidence is a number
    parsed.confidence = Number(parsed.confidence) || 0;

    return parsed;
  } catch (e) {
    return { answer: false, confidence: 0 };
  }
}


// // Example usage
// askYesNo("is real madrid is in 1st position in la liga 2025-2026?")
//   .then(console.log)
//   .catch(console.error);

import { ethers } from "ethers";
import abi from "./abi.json" with { type: "json" };

// 🔗 RPC provider (Alchemy free Sepolia endpoint)
const provider = new ethers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/JIPTKH1MaYX-pqia-6yOz"
);

// 📍 Contract details
const contractAddress = "0x6fF38e89659866B0BeCcE6a558644a9937BC3C26";

const signer = new ethers.Wallet("0x686bab5a1347fa6cc0167c083e41fac0cf31f62c46a7792877195cf724cc5253", provider);
const contract = new ethers.Contract(contractAddress, abi, signer);

const latestBlock = await provider.getBlockNumber();
// console.log("latestBlock",latestBlock)
async function proposeOutcomeIfMarket(id) {
    
    try {
        console.log(`🚀 Sending proposeAIOutcome for market ${id}...`);
        const market = await contract.markets(id);
        
        
        const question=market.question.toString()
        const status_market=market.status.toString()
        console.log("question---->",question)
        console.log("status_market---->",status_market)
        if (status_market=="1"){
            const response = await askYesNo(question);
            console.log("response---->",response)
            const tx = await contract.proposeAIOutcome(
                id,
                response.answer, // 👈 set isYes (true/false as needed)
                "" // 👈 replace with actual evidence URI
            );
    
            console.log("⏳ Tx sent:", tx.hash);
    
            const receipt = await tx.wait();
            console.log("✅ Tx confirmed in block:", receipt.blockNumber);
        }
        else{
            console.log("Market is not in resolving state")
        }
        
    } catch (err) {
        console.error("❌ Error calling proposeAIOutcome:", err);
    }
}
    
async function fetchPastEvents(fromBlock = 9115859) {
  const filter = contract.filters.MarketClosed();
  const latestBlock = await provider.getBlockNumber();

  console.log(`⏳ Fetching MarketClosed events from block ${fromBlock} to ${latestBlock}...`);

  const step = 499;

  while (fromBlock <= latestBlock) {
    const toBlock = Math.min(fromBlock + step, latestBlock);

    try {
      const logs = await contract.queryFilter(filter, fromBlock, toBlock);

      logs.forEach((ev) => {
        console.log("📜 Past Event");
        console.log("Block:", ev.blockNumber);
        console.log("Market ID:", ev.args.toString());
        console.log("Tx Hash:", ev.transactionHash);
        proposeOutcomeIfMarket(ev.args.toString());
        console.log("---");
      });
    } catch (err) {
      console.error(`❌ Error fetching logs [${fromBlock} → ${toBlock}]:`, err.message);
    }

    fromBlock = toBlock + 1;
  }

  console.log("✅ Finished fetching past events!");
}

async function watchNewEvents() {
  contract.on("MarketClosed", (id, event) => {
    console.log("📢 New MarketClosed event detected!");
    console.log("Block:", event.blockNumber);
    console.log("Market ID:", id.toString());
    console.log("Tx Hash:", event.transactionHash);
    proposeOutcomeIfMarket(id.toString());
    console.log("---");
  });
}

async function main() {
//   await fetchPastEvents(9117898); // 👈 start from block 9115859
  await watchNewEvents();
}

main().catch((err) => console.error("💥 Script failed:", err));
