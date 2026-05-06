const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

let razorpay;
try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isConfigured = keyId && 
                       keySecret && 
                       !keyId.includes('YOUR_KEY_ID') && 
                       !keySecret.includes('YOUR_KEY_SECRET');

  if (isConfigured) {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[PAYMENT] Razorpay initialized successfully.');
  } else {
    console.warn('[PAYMENT] Razorpay keys missing or using placeholders in .env. Payment features will be disabled.');
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
      console.error('[PAYMENT] createOrder failed: Razorpay not configured.');
      return res.status(500).json({ 
        message: 'Razorpay gateway is not configured on the server. Please check your .env file for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' 
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    console.log(`[PAYMENT] Creating Razorpay order with options:`, JSON.stringify(options));
    const order = await razorpay.orders.create(options);

    if (!order) {
      console.error('[PAYMENT] Razorpay API returned null/undefined order');
      throw new Error('Razorpay API returned an empty order object');
    }

    console.log(`[PAYMENT] Razorpay order created successfully: ${order.id}`);
    res.status(200).json(order);
  } catch (error) {
    console.error('[PAYMENT] Razorpay Order Error Detail:', error);
    
    // Razorpay error response usually has error.error.description
    const errorMsg = error.error?.description || error.description || error.message || 'Failed to create payment order';
    
    res.status(500).json({ 
      message: errorMsg,
      error: error
    });
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
      type, // 'license_activation' or 'employee_activation'
      orgId,
      targetId // The specific user/org ID being activated
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
        // Try finding the admin by their User ID first
        let admin = await User.findById(orgId);
        
        // If not found or not an admin, try finding the org admin user by their organizationId
        if (!admin || (admin.role !== 'orgadmin' && admin.role !== 'admin')) {
           admin = await User.findOne({ 
             organizationId: orgId, 
             role: { $in: ['orgadmin', 'admin'] }
           });
        }

        if (admin) {
           admin.isPaid = true;
           await admin.save();
           console.log(`[PAYMENT] Organization admin ${admin.name} (ID: ${admin._id}) marked as PAID.`);
        } else {
           console.warn(`[PAYMENT] Could not resolve organization admin for license activation with ID ${orgId}.`);
        }
      }

      // If this was for an individual employee activation
      if (type === 'employee_activation' && targetId && orgId) {
        const { getTenantDb } = require('../config/tenantConnection');
        const { getTenantModels } = require('../models/tenantModels');
        
        // 1. Try to update in Main DB first (in case it's a global identity)
        const mainEmployee = await User.findById(targetId);
        if (mainEmployee) {
          mainEmployee.isPaid = true;
          await mainEmployee.save();
          console.log(`[PAYMENT] Employee ${mainEmployee.name} (ID: ${targetId}) found in MAIN DB and marked as PAID.`);
        }

        // 2. Resolve the organization's database name
        // Try finding the admin by their User ID first
        let admin = await User.findById(orgId).select('dbName name');
        
        // If not found or no dbName, try finding the org admin user by their organizationId
        if (!admin || !admin.dbName) {
           admin = await User.findOne({ 
             organizationId: orgId, 
             role: { $in: ['orgadmin', 'admin'] }
           }).select('dbName name');
        }

        if (admin && admin.dbName) {
          try {
            console.log(`[PAYMENT] Accessing Tenant DB: ${admin.dbName} for employee activation...`);
            const connection = await getTenantDb(admin.dbName);
            const { User: TenantUser } = getTenantModels(connection);
            
            const tenantEmployee = await TenantUser.findById(targetId);
            if (tenantEmployee) {
              tenantEmployee.isPaid = true;
              await tenantEmployee.save();
              console.log(`[PAYMENT] Employee ${tenantEmployee.name} (ID: ${targetId}) found in TENANT DB (${admin.dbName}) and marked as PAID.`);
            } else if (!mainEmployee) {
              console.warn(`[PAYMENT] Employee ID ${targetId} not found in Tenant DB or Main DB.`);
            }
          } catch (dbError) {
            console.error(`[PAYMENT] Error accessing tenant DB ${admin.dbName}:`, dbError.message);
          }
        } else if (!mainEmployee) {
          console.warn(`[PAYMENT] Could not resolve tenant database for Org/Admin ID ${orgId}.`);
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
