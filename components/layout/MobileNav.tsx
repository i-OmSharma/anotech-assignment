"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around h-16 z-50">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-medium transition-colors px-4 py-2",
              isActive ? "text-primary" : "text-gray-500"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex flex-col items-center gap-1 text-xs font-medium text-gray-500 px-4 py-2"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </nav>
  )
}
