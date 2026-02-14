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

    success.value = "Registration accepted. New unit initialized.";
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
  <div class="min-h-screen flex items-center justify-center bg-background p-6 font-sans">
    <div class="w-full max-w-lg">
      <div
        class="bg-surface/30 backdrop-blur-3xl border border-glass-border rounded-4xl p-12 shadow-glass relative overflow-hidden group"
      >
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
        
        <div class="relative z-10">
          <div class="mb-12 text-center">
             <div class="inline-flex items-center justify-center w-16 h-16 bg-accent/10 border-2 border-accent rounded-2xl text-accent text-3xl font-black mb-8">
                +
             </div>
             <h1 class="text-3xl font-black text-foreground tracking-tighter uppercase mb-2">
               New <span class="text-accent">User</span> Enrollment
             </h1>
             <p class="text-xs font-black text-muted tracking-widest uppercase opacity-50">STATION: PERSONNEL_INITIALIZATION</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-6">
            <div
              v-if="error"
              class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black text-center uppercase tracking-widest"
            >
              {{ error }}
            </div>

            <div
              v-if="success"
              class="p-5 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-sm font-black text-center uppercase tracking-widest leading-relaxed"
            >
              {{ success }}
              <div class="mt-4">
                <button
                  type="button"
                  @click="router.push('/login')"
                  class="bg-accent text-background px-6 py-3 rounded-xl hover:shadow-glass transition-all"
                >
                  Return to Gateway
                </button>
              </div>
            </div>

            <div v-if="!success" class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">Display Name</label>
                <input
                  v-model="fullName"
                  type="text"
                  placeholder="UNIT_NAME..."
                  class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground"
                  required
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">Access UID</label>
                <input
                  v-model="username"
                  type="text"
                  placeholder="UID_CODE..."
                  class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground"
                  required
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">Level Authorization</label>
                <select
                  v-model="role"
                  class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-foreground appearance-none uppercase tracking-widest text-xs"
                  required
                >
                  <option value="cashier">Level 01: CASHIER</option>
                  <option value="manager">Level 02: MANAGER</option>
                  <option value="admin">Level 03: ADMIN</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-black text-muted uppercase tracking-widest ml-2">Encryption Key</label>
                <input
                  v-model="password"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  class="w-full px-6 py-4 bg-background/50 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/20 font-bold text-foreground"
                  required
                />
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full py-5 bg-accent text-background rounded-2xl font-black uppercase tracking-widest shadow-glass shadow-accent/20 hover:shadow-accent/40 active:scale-95 disabled:opacity-50 transition-all text-xs mt-6"
              >
                {{ loading ? "Processing..." : "Authorize Entry" }}
              </button>
            </div>
          </form>

          <div class="mt-10 pt-8 border-t border-glass-border text-center">
            <button
              @click="router.push('/login')"
              class="text-xs font-black text-muted hover:text-accent transition-colors uppercase tracking-widest"
            >
              Cancel Operation
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

