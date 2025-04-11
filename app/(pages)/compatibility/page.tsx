"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, AlertCircle, Search, Trophy, UserPlus, X, Loader2, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { useNotifications } from "@/contexts/notification-context";
import Link from "next/link";
import notificationModel from "@/models/Notification";

interface User {
  _id: string;
  name: string;
  image: string;
}

interface TopCouple {
  user1: User;
  user2: User;
  score: number;
}

interface PendingRelationship {
  [key: string]: boolean;
}

export default function CompatibilityTest() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const [hasRelationship, setHasRelationship] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [topCouples, setTopCouples] = useState<TopCouple[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [pendingRelationships, setPendingRelationships] = useState<PendingRelationship>({});

  useEffect(() => {
    // Check if user has a relationship
    const checkRelationship = async () => {
      try {
        const response = await axios.get("/api/relationships");
        const activeRelationship = response.data.relationships.find(
          (r: any) => r.status === "accepted"
        );
        setHasRelationship(!!activeRelationship);
        
        // Create a map of pending relationships
        const pendingMap: PendingRelationship = {};
        response.data.relationships.forEach((r: any) => {
          if (r.status === "pending") {
            if (r.user_sender_id === session?.user?._id) {
              pendingMap[r.user_receiver_id] = true;
            } else {
              pendingMap[r.user_sender_id] = true;
            }
          }
        });
        setPendingRelationships(pendingMap);
      } catch (error) {
        console.error("Error checking relationship:", error);
      }
    };

    // Fetch top couples
    const fetchTopCouples = async () => {
      try {
        const response = await axios.get("/api/compatibility/top-couples");
        setTopCouples(response.data.couples);
      } catch (error) {
        console.error("Error fetching top couples:", error);
      }
    };

    if (session?.user) {
      checkRelationship();
      fetchTopCouples();
    }
  }, [session]);

  const questions = [
    "How do you and your partner handle conflicts?",
    "What are your shared values and goals?",
    "How do you communicate about finances?",
    // Add more questions
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`/api/search?q=${searchQuery}`);
      setSearchResults(response.data.users);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchPerformed(false);
  };

  const sendRelationshipRequest = async (receiverId: string) => {
    try {
      const response = await axios.post("/api/relationships", { receiverId });

      if(!response.data.success){
        addNotification(response.data.message);
        return;
      }
      addNotification("Relationship request sent successfully!");
      
      // Update pending relationships state
      setPendingRelationships({
        ...pendingRelationships,
        [receiverId]: true
      });
    } catch (error) {
      console.error("Error sending relationship request:", error);
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.message) {
        addNotification(error.response.data.message);
      } else {
        addNotification("Failed to send relationship request");
      }
    }
  };

  // Function to render top couples section
  const renderTopCouples = () => (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Couples
        </CardTitle>
        <CardDescription>
          Couples with the highest compatibility scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCouples.length > 0 ? (
            topCouples.map((couple, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <Avatar className="border-2 border-background">
                      <AvatarImage src={couple.user1.image} alt={couple.user1.name} />
                      <AvatarFallback>{couple.user1.name[0]}</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background">
                      <AvatarImage src={couple.user2.image} alt={couple.user2.name} />
                      <AvatarFallback>{couple.user2.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {couple.user1.name} & {couple.user2.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {couple.score}% Compatible
                    </span>
                  </div>
                </div>
                <Heart className="h-5 w-5 text-primary" />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No top couples data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!hasRelationship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Relationship Status Required</AlertTitle>
          <AlertDescription>
            You need to be in a relationship to take the compatibility test.
            Search for your partner below and send them a relationship request.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Search Section - Smaller and Left-aligned */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Find Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-1">
                  <Input
                    placeholder="Search by name..."
                    className="text-sm h-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchPerformed ? (
                    isSearching ? (
                      <Button size="sm" className="ml-2 h-8 px-2" disabled>
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </Button>
                    ) : (
                      <Button size="sm" className="ml-2 h-8 px-2" onClick={clearSearch}>
                        <X className="h-3 w-3" />
                      </Button>
                    )
                  ) : (
                    <Button size="sm" className="ml-2 h-8 px-2" onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                      <Search className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-xs">Searching...</span>
                    </div>
                  ) : searchPerformed && searchResults.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${user._id}`}>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                          </Avatar>
                          </Link>
                          <span className="text-xs">{user.name}</span>
                        </div>
                        {pendingRelationships[user._id] ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs py-0 px-2 bg-secondary/50"
                            disabled
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Sent
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs py-0 px-2"
                            onClick={() => sendRelationshipRequest(user._id)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Request
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Couples - Taking more space */}
          {renderTopCouples()}
        </div>
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

        {/* Top Couples Section */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top Couples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCouples.length > 0 ? (
                  topCouples.map((couple, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <Avatar className="border-2 border-background">
                            <AvatarImage src={couple.user1.image} alt={couple.user1.name} />
                            <AvatarFallback>{couple.user1.name[0]}</AvatarFallback>
                          </Avatar>
                          <Avatar className="border-2 border-background">
                            <AvatarImage src={couple.user2.image} alt={couple.user2.name} />
                            <AvatarFallback>{couple.user2.name[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {couple.user1.name} & {couple.user2.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {couple.score}% Compatible
                          </span>
                        </div>
                      </div>
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No top couples data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
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
      
      {/* Top Couples always visible */}
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top Couples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCouples.length > 0 ? (
                topCouples.map((couple, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <Avatar className="border-2 border-background">
                          <AvatarImage src={couple.user1.image} alt={couple.user1.name} />
                          <AvatarFallback>{couple.user1.name[0]}</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-background">
                          <AvatarImage src={couple.user2.image} alt={couple.user2.name} />
                          <AvatarFallback>{couple.user2.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {couple.user1.name} & {couple.user2.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {couple.score}% Compatible
                        </span>
                      </div>
                    </div>
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No top couples data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}