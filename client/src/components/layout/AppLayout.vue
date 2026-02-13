<script setup lang="ts">
import AppSidebar from "@/components/layout/AppSidebar.vue";

</script>

<template>
  <div class="min-h-screen bg-background flex">
    <AppSidebar class="hidden md:flex" />
    <div class="flex-1 flex flex-col">
      <main>
        <slot/>
      </main>
    </div>
  </div>
</template>
