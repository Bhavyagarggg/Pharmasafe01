"use client"

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
import { createClientSupabase } from "@/lib/supabase"

type User = { name: string; email: string }

export function Topbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = "/auth/login"
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
        {!loading && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" aria-label="Open profile menu">
                {user.email?.split("@")[0]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : !loading ? (
          <Link href="/auth/login">
            <Button size="sm" variant="default">
              Login
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  )
}
