'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Users, MessageCircle, Brain, X, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const route = useRouter();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const {data : session} = useSession();

  if(session?.user){
     route.push('/dashboard')
  }
  
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
            <Button size="lg" className="text-lg" onClick={()=>{route.push('/sign-in')}}>
              Take Compatibility Test <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => setShowLearnMore(true)}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">About LoveBite.ai</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowLearnMore(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Our Mission</h3>
                  <p className="text-muted-foreground">
                    LoveBite.ai is dedicated to helping couples build stronger, more fulfilling relationships through 
                    the power of AI-driven insights and a supportive community. We believe that understanding your 
                    compatibility on a deeper level is the foundation for lasting love.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center mb-3">
                      <Users className="h-6 w-6 text-primary mr-2" />
                      <h4 className="font-semibold">Compatibility Testing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Our scientifically-backed compatibility test analyzes 12 dimensions of relationship dynamics. 
                      Both partners take the test independently, and our AI analyzes your results to highlight strengths, 
                      potential challenges, and personalized recommendations for growth.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center mb-3">
                      <MessageCircle className="h-6 w-6 text-primary mr-2" />
                      <h4 className="font-semibold">Discussion Forums</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect with a community of like-minded couples who are committed to relationship growth. 
                      Share experiences, ask questions, and learn from others who may have faced similar challenges. 
                      Our moderated forums ensure a supportive and respectful environment.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center mb-3">
                      <Brain className="h-6 w-6 text-primary mr-2" />
                      <h4 className="font-semibold">AI Counseling</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Our AI relationship counselor provides personalized guidance based on your compatibility results. 
                      Get insights, conversation starters, and practical exercises designed to improve communication, 
                      build empathy, and foster deeper connection with your partner.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">How It Works</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Create an account and invite your partner to join</li>
                    <li>Both partners complete the comprehensive compatibility assessment</li>
                    <li>Receive detailed insights about your relationship dynamics</li>
                    <li>Access personalized recommendations from our AI counselor</li>
                    <li>Connect with the community to share experiences and get advice</li>
                  </ol>
                </div>
                
                <div className="text-center mt-8">
                  <Button size="lg" onClick={() => {
                    setShowLearnMore(false);
                    route.push('/sign-in');
                  }}>
                    Start Your Journey
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              title="Discussion Q&A's"
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
          <Link href="/sign-in">
            <Button size="lg" variant="secondary" className="text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-background border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Heart className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-lg">LoveBite.ai</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-muted-foreground mr-2" />
            <a href="mailto:whitensnake1611@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
              whitensnake1611@gmail.com
            </a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LoveBite.ai. All rights reserved.
          </div>
        </div>
      </footer>
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