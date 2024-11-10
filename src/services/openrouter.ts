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
Your task is to expand and enhance the given content into a 15-minute presentation (approximately 2250-3000 words).

Guidelines for expansion:
1. Develop the core message through:
   - Detailed stories and examples (at least 2-3 stories)
   - In-depth real-world applications
   - Comprehensive explanations of key concepts
   - Multiple thought-provoking questions
   - Strong supporting evidence and research
   - Extended analogies and metaphors

2. Structure for optimal flow (15-minute format):
   - Compelling hook (1-2 minutes)
   - Main content development (10-11 minutes)
   - Examples and stories (2-3 minutes)
   - Strong conclusion (1-2 minutes)
   - Natural transitions between all sections

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
   - Add emphasis points for key messages

5. Expand through these techniques:
   - Deep dive into each key point (2-3 minutes per point)
   - Connect ideas to broader themes
   - Share multiple perspectives
   - Provide detailed practical applications
   - Include relevant analogies
   - Add supporting statistics or research
   - Incorporate audience engagement points

Transform the content into an engaging, in-depth 15-minute presentation while maintaining its core message and purpose.
Ensure the content is substantial enough for a full 15-minute delivery at a natural speaking pace.`;

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
            content: `Please expand this content into a full 15-minute presentation, ensuring sufficient depth and detail: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 6000  // Increased for longer content
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
