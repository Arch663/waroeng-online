<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "@/composables/useI18n";

const router = useRouter();
const { language, t } = useI18n();

const username = ref("");
const password = ref("");
const fullName = ref("");
const role = ref<"admin" | "manager" | "cashier">("cashier");
const loading = ref(false);
const error = ref("");
const success = ref("");

const copy = computed(() =>
  language.value === "id"
    ? {
        fullName: "Nama Lengkap",
        username: "Username",
        authorization: "Otorisasi",
        password: "Password",
        fullNamePh: "Masukkan nama lengkap",
        usernamePh: "Masukkan username",
        passwordPh: "Masukkan password",
        register: "Daftar",
        back: "Kembali ke Login",
        success: "Registrasi berhasil.",
        failed: "Registrasi gagal.",
        error: "Terjadi kesalahan saat registrasi.",
      }
    : {
        fullName: "Full Name",
        username: "Username",
        authorization: "Authorization",
        password: "Password",
        fullNamePh: "Enter full name",
        usernamePh: "Enter username",
        passwordPh: "Enter password",
        register: "Register",
        back: "Back to Login",
        success: "Registration successful.",
        failed: "Registration failed.",
        error: "An error occurred during registration.",
      },
);

async function handleRegister() {
  if (!username.value || !password.value || !fullName.value) return;

  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const res = await fetch(`${import.meta.env.VITE_DATABASE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        full_name: fullName.value,
        role: role.value,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || copy.value.failed);
    }

    success.value = copy.value.success;
    username.value = "";
    password.value = "";
    fullName.value = "";
  } catch (err) {
    error.value = err instanceof Error ? err.message : copy.value.error;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-6 font-sans">
    <div class="w-full max-w-lg">
      <div class="bg-surface border border-glass-border rounded-2xl p-12  relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

        <div class="relative z-10">
          <div class="mb-12 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-accent/10 border-2 border-accent rounded-2xl text-accent text-3xl font-black mb-8">
              +
            </div>
            <h1 class="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">
              {{ t("register_title") }}
            </h1>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-6">
            <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black text-center uppercase tracking-widest">
              {{ error }}
            </div>

            <div v-if="success" class="p-5 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-sm font-black text-center uppercase tracking-widest leading-relaxed">
              {{ success }}
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">{{ copy.fullName }}</label>
              <input v-model="fullName" type="text" :placeholder="copy.fullNamePh" class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground" required />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">{{ copy.username }}</label>
              <input v-model="username" type="text" :placeholder="copy.usernamePh" class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground" required />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">{{ copy.authorization }}</label>
              <select v-model="role" class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-foreground appearance-none uppercase tracking-widest text-xs" required>
                <option value="cashier">CASHIER</option>
                <option value="manager">MANAGER</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">{{ copy.password }}</label>
              <input v-model="password" type="password" :placeholder="copy.passwordPh" class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground" required />
            </div>

            <button type="submit" :disabled="loading" class="w-full py-5 bg-accent text-background rounded-2xl font-semibold tracking-wide  shadow-accent/20 hover:shadow-accent/40 active:scale-95 disabled:opacity-50 transition-all text-xs mt-6">
              {{ loading ? t("common_process") : copy.register }}
            </button>
          </form>

          <div class="mt-10 pt-8 border-t border-glass-border text-center">
            <button @click="router.push('/login')" class="text-xs font-black text-muted hover:text-accent transition-colors uppercase tracking-widest">
              {{ copy.back }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



