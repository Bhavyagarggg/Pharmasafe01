"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
            <p className="text-sm text-muted-foreground">
              Something went wrong with the confirmation link. Please try signing up again.
            </p>
          </div>
          <Link href="/auth/signup">
            <Button className="w-full">Back to Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
