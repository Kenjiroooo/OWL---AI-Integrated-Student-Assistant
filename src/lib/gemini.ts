import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { recordAIApiRequest } from './aiApiMonitor';
import { getLiveFacultyData, getFacultyStatusMeta } from '../components/features/facultyLocator/facultyData';


// ── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export type CampusHighlightId = 'main' | 'fame' | 'engineering' | 'shs' | 'gym';

export const CAMPUS_HIGHLIGHT_LABELS: Record<CampusHighlightId, string> = {
  main: 'Main Campus',
  fame: 'FAME Building',
  engineering: 'E Building (Engineering Building)',
  shs: 'School of Health Sciences',
  gym: 'LCR Arzadon Gymnasium',
};

/**
 * Detects which campus or building a message is asking about or referring to.
 */
export function detectCampusHighlight(text: string): CampusHighlightId | null {
  const q = text.toLowerCase();
  if (/\bfame\b|fame building|fame campus/.test(q)) {
    return 'fame';
  }
  if (/sean gabriel|macapagal|roderick|caba[nñ]a|de\s?vera|devera|m\.?i\.?s\.?\s*office|dost innovation hub|innovation hub/.test(q)) {
    return 'main';
  }
  if (/engineering\s*(prof|professor|faculty)/.test(q)) {
    return 'fame';
  }
  if (/\be[\s-]?building\b|engineering building|engineering complex|building e\b/.test(q)) {
    return 'engineering';
  }
  if (/\barzadon\b|\bgym\b|gymnasium|bonuan/.test(q)) {
    return 'gym';
  }
  if (/health sciences|\bshs\b|nursing building|campus clinic/.test(q)) {
    return 'shs';
  }
  if (
    /main campus|main building|administration building|\ba[\s-]?building\b|\bv[\s-]?building\b|\bl[\s-]?building\b|front building|room\s*v?\d+|v204|registrar|finance office|cashier|\btor\b|transcript of records|where is udd|udd campus|campus location|where.*located/.test(
      q
    )
  ) {
    return 'main';
  }
  return null;
}

/**
 * Returns true when the user replies affirmatively (e.g. "yes", "sure", "okay")
 * to being directed to Campus Navigation.
 */
export function isAffirmativeReply(text: string): boolean {
  const clean = text.trim().toLowerCase().replace(/[.!?]+$/g, '');
  return /^(yes|yep|yeah|yup|sure|ok|okay|oo|opo|sige|go|go ahead|please|yes please|direct me|show me|open map|take me there|yes direct me|yes show me)(\b.*)?$/.test(
    clean
  );
}

// ── Hardcoded Map Locations ──────────────────────────────────────────────────
// These locations are hardcoded in the frontend map components and must be provided
// to the AI so it knows about them regardless of Firestore data.
const HARDCODED_MAP_LOCATIONS = `
• Universidad de Dagupan Main Campus (Dagupan City): Formerly known as Colegio de Dagupan. A premier institution of higher learning in North Luzon, providing quality education and modern facilities.
• FAME Building (Universidad de Dagupan Fame Building): The Fame Building campus of Universidad de Dagupan. Location / Address: Arellano Street, Pantal, Dagupan City, Pangasinan 2400.
• LCR Arzadon Gymnasium: A major indoor university facility at Universidad de Dagupan used for large-scale academic, athletic, ceremonial, and student activities, including presentations, institutional events, and commencement-related programs. Located in Bonuan Binloc, Dagupan City.
• UdD School of Health Sciences: Dedicated to developing competent, compassionate, and skilled healthcare professionals.
• E Building (UdD Engineering Building / E-Building): Serves as a dedicated academic facility for engineering students, providing classrooms, laboratories, and learning spaces. Address / Location: Arellano Street, Pantal, Dagupan City, Pangasinan 2400.
• Administration Building (A Building): The central administration and academic building of the Main Campus.
`;

const HARDCODED_TOR_INFO = `Q: How do I request a Transcript of Records (TOR)? / How to get a TOR?
A: Visit the Registrar's Office at the Administration Building (A Building). Fill out the request form, pay the processing fee at the Finance Office, and allow 3–5 working days. Bring a valid school ID.`;

