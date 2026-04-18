"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, CheckSquare, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginSchema, LoginInput } from "@/lib/validations"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }
      router.push("/tasks")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">TaskFlow</span>
        </div>
        <div>
          <blockquote className="text-gray-300 text-2xl font-light leading-relaxed mb-6">
            &ldquo;Stay organised. Ship faster. Win together.&rdquo;
          </blockquote>
          <div className="space-y-3">
            {["Kanban & list views", "Team task assignment", "Priority tracking & due dates"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-gray-400 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-xs">Anotech India Solutions · SDE-1 Assignment</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg">TaskFlow</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</>
                ) : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-gray-900 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
