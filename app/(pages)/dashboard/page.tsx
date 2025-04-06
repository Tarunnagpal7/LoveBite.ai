'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  ArrowRight,  
  MessageCircle, 
  Brain, 
  Clock, 
  Star, 
  Send,
  Atom,
  Edit,
  CheckCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { User as AuthUser } from "next-auth";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { FeedbackFormData, feedbackFormSchema } from "@/schemas/feedbackForm";
import {toast} from "sonner";

export function AuthenticatedHome() {
  const { data: session } = useSession();
  const user = session?.user as AuthUser;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<FeedbackFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      message: "",
      rating: 0,
    }
  });

  // Fetch existing feedback when component mounts
  useEffect(() => {
    fetchExistingFeedback();
  }, [session]);

  const fetchExistingFeedback = async () => {
    try {   
      const response = await axios.get('/api/feedback');
      console.log(response.data);
      
      // Fix the inconsistent property name (feedback vs feedbacks)
      
     if (response.data.feedbacks) {
        setExistingFeedback(response.data.feedbacks);
        form.reset({
          message: response.data.feedbacks.message,
          rating: response.data.feedbacks.rating
        });
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post('/api/feedback', data);
      
      if (response.data.success) {
        toast.success("Feedback submitted successfully!");
        fetchExistingFeedback();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error('Feedback submit error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= form.watch("rating") ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
            onClick={() => form.setValue("rating", star, { shouldValidate: true })}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* Hero Section with Greeting */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 love-gradient opacity-10 rounded-b-full transform scale-150"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Welcome back, <span className="text-primary">{user?.name || "Partner"}</span>!
              </h1>
              <p className="mt-3 text-xl text-muted-foreground max-w-2xl">
                Let's continue strengthening your relationship journey today.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10">
                <Heart className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center md:text-left">
            Continue Your Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
              icon={<Atom className="h-8 w-8 text-indigo-500" />}
              title="AI Counseling"
              description="start a personalized session with our AI counselor."
              buttonText="Try Now"
              slug="/ai-counseling"
              color="bg-indigo-500/10 hover:bg-indigo-500/20"
            />
            <ActionCard 
              icon={<MessageCircle className="h-8 w-8 text-emerald-500" />}
              title="Conversation Starters"
              description="Discover thoughtful questions to deepen your connection today."
              buttonText="Get Started"
              slug='/Q&A'
              color="bg-emerald-500/10 hover:bg-emerald-500/20"
            />
            <ActionCard 
              icon={<Brain className="h-8 w-8 text-pink-500" />}
              title="Relationship Insights"
              description="View your personalized relationship analysis and recommendations."
              buttonText="View Insights"
              slug='/compatibility'
              color="bg-pink-500/10 hover:bg-pink-500/20"
            />
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary/30 rounded-lg mx-4 lg:mx-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">
            Upcoming Events
          </h2>
          <div className="space-y-4">
            <EventCard 
              date="soon"
              title="Interactive Games"
              time="TBA"
              description="Join us for a fun-filled evening of interactive games designed to strengthen your bond."
            />
          </div>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 border-primary/20">
            <h2 className="text-2xl font-semibold mb-4 text-center">Share Your Feedback</h2>
            <p className="text-muted-foreground text-center mb-6">
              Your thoughts help us improve LoveBite.ai for you and your partner.
            </p>
            
            {existingFeedback && !isEditing ? (
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium mb-3">Thank You For Your Feedback!</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  We appreciate you taking the time to share your thoughts with us.
                  Your input helps us improve LoveBite.ai for everyone.
                </p>
                
                <div className="bg-primary/5 p-6 rounded-lg w-full max-w-md my-4">
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                    <div className="flex justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= existingFeedback.rating 
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {existingFeedback.message && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Your Message</p>
                      <div className="bg-background p-3 rounded border border-border/50">
                        <p className="text-foreground">{existingFeedback.message}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)} 
                  className="mt-2 gap-2"
                >
                  <Edit size={16} /> Submit New Feedback
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How would you rate your experience?</FormLabel>
                        <FormControl>
                          <div className="mt-1">{renderStarRating()}</div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Share your thoughts with us</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us what you like or how we can improve..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-center">
                    <Button 
                      type="submit" 
                      className="px-6 gap-2" 
                      disabled={isSubmitting}
                    >
                      <Send size={16} /> 
                      {isSubmitting ? "Submitting..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

function ActionCard({ icon, title, description, slug, buttonText, color }: { icon: React.ReactNode; title: string; description: string; slug: string; buttonText: string; color: string }) {
    return (
      <Card className={`p-6 border-primary/10 hover:shadow-lg transition-all ${color}`}>
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button variant="outline" className="w-full justify-between group">
          <Link href={slug} className="flex-1 flex items-center">{buttonText}</Link>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Card>
    );
  }

function EventCard({ date, title, time, description } : { date: string; title: string; time: string; description: string }) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-background/80 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg text-center min-w-16">
        <span className="block text-xs font-semibold text-primary">{date}</span>
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="h-3 w-3 mr-1" />
            {time}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function AuthHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHome />
    </div>
  );
}