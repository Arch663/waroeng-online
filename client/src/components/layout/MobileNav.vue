<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "@/composables/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import AppLogo from "@/components/ui/AppLogo.vue";

type MenuIcon = "dashboard" | "cashier" | "inventory" | "purchase" | "supplier" | "report";

const isOpen = ref(false);
const { isDark } = useTheme();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
};

const menuItems: Array<{ name: string; path: string; icon: MenuIcon; roles: string[] }> = [
  { name: "Dashboard", path: "/", icon: "dashboard", roles: ["admin", "manager"] },
  { name: "Kasir", path: "/kasir", icon: "cashier", roles: ["admin", "cashier"] },
  { name: "Inventori", path: "/inventory", icon: "inventory", roles: ["admin", "manager"] },
  { name: "Pembelian", path: "/purchases", icon: "purchase", roles: ["admin", "manager"] },
  { name: "Supplier", path: "/suppliers", icon: "supplier", roles: ["admin", "manager"] },
  { name: "Laporan", path: "/reports", icon: "report", roles: ["admin", "manager"] },
];

const filteredMenu = computed(() => {
  return menuItems.filter((item) => item.roles.includes(auth.user?.role || ""));
});

const iconPaths: Record<MenuIcon, string[]> = {
  dashboard: ["M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z"],
  cashier: [
    "M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
    "M3 10h18M7 15h.01M11 15h2m2 0h2",
  ],
  inventory: ["M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"],
  purchase: ["M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2"],
  supplier: [
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
    "M9 7a4 4 0 100-8 4 4 0 000 8z",
    "M23 21v-2a4 4 0 00-3-3.87",
    "M16 3.13a4 4 0 010 7.75",
  ],
  report: [
    "M9 17v-6m4 6V7m4 10v-3",
    "M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
  ],
};

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

function handleLogout() {
  auth.logout();
  closeMenu();
  router.push("/login");
}
</script>

<template>
  <div>
    <header
      class="h-20 bg-glass-bg backdrop-blur-3xl border-b border-glass-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-soft"
    >
      <AppLogo subtitle="Mobile Ops" />
      <button
        @click="toggleMenu"
        class="p-3 text-foreground transition-all active:scale-90 bg-surface/50 rounded-xl border border-glass-border"
      >
        <svg
          v-if="!isOpen"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </header>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-background/60 z-40 backdrop-blur-md"
        @click="closeMenu"
      />
    </Transition>

    <Transition name="slide">
      <aside
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-glass-bg backdrop-blur-3xl z-50 shadow-glass flex flex-col p-8 border-l border-glass-border"
      >
        <div class="flex justify-between items-center mb-10">
          <div>
            <span class="text-xs text-accent font-black uppercase tracking-widest block mb-2">Navigation</span>
            <span class="text-3xl font-black text-foreground uppercase tracking-tighter">Menu</span>
          </div>
          <button @click="closeMenu" class="p-3 rounded-2xl bg-surface/50 border border-glass-border text-foreground">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          v-if="auth.user"
          class="mb-10 p-6 bg-surface/50 rounded-3xl border border-glass-border shadow-soft"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-foreground/10 flex items-center justify-center text-foreground font-black border border-foreground/10"
            >
              {{ auth.user.full_name?.charAt(0) || "U" }}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="font-black text-foreground truncate uppercase text-xs tracking-tight">{{ auth.user.full_name }}</span>
              <span class="text-xs text-muted font-bold uppercase tracking-widest mt-1 opacity-60">{{ auth.user.role }}</span>
            </div>
          </div>
        </div>

        <nav class="flex flex-col gap-3 grow">
          <RouterLink
            v-for="item in filteredMenu"
            :key="item.path"
            :to="item.path"
            @click="closeMenu"
            class="flex items-center gap-4 px-6 py-5 rounded-2xl transition-all relative overflow-hidden"
            :class="[
              route.path === item.path
                ? 'bg-accent text-background shadow-glass font-black'
                : 'text-muted hover:text-foreground hover:bg-surface/60 font-bold'
            ]"
          >
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path v-for="path in iconPaths[item.icon]" :key="path" :d="path" />
            </svg>
            <span class="text-sm uppercase tracking-widest">{{ item.name }}</span>
          </RouterLink>
        </nav>

        <div class="pt-10 flex flex-col gap-4">
          <button
            @click="toggleDarkMode"
            class="flex items-center justify-between p-5 rounded-2xl bg-surface/50 border border-glass-border font-black text-xs uppercase tracking-widest text-foreground"
            :title="isDark ? 'Switch to Eva-02 (Light)' : 'Switch to Eva-01 (Dark)'"
          >
            <div class="flex items-center gap-4">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path v-if="isDark" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36-1.41-1.41M7.05 7.05 5.64 5.64m12.72 0-1.41 1.41M7.05 16.95l-1.41 1.41M12 7a5 5 0 100 10 5 5 0 000-10z" />
                <path v-else d="M12 3a9 9 0 109 9A7 7 0 0112 3z" />
              </svg>
              <span>{{ isDark ? "Mode Eva Unit-01" : "Mode Eva Unit-02" }}</span>
            </div>
          </button>

          <button
            @click="handleLogout"
            class="flex items-center justify-center gap-4 p-5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs uppercase tracking-widest active:bg-red-500 active:text-white transition-all shadow-soft"
          >
            Exit Plug
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>


