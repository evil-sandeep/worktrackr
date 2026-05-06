import { useCallback } from 'react';
import paymentService from '../services/paymentService';
import { useUI } from '../context/UIContext';

const useRazorpay = () => {
  const { addToast, showLoader } = useUI();

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initPayment = useCallback(async ({ 
    amount, 
    orgName, 
    userName, 
    userEmail, 
    userPhone,
    onSuccess,
    type = 'license_activation',
    orgId,
    targetId
  }) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      addToast('Razorpay SDK failed to load. Are you online?', 'error');
      return;
    }

    try {
      showLoader(true);
      console.log(`[PAYMENT] Initiating order for ${amount}...`);
      
      // 1. Create order on server
      const order = await paymentService.createOrder(amount, `rcpt_${Date.now()}`);
      console.log(`[PAYMENT] Order created: ${order.id}`);
      showLoader(false);

      if (!import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID.includes('YOUR_KEY_ID')) {
        addToast('Razorpay Key ID is not configured in client .env', 'error');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "WorkTrackr SaaS",
        description: `License Activation for ${orgName}`,
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async (response) => {
          try {
            showLoader(true);
            console.log('[PAYMENT] Signature received, verifying...');
            const verification = await paymentService.verifyPayment({
              ...response,
              type,
              orgId,
              targetId
            });
            
            addToast('Payment successful and verified!', 'success');
            if (onSuccess) onSuccess(verification);
          } catch (error) {
            console.error('[PAYMENT] Verification Error:', error);
            addToast(error.response?.data?.message || 'Payment verification failed', 'error');
          } finally {
            showLoader(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        notes: {
          orgId: orgId
        },
        theme: {
          color: "#0078D4",
        },
      };

      const paymentObject = new window.Razorpay(options);
      console.log('[PAYMENT] Opening Razorpay modal...');
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response) {
        console.error('[PAYMENT] Failed:', response.error);
        addToast(response.error.description, 'error');
      });

    } catch (error) {
      showLoader(false);
      console.error('[PAYMENT] Error:', error);
      addToast(error.response?.data?.message || 'Failed to initiate payment', 'error');
    }
  }, [addToast, showLoader]);

  return { initPayment };
};

export default useRazorpay;
