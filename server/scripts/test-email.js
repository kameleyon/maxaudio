const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const emailService = require('../services/email.service');

// Test email configuration
async function testEmailConfig() {
  console.log('\n🔍 Testing Email Configuration...\n');

  // Check required environment variables
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'FRONTEND_URL'
  ];

  console.log('Environment variables loaded:');
  requiredVars.forEach(varName => {
    console.log(`${varName}: ${process.env[varName] ? '✅ Set' : '❌ Missing'}`);
  });

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  console.log('\n✅ All required environment variables are set');

  // Test email sending
  const testEmail = process.argv[2];
  if (!testEmail) {
    console.error('\n❌ Please provide a test email address:');
    console.log('   node scripts/test-email.js your-email@example.com\n');
    process.exit(1);
  }

  try {
    console.log('\n📧 Sending test verification email...');
    await emailService.sendVerificationEmail(testEmail);
    console.log('✅ Verification email sent successfully');

    console.log('\n📧 Sending test password reset email...');
    await emailService.sendPasswordResetEmail(testEmail);
    console.log('✅ Password reset email sent successfully');

    console.log('\n✨ All email tests passed successfully!\n');
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testEmailConfig().catch(console.error);
