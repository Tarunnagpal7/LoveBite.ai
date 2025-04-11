"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, User, Cake, Users, Sparkles, Edit2, Camera, Mail, Palette, Star, Loader2, Calendar, Clock, XCircle, PlusCircle, FileQuestion } from "lucide-react";
import { profileSchema } from "@/schemas/profileSchema";
import type { ProfileFormData } from "@/schemas/profileSchema";
import axios from "axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";

interface Profile {
  age?: number;
  gender?: string;
  inRelation?: string;
  zodiacSign?: string;
}

interface Relationship {
  _id?: string;
  user_sender_id?: any;
  user_receiver_id?: any;
  status?: string;
  partner_details?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface Question {
  _id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingRelationship, setIsEndingRelationship] = useState(false);
  const user = session?.user;
  const [activeBadge, setActiveBadge] = useState(0);
  const [currentRelationship, setCurrentRelationship] = useState<Relationship | null>(null);
  const [relationshipHistory, setRelationshipHistory] = useState<Relationship[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const badges = [
    { name: "New Member", color: "bg-emerald-500" },
    { name: "Active", color: "bg-sky-500" },
    { name: "Trendsetter", color: "bg-purple-500" }
  ];

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      zodiacSign: undefined,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        console.log(response)
        if (response.data.success) {
          setProfile(response.data.profile);
          
          if (response.data.relationship) {
            setCurrentRelationship(response.data.relationship);
          }
          
          if (response.data.relationshipHistory) {
            setRelationshipHistory(response.data.relationshipHistory);
          }
          
          if (response.data.questions) {
            setQuestions(Array.isArray(response.data.questions) 
              ? response.data.questions 
              : response.data.questions.questions || []);
          }
          
          // Update form with fetched data
          form.reset({
            age: response.data.profile.age,
            gender: response.data.profile.gender,
            zodiacSign: response.data.profile.zodiacSign,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session, form]);

  // Cycle through badges
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBadge((prev) => (prev + 1) % badges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/profile/update", data);
      if (response.data.success) {
        await update();
        setProfile(data);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndRelationship = async () => {
    if (!currentRelationship?._id) return;
    
    setIsEndingRelationship(true);
    try {
      const response = await axios.patch(`/api/relationships/${currentRelationship._id}`, {
        status: "ended"
      });
      
      if (response.data.success) {
        toast.success("Relationship ended");
        // Update the relationship history
        if (currentRelationship) {
          setRelationshipHistory(prev => [currentRelationship, ...prev]);
        }
        setCurrentRelationship(null);
        
        // Update profile relationship status
        setProfile(prev => prev ? { ...prev, inRelation: "single" } : null);
        
        // Refresh session to update user data
        await update();
      }
    } catch (error) {
      console.error("Error ending relationship:", error);
      toast.error("Failed to end relationship");
    } finally {
      setIsEndingRelationship(false);
    }
  };

  // Get zodiac sign emoji
  const getZodiacEmoji = (sign?: string) => {
    const emojis: Record<string, string> = {
      "Aries": "♈️",
      "Taurus": "♉️",
      "Gemini": "♊️",
      "Cancer": "♋️",
      "Leo": "♌️",
      "Virgo": "♍️",
      "Libra": "♎️",
      "Scorpio": "♏️",
      "Sagittarius": "♐️",
      "Capricorn": "♑️",
      "Aquarius": "♒️",
      "Pisces": "♓️"
    };
    return sign ? emojis[sign] || "" : "";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const InfoItem = ({ icon: Icon, label, value, color = "text-indigo-500" }: { icon: any; label: string; value?: string | number | null; color?: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary/30">
      <div className={`p-2 rounded-full ${color} bg-opacity-10 text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold">{value || "Not specified"}</span>
      </div>
    </div>
  );

  const navigateToQuestion = (questionId: string) => {
    router.push(`/Q&A/${questionId}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-900/5 to-purple-900/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 overflow-hidden">
          <CardContent className="pt-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative m-5">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/20 transition-all hover:ring-primary">
                  <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl font-bold">
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {user?.name}
                  </h1>
                  <div className="flex gap-2">
                    <div className={`text-xs px-2 py-1 rounded-full ${badges[activeBadge].color} text-white font-medium animate-pulse`}>
                      {badges[activeBadge].name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <p>{user?.email}</p>
                </div>
                <div className="flex gap-4 mt-4 justify-center md:justify-start">
                  <Button variant="secondary" size="sm" className="rounded-full px-4">
                    <Star className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-full px-4">
                    <Palette className="h-4 w-4 mr-2" />
                    Themes
                  </Button>
                </div>
              </div>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-primary/20 hover:bg-white/20 transition-all">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] border-0 shadow-xl bg-background/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      Edit Profile
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter your age"
                                className="rounded-lg"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-lg">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zodiacSign"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zodiac Sign</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-lg">
                                  <SelectValue placeholder="Select zodiac sign" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {zodiacSigns.map((sign) => (
                                  <SelectItem key={sign} value={sign}>
                                    {getZodiacEmoji(sign)} {sign}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button disabled={isLoading} type="submit" className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save Changes" }
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 overflow-hidden hover:shadow-xl transition-all">
            <CardHeader className="border-b border-muted/20 bg-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-indigo-500 bg-opacity-10">
                  <User className="h-5 w-5 text-indigo-500" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-6">
              <InfoItem icon={Cake} label="Age" value={profile?.age} color="bg-pink-500" />
              <InfoItem 
                icon={Users} 
                label="Gender" 
                value={profile?.gender && profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} 
                color="bg-blue-500"
              />
              <InfoItem icon={Heart} label="Relationship Status" value={profile?.inRelation} color="bg-red-500" />
              <InfoItem 
                icon={Sparkles} 
                label="Zodiac Sign" 
                value={profile?.zodiacSign ? `${getZodiacEmoji(profile?.zodiacSign)} ${profile?.zodiacSign}` : undefined} 
                color="bg-amber-500"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 overflow-hidden hover:shadow-xl transition-all">
            <CardHeader className="border-b border-muted/20 bg-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-pink-500 bg-opacity-10">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                Relationship Details
              </CardTitle>
              <CardDescription>
                Information about your current relationship and partner
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {profile?.inRelation === "in a relationship" && currentRelationship ? (
                <div className="space-y-6 p-4 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-xl">
                  <div className="flex items-center justify-center gap-4 py-4">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarImage 
                        src={currentRelationship.partner_details?.image || ""} 
                        alt={currentRelationship.partner_details?.name || ""} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-xl font-bold">
                        {currentRelationship.partner_details?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-px bg-gradient-to-r from-indigo-500 to-pink-500"></div>
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold">
                        {user?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">
                      {currentRelationship.partner_details?.name || "Partner"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Together since {formatDate(currentRelationship.createdAt)}
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-full border-red-500/20 hover:bg-red-500/10 text-red-500">
                        <XCircle className="mr-2 h-4 w-4" />
                        End Relationship
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>End Relationship</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to end your relationship with {currentRelationship.partner_details?.name || "your partner"}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleEndRelationship} 
                          disabled={isEndingRelationship}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {isEndingRelationship ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-6">
                    You haven't connected with a partner yet
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-pink-500/20 hover:bg-pink-500/10 text-pink-500 font-medium rounded-full px-6 py-2"
                    onClick={(e)=>{
                      e.stopPropagation();
                      router.push('/compatibility')
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Connect with Partner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Past Relationships */}
        {relationshipHistory.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 overflow-hidden hover:shadow-xl transition-all">
            <CardHeader className="border-b border-muted/20 bg-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500 bg-opacity-10">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                Relationship History
              </CardTitle>
              <CardDescription>
                Your past relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {relationshipHistory.map((rel, index) => (
                  <div key={rel._id || index} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-all">
                    <Link href={`/profile/${rel.partner_details._id}`} >
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={rel.partner_details?.image || ""} 
                        alt={rel.partner_details?.name || ""} 
                        />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500">
                        {rel.partner_details?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    </Link>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-semibold">{rel.partner_details?.name || "Former Partner"}</h3>
                      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Started: {formatDate(rel.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Ended: {formatDate(rel.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 overflow-hidden hover:shadow-xl transition-all">
          <CardHeader className="border-b border-muted/20 bg-secondary/10">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-500 bg-opacity-10">
                <FileQuestion className="h-5 w-5 text-blue-500" />
              </div>
              Your Questions
            </CardTitle>
            <CardDescription>
              Questions you've asked
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div 
                    key={question._id} 
                    className="p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer"
                    onClick={() => navigateToQuestion(question._id)}
                  >
                    <h3 className="font-semibold mb-2">{question.content}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(question.createdAt)}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToQuestion(question._id);
                        }}
                      >
                        View Details →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-xl">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center mb-4">
                  <FileQuestion className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium mb-6">
                  You haven't asked any questions yet
                </p>
                <Button 
                  variant="outline" 
                  className="border-blue-500/20 hover:bg-blue-500/10 text-blue-500 font-medium"
                  onClick={(e) => {
                     e.stopPropagation();
                     router.push('Q&A')
                  }}
                  >
                  Ask a Question
                </Button>
              
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}