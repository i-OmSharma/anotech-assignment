"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { LogOut, ChevronDown, CheckSquare } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface NavbarProps {
  userName: string
  userEmail: string
  userRole: string
}

export function Navbar({ userName, userEmail, userRole }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <CheckSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-gray-900">TaskFlow</span>
      </div>
      <div className="hidden md:block" />

      {/* Right: user menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 leading-none">{userName}</span>
            <span className="text-xs text-gray-500 leading-none mt-0.5 capitalize">{userRole.toLowerCase()}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{userEmail}</p>
              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                {userRole.toLowerCase()}
              </span>
            </div>
            <div className="p-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
