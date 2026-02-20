<script setup lang="ts">
defineProps<{
  open: boolean;
  maxWidthClass?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="bg-surface rounded-2xl w-full p-8 border border-border flex flex-col max-h-dvh"
      :class="maxWidthClass || 'max-w-md'"
    >
      <div
        class="overflow-y-auto overflow-x-hidden pr-1 space-y-5 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

