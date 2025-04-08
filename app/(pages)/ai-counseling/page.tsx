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

export default function AICounseling() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI relationship counselor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Simulated credit state - in production, this would come from your backend
  const [credits, setCredits] = useState(50);
  const maxCredits = 50;

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
      // Deduct credit before API call
      setCredits(prev => Math.max(0, prev - 1));
      
      // Make API call to your Gemini endpoint
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

  const handleVoiceInput = () => {
    // Placeholder for voice input functionality
    // In a real app, you would implement speech recognition here
    alert("Voice input functionality would be implemented here");
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to format message content with proper paragraphs and lists
  const formatMessageContent = (content  :string) => {
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
        <Card className="mb-8 border-0 shadow-lg  backdrop-blur-sm">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="flex items-center gap-2 text-xl ">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="text-primary h-6 w-6" />
              </div>
              AI Relationship Counselor
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <CreditDisplay credits={credits} maxCredits={maxCredits} />
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

        <Card className="mb-4 border-0 shadow-lg h-[500px] flex flex-col  backdrop-blur-sm">
          <CardContent className="flex-1 overflow-y-auto p-6 ">
            <div className="flex justify-center mb-4">
              <div className="text-xs  px-2 py-1 rounded-full">
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
                  <div className="text-xs  mt-1 px-2">
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
                  <div className="rounded-2xl px-4 py-2  rounded-tl-none">
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
            {credits <= 0 ? (
              <div className="w-full text-center p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                You've run out of credits! <Link href="/pricing" className="underline font-medium">Upgrade your plan</Link> to continue.
              </div>
            ) : (
              isVoiceMode ? (
                <Button 
                  className="w-full rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                  size="lg"
                  onClick={handleVoiceInput}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Hold to Speak
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="rounded-full border-primary/20 focus:border-primary "
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="rounded-full w-12 h-12 p-0 aspect-square "
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