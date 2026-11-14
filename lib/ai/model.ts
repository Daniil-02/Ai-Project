// Виклик мовної моделі (практична робота 6).
// Працює лише на сервері: ключ провайдера читається зі змінної без префікса NEXT_PUBLIC_,
// тому імпортуйте цей файл тільки із серверних дій ("use server") і серверного коду.
// Провайдер задає AI_PROVIDER у .env.local: "openrouter", "gemini" або "groq".
// Під час тестів (npm test) провайдер не викликається: відповідь підставляє tests/helpers/model.ts.
// Файл нічого не пише в журнали: ні ключ, ні текст запиту.

import { AI_FAULT_MODE, type AiFaultMode } from "./fault-mode";

export type ModelRequest = {
  system: string; // інструкція застосунку: що модель має зробити
  user: string; // дані для моделі; текст користувача — тільки тут, не в system
  jsonSchema?: object; // схема відповіді (JSON Schema); без неї модель відповідає довільним текстом
  timeoutMs?: number; // таймаут у мілісекундах; без нього запит чекає, скільки дозволить платформа
};

export type ModelReply = { text: string; provider: string; model: string };

export class ModelNotConfiguredError extends Error {
  constructor() {
    super("Ключ провайдера моделі не задано");
    this.name = "ModelNotConfiguredError";
  }
}

export class ModelUnavailableError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ModelUnavailableError";
    this.status = status;
  }
}

export class ModelTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super("Модель не відповіла за " + timeoutMs + " мс");
    this.name = "ModelTimeoutError";
  }
}

type Provider = "openrouter" | "gemini" | "groq";

function provider(): Provider {
  if (process.env.AI_PROVIDER === "openrouter") return "openrouter";
  if (process.env.AI_PROVIDER === "groq") return "groq";
  if (process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) return "openrouter";
  return "gemini";
}

function apiKey(): string | undefined {
  const p = provider();
  const key =
    p === "openrouter"
      ? process.env.OPENROUTER_API_KEY
      : p === "groq"
        ? process.env.GROQ_API_KEY
        : process.env.GEMINI_API_KEY;
  return key && key.trim() ? key.trim() : undefined;
}

function modelName(): string {
  const p = provider();
  if (p === "openrouter") return process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  if (p === "groq") return process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  return process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
}

export function modelConfigured(): boolean {
  if (process.env.VITEST) return testModel !== undefined;
  return apiKey() !== undefined;
}

type TestModel = (request: ModelRequest) => Promise<string>;
let testModel: TestModel | undefined;

export function setTestModel(model: TestModel | undefined): void {
  testModel = model;
}

export async function askModel(request: ModelRequest): Promise<ModelReply> {
  if (process.env.VITEST) {
    if (!testModel) throw new ModelNotConfiguredError();
    return { text: await testModel(request), provider: "test", model: "test" };
  }
  const key = apiKey();
  if (!key) throw new ModelNotConfiguredError();

  const mode: AiFaultMode = AI_FAULT_MODE;
  const signal = request.timeoutMs ? AbortSignal.timeout(request.timeoutMs) : undefined;
  try {
    if (mode === "down") throw new ModelUnavailableError(503, "Провайдер недоступний (режим збою down)");
    if (mode === "invalid") {
      return { text: "Вибачте, я не можу виконати це завдання.", provider: provider(), model: modelName() };
    }
    if (mode === "slow") await wait(60_000, signal);

    const p = provider();
    const text =
      p === "openrouter"
        ? await callOpenRouter(key, request, signal)
        : p === "groq"
          ? await callGroq(key, request, signal)
          : await callGemini(key, request, signal);
    return { text, provider: p, model: modelName() };
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new ModelTimeoutError(request.timeoutMs ?? 0);
    }
    if (error instanceof ModelUnavailableError) throw error;
    throw new ModelUnavailableError(0, "Немає з'єднання з провайдером моделі");
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

async function readError(response: Response): Promise<ModelUnavailableError> {
  let detail = "";
  try {
    const body = await response.json();
    detail = String(body?.error?.message ?? "").slice(0, 200);
  } catch {
    detail = "";
  }
  return new ModelUnavailableError(response.status, "Провайдер відповів " + response.status + (detail ? ": " + detail : ""));
}

async function callOpenRouter(key: string, request: ModelRequest, signal?: AbortSignal): Promise<string> {
  const body: Record<string, unknown> = {
    model: modelName(),
    messages: [
      { role: "system", content: request.system },
      { role: "user", content: request.user },
    ],
  };
  if (request.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "reply", strict: false, schema: request.jsonSchema },
    };
  }
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + key,
      "HTTP-Referer": "https://shadow-vanguard.vercel.app",
      "X-Title": "Shadow Vanguard",
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw await readError(response);
  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content ?? "");
}

async function callGemini(key: string, request: ModelRequest, signal?: AbortSignal): Promise<string> {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName() + ":generateContent";
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: request.system }] },
    contents: [{ role: "user", parts: [{ text: request.user }] }],
  };
  if (request.jsonSchema) {
    body.generationConfig = { responseMimeType: "application/json", responseJsonSchema: request.jsonSchema };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw await readError(response);
  const data = await response.json();
  const parts: Array<{ text?: string }> = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("");
}

async function callGroq(key: string, request: ModelRequest, signal?: AbortSignal): Promise<string> {
  const body: Record<string, unknown> = {
    model: modelName(),
    messages: [
      { role: "system", content: request.system },
      { role: "user", content: request.user },
    ],
  };
  if (request.jsonSchema) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "reply", strict: false, schema: request.jsonSchema },
    };
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw await readError(response);
  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content ?? "");
}
