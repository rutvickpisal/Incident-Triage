import express from "express";
import cors from "cors";
import { analyzeIncident } from "./services/aiService.js";
import { parseAIResponse } from "./utils/parseAIResponse.js";
import prisma from "./lib/prisma.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

app.post("/api/incidents", async (req, res) => {
  const {description, serviceName,  environment}  = req.body;

  if(!description) return res.status(400).json({ error: "Description is required" });

  let analysis;
  let aiStatus = "success";

  try {
      const aiResponse = await analyzeIncident(description);
      console.log("AI Response:", aiResponse);
      const parsed = parseAIResponse(aiResponse);

      if (!parsed) {
          throw new Error("AI returned invalid JSON");
      }

      analysis = parsed;
  } catch (error) {
          aiStatus = "fallback";
          analysis = {
              severity: "P3",
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

      severity: analysis.severity,
      confidence: analysis.confidence,
      aiStatus,
      escalation,

      possibleCauses: analysis.possibleCauses,
      nextSteps: analysis.nextSteps
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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})