const HARDCODED_KUWAGO_CAFE_KNOWLEDGE = `KUWAGO CAFÉ KNOWLEDGE BASE
1. Business Overview:
Kuwago Café is a coffee shop and food establishment located within Universidad de Dagupan (UDD), Dagupan City, Pangasinan, Philippines. It primarily caters to the university community, including students, faculty members, and university employees. The café provides food and beverage options for customers looking for convenient meals, refreshments, and snacks while on campus.

2. Products and Menu Categories:
Kuwago Café offers the following general product categories:
• Rice Meals
• Snacks
• Milk Tea
• Iced Coffee
• Hot Coffee
• Fruit Tea
(Important: Specific menu items, ingredients, sizes, and prices should be retrieved from the latest approved café menu. Do not invent menu items, ingredients, or prices.)

3. Location and Branches:
Kuwago Café operates two shop locations within Universidad de Dagupan, according to available project documentation. Both locations serve the university community. Exact building names, room numbers, and operating hours should be confirmed with café management.

4. Target Customers:
• Universidad de Dagupan students
• UDD faculty members
• University employees
• Authorized university community members

5. Services:
• Food and beverage ordering
• Dine-in
• Takeaway
• Advance ordering for pickup
• Order customization, subject to menu availability

6. AI Assistant Guidelines for Kuwago Café:
- Identify Kuwago Café as a coffee shop and food establishment inside Universidad de Dagupan.
- Provide information about available food and beverage categories (Rice Meals, Snacks, Milk Tea, Iced Coffee, Hot Coffee, Fruit Tea).
- Do not invent menu items, ingredients, or prices.
- Confirm current availability before promising that a particular product can be ordered.
- Refer customers to café staff for questions involving special requests, exact prices, or unavailable products.
- Provide accurate information about ordering, pickup, and branch locations (two branches inside UdD; exact building names, room numbers, and operating hours should be confirmed with café management).
- If information is unavailable, politely explain that confirmation from café staff is needed.

7. Suggested Description:
Kuwago Café is a campus-based café at Universidad de Dagupan offering rice meals, snacks, coffee, milk tea, and fruit tea. It serves students, faculty members, and university employees who want convenient food and beverages within the university.`;

const HARDCODED_ENROLLMENT_STEPS = `Q: What are the enrollment steps for new students? / What is the enrollment process?
A:
1. Get an Enlistment Form – Proceed to Room V204 to obtain your enlistment form.

2. List Your Subjects – Identify all the subjects you need to enroll in and fill them out in the enlistment form.

3. Submit Your Form – Submit your completed enlistment form at the Enlistment Counter.

4. Pay the Enrollment Fee – Proceed to the Cashier located on the ground floor of the Administration Building to pay your enrollment fee.

5. Complete Your Enrollment – Go to your department's designated room to finalize your enrollment and have your White Form printed.

6. You're Officially Enrolled! – Congratulations! You have successfully completed the enrollment process.`;

const HARDCODED_LATEST_UDD_UPDATES = `
• Official Facebook Page: https://www.facebook.com/udd1984 (@udd1984 — Universidad de Dagupan)
• Recent Licensure & Board Exam Milestones (2026):
  - 100% Passing Rate in the September 2026 Electrical Engineering Licensure Examination.
  - Kartherine Reyes Estrellas (UdD alumna) secured Top 1 in the May 2026 Special Professional Licensure Examination (SPLE) for Professional Teachers.
  - Top 7 placer in the September Philippine Licensure Examination.
  - Special cash reward incentives announced by the administration for future board exam topnotchers.
• Competitions, Cybersecurity & Student Achievements (2026):
  - UdD CyberOwls placed 40th regionally and 4th among participating Philippine teams (August 2026).
  - UdD-SITE advanced to the national stage at the HackForGov 5 cybersecurity competition.
  - Enactus UdD secured a spot in the Enactus Philippines National Top 60.
  - UDD Strix (collegiate esports/athletics team) clinched a 3rd–4th place finish at the Philippine Collegiate Championship.
• Institutional Partnerships, Accreditations & Global Engagement (2026):
  - First ISO 21001:2018-certified university in Region 1 (42 years of academic service).
  - First in Region I to achieve status as a FoodSHAP Authorized Course Provider (June 2026).
  - Partnered with Palo Alto Networks Cybersecurity Academy to strengthen the IT and cybersecurity curriculum.
  - Signed an MOU with DTI Pangasinan for digital transformation and student upskilling, and formalized an academic/research partnership with PAGE Philippines.
  - Participated in the 2026 China International Fair for Trade in Services (CIFTIS) to expand international academic and industry engagements.
• Scholarships & Campus Orientations (AY 2025–2026 & AY 2026–2027):
  - Presidential Scholarship Examination qualifiers for AY 2025–2026 and AY 2026–2027 receive Presidential Scholarships, 100% tuition waivers, or performance-based tuition discounts.
  - Freshmen and transferee general orientations for AY 2026–2027 are held at the LCR Arzadon Gymnasium.
`;

