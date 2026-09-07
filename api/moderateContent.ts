export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text } = req.body;
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
            content: `You are an AI safety moderator for a university kiosk.
Analyze the following text for:
1. Profanity, hate speech, or harassment
2. Spam or gibberish (e.g., "asdasdasd")
3. Jokes or obviously fake reports (e.g., "I lost my mind")
4. Inappropriate or non-academic content

Respond EXACTLY in this JSON format:
{
  "passed": boolean,
  "reason": "String explaining why it failed, or null if it passed"
}`
          },
          { role: "user", content: `Moderate this text: "${text}"` }
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
