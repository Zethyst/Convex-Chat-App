"use client";

import { ReactNode, useEffect } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in environment variables");
}

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const auth = useAuth();

  useEffect(() => {
    console.log("[ConvexClientProvider] Clerk auth state:", {
      isSignedIn: auth.isSignedIn,
      userId: auth.userId,
      isLoaded: auth.isLoaded,
    });

    // Log when Clerk provides auth token
    if (auth.isSignedIn && auth.getToken) {
      // Try to get the Convex-specific token
      auth.getToken({ template: "convex" })
        .then((token) => {
          console.log("[ConvexClientProvider] ✅ Convex token available:", {
            hasToken: !!token,
            tokenLength: token?.length,
            tokenPreview: token ? `${token.substring(0, 20)}...` : null,
          });
        })
        .catch((err) => {
          console.error("[ConvexClientProvider] ❌ Failed to get Convex token:", err);
          console.error("[ConvexClientProvider] This usually means:");
          console.error("  1. JWT template named 'convex' doesn't exist in Clerk Dashboard");
          console.error("  2. Or the template isn't activated");
          console.error("  3. Go to Clerk Dashboard → JWT Templates → Create 'convex' template");
        });

      // Also try default token for comparison
      auth.getToken().then((token) => {
        console.log("[ConvexClientProvider] Default Clerk token available:", {
          hasToken: !!token,
          tokenLength: token?.length,
        });
      }).catch((err) => {
        console.error("[ConvexClientProvider] Failed to get default Clerk token:", err);
      });
    }
  }, [auth.isSignedIn, auth.userId, auth.isLoaded, auth.getToken]);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
