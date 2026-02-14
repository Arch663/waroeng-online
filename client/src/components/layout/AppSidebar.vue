<script setup lang="ts">
import { computed, ref } from "vue";
import { useTheme } from "@/composables/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { RouterLink, useRouter } from "vue-router";
import cashierIcon from "@/assets/cashier.svg";
import dashboardIcon from "@/assets/dashboard.svg";
import stockIcon from "@/assets/stock.svg";
import reportIcon from "@/assets/report.svg";

const { isDark } = useTheme();
const auth = useAuthStore();
const router = useRouter();

const isHovered = ref(false);

const menus = computed(() => {
  const role = auth.user?.role || "";
  const all = [
    {
      name: "Dashboard",
      icon: dashboardIcon,
      path: "/",
      roles: ["admin", "manager"],
    },
    {
      name: "Kasir",
      icon: cashierIcon,
      path: "/kasir",
      roles: ["admin", "cashier"],
    },
    {
      name: "Inventory",
      icon: stockIcon,
      path: "/inventory",
      roles: ["admin", "manager"],
    },
    {
      name: "Supplier",
      icon: "🚚",
      isEmoji: true,
      path: "/suppliers",
      roles: ["admin", "manager"],
    },
    {
      name: "Pembelian",
      icon: reportIcon,
      path: "/purchases",
      roles: ["admin", "manager"],
    },
    {
      name: "Laporan",
      icon: "📊",
      isEmoji: true,
      path: "/reports",
      roles: ["admin", "manager"],
    },
  ];
  return all.filter((m) => m.roles.includes(role));
});

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <aside
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    class="h-screen sticky top-0 bg-surface border-r border-border p-4 flex flex-col gap-6 transition-all duration-300 ease-in-out group"
    :class="isHovered ? 'w-64' : 'w-20'"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-2 overflow-hidden whitespace-nowrap">
      <div
        class="min-w-10 w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
      >
        W
      </div>
      <h1
        class="text-xl font-bold text-foreground transition-opacity duration-300"
        :class="isHovered ? 'opacity-100' : 'opacity-0'"
      >
        ArchWaroeng
      </h1>
    </div>

    <!-- User Profile -->
    <div
      v-if="auth.user"
      class="px-2 py-4 border-y border-border/50 overflow-hidden"
    >
      <div class="flex flex-col whitespace-nowrap">
        <span
          class="font-bold text-foreground truncate transition-opacity duration-300"
          :class="isHovered ? 'opacity-100' : 'opacity-0'"
        >
          {{ auth.user.full_name }}
        </span>
        <span
          class="text-xs text-muted uppercase tracking-wider flex items-center gap-1.5 mt-0.5 transition-opacity duration-300"
          :class="isHovered ? 'opacity-100' : 'opacity-0'"
        >
          <span
            class="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"
          ></span>
          {{ auth.user.role }}
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-col gap-2 grow overflow-hidden">
      <RouterLink
        v-for="m in menus"
        :key="m.path"
        :to="m.path"
        class="flex items-center gap-3 px-3.5 py-3 text-foreground/80 rounded-xl text-left hover:text-accent hover:bg-accent/5 transition-all whitespace-nowrap"
        active-class="bg-accent !text-white hover:text-white shadow-md shadow-accent/20"
      >
        <div
          v-if="m.isEmoji"
          class="min-w-6 w-6 h-6 flex items-center justify-center text-lg shrink-0"
        >
          {{ m.icon }}
        </div>
        <img
          v-else
          :src="m.icon"
          class="min-w-6 w-6 h-6 currentColor shrink-0"
          :style="m.path === '/' && !isDark ? 'filter: brightness(0)' : ''"
        />
        <span
          class="font-medium transition-opacity duration-300"
          :class="isHovered ? 'opacity-100' : 'opacity-0'"
        >
          {{ m.name }}
        </span>
      </RouterLink>
    </nav>

    <!-- Bottom Actions -->
    <div
      class="flex flex-col gap-3 pt-6 border-t border-border/50 overflow-hidden"
    >
      <button
        @click="isDark = !isDark"
        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/10 text-foreground transition-all whitespace-nowrap"
      >
        <span class="text-lg shrink-0">{{ isDark ? "🌙" : "☀️" }}</span>
        <span
          class="font-medium transition-opacity duration-300"
          :class="isHovered ? 'opacity-100' : 'opacity-0'"
        >
          {{ isDark ? "Mode Gelap" : "Mode Terang" }}
        </span>
      </button>

      <button
        @click="handleLogout"
        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-left whitespace-nowrap"
      >
        <span class="text-lg shrink-0">🚪</span>
        <span
          class="font-medium transition-opacity duration-300"
          :class="isHovered ? 'opacity-100' : 'opacity-0'"
        >
          Keluar
        </span>
      </button>
    </div>
  </aside>
</template>
