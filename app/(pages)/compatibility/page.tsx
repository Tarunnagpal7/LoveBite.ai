"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, AlertCircle, Search, Trophy, UserPlus, X, Loader2, Check, ChevronRight, ArrowRight, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications } from "@/contexts/notification-context";
import axios from "axios";
import Link from "next/link";
import Loading from "@/components/Loading";

// Types
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

export default function CompatibilityPage() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const router = useRouter();
  
  // State for relationship and search
  const [hasRelationship, setHasRelationship] = useState(false);
  const [relationshipId, setRelationshipId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [topCouples, setTopCouples] = useState<TopCouple[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [pendingRelationships, setPendingRelationships] = useState<PendingRelationship>({});
  
  // Test status state
  const [isLoading, setIsLoading] = useState(true);
  const [compatibilityId, setCompatibilityId] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<{
    status: "Not Started" | "In Progress" | "Completed" | "Waiting";
    userCompleted: boolean;
    partnerCompleted: boolean;
  }>({
    status: "Not Started",
    userCompleted: false,
    partnerCompleted: false
  });
  const [partnerInfo, setPartnerInfo] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      checkRelationshipAndTest();
      fetchTopCouples();
    }
  }, [session]);

  const checkRelationshipAndTest = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/relationships");
      
      const activeRelationship = response.data.relationships.find(
        (r: any) => r.status === "accepted"
      );

      if (activeRelationship) {
        setHasRelationship(true);
        setRelationshipId(activeRelationship._id);
        
        // Get partner info
        const partnerId = activeRelationship.user_sender_id === session?.user?._id 
          ? activeRelationship.user_receiver_id 
          : activeRelationship.user_sender_id;

          // console.log(partnerId)
          
        try {
          const partnerResponse = await axios.get(`/api/user/partner?partnerId=${partnerId}`);
          setPartnerInfo(partnerResponse.data.user);
        } catch (error) {
          console.error("Error fetching partner info:", error);
        }
        

        // Check for existing test
        try {
          const testResponse = await axios.get(`/api/compatibility/test/${activeRelationship._id}`);
          
          if (testResponse.data.compatibility) {
            const { compatibility } = testResponse.data;
            setCompatibilityId(compatibility._id);
            
            // Determine whether the current user and partner have completed the test
            const relationship = await axios.get(`/api/relationships/${activeRelationship._id}`);
            const isUser1 = relationship.data.relationship.user_sender_id === session?.user?._id;
            
            const userCompleted = isUser1 ? compatibility.user1_completed : compatibility.user2_completed;
            const partnerCompleted = isUser1 ? compatibility.user2_completed : compatibility.user1_completed;
            
            if (compatibility.test_status === "Completed") {
              setTestStatus({
                status: "Completed",
                userCompleted: true,
                partnerCompleted: true
              });
            } else if (userCompleted) {
              setTestStatus({
                status: "Waiting",
                userCompleted: true,
                partnerCompleted: false
              });
            } else {
              setTestStatus({
                status: "In Progress",
                userCompleted: false,
                partnerCompleted: partnerCompleted
              });
            }
          } else {
            setTestStatus({
              status: "Not Started",
              userCompleted: false,
              partnerCompleted: false
            });
          }
        } catch (error) {
          console.error("Error checking test status:", error);
          addNotification("Failed to check test status");
        }
      } else {
        setHasRelationship(false);
        
        // Create pending relationships map
        const pendingMap: PendingRelationship = {};
        response.data.relationships.forEach((r: any) => {
          if (r.status === "pending") {
            pendingMap[r.user_sender_id === session?.user?._id ? r.user_receiver_id : r.user_sender_id] = true;
          }
        });
        setPendingRelationships(pendingMap);
      }
    } catch (error) {
      console.error("Error checking relationship and test:", error);
      addNotification("Failed to load relationship data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopCouples = async () => {
    try {
      const response = await axios.get("/api/compatibility/top-couples");
      setTopCouples(response.data.couples);
    } catch (error) {
      console.error("Error fetching top couples:", error);
    }
  };

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
      if (response.data.success) {
        addNotification("Relationship request sent successfully!");
        setPendingRelationships({ ...pendingRelationships, [receiverId]: true });
      }
    } catch (error) {
      console.error("Error sending relationship request:", error);
      addNotification("Failed to send relationship request");
    }
  };

  const startTest = async () => {
    if (!relationshipId) return;
    
    try {
      const response = await axios.post("/api/compatibility/start", {
        relationshipId
      });
      router.push(`/compatibility/test/${response.data.compatibilityId}`);
    } catch (error) {
      console.error("Error starting test:", error);
      addNotification("Failed to start test");
    }
  };

  const continueTest = () => {
    if (compatibilityId) {
      router.push(`/compatibility/test/${compatibilityId}`);
    }
  };

  const viewResults = () => {
    if (compatibilityId) {
      router.push(`/compatibility/result/${compatibilityId}`);
    }
  };

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
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                      <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    </div>
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading/>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-12 bg-gradient-to-b ">
      <Card className="max-w-2xl mx-auto shadow-lg border-primary/10 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Heart className="text-primary h-6 w-6 fill-primary/20" />
            <span className="bg-clip-text  bg-gradient-to-r from-primary to-primary-foreground">Compatibility Test</span>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Discover deep insights about your relationship with {partnerInfo?.name}.
            Both partners need to complete the test separately for accurate results.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {testStatus.status === "Not Started" && (
            <div className="text-center py-4">
              <Button onClick={startTest} className="w-full max-w-md mx-auto py-6 text-lg rounded-xl transition-all hover:scale-105">
                <span>Start Test</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
  
          {testStatus.status === "In Progress" && !testStatus.userCompleted && (
            <div className="space-y-6">
              <Alert className="border-2 border-amber-200 bg-amber-50 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-semibold text-lg">Test In Progress</AlertTitle>
                <AlertDescription className="mt-1">
                  You or your partner have started the compatibility test but haven't completed it yet.
                </AlertDescription>
              </Alert>
              <Button onClick={continueTest} className="w-full py-5 text-lg rounded-xl bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90">
                Continue Test
              </Button>
            </div>
          )}
  
          {testStatus.status === "Waiting" && testStatus.userCompleted && !testStatus.partnerCompleted && (
            <Alert className="border-2 border-blue-200 bg-blue-50 text-blue-800 py-4">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 mr-3 mt-1" />
                <div>
                  <AlertTitle className="font-semibold text-lg">Awaiting Partner</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p>Your responses have been saved. We're waiting for {partnerInfo?.name} to complete the test.</p>
                    {/* <div className="mt-4 flex justify-center">
                      <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-primary border-b-primary border-l-transparent animate-spin"></div>
                    </div> */}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
  
          {testStatus.status === "Completed" && (
            <div className="space-y-6">
              <Alert className="border-2 border-green-200 bg-green-50 text-green-800">
                <div className="flex items-start">
                  <Check className="h-6 w-6 mr-3 mt-1" />
                  <div>
                    <AlertTitle className="font-semibold text-lg">Test Completed</AlertTitle>
                    <AlertDescription className="mt-1">
                      Both you and {partnerInfo?.name} have completed the test!
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
              <Button onClick={viewResults} className="w-full py-5 text-lg rounded-xl bg-gradient-to-r from-green-500 to-primary hover:opacity-90 transition-all hover:shadow-lg">
                <span>View Results</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
  
      {/* Top couples section */}
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="shadow-lg border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Trophy className="h-6 w-6 text-amber-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">Top Couples</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {topCouples.length > 0 ? (
                topCouples.map((couple, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-secondary/30 to-secondary/50 hover:from-secondary/40 hover:to-secondary/60 transition-all border border-primary/5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-4">
                        <Avatar className="border-2 border-background ring-2 ring-primary/20 h-12 w-12">
                          <AvatarImage src={couple.user1?.image} alt={couple.user1.name[0]} />
                          <AvatarFallback className="bg-primary/20">{couple.user1.name[0]}</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-background ring-2 ring-primary/20 h-12 w-12">
                          <AvatarImage src={couple.user2?.image} alt={couple.user2.name[0]} />
                          <AvatarFallback className="bg-primary/20">{couple.user2.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-lg">
                          {couple.user1.name} & {couple.user2.name}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                          <span className="font-medium text-pink-500">{couple.score}%</span> Compatible
                        </span>
                      </div>
                    </div>
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                      <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-primary/20">
                  <Users className="h-12 w-12 mx-auto text-primary/30 mb-3" />
                  <p className="text-lg">No top couples data available yet</p>
                  <p className="text-sm mt-2">Complete tests will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}