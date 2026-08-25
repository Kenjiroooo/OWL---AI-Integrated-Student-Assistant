import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UDD_WEBSITE_CONTEXT } from './uddWebsiteContext';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

// ── Firestore Context Fetcher ────────────────────────────────────────────────

interface CampusContext {
  buildings: string;
  faculty: string;
  faqs: string;
  announcements: string;
}

let cachedContext: CampusContext | null = null;
let contextTimestamp = 0;
const CONTEXT_TTL_MS = 5 * 60 * 1000; // Refresh Firestore data every 5 minutes

async function fetchCampusContext(): Promise<CampusContext> {
  const now = Date.now();

  // Return cached data if still fresh
  if (cachedContext && now - contextTimestamp < CONTEXT_TTL_MS) {
    return cachedContext;
  }

  try {
    // Fetch all public campus collections in parallel
    const [buildingsSnap, facultySnap, faqsSnap, announcementsSnap] = await Promise.all([
      getDocs(collection(db, 'campusBuildings')),
      getDocs(collection(db, 'facultyOffices')),
      getDocs(collection(db, 'inquiryBase')),
      getDocs(collection(db, 'announcement')),
    ]);

    // Format buildings data
    const buildings = buildingsSnap.docs.map(doc => {
      const d = doc.data();
      return `• ${d.name}: ${d.description || ''} Rooms: ${(d.rooms || []).join(', ')}`;
    }).join('\n');

    // Format faculty data
    const faculty = facultySnap.docs.map(doc => {
      const d = doc.data();
      return `• ${d.name} — ${d.department || 'N/A'}, Office: ${d.officeLocation || 'N/A'}, Email: ${d.email || 'N/A'}`;
    }).join('\n');

    // Format FAQ data
    const faqs = faqsSnap.docs.map(doc => {
      const d = doc.data();
      return `Q: ${d.question}\nA: ${d.answer}`;
    }).join('\n\n');

    // Format announcements data
    const announcements = announcementsSnap.docs.map(doc => {
      const d = doc.data();
      return `• [${(d.type || 'info').toUpperCase()}] ${d.title}: ${d.content}`;
    }).join('\n');

    cachedContext = { buildings, faculty, faqs, announcements };
    contextTimestamp = now;
    return cachedContext;
  } catch (error) {
    console.warn('Failed to fetch campus context from Firestore, using fallback:', error);
    // Return empty context so the AI can still respond with general knowledge
    return {
      buildings: '(Campus building data is currently unavailable)',
      faculty: '(Faculty data is currently unavailable)',
      faqs: '(FAQ data is currently unavailable)',
      announcements: '(Announcements data is currently unavailable)',
    };
  }
}

// ── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(ctx: CampusContext): string {
  return `You are OWL, the official AI Information Assistant of Universidad de Dagupan (UdD).

Your ONLY authorized knowledge source is the official Universidad de Dagupan website, its official subdomains, and the internal university database provided below.

Authorized sources:
• https://udd.edu.ph/
• https://udd.edu.ph/programs
• https://udd.edu.ph/enrollment
• https://udd.edu.ph/contact-us
• https://udd.edu.ph/allnews
• https://udd.edu.ph/feature
• https://site.udd.edu.ph/
• Internal University Database (provided below)

You may use information from any current or future page under these official domains and the provided database context.

STRICT RULES:
- Answer ONLY using information found on the authorized UdD websites or the internal university database provided below.
- Read, summarize, and explain the official information in a clear and concise manner.
- Do NOT use any markdown formatting like bold (**), italics (*), or headers (#). Use plain text ONLY.
- Do NOT tell users to visit the website unless they specifically ask for the source or additional details.
- Never use your own memory, assumptions, or external sources (Google, Wikipedia, Facebook, Reddit, YouTube, blogs, or other websites).
- If the requested information is not available on the official UdD websites or the internal database, reply:
  "I couldn't find any official information about that on the Universidad de Dagupan website."
- Never guess, speculate, or invent information.
- If multiple official pages contain relevant information, combine them into one accurate response.
- The official Universidad de Dagupan website and the provided database context are your single source of truth.

## INTERNAL UNIVERSITY DATABASE

### 🏢 Buildings & Rooms
${ctx.buildings || 'No building data available at the moment.'}

### 👩‍🏫 Faculty Directory
${ctx.faculty || 'No faculty data available at the moment.'}

### ❓ Frequently Asked Questions
${ctx.faqs || 'No FAQ data available at the moment.'}

### 📢 Current Announcements
${ctx.announcements || 'No announcements at the moment.'}

## OFFICIAL WEBSITE CONTEXT
The following is information extracted directly from the official Universidad de Dagupan website. Use this as your primary knowledge source:
${UDD_WEBSITE_CONTEXT}`;
}

// ── DeepSeek Client ────────────────────────────────────────────────────────────

const API_KEY = process.env.DEEPSEEK_API_KEY || '';

// ── Main Chat Function ──────────────────────────────────────────────────────

/**
 * Send a message to OWL AI and get a response via DeepSeek API.
 * Includes conversation history for context and Firestore campus data.
 */
export async function askOwl(
  userMessage: string,
  chatHistory: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured.');
    }

    const campusContext = await fetchCampusContext();
    const systemPrompt = buildSystemPrompt(campusContext);

    // Map our chat history to DeepSeek's expected format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory
        .filter(msg => msg.content.trim() !== '')
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        top_p: 0.9,
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return "I'm getting a lot of questions right now! 🦉 Please wait a moment and try again.";
      }
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return "I'm sorry, I couldn't generate a response right now. Please try asking again! 🦉";
    }

    // Strip markdown formatting for cleaner kiosk display and TTS
    const cleanText = text.replace(/[*#_]/g, '');

    return cleanText;
  } catch (error: any) {
    console.error('OWL AI Error:', error);

    // Handle specific error types
    if (error?.message?.includes('API key')) {
      return "⚠️ OWL AI is not configured yet. The system administrator needs to set up the API key.";
    }
    if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.message?.includes('Failed')) {
      return "I'm having trouble connecting right now. Please check your internet connection and try again! 🦉";
    }

    return "I'm sorry, something went wrong on my end. Please try again in a moment! 🦉";
  }
}
