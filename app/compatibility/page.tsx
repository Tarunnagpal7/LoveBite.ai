"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CompatibilityTest() {
  const [hasRelationship, setHasRelationship] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    "How do you and your partner handle conflicts?",
    "What are your shared values and goals?",
    "How do you communicate about finances?",
    // Add more questions
  ];

  if (!hasRelationship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Relationship Status Required</AlertTitle>
          <AlertDescription>
            Please complete your profile and verify your relationship status to take the compatibility test.
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => setHasRelationship(true)} className="mt-4">
          Update Profile
        </Button>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="text-primary" />
              Compatibility Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Discover deep insights about your relationship through our comprehensive compatibility test.
              Both partners need to complete the test separately for accurate results.
            </p>
            <Button onClick={() => setTestStarted(true)}>Start Test</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}/{questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-xl">{questions[currentQuestion]}</p>
          <div className="space-y-4">
            {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((answer) => (
              <Button
                key={answer}
                variant="outline"
                className="w-full text-left justify-start"
                onClick={() => setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1))}
              >
                {answer}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}