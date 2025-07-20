// Environment configuration for the frontend
export const env = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Hefel Gym Manager',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Development settings
  DEV_PORT: import.meta.env.VITE_DEV_PORT || 8080,
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  
  // Feature flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
};

// Validate required environment variables
const requiredEnvVars = ['VITE_API_URL'];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using default values. Consider creating a .env file.');
  }
  
  return missing.length === 0;
};

// Log environment info in development
if (env.NODE_ENV === 'development') {
  console.log('🌍 Environment Configuration:', {
    API_URL: env.API_URL,
    APP_NAME: env.APP_NAME,
    NODE_ENV: env.NODE_ENV,
  });
} 