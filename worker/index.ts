/**
 * OWL Kiosk — Cloudflare Worker
 *
 * Serves the React SPA (via static assets) and the /api/* routes that used to
 * live in the Vercel `api/` folder. Because a free *.workers.dev URL has no
 * dashboard WAF / Bot Fight Mode, all protection is implemented here:
 *
 *   1. Per-IP rate limiting (Workers Rate Limiting bindings)
 *   2. Same-origin check (only our own site may call the API)
 *   3. Strict method / content-type / body-size / field-length validation
 *   4. Locked-down AI proxy (model, temperature, max_tokens fixed server-side)
 *   5. Secrets only from Cloudflare (`wrangler secret put`), never in the bundle
 *   6. Security headers + `Cache-Control: no-store` on every API response
 *
 * Note: the `api/` folder is intentionally kept so the app can still be
 * deployed on Vercel.
 */

// ── Minimal Cloudflare types (kept local so they don't clash with DOM lib) ──

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: Fetcher;
  RL_CHAT: RateLimit;
  RL_GENERAL: RateLimit;
  RL_IMAGE: RateLimit;
  DEEPSEEK_API_KEY?: string;
  GEMINI_API_KEY?: string;
  IMGBB_API_KEY?: string;
  /** Optional comma-separated list of extra allowed origins (e.g. custom domain). */
  ALLOWED_ORIGINS?: string;
}

// ── Limits ──────────────────────────────────────────────────────────────────

const MAX_BODY_BYTES_DEFAULT = 32 * 1024; // 32 KB for small JSON endpoints
const MAX_BODY_BYTES_CHAT = 400 * 1024; // chat carries the big system prompt
const MAX_BODY_BYTES_IMAGE = 8 * 1024 * 1024; // base64 image

const CHAT_MAX_MESSAGES = 60;
const CHAT_MAX_TOTAL_CHARS = 250_000;
const CHAT_MAX_TOKENS = 1500;

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const GEMINI_MODEL = 'gemini-2.5-flash';
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

// ── Helpers ─────────────────────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...extra },
  });
}

function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false; // browsers always send Origin on POST
  const self = new URL(request.url).origin;
  if (origin === self) return true;
  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return extra.includes(origin);
}

/** Reads and parses a JSON body with a hard byte cap. Returns null if invalid. */
async function readJson(request: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('Content-Type') || '';
  if (!type.toLowerCase().includes('application/json')) return null;

  const declared = Number(request.headers.get('Content-Length') || '0');
  if (declared > maxBytes) return null;

  const text = await request.text();
  if (text.length > maxBytes) return null;

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

async function callDeepSeek(
  env: Env,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: any }> {
  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({ model: 'deepseek-chat', ...body }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) {
    console.error('DeepSeek error:', response.status, await response.text());
    return { ok: false, status: response.status, data: null };
  }
  return { ok: true, status: 200, data: await response.json() };
}

// ── Route handlers ──────────────────────────────────────────────────────────

async function askOwlChat(request: Request, env: Env): Promise<Response> {
  if (!env.DEEPSEEK_API_KEY) return json({ error: 'API key is not configured' }, 500);

  const body = await readJson(request, MAX_BODY_BYTES_CHAT);
  if (!body || !Array.isArray(body.messages)) return json({ error: 'Invalid request' }, 400);

  const raw = body.messages as unknown[];
  if (raw.length < 1 || raw.length > CHAT_MAX_MESSAGES) return json({ error: 'Invalid request' }, 400);

  const messages: { role: string; content: string }[] = [];
  let total = 0;
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i] as { role?: unknown; content?: unknown };
    if (!m || typeof m.content !== 'string') return json({ error: 'Invalid request' }, 400);
    // Only the very first message may be a system prompt; clients can't inject later ones.
    const role = m.role === 'user' || m.role === 'assistant' || (m.role === 'system' && i === 0) ? m.role : null;
    if (!role) return json({ error: 'Invalid request' }, 400);
    total += m.content.length;
    if (total > CHAT_MAX_TOTAL_CHARS) return json({ error: 'Request too large' }, 413);
    messages.push({ role: role as string, content: m.content });
  }

  try {
    const result = await callDeepSeek(env, {
      messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: CHAT_MAX_TOKENS,
    });
    if (!result.ok) return json({ error: 'Failed to fetch from AI API' }, result.status === 429 ? 429 : 502);

    // Forward only what the client needs.
    const content = result.data?.choices?.[0]?.message?.content ?? '';
    return json({ choices: [{ message: { role: 'assistant', content } }] });
  } catch (error) {
    console.error('askOwlChat error:', error);
    return json({ error: 'Internal Server Error' }, 500);
  }
}

