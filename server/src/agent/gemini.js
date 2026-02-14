// gemini.js
// Wrapper around the Google Generative AI SDK.
// Keeps the API setup in one place.

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We use gemini-1.5-flash — it's fast, cheap, and good enough for structured output.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function askGemini(systemPrompt, userPrompt) {
    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "System instruction: " + systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I will follow these instructions." }],
                },
            ],
        });

        const result = await chat.sendMessage(userPrompt);
        const text = result.response.text();
        return text;
    } catch (err) {
        console.error("Gemini API error:", err.message);
        throw new Error("Failed to get response from Gemini: " + err.message);
    }
}

export { askGemini };
