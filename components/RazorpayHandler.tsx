// RazorpayPayment.tsx
"use client";

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  amount: number;
  packageName: string;
  userEmail?: string;
  userName?: string;
  onSuccess?: (packageName : string) => void;
  onFailure?: (error: any) => void;
}

export default function RazorpayPayment({
  isOpen,
  onClose,
  packageId,
  amount,
  packageName,
  userEmail = "",
  userName = "",
  onSuccess,
  onFailure
}: RazorpayPaymentProps) {
  const router = useRouter();

  useEffect(() => {
    // Load Razorpay script when component mounts
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        document.body.appendChild(script);
      });
    };

    const initializePayment = async () => {
      if (!isOpen) return;
      
      try {
        // 1. Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await loadRazorpayScript();
        }
        
        // 2. Create order on your backend
        const orderResponse = await axios.post(`/api/packages/${packageId}/orders`);
        // 3. Initialize Razorpay checkout
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: orderResponse.data.razorpayOrder.amount,
          currency:orderResponse.data.razorpayOrder.currency ,
          name: "LoveBite.ai",
          description: `Payment for ${orderResponse.data.packageName} package`,
          order_id: orderResponse.data.razorpayOrder.id,
          handler: function(response: any) {
            // Handle successful payment
            const razorPaymentId = response.razorpay_payment_id;
            const razorOrderId = response.razorpay_order_id;
            const signature = response.razorpay_signature;
            
            // Verify payment with your backend
            verifyPayment(razorPaymentId, razorOrderId, signature);
          },
          prefill: {
            name: userName,
            email: userEmail,
          },
          theme: {
            color: "#6366F1", // Using primary color
          },
          modal: {
            ondismiss: function() {
              onClose();
            }
          }
        };
        
        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        
      } catch (error) {
        console.error("Payment initialization error:", error);
        toast.error("Failed to initialize payment");
        if (onFailure) onFailure(error);
        onClose();
      }
    };
    
    if (isOpen) {
      initializePayment();
    }
    
  }, [isOpen, packageId, amount, packageName, userEmail, userName, onClose, onSuccess, onFailure]);
  
  const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
    try {
      // Verify payment with your backend
      const response = await axios.post("/api/verify-payment", {
        razorPaymentId : paymentId,
        razorOrderId : orderId,
        signature,
        amount,
        packageId
      });
      
      if (response.data.success) {
        toast.success("Payment successful!");
        if (onSuccess) onSuccess(packageName);
        
        // Redirect to success page or dashboard
        router.push("/dashboard");
      } else {
        toast.error("Payment verification failed");
        if (onFailure) onFailure(new Error("Payment verification failed"));
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed");
      if (onFailure) onFailure(error);
    } finally {
      onClose();
    }
  };
  
  // This component doesn't render anything visually
  return null;
}