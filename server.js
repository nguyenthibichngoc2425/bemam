import express from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildChatInstruction, calculateExpression, classifyTask, normalizeAge, validatePracticeQuestions } from "./ai-core.js";
import { retrieveKnowledge } from "./knowledge.js";

function loadEnvFile() {
  try {
    const file = readFileSync(new URL("./.env", import.meta.url), "utf8");
    for (const line of file.split(/\r?\n/u)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/u);
      if (!match || match[1] in process.env) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/gu, "");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

loadEnvFile();

const app = express();
const port = Number(process.env.PORT || 3000);
const aiProvider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b";
const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const openaiBaseUrl = process.env.OPENAI_BASE_URL || "http://127.0.0.1:1234/v1";
const openaiModel = process.env.OPENAI_MODEL || "qwen2.5-7b-instruct";
const openaiApiKey = process.env.OPENAI_API_KEY || "";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "40kb" }));
app.use((req, res, next) => {
  if (allowedOrigin) res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(__dirname));app.get("/api/health", (req, res) => {
  const modelName = aiProvider === "gemini" ? geminiModel : aiProvider === "ollama" ? ollamaModel : openaiModel;
  res.json({ ok: true, provider: aiProvider, model: modelName });
});

function requireText(value, max, field) { if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`${field} khÃ´ng há»£p lá»‡.`); return value.trim(); }
function safeError(res, message = "Máº§m chÆ°a thá»ƒ tráº£ lá»i lÃºc nÃ y.") { return res.status(502).json({ error: message }); }

async function ollama(prompt, signal) {
  const response = await fetch(`${ollamaUrl}/api/chat`, { method: "POST", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: ollamaModel, stream: false, messages: [{ role: "system", content: prompt }] }) });
  if (!response.ok) throw new Error("Ollama khÃ´ng pháº£n há»“i.");
  const data = await response.json();
  if (!data.message?.content) throw new Error("Ollama tráº£ vá» dá»¯ liá»‡u khÃ´ng há»£p lá»‡.");
  return data.message.content.trim();
}

async function openAiCompatible(prompt, signal) {
  const headers = { "Content-Type": "application/json" };
  if (openaiApiKey) headers.Authorization = `Bearer ${openaiApiKey}`;
  const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
    method: "POST",
    signal,
    headers,
    body: JSON.stringify({ model: openaiModel, messages: [{ role: "system", content: prompt }], temperature: 0.2 })
  });
  if (!response.ok) throw new Error("Dá»‹ch vá»¥ OpenAI-compatible khÃ´ng pháº£n há»“i.");
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("OpenAI-compatible tráº£ vá» dá»¯ liá»‡u khÃ´ng há»£p lá»‡.");
  return content.trim();
}

async function gemini(prompt, signal, jsonMode = false) {
  if (!geminiApiKey) throw new Error("Thiáº¿u GEMINI_API_KEY trong file .env.");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, ...(jsonMode ? { responseMimeType: "application/json" } : {}) }
    })
  });
  const responseText = await response.text();
  let data;
  try { data = JSON.parse(responseText); } catch { data = null; }
  if (!response.ok) {
    const providerMessage = data?.error?.message || `HTTP ${response.status}`;
    console.error(`[gemini] ${response.status}: ${providerMessage}`);
    throw new Error(`Gemini provider error (${response.status}).`);
  }
  const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!content) throw new Error("Gemini tráº£ vá» dá»¯ liá»‡u khÃ´ng há»£p lá»‡.");
  return content;
}

async function runModel(prompt, signal, options = {}) {
  if (aiProvider === "gemini") return gemini(prompt, signal, options.jsonMode === true);
  if (aiProvider === "openai-compatible") return openAiCompatible(prompt, signal);
  if (aiProvider !== "ollama") throw new Error("AI_PROVIDER khÃ´ng há»£p lá»‡. Há»— trá»£: gemini, ollama, openai-compatible.");
  return ollama(prompt, signal);
}

app.post("/api/chat", async (req, res) => {
  try {
    const age = normalizeAge(req.body.age);
    if (!Array.isArray(req.body.messages) || req.body.messages.length > 12) return res.status(400).json({ error: "Lá»‹ch sá»­ há»™i thoáº¡i quÃ¡ dÃ i." });
    const messages = req.body.messages.map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: requireText(item.content, 500, "Tin nháº¯n") }));
    if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "CÃ¢u há»i chÆ°a há»£p lá»‡." });
    const classification = classifyTask(messages[messages.length - 1].content);
    const calculation = classification.needsTool ? calculateExpression(messages[messages.length - 1].content) : null;
    const evidence = retrieveKnowledge(messages[messages.length - 1].content);
    const toolContext = calculation?.valid ? `\nKáº¿t quáº£ cÃ´ng cá»¥ xÃ¡c Ä‘á»‹nh: ${calculation.first} ${calculation.operator} ${calculation.second} = ${calculation.result}.` : "";
    const evidenceContext = evidence.length ? `\nTÃ i liá»‡u cÃ³ thá»ƒ liÃªn quan (chá»‰ dÃ¹ng khi thá»±c sá»± há»— trá»£ cÃ¢u há»i):\n${evidence.map((item) => `[${item.id}] ${item.text}`).join("\n")}` : "\nKhÃ´ng tÃ¬m tháº¥y tÃ i liá»‡u phÃ¹ há»£p; khÃ´ng Ä‘Æ°á»£c bá»‹a nguá»“n.";
    return res.json({ message: await runModel(`${buildChatInstruction(age, messages, classification)}${toolContext}${evidenceContext}`, AbortSignal.timeout(30000)), classification, verification: calculation || null, evidence, provider: aiProvider });
  } catch (error) {
    console.error("[chat]", error);
    return safeError(res, "Mầm chưa thể trả lời lúc này. Hãy thử lại sau ít giây.");
  }
});

