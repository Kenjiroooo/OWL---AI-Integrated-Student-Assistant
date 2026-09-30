export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { comment, facultyName } = req.body;

  // If no comment provided, it's optional so pass it through
  if (!comment || !comment.trim()) {
    return res.status(200).json({ passed: true, reason: null });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
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
}`
          },
          {
            role: 'user',
            content: `Please moderate this faculty evaluation comment for professor "${facultyName || 'Unknown'}":\n\nComment: "${comment}"`
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      console.error('Evaluation Moderation API failed', await response.text());
      // Fail open if the API is down so users can still submit
      return res.status(200).json({ passed: true, reason: null });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || '{}';
    const result = JSON.parse(resultText);

    return res.status(200).json({
      passed: result.passed ?? true,
      reason: result.reason ?? null
    });
  } catch (error) {
    console.error('Evaluation Moderation Error:', error);
    // Fail open
    return res.status(200).json({ passed: true, reason: null });
  }
}
