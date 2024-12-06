import SignInButton from '@/components/SignInButton'

export default function LandingPage() {
  return (
    
    <div className="space-y-6 p-4">
      <div className="flex justify-end p-4">
            <SignInButton />
          </div>
      <h1 className="text-3xl font-bold">Welcome to Our Site</h1>
      <p>Explore our features and enjoy your stay!</p>
    </div>
  )
}

