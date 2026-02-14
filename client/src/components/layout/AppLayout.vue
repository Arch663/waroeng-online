<script setup lang="ts">
import AppSidebar from "@/components/layout/AppSidebar.vue";
import MobileNav from "@/components/layout/MobileNav.vue";
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <AppSidebar class="hidden md:flex" />
    <MobileNav class="md:hidden" />
    <div class="flex-1 flex flex-col">
      <main class="p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
