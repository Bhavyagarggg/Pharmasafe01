"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type User = { name: string; email: string }

export function Topbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("pharmasafe:user") : null
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        setUser(null)
      }
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem("pharmasafe:user")
    setUser(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden bg-transparent" aria-label="Open navigation">
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>PharmaSafe 💊</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100%-56px)]">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>

        {/* Brand for small screens */}
        <Link href="/" className="md:hidden shrink-0 text-sm font-semibold text-foreground">
          PharmaSafe {"💊"}
        </Link>

        {/* Search (hide on very small) */}
        <div className="hidden sm:block flex-1">
          <label htmlFor="global-search" className="sr-only">
            Search
          </label>
          <Input id="global-search" placeholder="Search medicines or batches..." className="w-full" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" aria-label="Open profile menu">
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Signed in</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="mailto:{user.email}">{user.email}</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <AuthDialog onAuth={(u) => setUser(u)} />
        )}
      </div>
    </div>
  )
}

function AuthDialog({ onAuth }: { onAuth: (u: User) => void }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("signup")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // basic validation
    if (mode === "signup" && !name.trim()) return setError("Name is required")
    if (!email.includes("@")) return setError("Valid email is required")
    if (password.length < 6) return setError("Password must be at least 6 characters")

    const u = { name: mode === "signup" ? name.trim() : email.split("@")[0], email: email.trim() }
    localStorage.setItem("pharmasafe:user", JSON.stringify(u))
    onAuth(u)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" aria-haspopup="dialog">
          Login / Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{mode === "signup" ? "Create your account" : "Welcome back"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <Button type="submit">{mode === "signup" ? "Sign up" : "Login"}</Button>
            <Button type="button" variant="ghost" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
              {mode === "signup" ? "Have an account? Login" : "New here? Sign up"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
