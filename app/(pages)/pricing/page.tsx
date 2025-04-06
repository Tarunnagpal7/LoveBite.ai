"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import LoadingWrapper from "@/components/LaodingWrapper";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Get started with basic AI counseling",
      features: [
        "50 AI counseling credits",
        "Basic relationship insights",
        "Text-based conversations",
        "Community forum access"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Premium",
      price: "19.99",
      description: "Enhanced features for deeper insights",
      features: [
        "500 AI counseling credits",
        "Advanced relationship analysis",
        "Voice conversations",
        "Priority support",
        "Exclusive content access",
        "Detailed compatibility reports"
      ],
      buttonText: "Upgrade Now",
      popular: true
    },
    {
      name: "Professional",
      price: "49.99",
      description: "Complete relationship counseling suite",
      features: [
        "Unlimited AI counseling credits",
        "Expert relationship guidance",
        "24/7 priority support",
        "Custom relationship roadmap",
        "Monthly relationship assessment",
        "Couples workshop access"
      ],
      buttonText: "Go Professional",
      popular: false
    }
  ];

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
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
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
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </LoadingWrapper>
  );
}