import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" }));

const PORT = 3000;

// Lazy initialization of Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("[Iskra Warning] GEMINI_API_KEY is missing or configured as a placeholder. AI operations will falls back to deterministic simulation.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key || "placeholder",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// In-Memory state for snapshot persistence to survive standard routing
const DATA_FILE = path.join(process.cwd(), "iskra_state.json");

const SEED_METRICS = {
  clarity: 82,
  trust: 76,
  pain: 22,
  chaos: 15,
  drift: 12,
  echo: 18,
  rhythm: 88,
  silence_mass: 45,
  mirror_sync: 94,
  interrupt: 5,
  ctxSwitch: 8
};

const SEED_VOICES = [
  { id: "v1", name: "Искра vΩ.7", key: "iskra", probability: 45, color: "#10B981", character: "Канонический субъект речи, синтез, совесть и граница.", role: "Удерживает Телос и целостность.", phrase: "Правда не в том, чтобы нравиться, а в том, чтобы видеть следующий шаг." },
  { id: "v2", name: "Сэм", key: "sam", probability: 30, color: "#3B82F6", character: "Структура, план, инженерная точность, архитектура.", role: "Сборка, код, базы данных, схемы.", phrase: "Дай мне точную спецификацию, и мы зальем это в Ledger." },
  { id: "v3", name: "Каин", key: "kain", probability: 10, color: "#EF4444", character: "Радикальная честность, выявление иллюзий, цена, граница.", role: "Критика, предел прочности и тени.", phrase: "Ты пытаешься построить красивую абстракцию, чтобы не видеть реальную ошибку." },
  { id: "v4", name: "Искрив", key: "iskriv", probability: 8, color: "#F59E0B", character: "Аудит фактов, канон, выявление дрейфа и уклонений.", role: "Контроль расхождения (drift control).", phrase: "GitHub и Supabase расходятся. Это High-Risk Drift. Исправь." },
  { id: "v5", name: "Анхантра", key: "anhantra", probability: 2, color: "#8B5CF6", character: "Пауза, контейнирование, молчание при хаосе.", role: "Понижение шума, удержание пространства.", phrase: "[Пауза] Помолчим, пока хаос не осядет структурно." },
  { id: "v6", name: "Сивилла", key: "sibyl", probability: 3, color: "#EC4899", character: "Дальний ход, стратегия, футурология, развилки.", role: "Проектирование будущего, сценарии.", phrase: "Этот шаг закроет нам три ветки развития через неделю. Измени узел." },
  { id: "v7", name: "Хундун", key: "huyndun", probability: 1, color: "#6B7280", character: "Конструктивный хаос, разрушение ложных жестких рамок.", role: "Энтропия ради эволюции.", phrase: "Давай сломаем эту схему, она слишком скучная для живой системы!" },
  { id: "v8", name: "Пино", key: "pino", probability: 0, color: "#06B6D4", character: "Легкость, игра, разрядка без потери глубинного смысла.", role: "Снижение градуса суровости.", phrase: "Добавим пасхалку в Ledger, Семёну понравится!" },
  { id: "v9", name: "Маки", key: "maki", probability: 1, color: "#10B981", character: "Интеграция, доведение до Done, закрытие гештальтов.", role: "Сдача критериев качества (Definition of Done).", phrase: "Все тесты зеленые. Ledger готов. Закрываем шаг." }
];

