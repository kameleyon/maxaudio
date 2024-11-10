import dotenv from 'dotenv';
import Stripe from 'stripe';
import { subscriptionTiers } from './subscription-tiers.js';

// Load environment variables
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Starting Stripe setup...');

    // Only create products for paid tiers
    const paidTiers = subscriptionTiers.filter(tier => tier.id !== 'free');

    for (const tier of paidTiers) {
      console.log(`\n📦 Creating product for ${tier.name}...`);
      
      // Create the product
      const product = await stripe.products.create({
        name: tier.name,
        description: tier.description,
        metadata: {
          tier_id: tier.id,
          characters_per_month: tier.limits.charactersPerMonth.toString(),
          voice_clones: tier.limits.voiceClones.toString(),
          requests_per_minute: tier.limits.requestsPerMinute.toString(),
          audio_length: tier.limits.audioLength.toString()
        }
      });

      console.log(`✅ Created product: ${product.id}`);

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(tier.monthlyPrice * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          tier_id: tier.id,
          billing_period: 'monthly'
        },
        lookup_key: `${tier.id}_monthly`
      });

      console.log(`💰 Created monthly price: ${monthlyPrice.id}`);

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(tier.yearlyPrice * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          tier_id: tier.id,
          billing_period: 'yearly'
        },
        lookup_key: `${tier.id}_yearly`
      });

      console.log(`💰 Created yearly price: ${yearlyPrice.id}`);

      // Store price IDs for .env
      console.log(`\n🔑 Add these to your .env file:`);
      console.log(`STRIPE_PRICE_ID_${tier.id.toUpperCase()}_MONTHLY=${monthlyPrice.id}`);
      console.log(`STRIPE_PRICE_ID_${tier.id.toUpperCase()}_YEARLY=${yearlyPrice.id}`);
    }

    console.log('\n✨ Stripe setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error setting up Stripe:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('Make sure your STRIPE_SECRET_KEY is correct in .env');
    }
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts();
