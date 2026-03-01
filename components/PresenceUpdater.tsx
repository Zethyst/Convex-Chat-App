"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Component that periodically updates the user's presence (lastSeen timestamp)
 * to indicate they are online. Updates every 30 seconds while the component is mounted.
 */
export default function PresenceUpdater() {
  const updatePresence = useMutation(api.presence.updatePresence);

  useEffect(() => {
    // Update presence immediately on mount
    updatePresence();

    // Then update every 30 seconds
    const interval = setInterval(() => {
      updatePresence();
    }, 30000); // 30 seconds

    // Also update on window focus (user comes back to tab)
    const handleFocus = () => {
      updatePresence();
    };
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [updatePresence]);

  return null; // This component doesn't render anything
}
