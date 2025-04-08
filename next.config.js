/** @type {import('next').NextConfig} */
const config = {
    env: {
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      },
};

module.exports= config;