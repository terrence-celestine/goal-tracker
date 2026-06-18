// api/suggest-goals.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const aiClient = getGenAI();
  if (!aiClient) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { categories } = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: 'categories must be a non-empty array' });
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are a goal-setting assistant. Suggest 5 specific, actionable goals for someone interested in: ${categories.join(', ')}.
      Respond ONLY with a JSON array. No markdown, no explanation, no backticks.
      Each item must have "title" and "description" fields.
      Example: [{"title": "Run 5k", "description": "Build up to running a 5k in under 30 minutes"}]
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const goals = JSON.parse(text);
    return res.status(200).json(goals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}