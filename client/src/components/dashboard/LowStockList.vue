<script setup lang="ts">
defineProps<{
  items: Array<{
    id: number;
    name: string;
    stock: number;
  }>;
}>();
</script>

<template>
  <div class="bg-surface rounded-2xl max-h-39 p-4 shadow-sm overflow-y-auto scrollbar scrollbar-thumb-foreground scrollbar-track-border scrollbar-hover:scrollbar-thumb-surface">
    <h2 class="font-semibold mb-4">Stok Menipis</h2>
    <div v-if="items.length === 0" class="text-sm text-muted">
      Tidak ada produk dengan stok kritis.
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex justify-between text-sm"
      >
        <span>{{ item.name }}</span>
        <span class="text-red-500 font-medium">
          {{ item.stock }}
        </span>
      </div>
    </div>
  </div>
</template>
