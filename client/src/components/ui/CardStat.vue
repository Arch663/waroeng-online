<script setup lang="ts">
defineProps<{
  title: string;
  value: string;
}>();
</script>

<template>
  <div class="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-4">
    <slot name="icon" />
    <div>
      <p class="text-sm text-foreground">
        {{ title }}
      </p>
      <h3 class="text-xs lg:text-xl text-accent font-medium">
        {{ value }}
      </h3>
    </div>
  </div>
</template>
