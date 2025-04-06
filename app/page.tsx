'use client'
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Users, MessageCircle, Brain } from "lucide-react";
import Link from "next/link";


export default function Home() {
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 love-gradient opacity-10"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="flex justify-center mb-8">
            <Heart className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Discover Your Perfect Match with
            <span className="text-primary"> LoveBite.ai</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use AI-powered compatibility testing to strengthen your relationship and connect with a supportive community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg">
              Take Compatibility Test <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Compatibility Testing"
              description="Take our comprehensive test with your partner to gain deep insights into your relationship."
            />
            <FeatureCard
              icon={<MessageCircle className="h-8 w-8" />}
              title="Discussion Forums"
              description="Connect with others, share experiences, and get advice from our supportive community."
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI Counseling"
              description="Receive personalized guidance and tips from our AI-powered relationship counselor."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 love-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to strengthen your relationship?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of couples who have discovered deeper connections through LoveBite.ai
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg glass-effect hover:shadow-lg transition-all">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}