"use client";

import { WifiOff, RefreshCw, Home, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";

// Subscribe to online/offline status
function subscribeToOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineStatus() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

export default function OfflinePage() {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    getServerSnapshot
  );

  useEffect(() => {
    if (isOnline) {
      // Auto-redirect after a short delay when back online
      const timeout = setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-green-500/20 p-6">
            <RefreshCw className="h-12 w-12 text-green-500 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">You&apos;re back online!</h1>
            <p className="text-muted-foreground max-w-md">
              Redirecting you to the app...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="rounded-full bg-muted p-6">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You&apos;re offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 w-full">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-left text-sm">
              <p className="font-medium">Your data is safe</p>
              <p className="text-muted-foreground">
                All your content is stored locally on your device. You can continue browsing and editing - changes will sync when you&apos;re back online.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link href="/" className="w-full">
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
          <Button onClick={handleRetry} variant="outline" className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Check connection
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: This page will automatically redirect when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
