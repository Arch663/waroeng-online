<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import MobileNav from "@/components/layout/MobileNav.vue";

const route = useRoute();
const showNavigation = computed(() => !route.meta.public);
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col lg:flex-row overflow-x-hidden">
    <AppSidebar v-if="showNavigation" class="hidden lg:flex peer" />
    <MobileNav v-if="showNavigation" class="lg:hidden" />
    <div
      class="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out"
      :class="showNavigation ? 'lg:pl-22 lg:peer-hover:pl-72' : ''"
    >
      <main class="p-4 md:p-6 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
