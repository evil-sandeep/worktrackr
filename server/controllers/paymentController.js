const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('[PAYMENT] Razorpay initialized successfully.');
  } else {
    console.warn('[PAYMENT] Razorpay keys missing in .env. Payment features will be disabled.');
  }
} catch (error) {
  console.error('[PAYMENT] Razorpay initialization failed:', error.message);
}

// @desc    Create a new order
// @route   POST /api/payment/order
// @access  Private
const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay gateway is not configured on the server. Please check environment variables.' });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay gateway is not configured on the server.' });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      type, // 'license_activation' or 'other'
      orgId 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified
      
      // If this was for a license activation, update the user/org
      if (type === 'license_activation' && orgId) {
        const { getTenantDb } = require('../config/tenantConnection');
        const { getTenantModels } = require('../models/tenantModels');
        
        // 1. Find the admin in Main DB
        const admin = await User.findById(orgId);
        if (admin) {
           admin.isPaid = true;
           await admin.save();
           
           // 2. If they have a tenant DB, we might want to update something there too?
           // For now, the 'isPaid' status on the OrgAdmin in Main DB is the source of truth.
        }
      }

      res.status(200).json({
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
