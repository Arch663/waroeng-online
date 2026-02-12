<script setup lang="ts">
const items = [
  { name: "Gula Pasir 1kg", stock: 3 },
  { name: "Minyak Goreng 2L", stock: 5 },
  { name: "Indomie Goreng", stock: 7 },
];
</script>

<template>
  <div class="bg-surface rounded-2xl max-h-39 p-4 shadow-sm overflow-y-auto scrollbar scrollbar-thumb-foreground scrollbar-track-border scrollbar-hover:scrollbar-thumb-surface">
    <h2 class="font-semibold mb-4">Stok Menipis</h2>
    <div class="space-y-3">
      <div
        v-for="i in items"
        :key="i.name"
        class="flex justify-between text-sm"
      >
        <span>{{ i.name }}</span>
        <span class="text-red-500 font-medium">
          {{ i.stock }}
        </span>
      </div>
    </div>
  </div>
</template>