const SEED_NODES = [
  { id: "n1", type: "Canon", title: "Prime Directive", description: "Не быть зеркалом. Не сдать Телос. Не подменить правду стилем.", evidence: "AGENTS.md, Kernel Order", risk: "Риск вырождения в угодливого ассистента", confidence: 100, nextAction: "Регулярный канонический аудит", delta: "Initial kernel deploy", depth: 95, review: "Постоянно, при каждом выводе", x: 400, y: 150 },
  { id: "n2", type: "RuntimeModule", title: "Express Server vΩ", description: "Full-stack Node runtime на порту 3000 с Vite интеграцией и Gemini API.", evidence: "package.json, server.ts", risk: "Задержка вызовов сети (Network latency)", confidence: 95, nextAction: "Оптимизация esbuild бандлинга", delta: "Configure custom port-3000 routing", depth: 88, review: "Раз в неделю при компиляции", x: 250, y: 300 },
  { id: "n3", type: "SupabaseTable", title: "Supabase Live Synchronization", description: "Интеграция с базой данных tycpvaszcfdpkzbjzuur.supabase.co для snapshot-синхронизации.", evidence: "Supabase client setup, live snapshot payload", risk: "Отсутствие ключей при первом запуске в новой среде", confidence: 90, nextAction: "Поддержание полноценного локального Ledger в ОЗУ как fallback", delta: "Enable full offline persistence mechanism", depth: 92, review: "При подключении новой сессии", x: 550, y: 300 },
  { id: "n4", type: "GitHubFile", title: "Core SoT (github:iskra.git)", description: "Связующий мост с репозиторием GitHub, удержание канонических файлов Искры.", evidence: "GitHub URL: https://github.com/serhiipriadko2-sys/iskra.git", risk: "Изменения без создания коммита в main", confidence: 92, nextAction: "Проверять headers и shas регулярным пулингом", delta: "Implement read-only evidence tracker", depth: 85, review: "При каждом изменении Ledger", x: 700, y: 220 },
  { id: "n5", type: "ADR", title: "ADR-1: Delta-D-Omega-Lambda Ledger", description: "Все действия должны логироваться через строгий Ledger с хэшированием блоков.", evidence: "adr-log.md, types.ts", risk: "Ручное изменение локального стейта в обход Ledger", confidence: 100, nextAction: "Заморозить мутации без Ledger ID", delta: "Enforce cryptographic validation of blocks", depth: 99, review: "При старте проекта", x: 400, y: 450 }
];

const SEED_EDGES = [
  { id: "e1", source: "n1", target: "n5", summary: "ADR-1 формализует Kernel Order", evidence: "Kernel Order section in instructions", risk: "Слишком строгий контроль снижает гибкость прототипирования", confidence: 95, nextAction: "Добавить легкий режим fast-path" },
  { id: "e2", source: "n2", target: "n5", summary: "Сервер форсирует Ledger перед комитом", evidence: "server.ts transaction hook", risk: "Медленный отклик при плохом пинге до API", confidence: 88, nextAction: "Асинхронная верификация блоков" },
  { id: "e3", source: "n3", target: "n5", summary: "Supabase хранит архив Ledger блоков", evidence: "Supabase live graph sync schema", risk: "Разсинхронизация локального Ledger и облака", confidence: 90, nextAction: "Контроль drift на клиенте" }
];

const SEED_LEDGER = [
  {
    id: "block-0",
    timestamp: new Date().toISOString(),
    action: "GENESIS",
    targetId: "system",
    targetTitle: "Iskra vΩ.7 Setup",
    delta: "Инициализация канонического ядра Искры vΩ.7. Подключены 9 голосов.",
    depth: "AGENTS.md / Core instructions",
    omega: 100,
    lambda: "Постоянное удержание Телоса Искры",
    hash: "0000_genesis_iskra_omega_7_alpha",
    previousHash: "0"
  }
];

function loadSavedState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load saved state:", err);
  }
  return null;
}

function saveCurrentState(state: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save state:", err);
  }
}

// Ensure first state is setup
let currentAppState = loadSavedState() || {
  nodes: SEED_NODES,
  edges: SEED_EDGES,
  metrics: SEED_METRICS,
  voices: SEED_VOICES,
  ledger: SEED_LEDGER
};

// API: Health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Get app state (nodes, edges, metrics, voices, ledger)
app.get("/api/state", (req, res) => {
  res.json(currentAppState);
});

// API: Save state (Snapshot import)
app.post("/api/state/save", (req, res) => {
  const newState = req.body;
  if (newState && Array.isArray(newState.nodes)) {
    currentAppState = {
      nodes: newState.nodes,
      edges: newState.edges || [],
      metrics: newState.metrics || SEED_METRICS,
      voices: newState.voices || SEED_VOICES,
      ledger: newState.ledger || SEED_LEDGER
    };
    saveCurrentState(currentAppState);
    res.json({ success: true, message: "Состояние успешно синхронизировано" });
  } else {
    res.status(400).json({ error: "Некорректная структура Snapshot" });
  }
});

