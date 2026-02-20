<script setup lang="ts">
import AppSidebar from "@/components/layout/AppSidebar.vue";
import MobileNav from "@/components/layout/MobileNav.vue";
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col lg:flex-row overflow-x-hidden">
    <AppSidebar class="hidden lg:flex peer" />
    <MobileNav class="lg:hidden" />
    <div class="flex-1 flex flex-col min-w-0 lg:pl-22 lg:peer-hover:pl-72 transition-all duration-300 ease-out">
      <main class="p-3 md:p-6 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

