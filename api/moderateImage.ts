import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageBase64, mimeType, itemName, description } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured. Bypassing image moderation.");
    return res.status(200).json({ passed: true, reason: null });
  }

  if (!imageBase64) {
    return res.status(400).json({ passed: false, reason: "No image provided." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a STRICT AI image moderator for a university kiosk's "Lost and Found" system.
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
}`
            },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg"
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const resultText = response.text || "{}";
    const result = JSON.parse(resultText);

    return res.status(200).json({
      passed: result.passed ?? true,
      reason: result.reason ?? null
    });
  } catch (error: any) {
    console.error('Image Moderation Error:', error);
    // Return the error so the frontend knows it failed, rather than blindly allowing it
    return res.status(200).json({ 
      passed: false, 
      reason: "AI Image verification failed due to a server error or invalid API key. Please check the logs. Error: " + (error.message || error)
    });
  }
}
