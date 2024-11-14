import { SignIn } from '@clerk/clerk-react';

export function LoginForm() {
  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="text-white text-xl md:text-2xl font-semibold">Sign in to AudioMax</h2>
        <p className="text-white/80 mt-2">Enter your details to continue</p>
      </div>
      <SignIn 
        routing="path" 
        path="/sign-in" 
        signUpUrl="/sign-up"
        afterSignInUrl="/studio"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "bg-transparent shadow-none",
            headerTitle: "text-white",
            headerSubtitle: "text-white/80",
            formButtonPrimary: "bg-[#63248d] hover:bg-[#63248d]/80",
            formFieldInput: "bg-white/10 border border-white/20 text-white",
            formFieldLabel: "text-primary",
            footerActionLink: "text-[#9de9c7] hover:text-[#9de9c7]/80"
          }
        }}
      />
    </div>
  );
}
