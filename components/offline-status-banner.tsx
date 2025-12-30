"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { WifiOff, Wifi, X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return true; // Assume online during SSR
}

export function OfflineStatusBanner() {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    getServerSnapshot
  );

  const [showBanner, setShowBanner] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // User went offline
      setShowBanner(true);
      setShowBackOnline(false);
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // User came back online after being offline
      setShowBanner(false);
      setShowBackOnline(true);

      // Auto-hide "back online" message after 3 seconds
      const timeout = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, wasOffline]);

  const handleDismiss = () => {
    setShowBanner(false);
  };

  const handleDismissBackOnline = () => {
    setShowBackOnline(false);
  };

  // "Back Online" notification
  if (showBackOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5 duration-300">
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/20 p-2">
              <Wifi className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-600 dark:text-green-400">
                You&apos;re back online!
              </p>
              <p className="text-sm text-muted-foreground">
                Your connection has been restored.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismissBackOnline}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Offline banner
  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-[420px] animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-lg border border-yellow-500/30 bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-yellow-500/20 p-2">
            <WifiOff className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-medium">You&apos;re offline</p>
            <p className="text-sm text-muted-foreground">
              No internet connection detected. Don&apos;t worry, you can still browse your cached content.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/50 p-2">
          <Database className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your data is stored locally and safe.
          </p>
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
          <Link href="/topics" className="flex-1">
            <Button size="sm" className="w-full gap-2">
              <Database className="h-4 w-4" />
              Browse Content
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
