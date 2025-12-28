"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You&apos;re offline</h1>
          <p className="text-muted-foreground max-w-md">
            It looks like you&apos;ve lost your internet connection. Don&apos;t
            worry - your saved content is still available locally.
          </p>
        </div>
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
