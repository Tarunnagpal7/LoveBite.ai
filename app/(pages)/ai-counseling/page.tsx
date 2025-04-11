"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Send, Bot, Volume2, RefreshCw } from "lucide-react";
import CreditDisplay from "@/components/credit-display";
import Link from "next/link";
import axios from "axios";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

export default function AICounseling() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI relationship counselor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [credits, setCredits] = useState(0);
  const [initialCredits, setInitialCredits] = useState(0);
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Fetch user credits on initial load
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setIsCreditsLoading(true);
        const response = await axios.get('/api/user/credit');
        if (response.data.success) {
          const creditValue = response.data.credit || 0;
          setCredits(creditValue);
          setInitialCredits(creditValue); // Store initial value for comparison
        } else {
          setCredits(0);
          setInitialCredits(0);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        setCredits(0);
        setInitialCredits(0);
      } finally {
        setIsCreditsLoading(false);
      }
    };
    
    fetchCredits();
  }, []);

  // Save credits to server when credits change
  useEffect(() => {
    // Don't sync during initial load or when credits haven't been fetched yet
    if (credits === 0 || initialCredits === 0 || credits === initialCredits) {
      return;
    }
    
    // Debounced sync to prevent too many requests
    const syncTimeout = setTimeout(() => {
      const syncCreditsToServer = async () => {
        try {
          await axios.post('/api/user/credit', { credit: credits });
          // console.log("Credits synced to server:", credits);
        } catch (error) {
          console.error("Error syncing credits to server:", error);
        }
      };
      
      syncCreditsToServer();
    }, 500); // 500ms debounce
    
    return () => clearTimeout(syncTimeout);
  }, [credits, initialCredits]);
  
  // Final sync when leaving page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Only sync if credits have changed from initial value
      if (credits !== 0 && initialCredits !== 0 && credits !== initialCredits) {
        // Use sendBeacon for more reliable data sending when page is unloading
        const data = JSON.stringify({ credit: credits });
        navigator.sendBeacon('/api/user/credit', data);
        // console.log("Credits synced via sendBeacon:", credits);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Also sync on component unmount if needed
      if (credits !== null && initialCredits !== null && credits !== initialCredits) {
        const finalSync = async () => {
          try {
            await axios.post('/api/user/credit', { credit: credits });
            // console.log("Final credits sync on unmount:", credits);
          } catch (error) {
            console.error("Error in final credits sync:", error);
          }
        };
        
        finalSync();
      }
    };
  }, [credits, initialCredits]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || credits <= 0 || isLoading) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    // Show typing indicator
    setTyping(true);
    setIsLoading(true);
    
    try {
      // Deduct credit locally before API call
      setCredits(prev => Math.max(0, prev - 1));
      
      // Make API call to your AI endpoint
      const response = await axios.post('/api/ai-chat', {
        userQuestion: input
      });
      
      // Add AI response to chat - preserve markdown formatting
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.response || "I'm sorry, I couldn't process that request."
      }]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      
      // Restore the credit if the API call failed
      setCredits(prev => prev + 1);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later."
      }]);
    } finally {
      setTyping(false);
      setIsLoading(false);
      setInput("");
    }
  };

  // const handleVoiceInput = () => {
  //   // Show coming soon toast or alert
  //   alert("Voice chat feature is coming soon!");
  // };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to handle navigation to pricing page
  const handleGoToPricing = () => {
    // Sync credits before navigation
    const syncCredits = async () => {
      if (credits !== null && initialCredits !== null && credits !== initialCredits) {
        try {
          await axios.post('/api/user/credit', { credit: credits });
          console.log("Credits synced before navigation:", credits);
        } catch (error) {
          console.error("Error syncing credits before navigation:", error);
        }
      }
      router.push('/pricing');
    };
    
    syncCredits();
  };

  // Function to format message content with proper paragraphs and lists
  const formatMessageContent = (content : string) => {
    return (
      <div className="message-content space-y-3">
        <ReactMarkdown
          components={{
            p: ({node, ...props}) => <p className="mb-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="ml-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-3 mb-2" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 border-0 shadow-lg backdrop-blur-sm">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="text-primary h-6 w-6" />
              </div>
              AI Relationship Counselor
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {isCreditsLoading ? (
              <div className="h-6 w-40 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <CreditDisplay credits={credits} />
            )}
            <div className="flex gap-4 mt-4">
              <Button
                variant={!isVoiceMode ? "default" : "outline"}
                onClick={() => setIsVoiceMode(false)}
                className="rounded-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Text Chat
              </Button>
              <Button
                variant={isVoiceMode ? "default" : "outline"}
                onClick={() => setIsVoiceMode(true)}
                className="rounded-full"
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Voice Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 border-0 shadow-lg h-[500px] flex flex-col backdrop-blur-sm">
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-center mb-4">
              <div className="text-xs px-2 py-1 rounded-full">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1">
                    <Bot className="text-primary h-4 w-4" />
                  </div>
                )}
                
                <div className="max-w-[75%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2",
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "border-pink-400 border-2 rounded-tl-none"
                    )}
                  >
                    {formatMessageContent(message.content)}
                  </div>
                  <div className="text-xs mt-1 px-2">
                    {formatDate()}
                  </div>
                </div>
                
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-2 mt-1">
                    <span className="text-primary-foreground text-xs font-bold">You</span>
                  </div>
                )}
              </div>
            ))}
            
            {typing && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1">
                  <Bot className="text-primary h-4 w-4" />
                </div>
                <div className="max-w-[75%]">
                  <div className="rounded-2xl px-4 py-2 rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '250ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '500ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>
          
          <div className="p-4 border-t">
            {credits === null ? (
              <div className="w-full h-12 bg-gray-200 animate-pulse rounded-full"></div>
            ) : credits <= 0 ? (
              <div className="w-full p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>You've run out of credits!</div>
                <Button 
                  onClick={handleGoToPricing} 
                  variant="destructive" 
                  className="whitespace-nowrap"
                >
                  Upgrade Your Plan
                </Button>
              </div>
            ) : (
              isVoiceMode ? (
                <Button 
                  className="w-full rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                  size="lg"
                  // onClick={handleVoiceInput}
                >
                  <Mic className="mr  -2 h-5 w-5" />
                  {/* Hold to Speak */}
                  coming Soon
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="rounded-full border-primary/20 focus:border-primary"
                    disabled={isLoading || credits <= 0}
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || credits <= 0}
                    className="rounded-full w-12 h-12 p-0 aspect-square"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}