<script setup lang="ts">
defineProps<{
  title: string;
  value: string;
}>();
</script>

<template>
  <div class="bg-surface/40 backdrop-blur-xl rounded-2xl p-4 border border-border shadow-glass flex items-center gap-4">
    <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0">
      <slot name="icon" />
    </div>
    <div class="min-w-0">
      <p class="text-xs md:text-xs uppercase tracking-wider font-bold text-muted truncate">
        {{ title }}
      </p>
      <h3 class="text-sm lg:text-lg text-foreground font-black tracking-tight truncate">
        {{ value }}
      </h3>
    </div>
  </div>
</template>

