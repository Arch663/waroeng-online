<script setup lang="ts">
defineProps<{
  stats: {
    omzetToday: number;
    transaksiToday: number;
    productsSoldToday: number;
    lowStockCount: number;
  };
}>();
</script>

<template>
  <div class="px-4 md:px-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="bg-surface rounded-2xl p-4 shadow-sm">
        <p class="text-sm text-foreground">Omzet Hari Ini</p>
        <h3 class="text-xl text-accent font-semibold mt-1">
          Rp {{ stats.omzetToday.toLocaleString() }}
        </h3>
      </div>
      <div class="bg-surface rounded-2xl p-4 shadow-sm">
        <p class="text-sm text-foreground">Transaksi Hari Ini</p>
        <h3 class="text-xl text-accent font-semibold mt-1">
          {{ stats.transaksiToday.toLocaleString() }}
        </h3>
      </div>
      <div class="bg-surface rounded-2xl p-4 shadow-sm">
        <p class="text-sm text-foreground">Produk Terjual Hari Ini</p>
        <h3 class="text-xl text-accent font-semibold mt-1">
          {{ stats.productsSoldToday.toLocaleString() }}
        </h3>
      </div>
      <div class="bg-surface rounded-2xl p-4 shadow-sm">
        <p class="text-sm text-foreground">Low Stock</p>
        <h3 class="text-xl text-accent font-semibold mt-1">
          {{ stats.lowStockCount.toLocaleString() }}
        </h3>
      </div>
    </div>
  </div>
</template>
