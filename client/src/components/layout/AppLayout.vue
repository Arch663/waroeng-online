<script setup lang="ts">
import AppSidebar from "@/components/layout/AppSidebar.vue";
import MobileNav from "@/components/layout/MobileNav.vue";
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden">
    <AppSidebar class="hidden md:flex peer" />
    <MobileNav class="md:hidden" />
    <div class="flex-1 flex flex-col min-w-0 md:pl-22 md:peer-hover:pl-72 transition-all duration-300">
      <main class="p-3 md:p-6 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

