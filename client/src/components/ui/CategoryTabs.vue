<script setup lang="ts">
defineProps<{
  categories: string[];
}>();

const active = defineModel<string>();
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-2">
    <button
      v-for="c in categories"
      :key="c"
      @click="active = c"
      class="px-4 py-2 rounded-full text-foreground border border-border whitespace-nowrap"
      :class="active === c ? 'bg-accent text-white' : 'bg-surface'"
    >
      {{ c }}
    </button>
  </div>
</template>
