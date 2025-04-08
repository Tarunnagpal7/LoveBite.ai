
import React, { useState, useEffect } from 'react';
// Success Notification Component
export const PaymentSuccessUI = ({ message = "Payment Successful" }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed top-20 right-5 flex items-center p-4 rounded-lg shadow-lg bg-green-600 text-white transform transition-all duration-500 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="mr-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7"
              className="animate-check" 
            />
          </svg>
        </div>
      </div>
      <div>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};

// Failure Notification Component
export const PaymentFailureUI = ({ message = "Payment Failed" }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed top-20 right-5 flex items-center p-4 rounded-lg shadow-lg bg-red-600 text-white transform transition-all duration-500 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="mr-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M6 18L18 6M6 6l12 12"
              className="animate-cross" 
            />
          </svg>
        </div>
      </div>
      <div>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};

