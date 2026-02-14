<script setup lang="ts">
defineProps<{
  compact?: boolean;
  subtitle?: string;
}>();
</script>

<template>
  <div class="flex items-center" :class="compact ? 'justify-center' : 'gap-3'">
    <div
      class="relative w-11 h-11 rounded-2xl bg-surface/70 border border-glass-border shadow-glass flex items-center justify-center overflow-hidden"
    >
      <div class="absolute inset-0 bg-linear-to-br from-accent/25 via-transparent to-secondary/25"></div>
      <svg
        class="relative w-7 h-7 text-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 6h3l3 12h2l2-7 2 7h2l3-12h3" />
      </svg>
    </div>
    <div v-if="!compact" class="flex flex-col">
      <span class="font-black text-foreground tracking-tighter uppercase text-sm leading-none">Waroeng</span>
      <span class="text-xs font-black text-accent tracking-widest uppercase mt-1">{{ subtitle || "Online" }}</span>
    </div>
  </div>
</template>
