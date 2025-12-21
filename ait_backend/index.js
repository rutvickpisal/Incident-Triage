import express from "express";
import cors from "cors";
import { analyzeIncident } from "./services/aiService.js";
import { parseAIResponse } from "./utils/parseAIResponse.js";
import prisma from "./lib/prisma.js";
import { embedText } from "./services/embeddings.js";
import { findSimilarIncidents } from "./services/similarity.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

app.post("/api/incidents", async (req, res) => {
  const {description, serviceName,  environment}  = req.body;

  if(!description || !serviceName || !environment) return res.status(400).json({ error: "Description, service name, and environment are required" });

  let analysis;
  let aiStatus = "success";
  let queryEmbedding;

  try {
      queryEmbedding = await embedText(description);
      const similarIncidents = await findSimilarIncidents(queryEmbedding);
      const context = similarIncidents.map((i, idx) => `
        ${idx + 1}.
        Description: ${i.description}
        Severity: ${i.severity}
        Possible Causes: ${i.possibleCauses.join(", ")}
        Next Steps: ${i.nextSteps.join(", ")}
        AI Summary: ${i.AISummary}
      `).join("\n");

      const aiResponse = await analyzeIncident(description, context);
      const parsed = parseAIResponse(aiResponse);

      if (!parsed) {
          throw new Error("AI returned invalid JSON");
      }

      analysis = parsed;
  } catch (error) {
          aiStatus = "fallback";
          analysis = {
              severity: "unable to determine",
              possibleCauses: ["Unable to determine automatically"],
              nextSteps: ["Manual investigation required"],
              confidence: 0.0
          };
  }

  const escalation =
  analysis.confidence < 0.7
    ? "REQUIRES_HUMAN_REVIEW"
    : "AUTO_TRIAGED";

  const savedIncident = await prisma.incident.create({
    data: {
      description,
      serviceName,
      environment,
      embedding: queryEmbedding,

      severity: analysis.severity,
      confidence: analysis.confidence,
      aiStatus,
      escalation,

      possibleCauses: analysis.possibleCauses,
      nextSteps: analysis.nextSteps,
      AISummary: analysis.AISummary
    }
  });

  res.json({incident: savedIncident});
})

app.get("/incidents", async (req, res) => {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.json(incidents);
});


app.delete("/incidents", async (req, res) => {
  try {
    const deleted = await prisma.incident.deleteMany({});
    res.json({ deletedCount: deleted.count });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete incidents" });
  }
});

app.get("/embed", async (req, res) => {
  try{
    const embedding = await embedText("Spike in 500 errors after deploy");
    res.json({ embedding });

  }catch(err){
    console.error("EMBEDDING ERROR:", err);
    res.status(500).json({ error: "Embedding failed" });
  }
})



const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})