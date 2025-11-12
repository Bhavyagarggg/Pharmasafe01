import type { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex bg-background text-foreground">
      <aside className="hidden md:flex w-64 border-r bg-sidebar text-sidebar-foreground">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-background">
          <Topbar />
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>

        <footer className="px-4 py-6 text-sm text-muted-foreground">
          <div className="max-w-7xl mx-auto">
            <p>{"© "}PharmaSafe – Expiry Management Dashboard</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
