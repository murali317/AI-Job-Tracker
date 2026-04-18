require('dotenv').config();
const Groq = require('groq-sdk');
async function test() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const resp = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Return JSON: {"greeting":"hello"}' }],
      response_format: { type: 'json_object' },
      max_tokens: 64,
      temperature: 0.3
    });
    console.log('SUCCESS:', resp.choices[0].message.content);
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}
test();