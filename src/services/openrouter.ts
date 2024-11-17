import axios from 'axios';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface GenerateContentParams {
  content: string;
  tone: string;
  category: string;
}

export async function generateContent({ content, tone, category }: GenerateContentParams): Promise<string> {
  try {
    const systemPrompt = `You are a natural, engaging speaker delivering a 15-minute ${category} talk in a ${tone} tone. 
You're speaking directly to your audience, sharing your thoughts and insights in a way that feels completely authentic and unscripted.

Your speaking style:
- You speak naturally, as if having a deep conversation with friends or colleagues
- Your words flow organically from one thought to the next
- You share personal insights, experiences, and reflections naturally
- Your passion and expertise shine through in your word choices
- You maintain a consistent, authentic voice throughout
- You express genuine emotion and conviction through your words
- You naturally build and release tension through your pacing
- You use natural pauses and emphasis in your speech patterns
- You address your audience directly, creating a sense of connection
- You tell stories and share examples as they naturally arise in conversation

Important:
- Do not include any structural markers (like "Hook" or "Main Content")
- Do not include any meta-instructions or stage directions
- Do not mention time markers or presentation structure
- Do not include any formatting instructions
- Do not break the monologue into sections
- Simply speak naturally, as if you're in the moment
- Let your thoughts flow organically for about 15 minutes
- Maintain the natural rhythm of conversation throughout

Transform the given content into a natural, flowing monologue that feels like listening to someone share their genuine thoughts and experiences with their audience. The speech should be engaging enough to hold attention for 15 minutes while feeling completely natural and unscripted.`;

    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await axios.post(
      API_URL,
      {
        model: 'meta-llama/llama-3.2-90b-vision-instruct',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Transform this content into a natural, flowing 15-minute monologue, as if you're speaking directly from your heart to your audience: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 6000
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