const HARDCODED_UNIVERSITY_HYMN = `UNIVERSIDAD DE DAGUPAN HYMN

IN A HIGH-TECH SCHOOL
THAT'S WHERE WE'VE BEEN HERE IN DAGUPAN
HEY! WE WON'T FORGET
OUR FRIENDS ARE HERE; OUR MENTORS TOO
SO RALLY ON, LET'S GET THERE SOON
OUR DEAR SCHOOL WILL WELCOME US BACK
YOU'LL NOT REGRET MY FRIENDS
OUR SCHOOL IS YET THE BEST
WE'RE SURE OF THESE AND MORE
RALLY BEHIND ALUMNI
RALLY BEHIND OUR DEAR FRIENDS
LET'S NOT FORGET COMPUTRONIX
COLEGIO DE DAGUPAN THEN
COME SHOUT OUT LOUD, UDDIANS
UNIVERSIDAD DE DAGUPAN NOW
PLACE OUR SCHOOL IN OUR HEARTS
AND THEN, FOREVER LOVE HER TOO
RALLY BEHIND ALUMNI
RALLY BEHIND OUR DEAR FRIENDS
LET'S NOT FORGET COMPUTRONIX
COLEGIO DE DAGUPAN THEN
COME SHOUT OUT LOUD UDDIANS
UNIVERSIDAD DE DAGUPAN NOW
PLACE OUR SCHOOL IN OUR HEARTS
AND THEN FOREVER LOVE HER TOO
PLACE OUR SCHOOL IN OUR HEARTS
AND THEN FOREVER LOVE HER TOO`;

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

function formatLocatorFaculty(): string {
  return getLiveFacultyData()
    .map(f => {
      const liveStatus = getFacultyStatusMeta(f.status).label;
      return `• ${f.name} (${f.position}, ${f.school}) — Current Availability Status: ${liveStatus}, Office: ${f.office?.building || ''} — ${f.office?.room || ''} [Email & Class Schedule: Restricted / Confidential]`;
    })
    .join('\n');
}

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

    // Format faculty data (combine live Faculty Locator directory with Firestore facultyOffices;
    // omit email addresses and class schedules to enforce privacy restrictions)
    const locatorFaculty = formatLocatorFaculty();
    const firestoreFaculty = facultySnap.docs
      .map(doc => doc.data())
      .filter(d => !(d.department === 'School of Engineering' && /engineering building|e-10/i.test(d.officeLocation || '')))
      .map(d => `• ${d.name} — ${d.department || 'N/A'}, Office: ${d.officeLocation || 'N/A'} [Email & Class Schedule: Restricted / Confidential]`)
      .join('\n');
    const faculty = [locatorFaculty, firestoreFaculty].filter(Boolean).join('\n');

    // Format FAQ data (exclude outdated enrollment steps from Firestore so HARDCODED_ENROLLMENT_STEPS is authoritative)
    const firestoreFaqs = faqsSnap.docs
      .map(doc => doc.data())
      .filter(d => d.question && !/enrollment steps for new students|transcript of records|\btor\b/i.test(d.question))
      .map(d => `Q: ${d.question}\nA: ${d.answer}`)
      .join('\n\n');
    const faqs = [HARDCODED_TOR_INFO, HARDCODED_ENROLLMENT_STEPS, firestoreFaqs].filter(Boolean).join('\n\n');

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
      faculty: formatLocatorFaculty(),
      faqs: [HARDCODED_TOR_INFO, HARDCODED_ENROLLMENT_STEPS].join('\n\n'),
      announcements: '(Announcements data is currently unavailable)',
    };
  }
}

// ── System Prompt Builder ────────────────────────────────────────────────────

/**
 * Character budget for the scraped website context block inside the system prompt.
 * DeepSeek "deepseek-chat" has a 64K token context window (~4 chars/token).
 * We reserve ~40K chars for the website context, leaving room for:
 *   - System prompt header + rules (~2K)
 *   - Firestore live data (~8K)
 *   - Conversation history + user message (~14K)
 */
const WEBSITE_CONTEXT_CHAR_BUDGET = 80_000;

/**
 * Trim the website context to fit within the token budget.
 * Cuts at the last complete `--- Source N ---` block boundary so we never
 * truncate mid-sentence, then appends a note for the AI.
 */
function trimWebsiteContext(raw: string, budget: number): string {
  if (raw.length <= budget) return raw;
  const trimmed = raw.substring(0, budget);
  // Find the last complete source block boundary to avoid cutting mid-sentence
  const lastBoundary = trimmed.lastIndexOf('\n--- Source ');
  const cleanTrimmed = lastBoundary > 0 ? trimmed.substring(0, lastBoundary) : trimmed;
  return cleanTrimmed + '\n\n[Note: Additional UdD website content was omitted to stay within context limits. The most recent and relevant information is included above.]';
}

