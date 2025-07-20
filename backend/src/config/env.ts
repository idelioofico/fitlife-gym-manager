import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const env = {
  // Server Configuration
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fitlife-gym-manager-secret-key-2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  
  // Feature flags
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false',
  ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key] && !env[key as keyof typeof env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  return true;
};

// Log environment info
if (env.NODE_ENV === 'development' && env.ENABLE_LOGGING) {
  console.log('🚀 Backend Environment Configuration:', {
    PORT: env.PORT,
    NODE_ENV: env.NODE_ENV,
    DATABASE_URL: env.DATABASE_URL ? '✅ Configured' : '❌ Missing',
    JWT_SECRET: env.JWT_SECRET ? '✅ Configured' : '❌ Missing',
    FRONTEND_URL: env.FRONTEND_URL,
    ALLOWED_ORIGINS: env.ALLOWED_ORIGINS,
  });
} 