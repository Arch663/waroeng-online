<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits(["pageChange"]);

const pages = computed(() => {
  const list: (number | string)[] = [];
  const max = props.totalPages;
  const current = props.currentPage;

  if (max <= 7) {
    for (let i = 1; i <= max; i++) list.push(i);
  } else {
    list.push(1);
    if (current > 3) list.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(max - 1, current + 1);

    for (let i = start; i <= end; i++) {
      if (!list.includes(i)) list.push(i);
    }

    if (current < max - 2) list.push("...");
    if (!list.includes(max)) list.push(max);
  }
  return list;
});
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-2 py-6"
  >
    <button
      @click="emit('pageChange', currentPage - 1)"
      :disabled="currentPage === 1"
      class="p-2 rounded-xl bg-surface border border-border text-foreground hover:bg-muted/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <template v-for="page in pages" :key="page">
      <div v-if="page === '...'" class="px-2 text-muted">...</div>
      <button
        v-else
        @click="emit('pageChange', page as number)"
        :class="[
          'w-10 h-10 rounded-xl font-bold transition-all border',
          currentPage === page
            ? 'bg-accent border-accent text-white'
            : 'bg-surface border-border text-foreground hover:bg-accent/5 hover:border-accent/40',
        ]"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="emit('pageChange', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="p-2 rounded-xl bg-surface border border-border text-foreground hover:bg-muted/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
</template>
