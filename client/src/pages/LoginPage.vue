<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguage } from "@/composables/useLanguage";

const router = useRouter();
const auth = useAuthStore();
const { language } = useLanguage();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const text = computed(() =>
  language.value === "id"
    ? {
        title: "Masuk",
        subtitle: "Silakan login untuk melanjutkan",
        username: "Username",
        usernamePlaceholder: "Masukkan username",
        password: "Password",
        passwordPlaceholder: "Masukkan password",
        login: "Masuk",
        loading: "Memproses...",
        loginFailed: "Login gagal.",
        loginError: "Terjadi kesalahan saat login.",
      }
    : {
        title: "Sign In",
        subtitle: "Please log in to continue",
        username: "Username",
        usernamePlaceholder: "Enter username",
        password: "Password",
        passwordPlaceholder: "Enter password",
        login: "Sign In",
        loading: "Processing...",
        loginFailed: "Login failed.",
        loginError: "An error occurred while logging in.",
      },
);

async function handleLogin() {
  if (!username.value || !password.value) return;

  loading.value = true;
  error.value = "";

  try {
    const res = await fetch(`${import.meta.env.VITE_DATABASE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || text.value.loginFailed);
    }

    const data = await res.json();
    auth.setAuth(data.user, data.token);
    router.push("/");
  } catch (err) {
    error.value = err instanceof Error ? err.message : text.value.loginError;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-6 font-sans">
    <div class="w-full max-w-lg">
      <div
        class="bg-surface border border-glass-border rounded-2xl p-12 relative overflow-hidden group"
      >
        <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent to-transparent opacity-50" />
        <div class="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent to-transparent opacity-50" />

        <div class="relative z-10">
          <div class="mb-12 text-center">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-2xl text-background text-4xl font-black mb-8 animate-pulse">
              W
            </div>
            <h1 class="text-4xl font-black text-foreground tracking-tighter uppercase mb-3">
              {{ text.title }}
            </h1>
            <p class="text-xs font-black text-muted tracking-widest uppercase opacity-50 italic">
              {{ text.subtitle }}
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-8">
            <div
              v-if="error"
              class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center uppercase tracking-widest animate-shake"
            >
              {{ error }}
            </div>

            <div class="space-y-3">
              <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">{{ text.username }}</label>
              <input
                v-model="username"
                type="text"
                :placeholder="text.usernamePlaceholder"
                class="w-full px-8 py-5 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground placeholder:text-xs"
                required
              />
            </div>

            <div class="space-y-3">
              <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">{{ text.password }}</label>
              <input
                v-model="password"
                type="password"
                :placeholder="text.passwordPlaceholder"
                class="w-full px-8 py-5 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground placeholder:text-xs"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-6 bg-accent text-background rounded-2xl font-semibold tracking-wide  hover:shadow-accent/40 active:scale-95 disabled:opacity-50 transition-all text-sm mt-4"
            >
              {{ loading ? text.loading : text.login }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out infinite;
}
</style>



