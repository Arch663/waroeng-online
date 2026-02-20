<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguage } from "@/composables/useLanguage";
import AppLogo from "@/components/ui/AppLogo.vue";

type MenuIcon = "dashboard" | "cashier" | "inventory" | "purchase" | "supplier" | "report" | "setting";
type MenuLabelKey = "dashboard" | "cashier" | "inventory" | "purchase" | "supplier" | "report" | "setting";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { language } = useLanguage();
const isExpanded = ref(false);

const text = computed(() =>
  language.value === "id"
    ? {
        dashboard: "Dashboard",
        cashier: "Kasir",
        inventory: "Inventori",
        purchase: "Pembelian",
        supplier: "Supplier",
        report: "Laporan",
        setting: "Pengaturan",
        logout: "Keluar",
      }
    : {
        dashboard: "Dashboard",
        cashier: "Cashier",
        inventory: "Inventory",
        purchase: "Purchases",
        supplier: "Suppliers",
        report: "Reports",
        setting: "Settings",
        logout: "Logout",
      },
);

function handleLogout() {
  auth.logout();
  router.push("/login");
}

const menuItems: Array<{ name: MenuLabelKey; path: string; icon: MenuIcon; roles: string[] }> = [
  { name: "dashboard", path: "/", icon: "dashboard", roles: ["admin", "manager"] },
  { name: "cashier", path: "/kasir", icon: "cashier", roles: ["admin", "cashier"] },
  { name: "inventory", path: "/inventory", icon: "inventory", roles: ["admin", "manager"] },
  { name: "purchase", path: "/purchases", icon: "purchase", roles: ["admin", "manager"] },
  { name: "supplier", path: "/suppliers", icon: "supplier", roles: ["admin", "manager"] },
  { name: "report", path: "/reports", icon: "report", roles: ["admin", "manager"] },
  { name: "setting", path: "/settings", icon: "setting", roles: ["admin", "manager", "cashier"] },
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
  setting: ["M12 8a4 4 0 100 8 4 4 0 000-8z", "M3 12h2m14 0h2M12 3v2m0 14v2M5.64 5.64l1.41 1.41m9.9 9.9 1.41 1.41m0-12.72-1.41 1.41m-9.9 9.9-1.41 1.41"],
};
</script>

<template>
  <aside
    class="flex flex-col h-dvh fixed left-0 top-0 bg-surface border-r border-border z-40 transition-all duration-300"
    :class="isExpanded ? 'w-72' : 'w-22'"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <div class="p-4" :class="isExpanded ? 'px-5 pt-6 pb-4' : 'px-4 pt-5 pb-3'">
      <AppLogo :compact="!isExpanded" subtitle="Online" />
    </div>

    <nav class="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
      <router-link
        v-for="item in filteredMenu"
        :key="item.path"
        :to="item.path"
        class="group flex items-center rounded-lg transition-colors duration-200 relative overflow-hidden py-3"
        :class="[
          isExpanded ? 'gap-3 px-3.5 justify-start' : 'justify-center px-2',
          route.path === item.path
            ? 'bg-accent/10 text-accent border border-accent/25'
            : 'text-muted hover:text-foreground hover:bg-background/60',
        ]"
      >
        <div
          v-if="route.path === item.path && isExpanded"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full"
        ></div>

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
        <span v-show="isExpanded" class="font-medium text-sm">{{ text[item.name] }}</span>
      </router-link>
    </nav>

    <div class="p-3 border-t border-border" :class="isExpanded ? 'p-4' : 'p-3'">
      <button
        @click="handleLogout"
        class="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-medium transition-colors border border-red-500/20 flex items-center"
        :class="isExpanded ? 'justify-center px-4' : 'justify-center px-2'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        <span v-show="isExpanded" class="ml-2">{{ text.logout }}</span>
      </button>
    </div>
  </aside>
</template>
