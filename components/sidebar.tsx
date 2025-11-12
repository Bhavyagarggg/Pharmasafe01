"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { href: "/", label: "Dashboard Overview" },
  { href: "/medicines", label: "Medicines & Batches" },
  { href: "/predictions", label: "Expiry Predictions" },
  { href: "/alerts", label: "Alerts" },
  { href: "/stock", label: "Stock Prioritization" },
  { href: "/reports", label: "Reports" },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <nav className="w-full h-full flex flex-col p-4 gap-2">
      <div className="px-2 py-1">
        <span className="font-semibold">PharmaSafe 💊</span>
      </div>
      <ul className="flex-1 flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="px-2 text-xs text-muted-foreground">v0 demo</div>
    </nav>
  )
}
