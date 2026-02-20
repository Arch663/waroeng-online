<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTheme } from "@/composables/useTheme";
import AppLogo from "@/components/ui/AppLogo.vue";

type MenuIcon = "dashboard" | "cashier" | "inventory" | "purchase" | "supplier" | "report";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { isDark } = useTheme();
const isExpanded = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
};

function handleLogout() {
  auth.logout();
  router.push("/login");
}

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
</script>

<template>
  <aside
    class="flex flex-col h-dvh fixed left-0 top-0 bg-glass-bg backdrop-blur-3xl border-r border-border z-40 transition-all duration-300"
    :class="isExpanded ? 'w-72' : 'w-22'"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <div class="p-4" :class="isExpanded ? 'px-6 pt-8 pb-4' : 'px-4 pt-6 pb-3'">
      <AppLogo :compact="!isExpanded" subtitle="Online" />
    </div>

    <nav class="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/35 scrollbar-track-transparent">
      <router-link
        v-for="item in filteredMenu"
        :key="item.path"
        :to="item.path"
        class="group flex items-center rounded-2xl transition-all duration-300 relative overflow-hidden py-4"
        :class="[
          isExpanded ? 'gap-4 px-4 justify-start' : 'justify-center px-2',
          route.path === item.path
            ? 'bg-accent/10 text-accent border border-accent/20'
            : 'text-muted hover:text-foreground hover:bg-surface/70',
        ]"
      >
        <div
          v-if="route.path === item.path && isExpanded"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-accent rounded-r-full"
        ></div>

        <svg
          class="w-5 h-5 transition-transform group-hover:scale-110 duration-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-for="path in iconPaths[item.icon]" :key="path" :d="path" />
        </svg>
        <span v-show="isExpanded" class="font-black text-sm uppercase tracking-widest">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="p-3" :class="isExpanded ? 'p-6' : 'p-3'">
      <div class="flex items-center rounded-2xl mb-3" :class="isExpanded ? 'justify-between p-3' : 'justify-center p-2'">
        <div v-show="isExpanded" class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
          <span class="text-xs font-black text-muted uppercase tracking-widest">Theme Sync</span>
        </div>
        <button
          @click="toggleDarkMode"
          class="p-2 hover:bg-accent/10 rounded-xl transition-all text-foreground"
          :title="isDark ? 'Switch to Eva-02 (Light)' : 'Switch to Eva-01 (Dark)'"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="isDark" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36-1.41-1.41M7.05 7.05 5.64 5.64m12.72 0-1.41 1.41M7.05 16.95l-1.41 1.41M12 7a5 5 0 100 10 5 5 0 000-10z" />
            <path v-else d="M12 3a9 9 0 109 9A7 7 0 0112 3z" />
          </svg>
        </button>
      </div>
      <p v-show="isExpanded" class="text-xs font-black uppercase tracking-wider text-muted/80 mb-3">
        {{ isDark ? "Mode: Eva Unit-01" : "Mode: Eva Unit-02" }}
      </p>

      <div class="flex items-center rounded-2xl mb-3" :class="isExpanded ? 'gap-3 p-2' : 'justify-center p-2'">
        <div class="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground font-black border border-foreground/10 text-xs">
          {{ auth.user?.full_name?.charAt(0) || "U" }}
        </div>
        <div v-show="isExpanded" class="min-w-0">
          <p class="text-xs font-black text-foreground truncate uppercase tracking-tight">{{ auth.user?.full_name }}</p>
          <p class="text-xs font-bold text-muted truncate uppercase tracking-widest opacity-60">{{ auth.user?.role }}</p>
        </div>
      </div>

      <button
        @click="handleLogout"
        class="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border border-red-500/20 flex items-center"
        :class="isExpanded ? 'justify-center px-4' : 'justify-center px-2'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        <span v-show="isExpanded" class="ml-2">Exit</span>
      </button>
    </div>
  </aside>
</template>


