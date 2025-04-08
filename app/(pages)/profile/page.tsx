"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, User, Cake, Users, Sparkles, Edit2, Camera, Mail, Palette, Star, Loader2 } from "lucide-react";
import { profileSchema } from "@/schemas/profileSchema";
import type { ProfileFormData } from "@/schemas/profileSchema";
import axios from "axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";

interface Profile {
  age?: number;
  gender?: string;
  inRelation?: string;
  zodiacSign?: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = session?.user;
  const [activeBadge, setActiveBadge] = useState(0);

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
      inRelation: undefined,
      zodiacSign: undefined,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        if (response.data.success) {
          setProfile(response.data.profile);
          // Update form with fetched data
          form.reset({
            age: response.data.profile.age,
            gender: response.data.profile.gender,
            inRelation: response.data.profile.inRelation,
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
    }finally{
      setIsLoading(false);
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-900/5 to-purple-900/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 overflow-hidden">
          {/* <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80"></div> */}
          <CardContent className="pt-0 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative m-5">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/20 transition-all hover:ring-primary">
                  {/* <AvatarImage src={user?.image || ""} alt={user?.name || ""} /> */}
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
                        name="inRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-lg">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="in a relationship">In a Relationship</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
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
                        {isLoading ? <Loader2 /> : "Save Changes" }
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
                Information about your relationship and partner
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {profile?.inRelation === "single" ? (
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
                  >
                    Connect with Partner
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 p-4 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-xl">
                  <div className="flex items-center justify-center gap-4 py-4">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-xl font-bold">
                        ?
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
                  <p className="text-center text-muted-foreground font-medium mb-4">
                    Partner connection feature coming soon!
                  </p>
                  <Button variant="outline" className="w-full rounded-full border-pink-500/20 hover:bg-pink-500/10 text-pink-500">
                    <Heart className="mr-2 h-4 w-4" />
                    Connect with Partner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}