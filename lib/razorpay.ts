// In your lib/razorpay.ts file
import Razorpay from 'razorpay';

export function CreateRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys are missing. Please check your environment variables.');
  }
  
  return new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
}