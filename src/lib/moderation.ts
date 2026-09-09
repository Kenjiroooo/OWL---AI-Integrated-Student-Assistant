/**
 * moderation.ts
 *
 * Automated Content Moderation & Verification Service for OWL Kiosk System.
 * Evaluates student-submitted reports (such as Lost & Found) using DeepSeek AI
 * to automatically prevent trolls, jokes, profanity, and spam from reaching public boards.
 */

export interface ModerationResult {
  passed: boolean;
  reason?: string;
  category: 'clean' | 'troll' | 'profanity' | 'spam' | 'inappropriate';
}

export interface LostFoundSubmission {
  itemName: string;
  location: string;
  description: string;
  type: 'lost' | 'found';
  imageBase64?: string;
}

// API_KEY is now managed by the backend proxy

// ── Client-Side Heuristic Fallback ───────────────────────────────────────────
// Used if the AI API is unreachable or times out, ensuring the kiosk is never defenseless.
const PROFANITY_REGEX = /\b(tangina|putangina|tarantado|gago|ulol|bobo|kupal|puta|leche|fuck|shit|bitch|asshole|bastard|dick|pussy|pakshet|tite|puke|kantot)\b/i;
const TROLL_ITEMS = [
  'girlfriend', 'boyfriend', 'jowa', 'sanity', 'buhay', 'life', 'grades', 'diploma',
  'virginity', 'kaluluwa', 'soul', 'heart', 'alien', 'ufo', 'ghost', 'dignity', 'will to live',
  '1000000', 'million', 'billion', 'trillion', 'drugs', 'weed', 'shabu',
  'puso', 'feelings', 'crush', 'pag-ibig', 'utak', 'brain'
];
const GIBBERISH_REGEX = /(.)\1{3,}|(asdf|qwerty|zxcv|1234|qwer|zxas|sdas|kdk)/i;

function clientSideHeuristic(report: LostFoundSubmission): ModerationResult {
  const combined = `${report.itemName} ${report.location} ${report.description}`.toLowerCase();

  // 1. Profanity check
  if (PROFANITY_REGEX.test(combined)) {
    return {
      passed: false,
      category: 'profanity',
      reason: 'Your report contains inappropriate language or profanity. Please use respectful wording.',
    };
  }

  // 2. Troll item check
  for (const item of TROLL_ITEMS) {
    if (report.itemName.toLowerCase().includes(item)) {
      return {
        passed: false,
        category: 'troll',
        reason: `"${report.itemName}" does not appear to be a physical item that can be lost or found on campus.`,
      };
    }
  }

  // 3. Gibberish check
  if (GIBBERISH_REGEX.test(combined) || report.itemName.trim().length < 2) {
    return {
      passed: false,
      category: 'spam',
      reason: 'The item name or description appears to be spam or random characters. Please describe a genuine item.',
    };
  }

  return {
    passed: true,
    category: 'clean',
  };
}

// ── AI Moderation Engine ─────────────────────────────────────────────────────

export async function moderateLostFoundReport(
  report: LostFoundSubmission
): Promise<ModerationResult> {
  // First fast-pass: if obvious profanity or gibberish, reject immediately
  const fastCheck = clientSideHeuristic(report);
  if (!fastCheck.passed) {
    return fastCheck;
  }

  // If proxy is down, it will fall back naturally
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch('/api/moderateContent', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemName: report.itemName,
        location: report.location,
        description: report.description,
        type: report.type,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('AI moderation request failed with status:', response.status);
      return fastCheck;
    }

    const data = await response.json();
    
    const textPassed = Boolean(data.passed);
    const textCategory = data.category || (textPassed ? 'clean' : 'troll');
    const textReason = data.reason || (textPassed ? undefined : 'This submission does not meet university guidelines.');

    if (!textPassed) {
      return { passed: textPassed, category: textCategory, reason: textReason };
    }

    // Second pass: Image Moderation via Gemini (if an image is provided)
    if (report.imageBase64) {
      try {
        const imgRes = await fetch('/api/moderateImage', {
          method: 'POST',
          signal: controller.signal, // Reuse timeout
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: report.imageBase64,
            itemName: report.itemName,
            description: report.description,
          }),
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          if (!imgData.passed) {
            return {
              passed: false,
              category: 'inappropriate', // Troll image or person
              reason: imgData.reason || 'The uploaded image was rejected by AI verification.',
            };
          }
        } else {
          console.warn('Image moderation request failed with status:', imgRes.status);
        }
      } catch (imgError) {
        console.warn('Image moderation encountered an error, falling back to text pass:', imgError);
      }
    }

    return {
      passed: true,
      category: 'clean'
    };
  } catch (error) {
    console.warn('AI moderation encountered an error, using heuristic fallback:', error);
    return fastCheck;
  }
}