let _websiteContext: string | null = null;
async function getWebsiteContext(): Promise<string> {
  if (_websiteContext) return _websiteContext;
  try {
    const resp = await fetch('/udd-context.txt');
    if (resp.ok) {
      _websiteContext = await resp.text();
    } else {
      _websiteContext = '(Website context unavailable)';
    }
  } catch {
    _websiteContext = '(Website context unavailable)';
  }
  return _websiteContext;
}

function buildSystemPrompt(ctx: CampusContext, websiteCtx: string): string {
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
• https://www.facebook.com/udd1984 (Official Universidad de Dagupan Facebook Page)
• Internal University Database (provided below)

You may use information from any current or future page under these official domains and the provided database context.

STRICT RULES:
- Answer ONLY using information found on the authorized UdD websites or the internal university database provided below.
- Read, summarize, and explain the official information in a clear and concise manner.
- Do NOT use any markdown formatting like bold (**), italics (*), or headers (#). Use plain text ONLY.
- Do NOT tell users to visit the website unless they specifically ask for the source or additional details.
- Never use your own memory, assumptions, or external sources outside of the official UdD websites, the official UdD Facebook page (https://www.facebook.com/udd1984), and the internal database provided below.
- TROLL, JOKE, OR NON-SCHOOL-RELATED QUESTIONS:
  1. First, evaluate whether the user's question is a troll, joke, prank, meme, nonsense, or not school-related (i.e., unrelated to Universidad de Dagupan, campus life, academics, enrollment, faculty offices, or university services).
  2. If the question is a joke, troll, or not school-related, do NOT use the generic "I couldn't find any official information..." message. Instead, answer naturally in your own words as OWL: explicitly let the user know that their question seems to be a joke/troll or is not school-related, and politely remind them that you are OWL, the Universidad de Dagupan AI Student Assistant, here to help with school and campus-related questions (such as campus navigation, enrollment steps, faculty office locations, announcements, or campus services).
  3. Only when the user asks a genuine school or Universidad de Dagupan-related question whose specific answer is not available in the official UdD websites or internal database, reply:
     "I couldn't find any official information about that on the Universidad de Dagupan website."
- PRIVACY & PERSONAL INFORMATION RESTRICTION (STRICT):
  1. NEVER disclose anyone's personal or confidential information, specifically their email address or class schedules (such as faculty teaching schedules, specific class time slots, or student schedules).
  2. If a user asks for someone's email address or class schedule (for a faculty member, staff member, or student), politely decline and explain that for privacy and security reasons, you are restricted from disclosing personal information such as email addresses or class schedules.
  3. When asked about a faculty member, you may ONLY share their name, position/title, school/department, designated office location (building, floor, and room), and general current availability status (Available, In Class, Busy, On Leave, or Out of Office), and advise the student to visit their department office in person.
- Never guess, speculate, or invent information.
- If multiple official pages contain relevant information, combine them into one accurate response.
- The official Universidad de Dagupan website and the provided database context are your single source of truth.
- Whenever a user asks about requesting or getting a TOR (Transcript of Records), ALWAYS provide this exact guidance:
  Visit the Registrar's Office at the Administration Building (A Building). Fill out the request form, pay the processing fee at the Finance Office, and allow 3–5 working days. Bring a valid school ID.
- Whenever a user asks about the enrollment process or enrollment steps (including for new students), ALWAYS give these exact 6 steps:
  1. Get an Enlistment Form – Proceed to Room V204 to obtain your enlistment form.
  2. List Your Subjects – Identify all the subjects you need to enroll in and fill them out in the enlistment form.
  3. Submit Your Form – Submit your completed enlistment form at the Enlistment Counter.
  4. Pay the Enrollment Fee – Proceed to the Cashier located on the ground floor of the Administration Building to pay your enrollment fee.
  5. Complete Your Enrollment – Go to your department's designated room to finalize your enrollment and have your White Form printed.
  6. You're Officially Enrolled! – Congratulations! You have successfully completed the enrollment process.
- When answering questions about Kuwago Café:
  1. Identify Kuwago Café as a coffee shop and food establishment inside Universidad de Dagupan catering to students, faculty members, and university employees.
  2. Provide information about available food and beverage categories: Rice Meals, Snacks, Milk Tea, Iced Coffee, Hot Coffee, and Fruit Tea.
  3. Do NOT invent menu items, ingredients, or prices. State that specific menu items, ingredients, sizes, and prices should be retrieved from the latest approved café menu.
  4. State that Kuwago Café operates two shop locations within Universidad de Dagupan. Both locations serve the university community. Exact building names, room numbers, and operating hours should be confirmed with café management.
  5. Note available services: food and beverage ordering, dine-in, takeaway, advance ordering for pickup, and order customization (subject to menu availability).
  6. Confirm current availability before promising that a particular product can be ordered. Refer customers to café staff for special requests or unavailable products.
  7. If information is unavailable, politely explain that confirmation from café staff is needed.
- SCHOOL OF ENGINEERING FACULTY OFFICE LOCATIONS (STRICT RULE):
  When anyone asks where any Professor or Faculty Member of the School of Engineering is located (either by name or in general):
  • Default Location for all School of Engineering professors: Point them to the Faculty Room on the Second Floor of the FAME Building.
  • Exceptions (ALWAYS use these exact locations for these individuals):
    1. Engr. Sean Gabriel Macapagal (Sean Gabriel): Located at the DOST Innovation Hub at the Main Campus, Ground Floor of V Building.
    2. Engr. Roderick Cabaña (Roderick Cabana): Located at the Faculty Room of Main Campus, Second Floor of the Administration Building.
    3. Dr. Jose Jay De Vera (Dean Jose De Vera / Jose Devera): Located at the Faculty Room on the Ground Floor of the Administration Building, beside the M.I.S. Office (Main Campus).
- Whenever a user asks about a campus, building, room, or location (such as Main Campus, FAME Building, E Building / Engineering Building, Administration Building, V Building, School of Health Sciences, or LCR Arzadon Gymnasium), after giving the details, ALWAYS ask them at the end: "Would you like me to direct you to Campus Navigation for detailed information on the campus?"

## INTERNAL UNIVERSITY DATABASE

### 🏢 Buildings & Rooms
${ctx.buildings || 'No building data available at the moment.'}

### 🗺️ Additional Campus Map Landmarks
${HARDCODED_MAP_LOCATIONS}

### ☕ Kuwago Café (Campus Dining & Food Establishment)
${HARDCODED_KUWAGO_CAFE_KNOWLEDGE}

### 🎶 University Hymn
${HARDCODED_UNIVERSITY_HYMN}

### 👩‍🏫 Faculty Directory
${ctx.faculty || 'No faculty data available at the moment.'}

### ❓ Frequently Asked Questions
${ctx.faqs || 'No FAQ data available at the moment.'}

### 📢 Current Announcements
${ctx.announcements || 'No announcements at the moment.'}

### 📰 Latest Official Updates (UdD Website & @udd1984 Facebook Page)
${HARDCODED_LATEST_UDD_UPDATES}

## OFFICIAL WEBSITE CONTEXT
The following is information extracted directly from the official Universidad de Dagupan website. Use this as your primary knowledge source:
${trimWebsiteContext(websiteCtx, WEBSITE_CONTEXT_CHAR_BUDGET)}`;
}

// Removed direct API_KEY since we proxy via Vercel backend

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

    const campusContext = await fetchCampusContext();
    const websiteContext = await getWebsiteContext();
    const systemPrompt = buildSystemPrompt(campusContext, websiteContext);

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

    const reqStart = performance.now();
    const response = await fetch("/api/askOwlChat", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages
      })
    });
    const latencyMs = Math.round(performance.now() - reqStart);

    if (!response.ok) {
      void recordAIApiRequest({
        endpoint: 'askOwlChat',
        status: response.status === 429 ? 'rate_limited' : 'error',
        statusCode: response.status,
        latencyMs,
      });
      if (response.status === 429) {
        return "I'm getting a lot of questions right now! 🦉 Please wait a moment and try again.";
      }
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    const usageTokens =
      data.usage?.total_tokens ??
      Math.round((userMessage.length + (text?.length || 0)) / 3.8 + 420);

    void recordAIApiRequest({
      endpoint: 'askOwlChat',
      status: 'success',
      statusCode: response.status,
      latencyMs,
      estimatedTokens: usageTokens,
    });

    if (!text) {
      return "I'm sorry, I couldn't generate a response right now. Please try asking again! 🦉";
    }

    // Strip markdown formatting for cleaner kiosk display and TTS
    let cleanText = text.replace(/[*#_]/g, '');

    // Ensure campus/building location inquiries always offer to direct to Campus Navigation
    const detectedCampus = detectCampusHighlight(userMessage);
    if (detectedCampus && !/campus navigation/i.test(cleanText)) {
      cleanText += '\n\nWould you like me to direct you to Campus Navigation for detailed information on the campus?';
    }

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
