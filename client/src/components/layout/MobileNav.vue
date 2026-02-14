<script setup lang="ts">
import { ref, computed } from "vue";
import { useTheme } from "@/composables/useTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { RouterLink, useRouter } from "vue-router";
import cashierIcon from "@/assets/cashier.svg";
import dashboardIcon from "@/assets/dashboard.svg";
import stockIcon from "@/assets/stock.svg";
import reportIcon from "@/assets/report.svg";

const isOpen = ref(false);
const { isDark } = useTheme();
const auth = useAuthStore();
const router = useRouter();

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

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function closeMenu() {
  isOpen.value = false;
}

function handleLogout() {
  auth.logout();
  router.push("/login");
  closeMenu();
}
</script>

<template>
  <div class="md:hidden">
    <!-- Header -->
    <header
      class="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-40"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold"
        >
          W
        </div>
        <span class="font-bold text-foreground">ArchWaroeng</span>
      </div>
      <button
        @click="toggleMenu"
        class="p-2 text-foreground active:bg-muted/10 rounded-lg"
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

    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        @click="closeMenu"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <aside
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-72 bg-surface z-50 shadow-2xl flex flex-col p-6"
      >
        <div class="flex justify-between items-center mb-8">
          <div class="flex flex-col">
            <span
              class="text-xs text-muted font-medium mb-1 uppercase tracking-wider"
              >Navigasi</span
            >
            <span class="text-xl font-bold">Menu</span>
          </div>
          <button @click="closeMenu" class="p-2 rounded-full bg-muted/10">
            <svg
              class="w-5 h-5"
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

        <!-- User Info Segment -->
        <div
          v-if="auth.user"
          class="mb-8 p-4 bg-muted/5 rounded-2xl border border-border/50"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold"
            >
              {{ auth.user?.username?.[0]?.toUpperCase() || "?" }}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="font-bold text-foreground truncate">{{
                auth.user.full_name
              }}</span>
              <span class="text-xs text-muted uppercase tracking-tighter">{{
                auth.user.role
              }}</span>
            </div>
          </div>
        </div>

        <nav class="flex flex-col gap-3 grow">
          <RouterLink
            v-for="m in menus"
            :key="m.path"
            :to="m.path"
            @click="closeMenu"
            class="flex items-center gap-4 px-5 py-4 text-foreground/80 rounded-2xl active:bg-accent/5 transition-all text-lg font-medium"
            active-class="bg-accent !text-white shadow-xl shadow-accent/20"
          >
            <div
              v-if="(m as any).isEmoji"
              class="w-6 h-6 flex items-center justify-center text-lg"
            >
              {{ m.icon }}
            </div>
            <img v-else :src="m.icon" class="w-6 h-6" />
            {{ m.name }}
          </RouterLink>
        </nav>

        <div class="pt-6 border-t border-border flex flex-col gap-3">
          <button
            @click="isDark = !isDark"
            class="flex items-center gap-4 px-5 py-4 rounded-2xl text-foreground font-medium"
          >
            <span class="text-xl">{{ isDark ? "🌙" : "☀️" }}</span>
            {{ isDark ? "Mode Gelap" : "Mode Terang" }}
          </button>

          <button
            @click="handleLogout"
            class="flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 font-medium active:bg-red-500/10"
          >
            <span class="text-xl">🚪</span>
            Keluar
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
