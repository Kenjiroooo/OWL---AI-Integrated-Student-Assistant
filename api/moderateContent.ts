export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { itemName, location, description, type } = req.body;
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
            role: "system",
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
}`
          },
          { 
            role: "user", 
            content: `Please moderate this ${type} report:
Item Name: "${itemName}"
Location: "${location}"
Description: "${description}"` 
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error('Moderation API failed', await response.text());
      // Fail open if the API is down so users can still post
      return res.status(200).json({ passed: true, reason: null });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(resultText);

    return res.status(200).json({
      passed: result.passed ?? true,
      reason: result.reason ?? null
    });
  } catch (error) {
    console.error('Moderation Error:', error);
    // Fail open
    return res.status(200).json({ passed: true, reason: null });
  }
}
