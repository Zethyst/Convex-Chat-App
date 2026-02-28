import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-8">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
            },
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/chat"
          fallbackRedirectUrl="/chat"
        />
      </div>
    </div>
  );
}
