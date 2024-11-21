import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupTestEnvironment() {
  try {
    console.log('Setting up test environment...');

    // Create test directories
    const dirs = ['server/uploads', 'server/temp', 'server/audios'];
    dirs.forEach(dir => {
      const fullPath = path.join(dirname(__dirname), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });

    // Update test environment variables
    const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Client URLs
CLIENT_URL=http://localhost:5173
PRODUCTION_CLIENT_URL=http://localhost:5173

# Database Configuration (using in-memory MongoDB)
DATABASE_URL=
DATABASE_NAME=audiomax

# JWT Configuration
JWT_SECRET=4dfec1514bfb9cd677dcb30e161f98788250572ace0f4c654be0b93cdda87d7ac04de5c94c89b94649867cf8e27d7e947238e43044bafe5e457a56a9060a4a42

# Email Configuration (using Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=26253160108c29
SMTP_PASS=********0912
SMTP_FROM_EMAIL=noreply@audiomax.com
SMTP_FROM_NAME=AudioMax Dev

# PlayHT Configuration
PLAYHT_SECRET_KEY=your_playht_secret_key_here
PLAYHT_USER_ID=your_playht_user_id_here

# Test Mode Settings
MOCK_VOICE_SERVICE=true
USE_IN_MEMORY_CACHE=true
MOCK_STORAGE=true
DISABLE_RATE_LIMITING=true

# Admin Test Account
ADMIN_EMAIL=admin@audiomax.com
ADMIN_PASSWORD=admin123

# Feature Flags
ENABLE_VOICE_CLONING=true
ENABLE_CUSTOM_VOICES=true
ENABLE_ANALYTICS=false
ENABLE_PUSH_NOTIFICATIONS=false`;

    fs.writeFileSync(path.join(dirname(__dirname), 'server/.env'), envContent);
    console.log('Updated environment variables');

    console.log('\n=== Test Environment Ready ===');
    console.log('To start testing:');
    console.log('1. In one terminal run: cd server && npm run dev');
    console.log('2. In another terminal run: npm run dev');
    console.log('\nAdmin Access:');
    console.log('URL: http://localhost:5173/admin');
    console.log('Email: admin@audiomax.com');
    console.log('Password: admin123');
    console.log('\nFeatures ready for testing:');
    console.log('- Studio (with mock voice service)');
    console.log('- File Manager (with local storage)');
    console.log('- Admin Dashboard');
    console.log('- User Management');
    console.log('\nNote: All services are mocked for testing.');
    console.log('=========================\n');

  } catch (error) {
    console.error('Error setting up test environment:', error);
    process.exit(1);
  }
}

// Run setup
setupTestEnvironment().catch(console.error);