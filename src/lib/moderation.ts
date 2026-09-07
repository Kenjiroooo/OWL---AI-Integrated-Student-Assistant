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
}

// API_KEY is now managed by the backend proxy

// ── Client-Side Heuristic Fallback ───────────────────────────────────────────
// Used if the AI API is unreachable or times out, ensuring the kiosk is never defenseless.
const PROFANITY_REGEX = /\b(tangina|putangina|tarantado|gago|ulol|bobo|kupal|puta|leche|fuck|shit|bitch|asshole|bastard|dick|pussy|pakshet|tite|puke|kantot)\b/i;
const TROLL_ITEMS = [
  'girlfriend', 'boyfriend', 'jowa', 'sanity', 'buhay', 'life', 'grades', 'diploma',
  'virginity', 'kaluluwa', 'soul', 'heart', 'alien', 'ufo', 'ghost', 'dignity', 'will to live',
  '1000000', 'million', 'billion', 'trillion', 'drugs', 'weed', 'shabu'
];
const GIBBERISH_REGEX = /(.)\1{4,}|(asdf|qwerty|zxcv|123456)/i;

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

    const response = await fetch('/api/moderateContent', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: userContent,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('AI moderation request failed with status:', response.status);
      return fastCheck;
    }

    const data = await response.json();

    return {
      passed: Boolean(data.passed),
      category: data.category || (data.passed ? 'clean' : 'troll'),
      reason: data.reason || (data.passed ? undefined : 'This submission does not meet university guidelines.'),
    };
  } catch (error) {
    console.warn('AI moderation encountered an error, using heuristic fallback:', error);
    return fastCheck;
  }
}
