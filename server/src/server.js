// server.js
// Main entry point for the backend.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoutes from "./routes/generate.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main routes
app.use("/api", generateRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
