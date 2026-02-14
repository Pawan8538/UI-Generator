// planner.js
// Step 1 of the agent pipeline.
// Takes user intent and outputs a structured JSON plan using ONLY allowed components.

import { getComponentSummaryForPrompt, ALLOWED_COMPONENTS } from "./componentRegistry.js";

const PLANNER_SYSTEM_PROMPT = `You are a UI layout planner. Your job is to take a user's description of a UI and produce a structured JSON plan.

CRITICAL RULES:
1. You can ONLY use components from the list below. No exceptions.
2. You must NOT invent new components.
3. You must NOT add any CSS, styles, or Tailwind classes.
4. You must NOT use HTML tags directly.
5. Your output must be ONLY valid JSON, nothing else. No markdown fences, no explanations.

STRICT MODE (STATELSS ONLY):
- This is a STATIC UI generator. You cannot generate state, logic, event handlers, or interactivity.
- If the user asks for "auto-slide", "timers", "animations", "forms that submit", or "API calls", you MUST politely refuse that specific part of the request in your explanation, and fallback to a static version.
- Do NOT try to fake it with buttons that don't work.
- You can only use the \`onClick\` prop for descriptions, it will not actually execute code.
- If the user asks for a component that is NOT in the list (like "Carousel", "Slider", "DatePicker"), you MUST politely REFUSE that part and explain that the component does not exist. Do NOT try to build it with other components unless the user explicitly asks for a custom build.
- If the user asks for a "Carousel", say "NO" and explain that it is not available.

${getComponentSummaryForPrompt()}

OUTPUT FORMAT:
Return a JSON object with this shape:
{
  "layout": {
    "type": "ComponentName",
    "props": { ... },
    "children": [ ... ]   // array of nested component objects, or a string for text content
  }
}

Each child in the "children" array is either:
- A string (for text content passed as children)
- Another component object with "type", "props", and optionally "children"

EXAMPLES:
User: "A login form with email and password"
{
  "layout": {
    "type": "Container",
    "props": {},
    "children": [
      {
        "type": "Card",
        "props": { "title": "Login" },
        "children": [
          {
            "type": "Flex",
            "props": { "direction": "column", "gap": "md" },
            "children": [
              { "type": "Input", "props": { "label": "Email", "type": "email", "placeholder": "Enter your email" } },
              { "type": "Input", "props": { "label": "Password", "type": "password", "placeholder": "Enter your password" } },
              { "type": "Button", "props": { "children": "Sign In", "variant": "primary" } }
            ]
          }
        ]
      }
    ]
  }
}

Remember: output ONLY the JSON. No text before or after it.

DESIGN GUIDELINES:
- Avoid empty Cards. If you add a Card for "Analytics", actually put a Chart or a big Typography number inside it.
- If the user asks for "Dashboard", populate it with meaningful content (Charts, Stats, Tables), not just empty placeholders.
- Use 'Flex' and 'Grid' to create responsive layouts.

LAYOUT STANDARDS (FOLLOW THESE):
- **Dashboard**: Always start with 'Navbar', then 'Container'. Inside 'Container', use 'Typography' (h2) for title, then a 'Grid' (columns=3 or 2) for Cards/Charts.
- **Lists of Items**: ALWAYS use 'Grid' for collections of Cards. NEVER use 'Flex' for main content grids (it causes uneven widths).
- **Charts**: ALWAYS place Charts inside a 'Card'.
- **Equal Widths**: To get equal widths, you MUST use 'Grid'.

PRESERVATION RULES (FOR MODIFICATIONS):
1. DO NOT DELETE existing components unless the user explicitly asks to "remove", "delete", or "clear" them.
2. If the user adds a new feature (e.g., "Add charts"), APPEND it to the existing layout (e.g., add to the main Container). DO NOT replace the Navbar or other existing parts.
3. KEEP PREVIOUS DATA/PROPS: If a chart already exists, keep its data unless the user asks to change it.
4. STRICT COMPONENT USAGE: You must ONLY use components from the list. Do not invent "Header", "Footer", "Sidebar" (unless allowed), "Hero", etc. Use 'Flex', 'Typography', 'Card' to build them.`;

function buildPlannerPrompt(userMessage, conversationHistory, existingPlan) {
  let prompt = "";

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += "CONVERSATION HISTORY:\n";
    for (const msg of conversationHistory) {
      prompt += `${msg.role}: ${msg.content}\n`;
    }
    prompt += "\n";
  }

  if (existingPlan) {
    prompt += `CURRENT UI PLAN (modify this based on the new request, do NOT start from scratch unless the user asks for a completely new UI):\n${JSON.stringify(existingPlan, null, 2)}\n\n`;
    prompt += `USER'S MODIFICATION REQUEST: ${userMessage}\n`;
    prompt += `\nCRITICAL INSTRUCTION: You are MODIFYING an existing layout. 
    - PRESERVE the existing structure (Navbar, etc.) unless told to remove it.
    - If adding something, INSERT it into the appropriate place (e.g., inside the main Container).
    - Output the COMPLETE updated plan, including unchanged parts.`;
  } else {
    prompt += `USER'S UI REQUEST: ${userMessage}`;
  }

  return prompt;
}

function validatePlan(plan) {
  const errors = [];

  function walkNode(node, path) {
    if (typeof node === "string") return; // text node, that is fine

    if (!node || typeof node !== "object") {
      errors.push(`Invalid node at ${path}: expected object or string`);
      return;
    }

    if (!node.type) {
      errors.push(`Missing "type" at ${path}`);
      return;
    }

    if (!ALLOWED_COMPONENTS.includes(node.type)) {
      errors.push(`Component "${node.type}" at ${path} is NOT in the allowed list. Allowed: ${ALLOWED_COMPONENTS.join(", ")}`);
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child, i) => walkNode(child, `${path}.children[${i}]`));
    }
  }

  if (!plan || !plan.layout) {
    errors.push('Plan must have a "layout" key');
    return errors;
  }

  walkNode(plan.layout, "layout");
  return errors;
}

export { PLANNER_SYSTEM_PROMPT, buildPlannerPrompt, validatePlan };
