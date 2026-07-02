import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyid';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'yourkeysecret';

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
