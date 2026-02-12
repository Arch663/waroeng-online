<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import { RouterLink } from "vue-router";
const { isDark } = useTheme();
const menus = [
  { name: "Dashboard", icon: "/src/assets/dashboard.svg", path: "/" },
  { name: "Kasir", icon: "/src/assets/cashier.svg", path: "/kasir" },
  { name: "Inventory", icon: "/src/assets/stock.svg", path: "/inventory" },
  // { name: "Laporan", icon: "/src/assets/report.svg", path: "/report" },
];
</script>

<template>
  <aside class="w-64 min-h-full bg-surface border-r border-border p-4 flex flex-col gap-4">
    <h1 class="text-xl font-bold text-accent">Waroeng</h1>
    <nav class="flex flex-col gap-2">
      <RouterLink
        v-for="m in menus"
        :key="m.path"
        :to="m.path"
        class="flex items-center gap-3 px-4 py-2 text-foreground rounded-xl text-left hover:text-accent"
        active-class="bg-accent text-white hover:text-white"
      >
        <img :src="m.icon" class="w-7 h-7" />
        {{ m.name }}
      </RouterLink>

      <button
        @click="isDark = !isDark"
        class="px-4 py-2 rounded-lg bg-accent text-white"
      >
        Toggle Theme
      </button>
    </nav>
  </aside>
</template>
