"use client"

import { useState } from "react"
import type { Provider } from "@supabase/supabase-js"
import { LogIn, X } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onLogin: (input: { email: string; password: string; role: "admin" | "user" }) => Promise<void>
  onLoginWithProvider: (provider: Provider) => Promise<void>
}

export function LoginModal({ isOpen, onClose, onLoginWithProvider }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSocialLogin = async (provider: Provider) => {
    setError("")
    setIsLoading(true)

    try {
      onClose()
      await onLoginWithProvider(provider)
    } catch {
      setError("No se pudo iniciar sesion con el proveedor seleccionado.")
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="h-2 bg-gradient-to-r from-forest via-forest-light to-forest" />

        <div className="p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={24} />
          </button>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/20">
              <LogIn className="h-7 w-7 text-forest" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Iniciar Sesion</h2>
            <p className="mt-2 text-muted-foreground">Elige una cuenta para continuar</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />
              Continuar con Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("azure")}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:border-forest/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MicrosoftIcon />
              Continuar con Microsoft
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-forest/10 px-4 py-3 text-sm text-forest">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                Redirigiendo...
              </div>
            ) : null}

            {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div> : null}
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

function MicrosoftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#F25022" d="M3 3h8.4v8.4H3z" />
      <path fill="#7FBA00" d="M12.6 3H21v8.4h-8.4z" />
      <path fill="#00A4EF" d="M3 12.6h8.4V21H3z" />
      <path fill="#FFB900" d="M12.6 12.6H21V21h-8.4z" />
    </svg>
  )
}
