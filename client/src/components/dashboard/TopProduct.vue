<script setup lang="ts">
defineProps<{
  products: Array<{
    id: number;
    name: string;
    sold: number;
    revenue: number;
  }>;
}>();
</script>

<template>
  <div class="bg-surface rounded-2xl p-4">
    <div class="mb-4">
      <h2 class="font-semibold">Produk Terlaris</h2>
      <p class="text-sm text-muted">Berdasarkan volume penjualan</p>
    </div>

    <div v-if="products.length === 0" class="text-sm text-muted">
      Belum ada data penjualan.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-muted">
          <tr>
            <th class="py-2">Produk</th>
            <th class="py-2">Terjual</th>
            <th class="py-2 text-right">Omzet</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="product in products"
            :key="product.id"
            class="border-t border-border"
          >
            <td class="py-2 font-medium">{{ product.name }}</td>
            <td class="py-2">{{ product.sold }}</td>
            <td class="py-2 text-right tabular-nums">
              Rp {{ product.revenue.toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
