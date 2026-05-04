"use client"

import { useState } from "react"
import type { Provider } from "@supabase/supabase-js"
import { Eye, EyeOff, LogIn, Shield, User, X } from "lucide-react"

import { cn } from "@/ui/utils"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onLogin: (input: { email: string; password: string; role: "admin" | "user" }) => Promise<void>
  onLoginWithProvider: (provider: Provider) => Promise<void>
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister, onLogin, onLoginWithProvider }: LoginModalProps) {
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

  const handleSocialLogin = async (provider: Provider) => {
  setError("")
  setIsLoading(true)

  try {
    onClose() // 👈 CIERRA el modal antes de redirigir
    //await onLoginWithProvider(provider)
  } catch (err) {
    setError("Error con Google")
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
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon />
                Continuar con Google
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.2H12z" />
      <path fill="#34A853" d="M3.5 7.4l3.2 2.3C7.5 7.7 9.6 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.7 0-7 2.1-8.5 5z" />
      <path fill="#FBBC05" d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.3-2.6-5.5-3.9l-3.2 2.5c1.5 2.9 4.6 5.1 8.7 5.1z" />
      <path fill="#4285F4" d="M21.1 12.3c0-.5 0-.9-.1-1.2H12v3.9h5.5c-.3 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6 0-1 .2-1.9.7-2.7L3.5 7.4C2.8 8.8 2.4 10.4 2.4 12c0 5.3 4.3 9.6 9.6 9.6 6.9 0 9.1-4.8 9.1-9.3z" />
    </svg>
  )
}

