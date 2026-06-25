"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, LogIn, LogOut, Menu, Shield, User, UserPlus, X } from "lucide-react"

import { useAuth } from "@/controller/auth-controller"
import { LoginModal } from "@/ui/components/auth/login-modal"
import { RegisterModal } from "@/ui/components/auth/register-modal"
import { cn } from "@/ui/utils"

const navItems = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#proceso", label: "Proceso" },
  { href: "/#proyectos", label: "Proyectos" },
  { href: "/#productos", label: "Productos" },
  { href: "/#contacto", label: "Contacto" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const { user, isAuthenticated, login, loginWithProvider, logout, register } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => {
      if (isUserMenuOpen) setIsUserMenuOpen(false)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isUserMenuOpen])

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  const menuItems = user?.role === "admin" ? [...navItems, { href: "/#admin", label: "Admin" }] : navItems

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
          isScrolled ? "bg-black/95 py-3 shadow-lg backdrop-blur-md" : "bg-transparent py-4 sm:py-6"        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
          <Link href="/#inicio" className="group flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
              <Image
                src="/images/simbolo.png"
                alt="Logo Makakaw"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-serif font-bold tracking-wide text-cream sm:text-xl">
                Makakaw
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-forest-light sm:text-xs sm:tracking-[0.2em]">
                Cafe y Cacao
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium uppercase tracking-wider text-cream/80 transition-colors hover:text-forest-light"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex items-center gap-2 rounded-xl border border-forest/30 bg-forest/10 px-4 py-2 transition-all hover:bg-forest/20"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest">
                    {user.role === "admin" ? <Shield size={16} className="text-white" /> : <User size={16} className="text-white" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-cream">{user.name}</p>
                    <p className="text-xs capitalize text-forest-light">{user.role}</p>
                  </div>
                  <ChevronDown size={16} className="text-cream/60" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-forest-light/20 bg-black/90 backdrop-blur-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-border p-3">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-foreground transition-colors hover:bg-forest/10"
                    >
                      <User size={16} className="text-forest" />
                      Mi perfil
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/#admin"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-foreground transition-colors hover:bg-forest/10"
                      >
                        <Shield size={16} className="text-forest" />
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Cerrar Sesion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:text-forest-light"
                >
                  <LogIn size={18} />
                  Iniciar Sesion
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-forest/20 transition-all hover:bg-forest-dark"
                >
                  <UserPlus size={18} />
                  Registrarse
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-cream lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={cn(
            "absolute left-0 right-0 top-full overflow-hidden bg-black/90 backdrop-blur-lg transition-all duration-300 lg:hidden",
            isMobileMenuOpen ? "max-h-[550px] " : "max-h-0"
          )}
        >
          <nav className="container mx-auto flex flex-col gap-4 px-4 py-6 sm:px-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b border-forest-light/40 py-2 text-base uppercase tracking-wider text-cream/80 transition-colors hover:text-forest-light sm:text-lg"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest">
                      {user.role === "admin" ? <Shield size={20} className="text-white" /> : <User size={20} className="text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-cream">{user.name}</p>
                      <p className="text-sm capitalize text-forest-light">{user.role}</p>
                    </div>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-forest/40 py-3 text-forest-light"
                  >
                    <User size={18} />
                    Mi perfil
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3 text-red-400"
                  >
                    <LogOut size={18} />
                    Cerrar Sesion
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsLoginOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-forest py-3 text-forest"
                  >
                    <LogIn size={18} />
                    Iniciar Sesion
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-forest py-3 text-white"
                  >
                    <UserPlus size={18} />
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onLogin={login}
        onLoginWithProvider={loginWithProvider}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
        onLoginWithProvider={loginWithProvider}
        onRegister={register}
      />
    </>
  )
}
