const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const subscriptionSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'past_due', 'canceled', 'trialing'],
    default: 'inactive'
  },
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: Date,
  endDate: Date,
  features: {
    maxStorage: {
      type: Number,
      default: 104857600 // 100MB in bytes
    },
    maxRequests: {
      type: Number,
      default: 100
    },
    maxAudioLength: {
      type: Number,
      default: 60 // 1 minute in seconds
    },
    voiceCloning: {
      type: Boolean,
      default: false
    },
    customVoices: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Boolean,
      default: false
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      usage: {
        type: Boolean,
        default: true
      },
      updates: {
        type: Boolean,
        default: true
      }
    }
  },
  usage: {
    storage: {
      type: Number,
      default: 0
    },
    requests: {
      type: Number,
      default: 0
    },
    audioGenerated: {
      type: Number,
      default: 0
    },
    lastRequest: Date
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => new Map()
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ stripeCustomerId: 1 }, { sparse: true });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'subscription.planId': 1 });
userSchema.index({ createdAt: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasFeature = function(feature) {
  return this.subscription?.features?.[feature] || false;
};

userSchema.methods.isSubscribed = function() {
  return this.subscription?.status === 'active' || this.subscription?.status === 'trialing';
};

userSchema.methods.canAccess = function(feature) {
  if (this.role === 'admin') return true;
  return this.isSubscribed() && this.hasFeature(feature);
};

userSchema.methods.withinUsageLimits = function() {
  if (this.role === 'admin') return true;
  if (!this.subscription?.features) return false;

  return (
    this.usage.storage <= this.subscription.features.maxStorage &&
    this.usage.requests <= this.subscription.features.maxRequests
  );
};

userSchema.methods.updateUsage = async function(type, amount) {
  this.usage[type] += amount;
  this.usage.lastRequest = new Date();
  await this.save();
};

// Statics
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

userSchema.statics.findByStripeCustomerId = function(stripeCustomerId) {
  return this.findOne({ stripeCustomerId });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
