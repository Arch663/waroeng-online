import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface User {
  id: number;
  username: string;
  role: "admin" | "manager" | "cashier";
  full_name: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  const isAuthenticated = computed(() => !!token.value);
  const role = computed(() => user.value?.role);

  function setAuth(u: User, t: string) {
    user.value = u;
    token.value = t;
    localStorage.setItem("token", t);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  async function fetchMe() {
    if (!token.value) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_DATABASE_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      );

      if (res.ok) {
        user.value = await res.json();
      } else {
        logout();
      }
    } catch (error) {
      console.error("Fetch me error:", error);
      logout();
    }
  }

  return { user, token, isAuthenticated, role, setAuth, logout, fetchMe };
});
