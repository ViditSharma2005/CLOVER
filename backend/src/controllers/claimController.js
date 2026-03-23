const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Worker = require('../models/Worker');
const WeatherEvent = require('../models/WeatherEvent');
const Notification = require('../models/Notification');
const { analyzeClaim } = require('../services/fraudService');
const logger = require('../utils/logger');

// POST /api/claims - Submit a claim
exports.submitClaim = async (req, res) => {
  try {
    const { triggerType, disruptionStartDate, disruptionEndDate, description, location, claimAmount } = req.body;
    const worker = req.worker;

    if (!triggerType || !disruptionStartDate) {
      return res.status(400).json({ success: false, message: 'Trigger type and disruption start date are required.' });
    }

    const disruptionStart = new Date(disruptionStartDate);
    if (Number.isNaN(disruptionStart.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid disruption start date.' });
    }

    const disruptionEnd = disruptionEndDate ? new Date(disruptionEndDate) : null;
    if (disruptionEndDate && Number.isNaN(disruptionEnd?.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid disruption end date.' });
    }

    if (disruptionEnd && disruptionEnd < disruptionStart) {
      return res.status(400).json({ success: false, message: 'Disruption end date cannot be before start date.' });
    }

    // Get active policy
    const policy = await Policy.findOne({ workerId: worker._id, status: 'active' });
    if (!policy) return res.status(400).json({ success: false, message: 'No active policy found. Please purchase a policy first.' });

    // Verify trigger is covered
    const coversTrigger = policy.coverageTriggers?.some(ct => ct.type === triggerType);
    if (!coversTrigger) return res.status(400).json({ success: false, message: `Trigger type '${triggerType}' is not covered by your current plan.` });

    // Duplicate prevention in a short claim window.
    const duplicateClaim = await Claim.findOne({
      workerId: worker._id,
      triggerType,
      disruptionStartDate: {
        $gte: new Date(disruptionStart.getTime() - 24 * 60 * 60 * 1000),
        $lte: new Date(disruptionStart.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $nin: ['rejected', 'fraud_flagged'] }
    });
    if (duplicateClaim) {
      return res.status(409).json({
        success: false,
        message: 'A similar claim is already present for this disruption period.',
        claimNumber: duplicateClaim.claimNumber
      });
    }

    // Find relevant verified event around the claimed start window.
    const weatherEvent = await WeatherEvent.findOne({
      city: new RegExp(worker.city, 'i'),
      eventType: triggerType,
      isTriggerMet: true,
      startTime: {
        $gte: new Date(disruptionStart.getTime() - 24 * 60 * 60 * 1000),
        $lte: new Date(disruptionStart.getTime() + 24 * 60 * 60 * 1000)
      }
    }).sort({ startTime: -1 });

    const parametricTriggers = ['extreme_heat', 'heavy_rain', 'flood', 'severe_pollution', 'cyclone', 'dense_fog', 'cold_wave'];
    if (parametricTriggers.includes(triggerType) && !weatherEvent) {
      return res.status(422).json({
        success: false,
        message: 'No verified parametric event found for this city and date window. Please select the correct date or wait for event sync.'
      });
    }

    const coverageTrigger = policy.coverageTriggers.find(ct => ct.type === triggerType);
    const maxPayout = Math.round(policy.coverageAmount * (coverageTrigger?.maxPayoutPercent || 70) / 100);
    const requestedAmount = claimAmount ? Number(claimAmount) : maxPayout;
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Claim amount must be a valid positive number.' });
    }

    const finalClaimAmount = Math.round(Math.min(requestedAmount, maxPayout));

    const claim = await Claim.create({
      workerId: worker._id,
      policyId: policy._id,
      triggerType,
      triggerDescription: description || `Manual claim: ${triggerType}`,
      triggerData: weatherEvent ? {
        weatherCondition: weatherEvent.data.description,
        temperature: weatherEvent.data.temperature,
        rainfall: weatherEvent.data.rainfall,
        windSpeed: weatherEvent.data.windSpeed,
        aqiIndex: weatherEvent.data.aqiIndex,
        sourceApi: weatherEvent.source
      } : {},
      disruptionStartDate: disruptionStart,
      disruptionEndDate: disruptionEnd,
      estimatedLoss: finalClaimAmount * 1.2,
      claimAmount: finalClaimAmount,
      location: {
        city: location?.city || worker.city,
        zone: location?.zone || worker.zone,
        pincode: location?.pincode || worker.pincode,
        latitude: worker.latitude,
        longitude: worker.longitude
      },
      status: 'submitted',
      isAutoTriggered: false,
      payoutMethod: worker.upiId ? 'upi' : 'bank_transfer'
    });

    // Run fraud detection
    const fraudResult = await analyzeClaim(claim, worker, policy, weatherEvent);
    claim.fraudScore = fraudResult.fraudScore;
    claim.fraudFlags = fraudResult.fraudFlags;
    claim.isFraudulent = fraudResult.isFraudulent;

    if (fraudResult.isFraudulent) {
      claim.status = 'fraud_flagged';
      await Worker.findByIdAndUpdate(worker._id, { $inc: { fraudFlags: 1 } });
      await Notification.create({
        workerId: worker._id,
        title: '⚠️ Claim Under Review',
        message: 'Your claim is being reviewed by our fraud detection system. You will be notified within 24 hours.',
        type: 'fraud_alert',
        priority: 'high'
      });
    } else if (fraudResult.recommendation === 'approve') {
      claim.status = 'approved';
      claim.approvedAmount = finalClaimAmount;
      claim.payoutStatus = 'processing';

      // Update policy stats
      await Policy.findByIdAndUpdate(policy._id, {
        $inc: { totalClaimsPaid: finalClaimAmount, claimCount: 1 }
      });

      await Notification.create({
        workerId: worker._id,
        title: '✅ Claim Approved!',
        message: `Your claim of ₹${finalClaimAmount} has been approved and will be processed within 24 hours.`,
        type: 'claim_approved',
        priority: 'high',
        data: { claimId: claim._id, amount: finalClaimAmount }
      });
    } else {
      claim.status = 'under_review';
      await Notification.create({
        workerId: worker._id,
        title: '🔍 Claim Under Manual Review',
        message: `Claim #${claim.claimNumber} is under review. We'll notify you within 48 hours.`,
        type: 'claim_triggered',
        data: { claimId: claim._id }
      });
    }

    await claim.save();

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully.',
      claim,
      fraudAnalysis: { score: fraudResult.fraudScore, recommendation: fraudResult.recommendation }
    });
  } catch (err) {
    logger.error('submitClaim error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/claims - Get all claims for a worker
exports.getMyClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { workerId: req.worker._id };
    if (status) filter.status = status;

    const claims = await Claim.find(filter)
      .populate('policyId', 'policyNumber planType coverageAmount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Claim.countDocuments(filter);

    res.json({ success: true, claims, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/claims/:id
exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, workerId: req.worker._id })
      .populate('policyId');
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });
    res.json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/claims/stats/summary
exports.getClaimStats = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const stats = await Claim.aggregate([
      { $match: { workerId } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$approvedAmount' }
      }}
    ]);

    const totalClaims = await Claim.countDocuments({ workerId });
    const totalPaidOut = await Claim.aggregate([
      { $match: { workerId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
    ]);

    res.json({
      success: true,
      stats,
      totalClaims,
      totalPaidOut: totalPaidOut[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: GET /api/claims/admin/all
exports.getAllClaims = async (req, res) => {
  try {
    const { status, city, triggerType, page = 1, limit = 20, fraudOnly } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (triggerType) filter.triggerType = triggerType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (fraudOnly === 'true') filter.isFraudulent = true;

    const claims = await Claim.find(filter)
      .populate('workerId', 'name phone platform city')
      .populate('policyId', 'policyNumber planType')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Claim.countDocuments(filter);
    res.json({ success: true, claims, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: PATCH /api/claims/:id/review
exports.reviewClaim = async (req, res) => {
  try {
    const { action, reviewNotes, rejectionReason, adjustedAmount } = req.body;
    const claim = await Claim.findById(req.params.id).populate('workerId');
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

    claim.reviewedBy = req.worker._id;
    claim.reviewedAt = new Date();
    claim.reviewNotes = reviewNotes;

    if (action === 'approve') {
      claim.status = 'approved';
      claim.approvedAmount = adjustedAmount || claim.claimAmount;
      claim.payoutStatus = 'processing';
      await Notification.create({
        workerId: claim.workerId._id,
        title: '✅ Claim Approved',
        message: `Claim #${claim.claimNumber} approved. ₹${claim.approvedAmount} will be transferred.`,
        type: 'claim_approved',
        priority: 'high'
      });
    } else if (action === 'reject') {
      claim.status = 'rejected';
      claim.rejectionReason = rejectionReason;
      await Notification.create({
        workerId: claim.workerId._id,
        title: '❌ Claim Rejected',
        message: `Claim #${claim.claimNumber} was rejected. Reason: ${rejectionReason}`,
        type: 'claim_rejected',
        priority: 'medium'
      });
    } else if (action === 'mark_fraud') {
      claim.status = 'fraud_flagged';
      claim.isFraudulent = true;
      await Worker.findByIdAndUpdate(claim.workerId._id, { $inc: { fraudFlags: 1 } });
    }

    await claim.save();
    res.json({ success: true, message: `Claim ${action}d successfully.`, claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/claims/:id/payout - Mark as paid
exports.processPayout = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const claim = await Claim.findById(req.params.id).populate('workerId');
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });
    if (claim.status !== 'approved') return res.status(400).json({ success: false, message: 'Claim must be approved before payout.' });

    claim.status = 'paid';
    claim.payoutStatus = 'completed';
    claim.payoutTransactionId = transactionId || 'UPI-' + Date.now();
    claim.paidAt = new Date();
    await claim.save();

    await Worker.findByIdAndUpdate(claim.workerId._id, { $inc: { totalClaimsCount: 1, loyaltyPoints: 10 } });

    await Notification.create({
      workerId: claim.workerId._id,
      title: '💰 Payout Successful!',
      message: `₹${claim.approvedAmount} has been transferred to your account. Transaction ID: ${claim.payoutTransactionId}`,
      type: 'claim_paid',
      priority: 'high',
      data: { transactionId: claim.payoutTransactionId, amount: claim.approvedAmount }
    });

    res.json({ success: true, message: 'Payout processed.', claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
