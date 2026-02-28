"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

const clerkAppearance = {
  elements: {
    rootBox: "mx-auto",
    card: "shadow-none",
  },
};

export default function LoginForm({
  mode = "sign-in",
}: {
  mode?: "sign-in" | "sign-up";
}) {
  if (mode === "sign-up") {
    return (
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/"
        signInUrl="/"
        afterSignUpUrl="/chat"
      />
    );
  }

  return (
    <SignIn
      appearance={clerkAppearance}
      routing="path"
      path="/"
      signUpUrl="/?mode=signup"
      afterSignInUrl="/chat"
      afterSignUpUrl="/chat"
    />
  );
}
