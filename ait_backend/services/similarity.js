import prisma from "../lib/prisma.js";

export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}
// queryEmbedding is a vector
export async function findSimilarIncidents(queryEmbedding) {
  console.log("FINDING SIMILAR INCIDENTS");
  const incidents = await prisma.incident.findMany({
    where: { embedding: { not: null } },
    take: 50
  });
  console.log("FOUND INCIDENTS FOR SIMILARITY:", incidents.length);
  const scored = incidents.map(i => ({
    incident: i,
    score: cosineSimilarity(queryEmbedding, i.embedding)
  }));
  console.log("SCORED INCIDENTS:", scored);
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.incident);
}
