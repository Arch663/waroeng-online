<script setup lang="ts">
import Skeleton from "@/components/ui/Skeleton.vue";

defineProps<{
  stats: {
    omzetToday: number;
    transaksiToday: number;
    productsSoldToday: number;
    lowStockCount: number;
    omzetMonth: number;
    transaksiMonth: number;
    purchasesToday?: number;
    purchasesMonth?: number;
  };
  loading?: boolean;
}>();
</script>

<template>
  <div>
    <div class="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      <!-- Card Template for reusing -->
      <div
        v-for="card in [
          {
            label: 'Omzet Hari Ini',
            value:
              'Rp ' +
              Number(stats.omzetToday).toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
            color: 'text-accent',
            icon: 'ðŸ’°',
          },
          {
            label: 'Transaksi Hari Ini',
            value: Number(stats.transaksiToday).toLocaleString('id-ID', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            color: 'text-accent',
            icon: 'ðŸ§¾',
          },
          {
            label: 'Beli Stok (Hari Ini)',
            value:
              'Rp ' +
              Number(stats.purchasesToday || 0).toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
            color: 'text-orange-500',
            icon: 'ðŸ“¦',
          },
          {
            label: 'Low Stock',
            value: Number(stats.lowStockCount).toLocaleString('id-ID', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            color: 'text-red-500',
            icon: 'âš ï¸',
          },
          {
            label: 'Omzet Bulan Ini',
            value:
              'Rp ' +
              Number(stats.omzetMonth).toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
            color: 'text-green-500',
            icon: 'ðŸ“ˆ',
          },
          {
            label: 'Transaksi Bulan Ini',
            value: Number(stats.transaksiMonth).toLocaleString('id-ID', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            color: 'text-green-500',
            icon: 'ðŸ“Š',
          },
          {
            label: 'Beli Stok (Bulan Ini)',
            value:
              'Rp ' +
              Number(stats.purchasesMonth || 0).toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }),
            color: 'text-orange-500',
            icon: 'ðŸš›',
          },
          {
            label: 'Produk Terjual',
            value: Number(stats.productsSoldToday).toLocaleString('id-ID', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }),
            color: 'text-blue-500',
            icon: 'âœ¨',
          },
        ]"
        :key="card.label"
        class="bg-surface/60 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-border group hover:border-accent/30 transition-all duration-300 hover:scale-[1.02]"
      >
        <div class="flex items-center justify-between mb-2">
          <p
            class="text-[10px] uppercase tracking-widest font-black text-muted/60"
          >
            {{ card.label }}
          </p>
          <span
            class="text-xs grayscale group-hover:grayscale-0 transition-all"
            >{{ card.icon }}</span
          >
        </div>
        <div v-if="loading">
          <Skeleton height="28px" width="80%" borderRadius="8px" />
        </div>
        <h3
          v-else
          :class="[
            'text-lg md:text-xl font-black tabular-nums transition-colors',
            card.color,
          ]"
        >
          {{ card.value }}
        </h3>
      </div>
    </div>
  </div>
</template>
