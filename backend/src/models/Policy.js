const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const policySchema = new mongoose.Schema({
  policyNumber: { type: String, unique: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },

  // Plan Details
  planType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  planName: { type: String },

  // Coverage
  coverageAmount: { type: Number, required: true }, // max payout per week in INR
  weeklyPremium: { type: Number, required: true },
  deductible: { type: Number, default: 0 },

  // Coverage Triggers
  coverageTriggers: [{
    type: {
      type: String,
      enum: [
        'weather',
        'pollution',
        'flood',
        'curfew',
        'strike',
        'platform_outage',
        'extreme_heat',
        'heavy_rain',
        'severe_pollution',
        'cyclone',
        'hailstorm',
        'dense_fog',
        'cold_wave'
      ]
    },
    threshold: mongoose.Schema.Types.Mixed,
    description: String,
    maxPayoutPercent: Number
  }],

  // Period
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  renewalDate: { type: Date },

  // Status
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended', 'pending_payment'],
    default: 'active'
  },

  // Financial
  totalPremiumPaid: { type: Number, default: 0 },
  totalClaimsPaid: { type: Number, default: 0 },
  claimCount: { type: Number, default: 0 },

  // Risk at policy creation
  riskScoreAtCreation: { type: Number },
  city: { type: String },
  platform: { type: String },
  deliverySegment: { type: String },

  // Auto-renewal
  autoRenew: { type: Boolean, default: true },
  renewalDiscount: { type: Number, default: 0 },

  // Premium breakdown
  premiumBreakdown: {
    basePremium: Number,
    riskLoading: Number,
    cityAdjustment: Number,
    platformAdjustment: Number,
    loyaltyDiscount: Number,
    referralDiscount: Number,
    finalPremium: Number
  },

  paymentHistory: [{
    amount: Number,
    paidAt: Date,
    transactionId: String,
    method: String,
    weekNumber: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Auto-generate policy number
policySchema.pre('save', function(next) {
  if (!this.policyNumber) {
    const year = new Date().getFullYear();
    const uid = uuidv4().split('-')[0].toUpperCase();
    this.policyNumber = `GS-${year}-${uid}`;
  }
  next();
});

policySchema.index({ workerId: 1, status: 1 });
policySchema.index({ policyNumber: 1 });
policySchema.index({ endDate: 1, status: 1 });

module.exports = mongoose.model('Policy', policySchema);
