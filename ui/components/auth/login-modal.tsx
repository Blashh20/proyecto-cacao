"use client"

import { useState } from "react"
import { Eye, EyeOff, LogIn, Shield, User, X } from "lucide-react"

import { cn } from "@/ui/utils"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onLogin: (input: { email: string; password: string; role: "admin" | "user" }) => Promise<void>
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "user">("user")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await onLogin({
        email,
        password,
        role,
      })
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo iniciar sesion"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="h-2 bg-gradient-to-r from-forest via-forest-light to-forest" />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={24} />
          </button>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-forest/20">
              <LogIn className="h-8 w-8 text-forest" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Iniciar Sesion</h2>
            <p className="mt-2 text-muted-foreground">Bienvenido de vuelta a Makakaw</p>
          </div>

          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all duration-300",
                role === "user"
                  ? "border-forest bg-forest/10 text-forest"
                  : "border-border text-muted-foreground hover:border-forest/50"
              )}
            >
              <User size={20} />
              <span className="font-medium">Usuario</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 transition-all duration-300",
                role === "admin"
                  ? "border-forest bg-forest/10 text-forest"
                  : "border-border text-muted-foreground hover:border-forest/50"
              )}
            >
              <Shield size={20} />
              <span className="font-medium">Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Correo Electronico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Contrasena</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

            {role === "admin" && (
              <div className="rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-forest-light">
                Solo usuarios con rol administrador en Supabase pueden entrar al panel admin.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-4 font-semibold text-white transition-all duration-300 hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Iniciando sesion...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar Sesion
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              No tienes una cuenta?{" "}
              <button onClick={onSwitchToRegister} className="font-semibold text-forest transition-colors hover:text-forest-light">
                Registrate aqui
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

