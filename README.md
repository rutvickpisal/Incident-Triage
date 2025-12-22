An AI-powered backend system that assists engineering teams in triaging production incidents by analyzing incident descriptions, retrieving similar historical incidents, and generating structured, confidence-aware recommendations.

In real production systems:

Incidents arrive incomplete and under pressure

Engineers waste time re-diagnosing known failure patterns

LLMs alone cannot provide a reliable solution without context

This system:

Grounds AI responses using historical incident data (RAG)

Enforces risk boundaries for critical incidents

Is designed as a deployable backend service, not a chat UI

Key Features

🚨 Incident logging with environment & service metadata

🧠 AI-driven incident analysis (severity, causes, next steps)

📚 Retrieval-Augmented Generation (RAG) using vector embeddings

📉 Confidence-aware responses (not blind AI output)

🛑 Human-review boundaries for high-severity incidents

⚙️ Production-ready backend with CI/CD

🌐 Deployed frontend + backend

Architecture Overview
User / UI
   │
   ▼
Express API
   │
   ├─ Incident DB (SQLite via Prisma)
   │
   ├─ Embedding Service
   │     └─ Vector similarity search (historical incidents)
   │
   └─ LLM (Groq)
         └─ Structured JSON response

Flow:

New incident arrives

Incident text → embedding vector

Vector similarity search against past incidents

Retrieved descriptions + resolutions injected into prompt

LLM generates structured JSON

Confidence adjusted based on context quality

Tech Stack
Backend

Node.js + Express

Prisma ORM

SQLite (dev-friendly, production swappable)

Groq LLM API

HuggingFace embeddings (local inference router)

Frontend

React

Deployed on Vercel

DevOps

GitHub Actions (CI)

Render (Backend hosting)

Vercel (Frontend hosting)

CI/CD Pipeline
Backend CI

Dependency install

Linting

Test execution

Environment validation

CD

Merge to main → automatic deployment

Failed CI blocks deployment

This ensures:

No broken code reaches production.

Environment Variables

Backend requires:

DATABASE_URL
GROQ_API_KEY
HF_API_KEY


Startup fails fast if any are missing.

Example Response
{
  "severity": "P0",
  "possibleCauses": [
    "Incompatible library version",
    "Incorrect production config"
  ],
  "nextSteps": [
    "Rollback to last stable release",
    "Audit recent dependency changes"
  ],
  "confidence": 0.91
}
