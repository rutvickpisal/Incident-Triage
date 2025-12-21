// import fetch from "node-fetch";

// const HF_EMBEDDING_URL = "https://router.huggingface.co/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

// export async function embedText(text) {
//   const res = await fetch(HF_EMBEDDING_URL, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.HF_API_KEY}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       inputs: ["Some hardcoded problem"]
//     })
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     console.error("HF EMBEDDING ERROR:", res.status, err);
//     throw new Error(`Embedding failed: ${err}`);
//   }

//   const vector = await res.json();
//   return vector[0];
// }

import { pipeline } from "@xenova/transformers";

let embedder;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

export async function embedText(text) {
  const model = await getEmbedder();

  const output = await model(text, {
    pooling: "mean",
    normalize: true
  });

  // output.data is a Float32Array
  return Array.from(output.data);
}