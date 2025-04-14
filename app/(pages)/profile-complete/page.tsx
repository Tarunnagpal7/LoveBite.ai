"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { profileSchema } from "@/schemas/profileSchema";
import type { ProfileFormData } from "@/schemas/profileSchema";
import axios from "axios";

export default function ProfileComplete() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.profileCompleted) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      inRelation: undefined,
      zodiacSign: undefined,
    },
    mode: "onChange", // Add this to validate on change
  });

  const steps = [
    {
      title: "Basic Information",
      fields: ["age", "gender"],
      description: "Let's start with some basic information about you",
    },
    {
      title: "Relationship Status",
      fields: ["inRelation"],
      description: "Tell us about your current relationship status",
    },
    {
      title: "Zodiac Sign",
      fields: ["zodiacSign"],
      description: "What's your zodiac sign? This helps us provide personalized insights",
    },
  ];

  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  // Function to handle next step
  const handleNextStep = async () => {
    const currentFields = steps[currentStep].fields;
    
    // Validate only current step fields
    const isStepValid = await form.trigger(currentFields as any);
    
    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      console.log("Validation failed for step", currentStep);
      // Form validation errors will be displayed automatically
    }
  };
  
  const onSubmit = async (data: ProfileFormData) => {
    if (currentStep < steps.length - 1) {
      handleNextStep();
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/profile/complete", data);
      
      if (response.data.success) {
        await update(); // Update the session with new profile data
        router.push("/pricing"); // Changed to /dashboard to match the useEffect check
      }
    } catch (error) {
      console.error("Error completing profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepConfig = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {currentStepConfig.title}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {currentStepConfig.description}
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-16 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your age"
                            {...field}
                            value={field.value || ''}  // Initialize with empty string if undefined
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : '';
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            {["male", "female"].map((gender) => (
                              <FormItem key={gender}>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant={field.value === gender ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => field.onChange(gender)}
                                  >
                                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                  </Button>
                                </FormControl>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 1 && (
                <FormField
                  control={form.control}
                  name="inRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid gap-4"
                        >
                          {["single", "in a relationship"].map((status) => (
                            <FormItem key={status}>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant={field.value === status ? "default" : "outline"}
                                  className="w-full justify-start"
                                  onClick={() => field.onChange(status)}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                              </FormControl>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {currentStep === 2 && (
                <FormField
                  control={form.control}
                  name="zodiacSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zodiac Sign</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {zodiacSigns.map((sign) => (
                            <FormItem key={sign}>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant={field.value === sign ? "default" : "outline"}
                                  className="w-full justify-start"
                                  onClick={() => field.onChange(sign)}
                                >
                                  {sign}
                                </Button>
                              </FormControl>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-between pt-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    className="ml-auto"
                    onClick={handleNextStep}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Completing..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}