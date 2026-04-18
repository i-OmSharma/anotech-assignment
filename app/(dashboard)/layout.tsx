import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { MobileNav } from "@/components/layout/MobileNav"
import { QueryProvider } from "@/components/providers/QueryProvider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar
            userName={session.user.name}
            userEmail={session.user.email}
            userRole={session.user.role}
          />
          <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
        </div>
        <MobileNav />
      </div>
    </QueryProvider>
  )
}