async function evaluateFeedback(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request, MAX_BODY_BYTES_DEFAULT);
  const category = str(body?.category, 60).trim();
  const content = str(body?.content, 2000).trim();
  if (!category || !content) return json({ error: 'Missing category or content' }, 400);
  if (!env.DEEPSEEK_API_KEY) return json({ error: 'API key is not configured' }, 500);

  const systemPrompt = `You are a feedback analysis engine for a university kiosk system. 
Analyze the given student feedback and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

Return this exact structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "urgency": "low" | "medium" | "high" | "critical",
  "summary": "<one-line summary, max 80 chars>",
  "tags": ["<tag1>", "<tag2>"],
  "actionability": "informational" | "suggestion" | "complaint" | "urgent_issue"
}

Guidelines:
- sentiment: positive = praise/satisfaction, negative = frustration/complaint, neutral = factual/mixed
- urgency: critical = safety/health risk or major disruption, high = significant daily impact, medium = noticeable inconvenience, low = minor or cosmetic
- summary: concise one-liner in plain English capturing the main point
- tags: 1-3 lowercase topic keywords (e.g. "wifi", "restroom", "professor", "cafeteria")
- actionability: informational = no action needed, suggestion = nice improvement idea, complaint = problem needs fixing, urgent_issue = requires immediate attention`;

  try {
    const result = await callDeepSeek(env, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Category: ${category}\nFeedback: ${content}` },
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 200,
    });
    if (!result.ok) return json({ error: 'AI evaluation failed' }, result.status === 429 ? 429 : 502);

    const rawText: string = result.data?.choices?.[0]?.message?.content?.trim() || '';
    const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let evaluation: Record<string, unknown>;
    try {
      evaluation = JSON.parse(cleanText);
    } catch {
      console.error('Failed to parse AI evaluation JSON:', rawText);
      return json({ error: 'Failed to parse AI response' }, 500);
    }

    const VALID_SENTIMENTS = ['positive', 'neutral', 'negative'];
    const VALID_URGENCIES = ['low', 'medium', 'high', 'critical'];
    const VALID_ACTIONABILITY = ['informational', 'suggestion', 'complaint', 'urgent_issue'];

    return json({
      sentiment: VALID_SENTIMENTS.includes(evaluation.sentiment as string) ? evaluation.sentiment : 'neutral',
      urgency: VALID_URGENCIES.includes(evaluation.urgency as string) ? evaluation.urgency : 'low',
      summary: typeof evaluation.summary === 'string' ? evaluation.summary.slice(0, 100) : '',
      tags: Array.isArray(evaluation.tags)
        ? (evaluation.tags as unknown[]).slice(0, 3).map((t) => String(t).toLowerCase().slice(0, 30))
        : [],
      actionability: VALID_ACTIONABILITY.includes(evaluation.actionability as string)
        ? evaluation.actionability
        : 'informational',
    });
  } catch (error) {
    console.error('evaluateFeedback error:', error);
    return json({ error: 'Internal Server Error' }, 500);
  }
}

async function moderateContent(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request, MAX_BODY_BYTES_DEFAULT);
  if (!body) return json({ error: 'Invalid request' }, 400);
  if (!env.DEEPSEEK_API_KEY) return json({ error: 'API key is not configured' }, 500);

  const itemName = str(body.itemName, 200);
  const location = str(body.location, 200);
  const description = str(body.description, 1000);
  const type = body.type === 'found' ? 'found' : 'lost';

  try {
    const result = await callDeepSeek(env, {
      messages: [
        {
          role: 'system',
          content: `You are a STRICT AI safety moderator for a university kiosk's "Lost and Found" system in the Philippines. You must understand both English and Tagalog/Filipino (including slang and internet speak).
Your ONLY job is to filter out troll posts, jokes, and non-genuine reports.

A genuine report MUST describe a physical, tangible object that can actually be lost or found on a campus (e.g., ID, water bottle, keys, laptop, bag).
Any report claiming to lose or find abstract concepts, people, relationships, emotions, or joke items MUST be rejected.

Rules for REJECTION (If ANY field triggers a rule, REJECT IT):
1. Not a Physical Object: Reject if the item is abstract, a person, or impossible to physically lose/find (e.g., "girlfriend", "boyfriend", "jowa", "sanity", "will to live", "grades", "soul", "crush", "pride", "dignity", "puso", "pag-ibig").
2. Profanity or Harassment: Reject any inappropriate language, hate speech, or harassment in English or Tagalog.
3. Spam or Gibberish: Reject random letters (e.g., "asdasdasd", "ksdksdkaskdas", "hahaha", "skdjksjd") or nonsensical descriptions.
4. Jokes or Memes: Reject obvious jokes, "hugot" lines, or fake reports (e.g., "I lost my mind in the library", "Nawawala ang feelings niya para sa akin", "sa puso koooo").

Respond EXACTLY in this JSON format:
{
  "passed": boolean,
  "reason": "If passed is false, explain why clearly and concisely. If true, set to null."
}`,
        },
        {
          role: 'user',
          content: `Please moderate this ${type} report:
Item Name: "${itemName}"
Location: "${location}"
Description: "${description}"`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    // Fail open if the AI provider is down so students can still post.
    if (!result.ok) return json({ passed: true, reason: null });

    const parsed = JSON.parse(result.data?.choices?.[0]?.message?.content || '{}');
    return json({ passed: parsed.passed ?? true, reason: parsed.reason ?? null });
  } catch (error) {
    console.error('moderateContent error:', error);
    return json({ passed: true, reason: null });
  }
}

async function moderateEvaluation(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request, MAX_BODY_BYTES_DEFAULT);
  if (!body) return json({ error: 'Invalid request' }, 400);

  const comment = str(body.comment, 2000);
  const facultyName = str(body.facultyName, 200);

  // Comment is optional — nothing to moderate.
  if (!comment.trim()) return json({ passed: true, reason: null });
  if (!env.DEEPSEEK_API_KEY) return json({ error: 'API key is not configured' }, 500);

  try {
    const result = await callDeepSeek(env, {
      messages: [
        {
          role: 'system',
          content: `You are a STRICT AI safety moderator for a university kiosk's Faculty Evaluation system at Universidad de Dagupan in the Philippines. You must understand both English and Tagalog/Filipino (including slang, internet speak, and coded language).

Your ONLY job is to filter out troll comments, profanity, personal attacks, and non-constructive feedback in faculty evaluations.

A GENUINE evaluation comment should contain constructive feedback about a professor's teaching, behavior, or academic performance — whether positive, negative, or mixed. Honest negative feedback is ALLOWED as long as it is respectful and constructive.

Rules for REJECTION (If ANY rule is triggered, REJECT):
1. PROFANITY & VULGAR LANGUAGE: Reject any comment with profanity, slurs, or vulgar language in English or Tagalog (including coded/masked profanity like "p*t@ng in@", "tang1n@", "g@g0", "b0b0", "pu+@", "t@ng@", etc).
2. PERSONAL ATTACKS & HARASSMENT: Reject insults targeting a professor's appearance, personal life, gender, race, religion, or disability. Examples: "panget naman niya", "ang taba", "walang kwenta", "bobo ng prof".
3. THREATS & INTIMIDATION: Reject any threats of violence or intimidation toward faculty.
4. SPAM & GIBBERISH: Reject random letters/characters (e.g., "asdfghjkl", "aaaaaaaa", "hahahaha", "skdjskdj"), repeated characters, or nonsensical text.
5. TROLLING & JOKES: Reject obvious troll comments, jokes, memes, hugot lines, or sarcastic non-feedback (e.g., "charot", "eme lang", "ez grade", "pogi lang talaga", "crush ko si sir/ma'am").
6. SEXUAL CONTENT: Reject any sexually suggestive or inappropriate comments about faculty.
7. DISCRIMINATORY LANGUAGE: Reject comments that are sexist, racist, or discriminatory.

IMPORTANT — Do NOT reject these:
- Honest negative feedback like "I think the professor needs to explain topics more clearly" or "The professor often comes late to class"
- Constructive criticism like "Strict grading but fair" or "Hindi engaging yung teaching style"
- Short but genuine comments like "Good professor" or "Very helpful" or "Needs improvement"

Respond EXACTLY in this JSON format:
{
  "passed": boolean,
  "reason": "If passed is false, provide a brief, student-friendly explanation (e.g., 'Your comment contains inappropriate language. Please provide constructive feedback.'). If true, set to null."
}`,
        },
        {
          role: 'user',
          content: `Please moderate this faculty evaluation comment for professor "${facultyName || 'Unknown'}":\n\nComment: "${comment}"`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    if (!result.ok) return json({ passed: true, reason: null });

    const parsed = JSON.parse(result.data?.choices?.[0]?.message?.content || '{}');
    return json({ passed: parsed.passed ?? true, reason: parsed.reason ?? null });
  } catch (error) {
    console.error('moderateEvaluation error:', error);
    return json({ passed: true, reason: null });
  }
}

async function moderateImage(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request, MAX_BODY_BYTES_IMAGE);
  if (!body) return json({ error: 'Invalid request' }, 400);

  if (!env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured. Bypassing image moderation.');
    return json({ passed: true, reason: null });
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
  if (!imageBase64) return json({ passed: false, reason: 'No image provided.' }, 400);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64.slice(0, 1024))) {
    return json({ passed: false, reason: 'Invalid image data.' }, 400);
  }

  const mimeType = typeof body.mimeType === 'string' && ALLOWED_IMAGE_MIME.has(body.mimeType) ? body.mimeType : 'image/jpeg';
  const itemName = str(body.itemName, 200);
  const description = str(body.description, 1000);

  const prompt = `You are a STRICT AI image moderator for a university kiosk's "Lost and Found" system.
Analyze the provided image along with the user's report details:
Item Name: "${itemName}"
Description: "${description}"

Rules for REJECTION:
1. People/Faces: If the PRIMARY focus of the image is a person's face or body, REJECT it immediately. A lost and found system is for objects, not missing persons or trolls posting selfies. (Note: It is OK if a person's hand is holding an object, or if people are vaguely in the background, but the object MUST be the main subject).
2. Not a Physical Object: If the image is a meme, a text screenshot, or something abstract that cannot be physically lost/found on a campus, REJECT it.
3. Mismatch: If the image clearly contradicts the Item Name (e.g., image is a dog but item name says "keys"), REJECT it.
4. Inappropriate: Reject any explicit or inappropriate content.

Respond EXACTLY in this JSON format:
{
  "passed": boolean,
  "reason": "If passed is false, explain why clearly and concisely. If true, set to null."
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }],
            },
          ],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(45_000),
      }
    );

    if (!response.ok) {
      console.error('Gemini error:', response.status, await response.text());
      throw new Error(`Gemini ${response.status}`);
    }

    const data: any = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text);
    return json({ passed: parsed.passed ?? true, reason: parsed.reason ?? null });
  } catch (error) {
    console.error('Image moderation error:', error);
    // Don't leak internals to the client; the kiosk shows this reason to the student.
    return json({
      passed: false,
      reason: 'AI image verification is temporarily unavailable. Please try again in a moment.',
    });
  }
}

