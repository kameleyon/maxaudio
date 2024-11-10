import axios from 'axios';

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

    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await axios.post(
      API_URL,
      {
        // IMPORTANT: Always use Llama 90B - DO NOT CHANGE THIS MODEL
        model: 'meta-llama/llama-3.2-90b-vision-instruct',
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
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
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
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      throw new Error('OpenRouter API key has expired or reached its limit. Please check your API key.');
    }
    throw new Error('Failed to generate content. Please try again.');
  }
}
