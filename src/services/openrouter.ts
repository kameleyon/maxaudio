import axios from 'axios';

const OPENROUTER_API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateContentParams {
  content: string;
  tone: string;
  category: string;
}

export async function generateContent({ content, tone, category }: GenerateContentParams): Promise<string> {
  try {
    const systemPrompt = `You are an expert content creator specializing in ${category} content with a ${tone} tone.
Your task is to expand and enhance the given content into a 12-15 minute presentation (approximately 1800-2250 words).

Guidelines for expansion:
1. Develop the core message through:
   - Relevant stories and examples
   - Real-world applications
   - Detailed explanations of key concepts
   - Thought-provoking questions
   - Supporting evidence or research

2. Structure for optimal flow:
   - Start with a compelling hook
   - Build ideas progressively
   - Create natural transitions between topics
   - End with a powerful conclusion

3. Maintain ${tone} tone while being engaging:
   - Professional: Clear, authoritative, yet accessible
   - Casual: Conversational and relatable
   - Educational: Informative but engaging
   - Inspirational: Uplifting and motivational

4. Use natural language patterns:
   - Vary sentence length and structure
   - Include rhetorical questions
   - Create natural pauses through sentence structure
   - Use descriptive language to paint pictures

5. Expand through these techniques:
   - Deep dive into key points
   - Connect ideas to broader themes
   - Share multiple perspectives
   - Provide practical applications
   - Include relevant analogies

Transform the content into an engaging, in-depth presentation while maintaining its core message and purpose.`;

    const response = await axios.post(
      API_URL,
      {
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please expand this content into a 12-15 minute presentation, using natural language and flow: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4096
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://stackblitz.com',
          'X-Title': 'AUDIOMAX Studio',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}
