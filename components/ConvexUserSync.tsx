"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";

export default function ConvexUserSync() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const storeUser = useMutation(api.users.getOrCreate);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      storeUser()
        .then((userId) => {
          console.log("[ConvexUserSync] ✅ User synced successfully:", userId);
        })
        .catch((err) => {
          console.error("[ConvexUserSync] ❌ Failed to sync user to Convex:", err);
          console.error("[ConvexUserSync] Error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name,
          });
          hasSynced.current = false;
        });
    }
    if (!isAuthenticated) {
      console.log("[ConvexUserSync] User not authenticated, resetting sync state");
      hasSynced.current = false;
    }
  }, [isAuthenticated, isLoading, storeUser]);

  return null;
}