async function uploadImage(request: Request, env: Env): Promise<Response> {
  if (!env.IMGBB_API_KEY) return json({ error: 'API key is not configured' }, 500);

  const body = await readJson(request, MAX_BODY_BYTES_IMAGE);
  const imageBase64 = typeof body?.imageBase64 === 'string' ? body.imageBase64 : '';
  if (!imageBase64) return json({ error: 'No image provided' }, 400);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64.slice(0, 1024))) {
    return json({ error: 'Invalid image data' }, 400);
  }

  try {
    const form = new URLSearchParams();
    form.append('image', imageBase64);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: { 'X-API-Key': env.IMGBB_API_KEY },
      body: form,
      signal: AbortSignal.timeout(45_000),
    });
    const data: any = await response.json();

    if (!data?.success) return json({ error: 'Image upload failed' }, 400);
    return json({ url: data.data.url });
  } catch (error) {
    console.error('uploadImage error:', error);
    return json({ error: 'Internal Server Error' }, 500);
  }
}

// ── Router ──────────────────────────────────────────────────────────────────

type Route = {
  handler: (request: Request, env: Env) => Promise<Response>;
  limiter: (env: Env) => RateLimit;
};

const ROUTES: Record<string, Route> = {
  '/api/askOwlChat': { handler: askOwlChat, limiter: (e) => e.RL_CHAT },
  '/api/evaluateFeedback': { handler: evaluateFeedback, limiter: (e) => e.RL_GENERAL },
  '/api/moderateContent': { handler: moderateContent, limiter: (e) => e.RL_GENERAL },
  '/api/moderateEvaluation': { handler: moderateEvaluation, limiter: (e) => e.RL_GENERAL },
  '/api/moderateImage': { handler: moderateImage, limiter: (e) => e.RL_IMAGE },
  '/api/uploadImage': { handler: uploadImage, limiter: (e) => e.RL_IMAGE },
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Only /api/* reaches the Worker first (see wrangler.jsonc run_worker_first),
    // but fall back to static assets for anything else just in case.
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const route = ROUTES[url.pathname];
    if (!route) return json({ error: 'Not Found' }, 404);

    if (request.method !== 'POST') {
      return json({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' });
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ error: 'Forbidden' }, 403);
    }

    // Rate limit per client IP, per route group.
    const { success } = await route.limiter(env).limit({ key: clientIp(request) });
    if (!success) {
      return json({ error: 'Too Many Requests' }, 429, { 'Retry-After': '30' });
    }

    try {
      return await route.handler(request, env);
    } catch (error) {
      console.error('Unhandled API error:', error);
      return json({ error: 'Internal Server Error' }, 500);
    }
  },
};
