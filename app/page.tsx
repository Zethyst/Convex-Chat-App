"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useAuth();
  const isSignUp = searchParams.get("mode") === "signup";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/chat");
      return;
    }
    if (isLoaded && !isSignedIn) {
      router.replace(isSignUp ? "/sign-up" : "/sign-in");
    }
  }, [isLoaded, isSignedIn, isSignUp, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-slate-400">Redirecting...</div>
      <p className="mt-4 text-sm text-slate-500">
        If you&apos;re not redirected,{" "}
        <Link href={isSignUp ? "/sign-up" : "/sign-in"} className="text-slate-900 font-medium underline">
          click here
        </Link>
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-slate-400">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
