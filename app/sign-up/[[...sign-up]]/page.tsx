import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-8">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none",
            },
          }}
          signInUrl="/sign-in"
          forceRedirectUrl="/chat"
          fallbackRedirectUrl="/chat"
        />
      </div>
    </div>
  );
}
