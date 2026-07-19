export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { role, description } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable on Vercel.' });
  }

  const prompt = `You are a professional hiring manager. Generate exactly 5 interview questions for a ${role} position based on these details: ${description}. Return the output strictly as a raw JSON object with a single key "questions" containing an array of strings. Do not include markdown code blocks.`;

  try {
    // Call the Groq OpenAI-compatible endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const textResponse = data.choices[0].message.content;
    
    return res.status(200).json(JSON.parse(textResponse));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to communicate with Groq AI' });
  }
}
