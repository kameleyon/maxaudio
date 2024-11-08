interface ApiEndpoints {
  audio: {
    generate: string;
    save: string;
  };
}

interface Config {
  apiUrl: string;
  endpoints: ApiEndpoints;
}

// Get the base URL for API endpoints
const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    // In production, use Netlify Functions
    return '/.netlify/functions';
  }
  // In development, use local server
  return '/api';
};

const BASE_URL = getBaseUrl();

export const config: Config = {
  apiUrl: BASE_URL,
  endpoints: {
    audio: {
      generate: `${BASE_URL}/generate-audio`,
      save: `${BASE_URL}/save-audio`
    }
  }
};
