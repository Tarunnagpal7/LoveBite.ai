"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Send, Bot, Volume2 } from "lucide-react";
import CreditDisplay from "@/components/credit-display";
import Link from "next/link";

export default function AICounseling() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI relationship counselor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  // Simulated credit state - in production, this would come from your backend
  const [credits, setCredits] = useState(50);
  const maxCredits = 50;

  const handleSend = () => {
    if (!input.trim() || credits <= 0) return;
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setCredits(prev => Math.max(0, prev - 1)); // Deduct 1 credit per message
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "This is a placeholder response. In production, this would be connected to an AI backend."
      }]);
    }, 1000);
    setInput("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary" />
              AI Relationship Counselor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreditDisplay credits={credits} maxCredits={maxCredits} />
            <div className="flex gap-4 mb-4">
              <Button
                variant={!isVoiceMode ? "default" : "outline"}
                onClick={() => setIsVoiceMode(false)}
              >
                <Send className="mr-2 h-4 w-4" />
                Text Chat
              </Button>
              <Button
                variant={isVoiceMode ? "default" : "outline"}
                onClick={() => setIsVoiceMode(true)}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Voice Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="h-[500px] overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {credits <= 0 && (
            <div className="w-full text-center p-2 bg-destructive/10 text-destructive rounded-lg">
              You've run out of credits! <Link href="/pricing" className="underline">Upgrade your plan</Link> to continue.
            </div>
          )}
          {credits > 0 && (
            isVoiceMode ? (
              <Button className="w-full" size="lg">
                <Mic className="mr-2 h-4 w-4" />
                Hold to Speak
              </Button>
            ) : (
              <>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}