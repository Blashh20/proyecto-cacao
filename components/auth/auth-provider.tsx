"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  name: string
  email: string
  role: "admin" | "user"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (role: "admin" | "user") => void
  logout: () => void
  register: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (role: "admin" | "user") => {
    setUser({
      name: role === "admin" ? "Administrador Makakaw" : "Usuario Demo",
      email: role === "admin" ? "admin@makakaw.co" : "usuario@demo.com",
      role,
    })
  }

  const logout = () => {
    setUser(null)
  }

  const register = () => {
    setUser({
      name: "Nuevo Usuario",
      email: "nuevo@makakaw.co",
      role: "user",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
