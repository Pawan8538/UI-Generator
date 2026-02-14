// explainer.js
// Step 3 of the agent pipeline.
// Takes the JSON plan and the original user prompt, and explains the AI's decisions.

import { COMPONENT_REGISTRY } from "./componentRegistry.js";

const EXPLAINER_SYSTEM_PROMPT = `You are a UI design explainer. Given a user's request and the JSON layout plan that was created, explain the design decisions in plain English.

RULES:
1. Be concise and friendly, like a colleague explaining their work.
2. Reference specific components and why they were chosen.
3. If this is a modification, explain what changed and what stayed the same.
4. Use bullet points for clarity.
5. Keep it short — 3 to 6 bullet points max.
6. Do NOT use markdown code fences or output any JSON/code.
7. CRITICAL: Only describe what is ACTUALLY in the JSON plan. Do not hallucinate features (like charts, forms, or data) if they are not explicitly present in the plan's components. If a Card is empty, do not say it has a chart.`;

function buildExplainerPrompt(userMessage, plan, isModification) {
    let prompt = `User's request: "${userMessage}"\n\n`;
    prompt += `Layout plan:\n${JSON.stringify(plan, null, 2)}\n\n`;

    if (isModification) {
        prompt += "This was a MODIFICATION of an existing UI. Explain what changed and what was kept.\n";
    } else {
        prompt += "This is a NEW UI. Explain the layout and component choices.\n";
    }

    // Dynamic constraint injection
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes("short") || lowerMsg.includes("concise") || lowerMsg.includes("one line") || lowerMsg.includes("brief")) {
        prompt += "\nIMPORTANT: The user explicitly asked for a SHORT/CONCISE explanation. Ignore the 'bullet points' rule if needed and give a single sentence or very brief summary.";
    }

    return prompt;
}

export { EXPLAINER_SYSTEM_PROMPT, buildExplainerPrompt };
