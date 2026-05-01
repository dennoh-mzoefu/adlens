import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginButton } from './LoginButton'
import { LineChart } from 'lucide-react'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-primary">
              <LineChart className="h-8 w-8" />
              <span className="text-2xl font-bold">AdLens</span>
            </div>
          </div>
          <h1 className="text-xl font-semibold">Sign in to continue</h1>
          <p className="text-sm text-muted-foreground">
            Track and analyze ads with Claude AI
          </p>
        </div>

        <div className="border rounded-xl p-6 space-y-4 bg-card">
          <LoginButton />
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to use this tool responsibly.
          </p>
        </div>
      </div>
    </main>
  )
}
