require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Say hello in JSON format: {"greeting":"hello"}');
    console.log('SUCCESS:', result.response.text());
  } catch (e) {
    console.log('ERROR:', e.message?.substring(0, 300));
  }
}
test();