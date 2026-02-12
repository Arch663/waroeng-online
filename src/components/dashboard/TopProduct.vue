<script setup lang="ts">
const products = [
  {
    name: "Indomie Goreng",
    sold: 320,
    revenue: 960000,
  },
  {
    name: "Minyak Goreng 2L",
    sold: 210,
    revenue: 3150000,
  },
  {
    name: "Gula Pasir 1kg",
    sold: 180,
    revenue: 2520000,
  },
];
</script>

<template>
  <div class="bg-surface rounded-2xl p-4">
    <div class="mb-4">
      <h2 class="font-semibold">Produk Terlaris</h2>
      <p class="text-sm text-muted-foreground">Berdasarkan volume penjualan</p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-muted-foreground">
          <tr>
            <th class="py-2">Produk</th>
            <th class="py-2">Terjual</th>
            <th class="py-2 text-right">Omzet</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="p in products"
            :key="p.name"
            class="border-t border-border"
          >
            <td class="py-2 font-medium">
              {{ p.name }}
            </td>

            <td class="py-2">
              {{ p.sold }}
            </td>

            <td class="py-2 text-right tabular-nums">
              Rp {{ p.revenue.toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
