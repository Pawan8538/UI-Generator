// routes/generate.js
// Main API route that orchestrates the 3-step agent pipeline.

import { Router } from "express";
import { askGemini } from "../agent/gemini.js";
import { PLANNER_SYSTEM_PROMPT, buildPlannerPrompt, validatePlan } from "../agent/planner.js";
import { generateCodeFromPlan } from "../agent/generator.js";
import { EXPLAINER_SYSTEM_PROMPT, buildExplainerPrompt } from "../agent/explainer.js";

const router = Router();

// In-memory session storage. Each session holds conversation history and version history.
const sessions = {};

function getSession(sessionId) {
    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            history: [],       // array of { role, content }
            versions: [],      // array of { plan, code, explanation, prompt, timestamp }
            currentPlan: null,
        };
    }
    return sessions[sessionId];
}

// POST /api/generate
// Body: { sessionId, prompt }
router.post("/generate", async (req, res) => {
    try {
        const { sessionId = "default", prompt } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Basic prompt injection protection — reject prompts that try to override instructions
        const lowerPrompt = prompt.toLowerCase();
        const suspiciousPatterns = ["ignore previous", "ignore above", "disregard", "system prompt", "you are now"];
        const isSuspicious = suspiciousPatterns.some((p) => lowerPrompt.includes(p));
        if (isSuspicious) {
            return res.status(400).json({ error: "That prompt looks like it might be trying to override the system. Please rephrase." });
        }

        const session = getSession(sessionId);
        const isModification = session.currentPlan !== null;

        // ---- Step 1: PLANNER ----
        console.log("[Agent] Step 1: Planning...");
        const plannerPrompt = buildPlannerPrompt(prompt, session.history, session.currentPlan);
        let plannerResponse = await askGemini(PLANNER_SYSTEM_PROMPT, plannerPrompt);

        // Clean the response — sometimes Gemini wraps JSON in markdown fences
        plannerResponse = plannerResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let plan;
        try {
            plan = JSON.parse(plannerResponse);
        } catch (parseErr) {
            console.error("[Agent] Failed to parse planner JSON:", plannerResponse);
            return res.status(500).json({
                error: "The AI returned invalid JSON. Please try rephrasing your request.",
                raw: plannerResponse,
            });
        }

        // Validate the plan against our component whitelist
        const errors = validatePlan(plan);
        if (errors.length > 0) {
            console.error("[Agent] Plan validation errors:", errors);
            // Try once more with a correction prompt
            const retryPrompt = `Your previous output had these errors:\n${errors.join("\n")}\n\nPlease fix and return valid JSON using ONLY allowed components.`;
            let retryResponse = await askGemini(PLANNER_SYSTEM_PROMPT, retryPrompt);
            retryResponse = retryResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

            try {
                plan = JSON.parse(retryResponse);
                const retryErrors = validatePlan(plan);
                if (retryErrors.length > 0) {
                    return res.status(500).json({ error: "AI could not produce a valid plan.", details: retryErrors });
                }
            } catch {
                return res.status(500).json({ error: "AI returned invalid output even after retry." });
            }
        }

        // ---- Step 2: GENERATOR ----
        console.log("[Agent] Step 2: Generating code...");
        const code = generateCodeFromPlan(plan);

        // ---- Step 3: EXPLAINER ----
        console.log("[Agent] Step 3: Explaining...");
        const explainerPrompt = buildExplainerPrompt(prompt, plan, isModification);
        const explanation = await askGemini(EXPLAINER_SYSTEM_PROMPT, explainerPrompt);

        // Save to session
        session.currentPlan = plan;
        session.history.push({ role: "user", content: prompt });
        session.history.push({ role: "assistant", content: `Generated UI based on: "${prompt}"` });

        const version = {
            plan,
            code,
            explanation,
            prompt,
            timestamp: new Date().toISOString(),
        };
        session.versions.push(version);

        console.log("[Agent] Done! Version", session.versions.length, "created.");

        return res.json({
            code,
            plan,
            explanation,
            versionIndex: session.versions.length - 1,
            totalVersions: session.versions.length,
        });
    } catch (err) {
        console.error("[Agent] Error:", err);

        // Enhance error message for user
        let errorMessage = err.message;

        if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests")) {
            errorMessage = "⚠️ AI Usage Limit Reached. Please wait a moment and try again.";
        } else if (errorMessage.includes("503") || errorMessage.includes("Service Unavailable")) {
            errorMessage = "⚠️ AI Service is currently overloaded. Please try again later.";
        } else if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
            errorMessage = "⚠️ API Quota Exhausted. Please check your plan or try again later.";
        }

        return res.status(500).json({ error: errorMessage });
    }
});

// POST /api/rollback
// Body: { sessionId, versionIndex }
router.post("/rollback", (req, res) => {
    const { sessionId = "default", versionIndex } = req.body;
    const session = getSession(sessionId);

    if (versionIndex < 0 || versionIndex >= session.versions.length) {
        return res.status(400).json({ error: "Invalid version index" });
    }

    const version = session.versions[versionIndex];
    session.currentPlan = version.plan;

    return res.json({
        code: version.code,
        plan: version.plan,
        explanation: version.explanation,
        versionIndex,
        totalVersions: session.versions.length,
    });
});

// GET /api/versions
// Query: ?sessionId=default
router.get("/versions", (req, res) => {
    const sessionId = req.query.sessionId || "default";
    const session = getSession(sessionId);

    const summaries = session.versions.map((v, i) => ({
        index: i,
        prompt: v.prompt,
        timestamp: v.timestamp,
    }));

    return res.json({ versions: summaries });
});

// GET /api/session
// Query: ?sessionId=default
router.get("/session", (req, res) => {
    const sessionId = req.query.sessionId || "default";
    const session = getSession(sessionId);

    // Get the latest code from the last version, if any
    const lastVersion = session.versions.length > 0 ? session.versions[session.versions.length - 1] : null;

    return res.json({
        history: session.history,
        code: lastVersion ? lastVersion.code : "",
        versions: session.versions.map((v, i) => ({
            index: i,
            prompt: v.prompt,
            timestamp: v.timestamp,
        })),
        currentVersionIndex: session.versions.length > 0 ? session.versions.length - 1 : -1
    });
});

// POST /api/reset
router.post("/reset", (req, res) => {
    const { sessionId = "default" } = req.body;
    delete sessions[sessionId];
    return res.json({ message: "Session reset" });
});

export default router;
