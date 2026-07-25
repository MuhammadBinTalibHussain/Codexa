const { GoogleGenAI } = require("@google/genai");

// Thrown for any AI-analysis failure (missing key, bad input, malformed AI
// response, etc). The controller maps `status` to an HTTP status code and
// never stores a report when this is thrown, per the "no partial or
// malformed reports are stored" requirement.
class AIAnalysisError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.name = "AIAnalysisError";
    this.status = status;
  }
}

let client = null;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIAnalysisError("AI analysis is not configured on the server (missing GEMINI_API_KEY)", 500);
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

const MAX_CODE_LENGTH = 12000; // guard against oversized payloads / runaway token cost
// Using the "-latest" alias instead of a pinned version (e.g. "gemini-2.5-flash")
// so this keeps working automatically as Google retires older model versions —
// Google points this alias at their current recommended Flash model.
const MODEL = "gemini-flash-latest";

const SYSTEM_PROMPT = `You are a senior software engineer acting as an automated code quality analyzer.

You will be given a code snippet and its language. Analyze it and respond with ONLY a single JSON object (no markdown fences, no prose before or after) matching exactly this shape:

{
  "readability": <integer 0-100>,
  "maintainability": <integer 0-100>,
  "performance": <integer 0-100>,
  "overall": <integer 0-100, a weighted composite of the other three>,
  "suggestions": [<3 to 6 short, specific, actionable strings>]
}

Scoring guidance:
- readability: clarity of naming, structure, and comments.
- maintainability: how easy the code is to modify or extend safely.
- performance: efficiency of the logic and avoidance of costly patterns.
- overall: your weighted judgment across the three dimensions above.

Edge cases:
- If the input is empty, not actual source code, or is unintelligible/binary-looking text, do NOT invent plausible-sounding scores. Instead return "overall": 0 for all four scores and a single suggestions entry explaining that no valid code could be analyzed.
- Never include any text outside the JSON object.`;

// Crude heuristic to catch obviously binary content before spending an API
// call on it: null bytes, or a high ratio of non-printable characters.
const looksBinary = (code) => {
  if (code.includes("\u0000")) return true;
  const nonPrintable = code.replace(/[\t\n\r\x20-\x7E]/g, "");
  return code.length > 0 && nonPrintable.length / code.length > 0.3;
};

const clampScore = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const validateAndNormalize = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    throw new AIAnalysisError("AI response was not a valid JSON object", 502);
  }

  const { readability, maintainability, performance, overall, suggestions } = parsed;
  const scoreFields = { readability, maintainability, performance, overall };

  for (const [key, value] of Object.entries(scoreFields)) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new AIAnalysisError(`AI response is missing a valid "${key}" score`, 502);
    }
  }

  if (!Array.isArray(suggestions) || suggestions.some((s) => typeof s !== "string")) {
    throw new AIAnalysisError("AI response is missing a valid suggestions list", 502);
  }

  const cleanSuggestions = suggestions.map((s) => s.trim()).filter(Boolean);

  return {
    readability: clampScore(readability),
    maintainability: clampScore(maintainability),
    performance: clampScore(performance),
    overall: clampScore(overall),
    suggestions: cleanSuggestions.length > 0 ? cleanSuggestions.slice(0, 6) : ["No major issues detected"],
  };
};

// Calls the Gemini API to analyze a snippet's code and returns a validated,
// normalized analysis object ready to be stored as an AIReport.
// Throws AIAnalysisError for empty/binary input or any failure to get a
// valid, schema-conforming response from the model.
const generateAnalysis = async (snippet) => {
  const code = (snippet.code || "").toString();
  const trimmed = code.trim();

  if (!trimmed) {
    throw new AIAnalysisError("Cannot analyze an empty snippet");
  }
  if (looksBinary(code)) {
    throw new AIAnalysisError("This snippet looks like binary content and cannot be analyzed");
  }

  const truncatedCode = code.length > MAX_CODE_LENGTH
    ? `${code.slice(0, MAX_CODE_LENGTH)}\n/* ...truncated for analysis... */`
    : code;

  const ai = getClient();

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: `Language: ${snippet.language || "unknown"}\n\nAnalyze this code snippet:\n\n${truncatedCode}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });
  } catch (err) {
    throw new AIAnalysisError(`AI service request failed: ${err.message}`, 502);
  }

  const raw = response?.text;
  if (!raw) {
    throw new AIAnalysisError("AI service returned an empty response", 502);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AIAnalysisError("AI response could not be parsed as JSON", 502);
  }

  return validateAndNormalize(parsed);
};

module.exports = { generateAnalysis, AIAnalysisError };