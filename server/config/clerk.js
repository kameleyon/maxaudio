import { Clerk } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables if not already loaded
dotenv.config({ path: join(__dirname, '../..', '.env') });

if (!process.env.CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is not set. Checking environment variables loaded:', {
    clerkSecret: process.env.CLERK_SECRET_KEY ? '✓' : '✗',
    envPath: join(__dirname, '../..', '.env')
  });
  throw new Error('CLERK_SECRET_KEY environment variable is not set');
}

// Initialize Clerk with the secret key
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export default clerk;
