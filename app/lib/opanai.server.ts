import OpenAI from 'openai';

import rawPrompt from '../prompt/parser.md?raw';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey,
});

const model = 'gpt-5.5';
const maxTokens = 16000;

export async function parseTransactions(content: string) {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: rawPrompt,
      },
      {
        role: 'user',
        content,
      },
    ],
    max_completion_tokens: maxTokens,
  });

  return response.choices[0].message.content;
}
