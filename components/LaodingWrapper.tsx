// filepath: c:\Users\Hp\Desktop\project\components\loading-wrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import Loading from "@/components/Loading";

export default function LoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // Simulate a 2-second loading time
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}