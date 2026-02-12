<script setup lang="ts">
const stats = [
  {
    title: "Omzet Hari Ini",
    value: "Rp 2.450.000",
  },
  {
    title: "Transaksi",
    value: "128",
  },
  {
    title: "Produk Terjual",
    value: "542",
  },
  {
    title: "Low Stock",
    value: "12",
  },
];
</script>

<template>
  <div class="px-4 md:px-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="s in stats"
        :key="s.title"
        class="bg-surface rounded-2xl p-4 shadow-sm"
      >
        <p class="text-sm text-foreground">
          {{ s.title }}
        </p>
        <h3 class="text-xl text-accent font-semibold mt-1">
          {{ s.value }}
        </h3>
      </div>
    </div>
  </div>
</template>