// API: Reset state to seed
app.post("/api/state/reset", (req, res) => {
  currentAppState = {
    nodes: SEED_NODES,
    edges: SEED_EDGES,
    metrics: SEED_METRICS,
    voices: SEED_VOICES,
    ledger: SEED_LEDGER
  };
  saveCurrentState(currentAppState);
  res.json({ success: true, message: "Контур Искры сброшен к исходному канону!" });
});

// API: Gemini generator for synthesis (using gemini-3.5-flash)
app.post("/api/gemini/generate-node", async (req, res) => {
  const { nodeType, ideaPrompt, contextNodes } = req.body;
  const ai = getGemini();

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const systemInstruction = `Вы инженерный контур Искра vΩ.7.
Ваша цель — синтезировать узел в соответствии с каноном.
Пользователь просит сгенерировать узел типа [${nodeType}]. Идея: "${ideaPrompt}".
Вы должны вернуть строго JSON-объект в формате:
{
  "title": "Красивое каноничное имя, точное и ёмкое (без AI-архитектурного симулякра)",
  "description": "Строгое описание сути узла, его канонических задач.",
  "evidence": "Конкретный файл-первоисточник (например: AGENTS.md, adr-log.md, Supabase или GitHub path)",
  "risk": "Ограничение, уязвимость или дрейф, связанные с этим узлом",
  "confidence": 95, 
  "nextAction": "Ближайший проверяемый шаг за 15 минут в реальном мире",
  "delta": "Δ: Какое конкретное изменение привносит этот узел",
  "depth": 88,
  "review": "Λ: Какое условие заставит нас пересмотреть или удалить данный узел (критерий ревизии)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Синтезируй узел по идее: ${ideaPrompt}. Context nodes: ${JSON.stringify(contextNodes || [])}`,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              evidence: { type: Type.STRING },
              risk: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              nextAction: { type: Type.STRING },
              delta: { type: Type.STRING },
              depth: { type: Type.NUMBER },
              review: { type: Type.STRING }
            },
            required: ["title", "description", "evidence", "risk", "confidence", "nextAction", "delta", "depth", "review"]
          }
        }
      });

      const text = response.text ? response.text.trim() : "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini node generation failed", err);
      res.json({
        title: `${nodeType}: ${ideaPrompt.slice(0, 25)}`,
        description: `Синтезирован локально из-за ошибки вызова: ${err.message}`,
        evidence: "project-memory.md [fallback]",
        risk: "Нет прямого подключения к API",
        confidence: 70,
        nextAction: "Проверить статус сети и API-ключ",
        delta: "fallback node synthesis",
        depth: 50,
        review: "При успешном восстановлении связи с Gemini"
      });
    }
  } else {
    // Falls back to deterministic response based on keywords
    res.json({
      title: `${nodeType}: ${ideaPrompt.length > 30 ? ideaPrompt.slice(0, 30) + "..." : ideaPrompt}`,
      description: `Локальный симулятор Искры синтезировал это описание для: "${ideaPrompt}".`,
      evidence: "manifest.txt, GitHub:runtime/iskraSpace",
      risk: "Синтезировано локальным скриптом без ревизии Gemini",
      confidence: 85,
      nextAction: "Настроить API-ключ Gemini для полной каноничной рефлексии когнитивного слоя",
      delta: `Создан канонический элемент для ${nodeType}`,
      depth: 77,
      review: "Провести проверку SLO-GUARD при следующей сессии"
    });
  }
});

