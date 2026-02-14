<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const username = ref("");
const password = ref("");
const fullName = ref("");
const role = ref<"admin" | "manager" | "cashier">("cashier");
const loading = ref(false);
const error = ref("");
const success = ref("");

async function handleRegister() {
  if (!username.value || !password.value || !fullName.value) return;

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const res = await fetch(
      `${import.meta.env.VITE_DATABASE_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
          full_name: fullName.value,
          role: role.value,
        }),
      },
    );

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Registrasi gagal.");
    }

    success.value = "Akun berhasil dibuat! Silakan login.";
    username.value = "";
    password.value = "";
    fullName.value = "";
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi.";
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
              Daftar User Baru
            </h1>
            <p class="text-muted">Buat akun untuk akses sistem</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div
              v-if="error"
              class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center"
            >
              {{ error }}
            </div>

            <div
              v-if="success"
              class="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm text-center"
            >
              {{ success }}
              <div class="mt-2">
                <button
                  type="button"
                  @click="router.push('/login')"
                  class="text-accent underline font-medium"
                >
                  Ke Halaman Login
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-muted">Nama Lengkap</label>
              <input
                v-model="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all"
                required
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-muted">Username</label>
              <input
                v-model="username"
                type="text"
                placeholder="Masukkan username"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all"
                required
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-muted">Password</label>
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all"
                required
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-muted">Role</label>
              <select
                v-model="role"
                class="w-full px-4 py-2.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent outline-none transition-all appearance-none"
                required
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all text-lg mt-4"
            >
              {{ loading ? "Mendaftarkan..." : "Daftar Akun" }}
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-border/50 text-center">
            <button
              @click="router.push('/login')"
              class="text-xs text-muted hover:text-foreground transition-colors"
            >
              Batal dan Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
