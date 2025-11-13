"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persistSession = async (sessionUser) => {
    try {
      if (sessionUser) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: sessionUser }),
        })
      } else {
        await fetch("/api/auth/session", { method: "DELETE" })
      }
    } catch (error) {
      console.error("Error sincronizando la sesión:", error)
    }
  }

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("notion_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulate login - check against stored users
    const users = JSON.parse(localStorage.getItem("notion_users") || "[]")
    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const userWithoutPassword = { id: foundUser.id, email: foundUser.email, name: foundUser.name }
      setUser(userWithoutPassword)
      localStorage.setItem("notion_user", JSON.stringify(userWithoutPassword))
      await persistSession(userWithoutPassword)
      return { success: true }
    }

    return { success: false, error: "Credenciales inválidas" }
  }

  const register = async (name, email, password) => {
    // Simulate registration
    const users = JSON.parse(localStorage.getItem("notion_users") || "[]")

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "El usuario ya existe" }
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("notion_users", JSON.stringify(users))

    const userWithoutPassword = { id: newUser.id, email: newUser.email, name: newUser.name }
    setUser(userWithoutPassword)
    localStorage.setItem("notion_user", JSON.stringify(userWithoutPassword))
    await persistSession(userWithoutPassword)

    return { success: true }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem("notion_user")
    await persistSession(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
