import { SignUp as ClerkSignUp } from '@clerk/clerk-react'
import { useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export function SignUp() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Navigate to="/studio" />
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-16rem)] gap-8 md:gap-12 items-center px-4 md:px-6">
      {/* Hero Section */}
      <div className="flex-1 text-center md:text-left">
        <img 
          src="/audiomax.png" 
          alt="AudioMax Logo" 
          className="w-[300px] md:w-[400px] mx-auto md:mx-0 mb-8"
        />
        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text animate-gradient">
          Join AUDIOMAX Today
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto md:mx-0">
          Create stunning audio content with AI-powered voice technology. Perfect for content creators, educators, and storytellers.
        </p>
      </div>

      {/* Auth Section */}
      <div className="w-full md:flex-1 md:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-8 border border-white/10">
          <ClerkSignUp 
            routing="hash"
            path="/sign-up"
            signInUrl="/"
            afterSignUpUrl="/studio"
            redirectUrl="/studio"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/80 w-full',
                card: 'bg-transparent w-full',
                headerTitle: 'text-white text-xl md:text-2xl',
                headerSubtitle: 'text-white/80',
                socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20 w-full',
                dividerLine: 'bg-white/20',
                dividerText: 'text-white/60',
                formFieldLabel: 'text-white/80',
                formFieldInput: 'bg-white/10 border-white/20 text-white w-full px-3 py-2 rounded-md',
                formFieldInputShowPasswordButton: 'text-white/60 hover:text-white',
                footerActionLink: 'text-[#9de9c7] hover:text-[#9de9c7]/80',
                footerAction: 'flex items-center justify-center mt-4',
                form: 'w-full space-y-4',
                formFieldRow: 'w-full',
                identityPreviewEditButton: 'text-[#9de9c7] hover:text-[#9de9c7]/80',
                formResendCodeLink: 'text-[#9de9c7] hover:text-[#9de9c7]/80',
                otpCodeFieldInput: 'bg-white/10 border-white/20 text-white w-12 h-12 text-center rounded-md'
              },
              layout: {
                socialButtonsPlacement: 'bottom'
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
