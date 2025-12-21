import prisma from "../lib/prisma.js";

export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}
// queryEmbedding is a vector
export async function findSimilarIncidents(queryEmbedding) {
  const incidents = await prisma.incident.findMany({
    where: { embedding: { not: null } },
    take: 50
  });
  const scored = incidents.map(i => ({
    incident: i,
    score: cosineSimilarity(queryEmbedding, i.embedding)
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.incident);
}
