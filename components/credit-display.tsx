"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";
import Link from "next/link";

interface CreditDisplayProps {
  credits: number;
  maxCredits: number;
}

export default function CreditDisplay({ credits, maxCredits }: CreditDisplayProps) {
  const percentage = (credits / maxCredits) * 100;

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
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{credits} credits remaining</span>
            <span>{maxCredits} total credits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}