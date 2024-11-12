const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  invoiceId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['paid', 'open', 'void', 'uncollectible'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: String,
  hostedUrl: String,
  pdfUrl: String,
  subscription: {
    id: String,
    status: String,
    interval: String
  },
  paymentIntent: {
    id: String,
    status: String
  },
  paymentMethod: {
    id: String,
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number
  },
  billingDetails: {
    name: String,
    email: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => new Map()
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
paymentSchema.index({ date: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'subscription.id': 1 });
paymentSchema.index({ 'paymentIntent.id': 1 });
paymentSchema.index({ 'paymentMethod.id': 1 });
paymentSchema.index({ createdAt: -1 });

// Statics
paymentSchema.statics.findByInvoiceId = function(invoiceId) {
  return this.findOne({ invoiceId });
};

paymentSchema.statics.findByUserId = function(userId, options = {}) {
  const query = this.find({ userId });

  if (options.status) {
    query.where('status').equals(options.status);
  }

  if (options.startDate) {
    query.where('date').gte(options.startDate);
  }

  if (options.endDate) {
    query.where('date').lte(options.endDate);
  }

  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ date: -1 });
  }

  if (options.limit) {
    query.limit(options.limit);
  }

  return query;
};

paymentSchema.statics.findBySubscriptionId = function(subscriptionId) {
  return this.find({ 'subscription.id': subscriptionId }).sort({ date: -1 });
};

paymentSchema.statics.findByPaymentIntentId = function(paymentIntentId) {
  return this.findOne({ 'paymentIntent.id': paymentIntentId });
};

paymentSchema.statics.findByPaymentMethodId = function(paymentMethodId) {
  return this.find({ 'paymentMethod.id': paymentMethodId }).sort({ date: -1 });
};

// Methods
paymentSchema.methods.markAsPaid = async function() {
  this.status = 'paid';
  await this.save();
};

paymentSchema.methods.markAsVoid = async function() {
  this.status = 'void';
  await this.save();
};

paymentSchema.methods.markAsUncollectible = async function() {
  this.status = 'uncollectible';
  await this.save();
};

paymentSchema.methods.updatePaymentMethod = async function(paymentMethod) {
  this.paymentMethod = {
    id: paymentMethod.id,
    brand: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    expMonth: paymentMethod.card.exp_month,
    expYear: paymentMethod.card.exp_year
  };
  await this.save();
};

// Virtuals
paymentSchema.virtual('formattedAmount').get(function() {
  return (this.amount / 100).toFixed(2);
});

paymentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

paymentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
