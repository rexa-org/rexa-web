const isDevelopment = import.meta.env.DEV;

export const CONFIG = {
    API_URL: isDevelopment 
        ? 'http://localhost:5005/api'                    // Local development
        : 'https://rex-api-two.vercel.app/api',         // Production
    APP_NAME: 'reXa • Reward Exchange',
    TOKEN_KEY: 'rex_token',
}; 