import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

app.post("/api/incidents", (req, res) => {
    const {description, serviceName,  environment}  = req.body;

    if(!description) return res.status(400).json({ error: "Description is required" });

    const analysis = {
        severity: "P2",
        possibleCauses: [
            "Database connection pool exhaustion",
            "Increased request latency from downstream service"
        ],
        nextSteps: [
            "Check DB connection metrics",
            "Review recent deployments"
        ],
        confidence: 0.72
    }

    res.json({
        incident: {
            description,
            serviceName,
            environment,
            createdAt: new Date().toISOString()
        },
        analysis
    })
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})