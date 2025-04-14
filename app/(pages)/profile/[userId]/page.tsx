"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, User, Cake, Users, Sparkles, Mail, Palette, Star } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";

interface Profile {
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  inRelation?: string;
  zodiacSign?: string;
  image?: string;
}

interface Relationship {
  user_sender_id?: string;
  user_receiver_id?: string;
  status?: string;
  partner_details?: Profile;
}

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBadge, setActiveBadge] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const badges = [
    { name: "New Member", color: "bg-emerald-500" },
    { name: "Active", color: "bg-sky-500" },
    { name: "Trendsetter", color: "bg-purple-500" }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("No user specified");
        setIsLoading(false);
        return;
      }

      try {
        // The email is already URL-encoded in the URL, so we use it as is
        const response = await axios.get(`/api/profile/${userId}`);
        
        if (response.data.success) {
          setProfile(response.data.profile);
          if (response.data.relationship) {
            setRelationship(response.data.relationship);
          }
        } else {
          setError(response.data.message || "Failed to load profile");
          toast.error(response.data.message || "Failed to load profile");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.response?.data?.message || "Failed to load profile");
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Cycle through badges
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBadge((prev) => (prev + 1) % badges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-indigo-900/5 to-purple-900/10 py-12 px-4 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 overflow-hidden p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">User Not Found</h2>
            <p className="text-muted-foreground">
              {error || "The profile you are looking for does not exist or was removed."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-900/5 to-purple-900/10 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 overflow-hidden">
          <CardContent className="pt-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative m-5">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
                  <AvatarImage src={profile?.image || ""} alt={profile?.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl font-bold">
                    {profile?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    {profile?.name}
                  </h1>
                  <div className="flex gap-2">
                    <div className={`text-xs px-2 py-1 rounded-full ${badges[activeBadge].color} text-white font-medium animate-pulse`}>
                      {badges[activeBadge].name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <p>{profile?.email}</p>
                </div>
              </div>
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
                Information about relationship status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {profile?.inRelation !== "in a relationship" ? (
                <div className="text-center py-8 px-4 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-6">
                    {profile?.name} hasn't connected with a partner yet
                  </p>
                </div>
              ) : relationship ? (
                <div className="space-y-6 p-4 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-xl">
                  <div className="flex items-center justify-center gap-4 py-4">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarImage src={profile?.image || ""} alt={profile?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold">
                        {profile?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-px bg-gradient-to-r from-indigo-500 to-pink-500"></div>
                    <Avatar className="h-16 w-16 border-2 border-background">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-500 text-xl font-bold">
                        {relationship.partner_details?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-center font-medium">
                    In a relationship with{" "}
                    <span className="text-pink-500">
                      {relationship.partner_details?.name || "Partner"}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 rounded-xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10 text-pink-500" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-2">
                    {profile?.name} is in a relationship
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Partner details are not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}