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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around h-16 z-50 safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-medium transition-colors px-5 py-2 rounded-lg",
              isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-indigo-600")} />
            {item.label}
          </Link>
        )
      })}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex flex-col items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 px-5 py-2 rounded-lg transition-colors"
      >
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </nav>
  )
}