app.post("/api/tutor", async (req, res) => {
  try {
    const problem = requireText(req.body.problem, 2000, "Äá» bÃ i");
    const age = normalizeAge(req.body.age);
    const classification = classifyTask(problem);
    const calculation = calculateExpression(problem);
    const evidence = retrieveKnowledge(problem);
    const toolContext = calculation?.valid ? `Káº¿t quáº£ tÃ­nh toÃ¡n xÃ¡c Ä‘á»‹nh Ä‘á»ƒ kiá»ƒm tra: ${calculation.result}.` : "";
    const evidenceContext = evidence.length ? `TÃ i liá»‡u tham kháº£o:\n${evidence.map((item) => `[${item.id}] ${item.text}`).join("\n")}` : "KhÃ´ng cÃ³ tÃ i liá»‡u tham kháº£o phÃ¹ há»£p.";
    const prompt = `Báº¡n lÃ  gia sÆ° Máº§m AI cho há»c sinh ${age} tuá»•i. ${toolContext} ${evidenceContext} Vá»›i Ä‘á» bÃ i dÆ°á»›i Ä‘Ã¢y, hÃ£y tráº£ lá»i báº±ng tiáº¿ng Viá»‡t theo Ä‘Ãºng 5 má»¥c: Chá»§ Ä‘á» vÃ  Ä‘iá»u khÃ³; Kiáº¿n thá»©c ná»n táº£ng; CÃ¡c bÆ°á»›c nhá»; Má»™t cÃ¢u há»i gá»£i Ã½ Ä‘á»ƒ em tá»± lÃ m; ÄÃ¡p Ã¡n vÃ  cÃ¡ch kiá»ƒm tra. LiÃªn há»‡ trá»±c tiáº¿p vá»›i Ä‘á» bÃ i, nÃªu giáº£ Ä‘á»‹nh náº¿u thiáº¿u dá»¯ kiá»‡n, khÃ´ng nÃ³i chung chung. PhÃ¢n loáº¡i: ${JSON.stringify(classification)}. Äá» bÃ i: ${problem}`;
    return res.json({ message: await runModel(prompt, AbortSignal.timeout(30000)), classification, verification: calculation || null, evidence, provider: aiProvider });
  } catch (error) {
    console.error("[tutor]", error);
    return safeError(res, "Mầm chưa thể gỡ rối lúc này. Hãy thử lại sau ít giây.");
  }
});

app.post("/api/practice", async (req, res) => {
  try {
    const topic = requireText(req.body.topic, 80, "Chá»§ Ä‘á»");
    const subject = requireText(req.body.subject, 40, "MÃ´n há»c");
    const difficulty = requireText(req.body.difficulty, 30, "Äá»™ khÃ³");
    const count = Math.min(8, Math.max(3, Number(req.body.count) || 5));
    const age = normalizeAge(req.body.age);
    const prompt = `Táº¡o Ä‘Ãºng ${count} cÃ¢u tráº¯c nghiá»‡m tiáº¿ng Viá»‡t cho há»c sinh ${age} tuá»•i, mÃ´n ${subject}, chá»§ Ä‘á» "${topic}", Ä‘á»™ khÃ³ "${difficulty}". Chá»‰ tráº£ vá» JSON há»£p lá»‡ dáº¡ng {"questions":[{"question":"...","options":["...","...","..."],"answer":0,"explanation":"...","difficulty":"...","skill":"..."}]}. answer lÃ  chá»‰ sá»‘ báº¯t Ä‘áº§u tá»« 0. Má»—i cÃ¢u cÃ³ Ä‘Ãºng má»™t Ä‘Ã¡p Ã¡n, lá»±a chá»n khÃ´ng trÃ¹ng, lá»i giáº£i ngáº¯n pháº£i khá»›p Ä‘Ã¡p Ã¡n. KhÃ´ng thÃªm markdown.`;
    const raw = await runModel(prompt, AbortSignal.timeout(90000), { jsonMode: true });
    const jsonText = raw.replace(/^```(?:json)?\s*|\s*```$/gi, "").trim();
    const start = jsonText.indexOf("{");
    const end = jsonText.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Gemini không trả về JSON hợp lệ.");
    const parsed = JSON.parse(jsonText.slice(start, end + 1));
    const validation = validatePracticeQuestions(parsed.questions, count);
    if (!validation.valid) throw new Error(`Dá»¯ liá»‡u bÃ i luyá»‡n táº­p khÃ´ng há»£p lá»‡: ${validation.errors.join(" ")}`);
    return res.json({ ...parsed, validation: { valid: true, errors: [] }, provider: aiProvider });
  } catch (error) {
    console.error("[practice]", error);
    return safeError(res, error.message.includes("hợp lệ") ? error.message : "Không tạo được bộ câu hỏi. Hãy thử lại.");
  }
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.listen(port, () => console.log(`Máº§m AI Ä‘ang cháº¡y táº¡i http://localhost:${port} vá»›i provider=${aiProvider}`));
