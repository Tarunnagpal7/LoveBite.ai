"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";
import Link from "next/link";

interface CreditDisplayProps {
  credits: number;
}

export default function CreditDisplay({ credits }: CreditDisplayProps) {
  // Handle null/undefined credits (loading state)
  if (credits === null || credits === undefined) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-medium">AI Credits</span>
            </div>
            <Link 
              href="/pricing" 
              className="text-sm text-primary hover:underline"
            >
              Get More Credits
            </Link>
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // We'll use a simple progress indicator without percentage calculation
  // This assumes higher credits = more progress
  // const progressValue = credits > 0 ? Math.min(100, credits) : 0;

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Credits</span>
          </div>
          <Link 
            href="/pricing" 
            className="text-sm text-primary hover:underline"
          >
            Get More Credits
          </Link>
        </div>
        <div className="space-y-2">
          {/* <Progress value={progressValue} className="h-2" /> */}
          <div className="text-lg text-muted-foreground">
            <span>{credits} credits remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}