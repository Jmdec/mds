import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
  [key: string]: unknown;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: (user: User) => {
        const token = typeof user.token === "string" ? user.token : "";

        if (typeof window !== "undefined") {
          document.cookie =
            "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        set({ isLoggedIn: true, user, token });

        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          const oneYearInSeconds = 365 * 24 * 60 * 60;
          document.cookie = `auth_token=${token}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`;
        }
      },

      logout: () => {
        set({ isLoggedIn: false, user: null, token: null });

        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("restaurant-cart-storage");
          document.cookie =
            "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      },

      initializeAuth: () => {
        if (typeof window === "undefined") return;

        const hydrated = useAuthStore.persist.hasHydrated();

        if (!hydrated) {
          const unsub = useAuthStore.persist.onFinishHydration(() => {
            unsub();
            useAuthStore.getState().initializeAuth();
          });
          return;
        }

        const { user, token } = get();

        if (user && token) {
          const oneYearInSeconds = 365 * 24 * 60 * 60;
          document.cookie = `auth_token=${token}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`;
          console.log("✅ Session restored from storage, role:", user.role);
          return;
        }

        set({ isLoggedIn: false, user: null, token: null });
        localStorage.removeItem("auth_token");
        document.cookie =
          "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        // _hasHydrated is intentionally excluded
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
