"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function AuthDebug() {
  const clerkAuth = useAuth();
  const clerkUser = useUser();
  const convexAuth = useConvexAuth();
  const [showDetails, setShowDetails] = useState(false);

  const currentIdentity = useQuery(api.users.getCurrentIdentity);
  const allUsers = useQuery(api.users.getAllUsers);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-slate-300 rounded-lg shadow-lg p-4 max-w-md text-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-900">Auth Debug</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-500 hover:text-slate-700"
        >
          {showDetails ? "−" : "+"}
        </button>
      </div>

      <div className="space-y-1">
        <div>
          <span className="font-semibold">Clerk:</span>{" "}
          <span className={clerkAuth.isSignedIn ? "text-green-600" : "text-red-600"}>
            {clerkAuth.isSignedIn ? "✅ Signed In" : "❌ Signed Out"}
          </span>
        </div>
        <div>
          <span className="font-semibold">Convex:</span>{" "}
          <span className={convexAuth.isAuthenticated ? "text-green-600" : "text-red-600"}>
            {convexAuth.isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
          </span>
        </div>
        <div>
          <span className="font-semibold">Users in DB:</span>{" "}
          <span className="text-blue-600">{allUsers?.length ?? "loading..."}</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
          <div>
            <div className="font-semibold mb-1">Clerk User ID:</div>
            <div className="font-mono text-slate-600 break-all">{clerkUser.user?.id ?? "none"}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Clerk Email:</div>
            <div className="font-mono text-slate-600">{clerkUser.user?.primaryEmailAddress?.emailAddress ?? "none"}</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Convex Identity Subject:</div>
            <div className="font-mono text-slate-600 break-all">
              {currentIdentity?.subject ?? "none"}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">Convex Loading:</div>
            <div className="text-slate-600">{convexAuth.isLoading ? "Yes" : "No"}</div>
          </div>
          {allUsers && allUsers.length > 0 && (
            <div>
              <div className="font-semibold mb-1">Users in Database:</div>
              <div className="max-h-32 overflow-y-auto">
                {allUsers.map((user) => (
                  <div key={user._id} className="font-mono text-slate-600 text-xs">
                    {user.clerkId} - {user.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
