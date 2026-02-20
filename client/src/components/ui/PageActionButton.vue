<script setup lang="ts">
defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <button
    class="px-8 py-4 bg-accent text-background rounded-2xl font-semibold tracking-wide transition-colors text-xs"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>

