"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, ArrowLeft, Lightbulb, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useNotifications } from "@/contexts/notification-context";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ResultInsight } from "@/models/ResultInsights";
import Loading from "@/components/Loading";

interface User {
  _id: string;
  name: string;
  image: string;
}

export default function CompatibilityResults() {
  const { data: session } = useSession();
  const params = useParams<{id : string}>();
  const router = useRouter();
  const compatibilityId = params.id
  const { addNotification } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<User | null>(null);
  const [results, setResults] = useState<ResultInsight | null>(null);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Use useCallback to prevent the function from being recreated on each render
  const fetchTestResults = useCallback(async () => {
    try {
      const resultResponse = await axios.get(`/api/compatibility/results?compatibilityId=${compatibilityId}`);
      return resultResponse.data.results;
    } catch (error) {
      console.error("Error fetching test results:", error);
      throw new Error("Failed to load test results");
    }
  }, [compatibilityId]);

  const fetchRelationshipInfo = useCallback(async () => {
    try {
      const compatibilityResponse = await axios.get(`/api/compatibility?compatibilityId=${compatibilityId}`);
      return {
        relationshipId: compatibilityResponse.data.relationship._id,
        relationship: compatibilityResponse.data.relationship
      };
    } catch (error) {
      console.error("Error fetching relationship info:", error);
      throw new Error("Failed to load relationship information");
    }
  }, [compatibilityId]);

  const fetchPartnerInfo = useCallback(async (partnerId: string) => {
    try {
      const partnerResponse = await axios.get(`/api/user/partner?partnerId=${partnerId}`);
      return partnerResponse.data.user;
    } catch (error) {
      console.error("Error fetching partner info:", error);
      throw new Error("Failed to load partner information");
    }
  }, []);

  // Load data only once when component mounts
  useEffect(() => {
    // Only fetch if we haven't already and we have required data
    if (!dataFetched && session?.user && params.id) {
      const loadData = async () => {
        setIsLoading(true);
        setIsError(false);
        
        try {
          // Fetch results first
          const testResults = await fetchTestResults();
          setResults(testResults);
          console.log(testResults);
          
          // Then fetch relationship info
          const { relationshipId, relationship } = await fetchRelationshipInfo();
          setRelationshipId(relationshipId);
          
          // Determine partner ID
          const partnerId = relationship.user_sender_id === session?.user?._id 
            ? relationship.user_receiver_id 
            : relationship.user_sender_id;
          
          // Fetch partner info
          const partner = await fetchPartnerInfo(partnerId);
          setPartnerInfo(partner);
          
          // Mark data as fetched to prevent refetching
          setDataFetched(true);
        } catch (error) {
          console.error("Error loading data:", error);
          setIsError(true);
          addNotification("Failed to load compatibility results");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [session, params.id, dataFetched, fetchTestResults, fetchRelationshipInfo, fetchPartnerInfo, addNotification]);

  
 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading/>
      </div>
    );
  }

  if (isError || !results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-8" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Results</AlertTitle>
          <AlertDescription>
            There was a problem loading your compatibility results. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/compatibility")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Compatibility
        </Button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button 
          onClick={() => router.push("/compatibility")} 
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Compatibility
        </Button>
        
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <Heart className="mx-4 h-8 w-8 text-primary" />
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage src={partnerInfo?.image || ""} alt={partnerInfo?.name || ""} />
                  <AvatarFallback>{partnerInfo?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Your Compatibility Results</h2>
              <p className="text-muted-foreground mb-6">
                Based on your responses and those of {partnerInfo?.name || "your partner"}
              </p>
              
              <div className="w-full mb-6">
                <div className="flex justify-between mb-2">
                  <span>Compatibility Score</span>
                  <span className={`font-bold ${getScoreColor(results.score)}`}>
                    {results.score.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={results.score} 
                  className="h-3 w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Strengths Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-500" />
              Relationship Strengths
            </CardTitle>
            <CardDescription>
              Areas where you and {partnerInfo?.name || "your partner"} connect well
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {results.strengths && results.strengths.map((strength, index) => (
                <li key={index} className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{strength.area}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{strength.details}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Weaknesses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Growth Opportunities
            </CardTitle>
            <CardDescription>
              Areas that may need attention in your relationship
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {results.weaknesses && results.weaknesses.map((weakness, index) => (
                <li key={index} className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{weakness.area}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{weakness.details}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Suggestions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              Relationship Suggestions
            </CardTitle>
            <CardDescription>
              Tips to help strengthen your connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {results.suggestions && results.suggestions.map((suggestion, index) => (
                <li key={index} className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
        </div>
      </div>
    </div>
  );
}