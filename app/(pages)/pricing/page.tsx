"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, X, CreditCard,AlertCircle} from "lucide-react";
import LoadingWrapper from "@/components/LaodingWrapper";
import axios from "axios";
import Loading from "@/components/Loading";
import { Package } from "@/models/Packages";
import RazorpayPayment from "@/components/RazorpayHandler";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReactDOM from 'react-dom/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentSuccessUI, PaymentFailureUI } from "@/components/payment-UI";

// Payment confirmation dialog component
const PaymentConfirmationDialog = ({ isOpen, onClose, selectedPlan, onConfirm } : {isOpen : boolean, onClose :()=> void, selectedPlan : Package, onConfirm : ()=> void}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Confirm Payment</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-xl font-bold mb-1">{selectedPlan.name}</h4>
            <p className="text-muted-foreground">{selectedPlan.description}</p>
          </div>
          
          <div className="bg-secondary/30 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span>Plan Price</span>
              <span>₹{selectedPlan.price}/month</span>
            </div>
           
            <div className="flex justify-between items-center pt-2 border-t font-medium">
              <span>Total</span>
              <span className="text-lg">₹{selectedPlan.price}</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <h5 className="font-medium">What you'll get:</h5>
            {selectedPlan.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} className="gap-2">
            <CreditCard className="h-4 w-4" />
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Package[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const {data : session} = useSession();
  const router = useRouter();

  if(!session?.user){
       router.replace('/sign-up')
  }

  const fetchPackages = async() => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/packages');
      if(response.data.success) {
        setPlans(response.data.packages);
        // console.log(response.data.packages);
      }
    } catch(error) {
      console.log("packages fetching error : ", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  // Function to handle free plan activation
  const handleFreePlan = async (plan: Package) => {
    try {
      setIsLoading(true);
      // Call API to activate free plan
      const packageId = plan._id
      const response = await axios.post(`/api/packages/${packageId}/credits`);

      if(response.data.existed){
        showNotification('Free plan is already created',false)
        return;
      }
      
      if (response.data.success) {
        // Show success message
        showNotification(`Free  plan activated successfully!`, true);
        // Redirect to dashboard
        setTimeout(() => {
          router.replace('/dashboard');
        }, 2000);
      } else {
        showNotification("Failed to activate free plan. Please try again.", false);
      }
    } catch (error) {
      console.error("Error activating free plan:", error);
      showNotification("Failed to activate free plan. Please try again.", false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to show notification
  const showNotification = (message: string, isSuccess: boolean) => {
    const notificationElement = document.createElement('div');
    notificationElement.id = isSuccess ? 'payment-success-notification' : 'payment-failure-notification';
    document.body.appendChild(notificationElement);
    
    const root = ReactDOM.createRoot(notificationElement);
    root.render(
      isSuccess 
        ? <PaymentSuccessUI message={message} />
        : <PaymentFailureUI message={message} />
    );
    
    setTimeout(() => {
      document.body.removeChild(notificationElement);
    }, 5000);
  };

  const handlePlanSelect = (plan: Package) => {
    // If it's a free plan, handle it differently
    if (plan.price === 0) {
      handleFreePlan(plan);
    } else {
      // For paid plans, continue with the existing flow
      setSelectedPlan(plan);
      setIsConfirmationOpen(true);
    }
  };

  const handlePaymentConfirm = async () => {
    setIsConfirmationOpen(false)
    if (selectedPlan) {
      setIsRazorpayOpen(true);
    }
  };

  // Updated payment handlers
  const handlePaymentSuccess = (packageName: string) => {
    showNotification(`Payment Successful! Package: ${packageName}`, true);
    
    // Redirect to dashboard after successful payment
    setTimeout(() => {
      router.replace('/dashboard');
    }, 2000);
  };

  const handlePaymentFailure = (error: any) => {
    showNotification("Payment Failed. Please try again.", false);
    console.error("Payment failure:", error);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <LoadingWrapper>
      <div className="min-h-screen py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan to unlock deeper relationship insights and enhance your journey with LoveBite.ai
            </p>
          </div>

          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>🎉 Verified... kinda!</AlertTitle>
            <AlertDescription>
              We’ve not been <strong>Razorpay verified</strong> as of <strong> now </strong> but we will soon ✅ — so the serious stuff is in place.  
              <br />
              Till then, enjoy the <strong>free plan</strong> and good vibes only 😎.
            </AlertDescription>
          </Alert>


          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">₹{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.price === 0 ? "Start Free Plan" : plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {selectedPlan && (
        <>
          <PaymentConfirmationDialog 
            isOpen={isConfirmationOpen}
            onClose={() => setIsConfirmationOpen(false)}
            selectedPlan={selectedPlan}
            onConfirm={handlePaymentConfirm}
          />

          <RazorpayPayment
            isOpen={isRazorpayOpen}
            onClose={() => setIsRazorpayOpen(false)}
            packageId={selectedPlan._id as string}
            amount={selectedPlan.price}
            packageName={selectedPlan.name}
            userEmail={session?.user?.email || ""}
            userName={session?.user?.name || ""}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
          />
        </>
      )}
    </LoadingWrapper>
  );
}