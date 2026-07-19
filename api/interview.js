export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Only POST requests allowed' });
  }

  const { role, description } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable on Vercel.' });
  }

  const prompt = `You are a professional hiring manager. Generate exactly 5 interview questions for a ${role} position based on these details: ${description}. Return the output strictly as a raw JSON object with a single key "questions" containing an array of strings. Do not include markdown code blocks.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json(JSON.parse(textResponse));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to communicate with AI' });
  }
}
