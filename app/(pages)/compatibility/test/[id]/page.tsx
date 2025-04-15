"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { SimpleProgress as Progress } from "@/components/Progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNotifications } from "@/contexts/notification-context";
import axios from "axios";
import Loading from "@/components/Loading";

interface TestQuestion {
  _id: string;
  question_text: string;
  question_type: "MCQ" | "brief";
  options?: string[];
}

interface TestResponse {
  questionId: string;
  response_text?: string;
  selected_option?: string;
}

export default function CompatibilityTestPage() {
  const params = useParams<{id : string}>()
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const compatibilityId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, TestResponse>>(new Map());
  const [relationshipId, setRelationshipId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadTestData();
    }
  }, [session, compatibilityId]);

  const loadTestData = async () => {
    try {
      setIsLoading(true);
      
      // Load compatibility information
      // console.log(compatibilityId)
      const compatibilityResponse = await axios.get(`/api/compatibility?compatibilityId=${compatibilityId}`);
      // console.log(compatibilityResponse)
      if (!compatibilityResponse.data.success) {
        router.push("/compatibility");
        return;
      }
      
      setRelationshipId(compatibilityResponse.data.relationshipId);
      
      // Load questions
      const questionsResponse = await axios.get("/api/compatibility/questions");
      setQuestions(questionsResponse.data.questions);
      
      // Load user's previous responses if any
      // const userResponses = compatibilityResponse.data.userResponses || [];
      // const responseMap = new Map();
      // userResponses.forEach((response: TestResponse) => {
      //   responseMap.set(response.questionId, {
      //     questionId: response.questionId,
      //     response_text: response.response_text,
      //     selected_option: response.selected_option
      //   });
      // });
      // setResponses(responseMap);
      
    } catch (error) {
      console.error("Error loading test data:", error);
      addNotification("Failed to load test data");
      router.push("/compatibility");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (response: string, type: "MCQ" | "brief") => {
    const currentQuestion = questions[currentQuestionIndex];
    const newResponses = new Map(responses);
    
    newResponses.set(currentQuestion._id, {
      questionId: currentQuestion._id,
      ...(type === "MCQ" ? { selected_option: response } : { response_text: response })
    });
    
    setResponses(newResponses);
  };



  const submitTest = async () => {
    setIsSaving(true);
    try {
      const response = await axios.post("/api/compatibility/submit", {
        compatibilityId,
        responses: Array.from(responses.values())
      });

      if (response.data.completed) {
        addNotification("Test submitted successfully! Waiting for your partner to complete the test.");
        router.push("/compatibility");
      }else if(response.data.success){
        addNotification("Test submitted successfully! check your results");
        router.push("/compatibility");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      addNotification("Failed to submit test");
      router.push('/compatibility')
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetReady = () => {
    setIsReady(true);
  };

  const exitTest = () => {
    router.push("/compatibility");
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    const currentResponse = responses.get(question._id);

    return (
      <div className="space-y-6">
        <Progress 
          value={(currentQuestionIndex / questions.length) * 100} 
          className="w-full"
        />
        
        <p className="text-xl font-medium">{question.question_text}</p>

        {question.question_type === "MCQ" ? (
          <RadioGroup
            value={currentResponse?.selected_option}
            onValueChange={(value) => handleResponseChange(value, "MCQ")}
          >
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <Textarea
            value={currentResponse?.response_text || ""}
            onChange={(e) => handleResponseChange(e.target.value, "brief")}
            placeholder="Type your answer here..."
            className="min-h-[150px]"
          />
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={submitTest}
              disabled={isSaving || !responses.has(question._id)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Test"
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!responses.has(question._id)}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

       
      </div>
    );
  };

  if (isLoading) {
    return (
       <Loading />
    );
  }

  if (!isReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Get Ready for Your Compatibility Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert>
                <AlertTitle>Before You Begin</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-2 mt-2">
                    <li>This test has {questions.length} questions.</li>
                    <li>Answer honestly to get the most accurate results.</li>
                    <li>You can save your progress and continue later.</li>
                    <li>Your partner will need to complete the test separately.</li>
                    <li>Results will be available when both of you have completed the test.</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-4">
                <Button onClick={handleGetReady} className="flex-1">
                  I'm Ready
                </Button>
                <Button variant="outline" onClick={exitTest} className="flex-1">
                  Exit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderQuestion()}
        </CardContent>
      </Card>
    </div>
  );
}