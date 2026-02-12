<script setup lang="ts">
const trx = [
  {
    id: "TRX001",
    total: 125000,
  },
  {
    id: "TRX002",
    total: 89000,
  },
  {
    id: "TRX002",
    total: 89000,
  },
  {
    id: "TRX002",
    total: 89000,
  },
];
</script>

<template>
  <div
    class="bg-surface rounded-2xl h-43.5 p-4 shadow-sm overflow-y-auto max-h-65 scrollbar scrollbar-thumb-foreground scrollbar-track-border scrollbar-hover:scrollbar-thumb-surface"
  >
    <h2 class="font-semibold mb-4">Transaksi Terakhir</h2>

    <div class="space-y-3">
      <div v-for="t in trx" :key="t.id" class="flex justify-between text-sm">
        <span>{{ t.id }}</span>

        <span class="font-medium"> Rp {{ t.total.toLocaleString() }} </span>
      </div>
    </div>
  </div>
</template>
