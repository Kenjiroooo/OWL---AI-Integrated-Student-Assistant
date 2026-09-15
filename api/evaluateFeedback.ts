export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { category, content } = req.body;

  if (!category || !content) {
    return res.status(400).json({ error: 'Missing category or content' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

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

  const userMessage = `Category: ${category}\nFeedback: ${content}`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek Evaluation Error:', errorText);
      return res.status(response.status).json({ error: 'AI evaluation failed' });
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() || '';

    // Strip potential markdown fences before parsing
    const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let evaluation: Record<string, unknown>;
    try {
      evaluation = JSON.parse(cleanText);
    } catch {
      console.error('Failed to parse AI evaluation JSON:', rawText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Validate and sanitize fields
    const VALID_SENTIMENTS = ['positive', 'neutral', 'negative'];
    const VALID_URGENCIES = ['low', 'medium', 'high', 'critical'];
    const VALID_ACTIONABILITY = ['informational', 'suggestion', 'complaint', 'urgent_issue'];

    const sanitized = {
      sentiment: VALID_SENTIMENTS.includes(evaluation.sentiment as string)
        ? evaluation.sentiment
        : 'neutral',
      urgency: VALID_URGENCIES.includes(evaluation.urgency as string)
        ? evaluation.urgency
        : 'low',
      summary: typeof evaluation.summary === 'string'
        ? (evaluation.summary as string).slice(0, 100)
        : '',
      tags: Array.isArray(evaluation.tags)
        ? (evaluation.tags as string[]).slice(0, 3).map(t => String(t).toLowerCase().slice(0, 30))
        : [],
      actionability: VALID_ACTIONABILITY.includes(evaluation.actionability as string)
        ? evaluation.actionability
        : 'informational',
    };

    return res.status(200).json(sanitized);
  } catch (error) {
    console.error('Evaluate Feedback API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
