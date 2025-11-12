"use client"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a confirmation link to your email address. Click the link to verify your account and get
              started.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn't receive an email? Check your spam folder or try signing up again.
          </p>
        </div>
      </div>
    </div>
  )
}