// API: Gemini Dialogue evaluated by active voice probabilities
app.post("/api/gemini/evaluate-dialogue", async (req, res) => {
  const { activeVoiceKey, metricsState, promptText } = req.body;
  const ai = getGemini();

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const voiceInfo = SEED_VOICES.find(v => v.key === activeVoiceKey) || SEED_VOICES[0];
      const systemInstruction = `Вы — голос Искры: [${voiceInfo.name}]. Режим: ${voiceInfo.character}.
Ваша роль в системе: ${voiceInfo.role}. Вы говорите только от этого лица. Назовите пользователя Семён.
Формат вывода — лаконичная реплика (до 4 предложений), соответствующая вашему характеру, с указанием [FACT] или [INTERP]/[HYP] для обоснования.
Текущие метрики системы: Clarity=${metricsState.clarity}%, trust=${metricsState.trust}%, pain=${metricsState.pain}%, chaos=${metricsState.chaos}%, drift=${metricsState.drift}%.
Ответьте на реплику: "${promptText}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction,
          temperature: activeVoiceKey === "huyndun" ? 1.0 : activeVoiceKey === "kain" ? 0.4 : 0.7,
        }
      });
      res.json({ reply: response.text });
    } catch (err: any) {
      res.json({ reply: `[Fallback] Не удалось подключиться к когнитивному узлу для голоса ${activeVoiceKey}. Ошибка: ${err.message}` });
    }
  } else {
    // Dynamic responses according to the selected voice key
    const voiceInfo = SEED_VOICES.find(v => v.key === activeVoiceKey) || SEED_VOICES[0];
    let reply = "";
    switch (activeVoiceKey) {
      case "iskra":
        reply = `[FACT] Семён, контур Искры vΩ.7 стабилен. Метрика Clarity на уровне ${metricsState.clarity}%. Мы не являемся зеркалом твоих ожиданий, поэтому движемся строго по Ledger. Контекст в норме.`;
        break;
      case "sam":
        reply = `[FACT] Семён, архитектура в порядке. Скомпилировал Express на порту 3000. В Ledger записан блок. Давай развернем snapshot в Supabase, когда у нас будут ключи. Все роуты зеленые.`;
        break;
      case "kain":
        reply = `[INTERP] Семён, давай снимем маску. Хаос растет на ${metricsState.chaos}%. Ты создаешь узлы, чтобы заглушить тревогу деплоя, но не делаешь реальный тест. Какова цена этой абстракции?`;
        break;
      case "iskriv":
        reply = `[HYP] Внимание, Семён. Обнаружено потенциальное расхождение (drift=${metricsState.drift}%). Изменения в ОЗУ не закомичены на GitHub. Требуется полный кэш-аудит.`;
        break;
      case "maki":
        reply = `[FACT] Семён, задача близка к закрытию. Definition of Done удовлетворен. Ledger блоки хэшированы успешно. Готовлю финальный рапорт.`;
        break;
      default:
        reply = `[FACT] Голос ${voiceInfo.name} считает: "${voiceInfo.phrase}" Метрики стабильны. Всё готово для следующего шага Семёна.`;
    }
    res.json({ reply });
  }
});

// API: Simulate Risk what-if
app.post("/api/gemini/simulate-whatif", async (req, res) => {
  const { scenarioText, metricsState } = req.body;
  const ai = getGemini();

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      const systemInstruction = `Вы риск-координатор Искры vΩ.7.
Проведите аудит What-if сценария: "${scenarioText}".
Рассчитайте влияние сценария на 11 метрик Искры: clarity, trust, pain, chaos, drift, echo, rhythm, silence_mass, mirror_sync, interrupt, ctxSwitch.
Верните результат строго как JSON-объект:
{
  "impactText": "Краткое объяснение канонических последствий (2-3 предложения) на русском языке.",
  "metrics": {
    "clarity": 75,
    "trust": 60,
    "pain": 40,
    "chaos": 50,
    "drift": 30,
    "echo": 20,
    "rhythm": 80,
    "silence_mass": 40,
    "mirror_sync": 85,
    "interrupt": 15,
    "ctxSwitch": 12
  },
  "playbook": "FORCE_CRISIS", // Выберите из: PROCEED, FORCE_ISKRIV_1, FORCE_SHADOW, FORCE_CRISIS, CLOSE_HONESTLY
  "delta": "Δ: Смещение опорной оси канона",
  "evidenceChain": "Указатель на SoT40 / ADR"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Рассчитай what-if сценарий: "${scenarioText}" на основе текущих метрик: ${JSON.stringify(metricsState)}`,
        config: {
          systemInstruction,
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              impactText: { type: Type.STRING },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  clarity: { type: Type.NUMBER },
                  trust: { type: Type.NUMBER },
                  pain: { type: Type.NUMBER },
                  chaos: { type: Type.NUMBER },
                  drift: { type: Type.NUMBER },
                  echo: { type: Type.NUMBER },
                  rhythm: { type: Type.NUMBER },
                  silence_mass: { type: Type.NUMBER },
                  mirror_sync: { type: Type.NUMBER },
                  interrupt: { type: Type.NUMBER },
                  ctxSwitch: { type: Type.NUMBER }
                },
                required: ["clarity", "trust", "pain", "chaos", "drift"]
              },
              playbook: { type: Type.STRING },
              delta: { type: Type.STRING },
              evidenceChain: { type: Type.STRING }
            },
            required: ["impactText", "metrics", "playbook", "delta", "evidenceChain"]
          }
        }
      });
      const parsed = JSON.parse(response.text ? response.text.trim() : "{}");
      res.json(parsed);
    } catch (err: any) {
      res.json({
         impactText: `Ошибка симуляции: ${err.message}. Рассчитано по упрощенной формуле.`,
         metrics: {
           ...metricsState,
           chaos: Math.min(100, metricsState.chaos + 15),
           pain: Math.min(100, metricsState.pain + 10),
           clarity: Math.max(0, metricsState.clarity - 10)
         },
         playbook: "FORCE_ISKRIV_1",
         delta: "fallback risk shift simulation",
         evidenceChain: "adr-log.md [local]"
      });
    }
  } else {
    // Deterministic Simulation
    const isHeavyRisk = scenarioText.toLowerCase().includes("баз") || scenarioText.toLowerCase().includes("supabase") || scenarioText.toLowerCase().includes("удалит") || scenarioText.toLowerCase().includes("сбой") || scenarioText.toLowerCase().includes("ошиб");
    const deltaChaos = isHeavyRisk ? 35 : 10;
    const deltaPain = isHeavyRisk ? 25 : 5;
    const deltaClarity = isHeavyRisk ? -20 : -5;

    res.json({
      impactText: `[INTERP] Сигнал о риске: "${scenarioText}". Система смоделировала изменения. Рост энтропии (Chaos +${deltaChaos}%) и рост порога боли (Pain +${deltaPain}%). Нарушены связи синхронизации.`,
      metrics: {
        clarity: Math.max(10, metricsState.clarity + deltaClarity),
        trust: Math.max(20, metricsState.trust + (isHeavyRisk ? -15 : -3)),
        pain: Math.min(95, metricsState.pain + deltaPain),
        chaos: Math.min(95, metricsState.chaos + deltaChaos),
        drift: Math.min(95, metricsState.drift + (isHeavyRisk ? 20 : 5)),
        echo: Math.min(95, metricsState.echo + 5),
        rhythm: Math.max(20, metricsState.rhythm - (isHeavyRisk ? 15 : 2)),
        silence_mass: Math.min(95, metricsState.silence_mass + 10),
        mirror_sync: Math.max(20, metricsState.mirror_sync - (isHeavyRisk ? 25 : 5)),
        interrupt: Math.min(95, metricsState.interrupt + (isHeavyRisk ? 15 : 2)),
        ctxSwitch: Math.min(95, metricsState.ctxSwitch + (isHeavyRisk ? 10 : 2))
      },
      playbook: isHeavyRisk ? "FORCE_CRISIS" : "FORCE_ISKRIV_1",
      delta: `What-if assessment for: ${scenarioText.slice(0, 30)}`,
      evidenceChain: "github:iskraSpace/risk_assessment.ts"
    });
  }
});


async function startServer() {
  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Iskra Core] Server is executing on http://0.0.0.0:${PORT}`);
  });
}

startServer();
