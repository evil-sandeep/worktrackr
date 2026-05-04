import { useCallback } from 'react';
import paymentService from '../services/paymentService';
import { useUI } from '../context/UIContext';

const useRazorpay = () => {
  const { addToast, showLoader } = useUI();

  const loadScript = (src) => {
    return new Promise((resolve) => {
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
    orgId
  }) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      addToast('Razorpay SDK failed to load. Are you online?', 'error');
      return;
    }

    try {
      showLoader(true);
      // 1. Create order on server
      const order = await paymentService.createOrder(amount, `org_${orgId}_${Date.now()}`);
      showLoader(false);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "WorkTrackr SaaS",
        description: `License Activation for ${orgName}`,
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async (response) => {
          try {
            showLoader(true);
            // 2. Verify payment on server
            const verification = await paymentService.verifyPayment({
              ...response,
              type,
              orgId
            });
            
            addToast('Payment successful and verified!', 'success');
            if (onSuccess) onSuccess(verification);
          } catch (error) {
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
          address: "WorkTrackr Corporate Office",
          orgId: orgId
        },
        theme: {
          color: "#0078D4",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response) {
        addToast(response.error.description, 'error');
      });

    } catch (error) {
      showLoader(false);
      addToast(error.response?.data?.message || 'Failed to initiate payment', 'error');
    }
  }, [addToast, showLoader]);

  return { initPayment };
};

export default useRazorpay;
