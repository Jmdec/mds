import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  role?: string
  token?: string
  [key: string]: unknown
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  token: string | null
  login: (user: User) => void
  logout: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      token: null,

      login: (user: User) => {
        const token = typeof user.token === "string" ? user.token : ""

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage")
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }

        set({ isLoggedIn: true, user, token })

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          const oneYearInSeconds = 365 * 24 * 60 * 60
          document.cookie = `auth_token=${token}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`
        }
      },

      logout: () => {
        set({ isLoggedIn: false, user: null, token: null })

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
          localStorage.removeItem("auth-storage")
          localStorage.removeItem("restaurant-cart-storage")
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
      },

      initializeAuth: () => {
        if (typeof window === "undefined") return

        const token = localStorage.getItem("auth_token")

        if (!token) {
          set({ isLoggedIn: false, user: null, token: null })
          return
        }

        const currentState = useAuthStore.getState()

        if (currentState.user && currentState.token === token) {
          console.log("✅ Auth already rehydrated by persist middleware, role:", currentState.user?.role)
          return
        }

        console.warn("⚠️ Auth token/state mismatch — clearing session")
        set({ isLoggedIn: false, user: null, token: null })

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
          localStorage.removeItem("auth-storage")
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)