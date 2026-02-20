<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLanguage } from "@/composables/useLanguage";
import AppLogo from "@/components/ui/AppLogo.vue";

type MenuIcon = "dashboard" | "cashier" | "inventory" | "purchase" | "supplier" | "report" | "setting";
type MenuLabelKey = "dashboard" | "cashier" | "inventory" | "purchase" | "supplier" | "report" | "setting";

const isOpen = ref(false);
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { language } = useLanguage();

const text = computed(() =>
  language.value === "id"
    ? {
        navigation: "Navigasi",
        menu: "Menu",
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
        navigation: "Navigation",
        menu: "Menu",
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
  cashier: ["M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z", "M3 10h18M7 15h.01M11 15h2m2 0h2"],
  inventory: ["M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"],
  purchase: ["M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2"],
  supplier: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100-8 4 4 0 000 8z", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"],
  report: ["M9 17v-6m4 6V7m4 10v-3", "M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"],
  setting: ["M12 8a4 4 0 100 8 4 4 0 000-8z", "M3 12h2m14 0h2M12 3v2m0 14v2M5.64 5.64l1.41 1.41m9.9 9.9 1.41 1.41m0-12.72-1.41 1.41m-9.9 9.9-1.41 1.41"],
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
    <header class="h-20 bg-glass-bg backdrop-blur-3xl border-b border-glass-border flex items-center justify-between px-6 sticky top-0 z-40">
      <AppLogo subtitle="Mobile Ops" />
      <button @click="toggleMenu" class="p-3 text-foreground transition-all active:scale-90 bg-surface/50 rounded-xl border border-glass-border">
        <svg v-if="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </header>

    <Transition name="fade"><div v-if="isOpen" class="fixed inset-0 bg-background/60 z-40 backdrop-blur-md" @click="closeMenu" /></Transition>

    <Transition name="slide">
      <aside v-if="isOpen" class="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-glass-bg backdrop-blur-3xl z-50 flex flex-col p-8 border-l border-glass-border">
        <div class="flex justify-between items-center mb-10">
          <div>
            <span class="text-xs text-accent font-black uppercase tracking-widest block mb-2">{{ text.navigation }}</span>
            <span class="text-3xl font-black text-foreground uppercase tracking-tighter">{{ text.menu }}</span>
          </div>
          <button @click="closeMenu" class="p-3 rounded-2xl bg-surface/50 border text-foreground">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav class="flex flex-col gap-3 grow">
          <RouterLink v-for="item in filteredMenu" :key="item.path" :to="item.path" @click="closeMenu" class="flex items-center gap-4 px-6 py-5 rounded-2xl transition-all relative overflow-hidden" :class="[route.path === item.path ? 'bg-accent text-background font-black' : 'text-muted hover:text-foreground hover:bg-surface/60 font-bold']">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="path in iconPaths[item.icon]" :key="path" :d="path" />
            </svg>
            <span class="text-sm uppercase tracking-widest">{{ text[item.name] }}</span>
          </RouterLink>
        </nav>

        <div class="pt-10 flex flex-col gap-4">
          <button @click="handleLogout" class="flex items-center justify-center gap-4 p-5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs uppercase tracking-widest active:bg-red-500 active:text-white transition-all">
            {{ text.logout }}
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
