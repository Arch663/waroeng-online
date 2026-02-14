<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const router = useRouter();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function handleLogin() {
  if (!username.value || !password.value) return;

  loading.value = true;
  error.value = "";

  try {
    const res = await fetch(
      `${import.meta.env.VITE_DATABASE_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      },
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Login gagal.");
    }

    const data = await res.json();
    auth.setAuth(data.user, data.token);
    router.push("/");
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Terjadi kesalahan saat login.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <div
        class="bg-surface border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
      >
        <div
          class="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl transition-transform group-hover:scale-110"
        />
        <div
          class="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl transition-transform group-hover:scale-110"
        />

        <div class="relative z-10">
          <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold text-foreground mb-2">
              Waroeng Online
            </h1>
            <p class="text-muted">Gunakan akun Anda untuk masuk</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div
              v-if="error"
              class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center"
            >
              {{ error }}
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">Username</label>
              <input
                v-model="username"
                type="text"
                placeholder="Masukkan username"
                class="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">Passsword</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all text-lg"
            >
              {{ loading ? "Masuk..." : "Masuk Sekarang" }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-border/50 text-center">
            <p class="text-xs text-muted/60">
              © 2026 Arch663 Waroeng System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
