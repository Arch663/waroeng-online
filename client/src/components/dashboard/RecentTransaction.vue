<script setup lang="ts">
defineProps<{
  transactions: Array<{
    id: number;
    invoiceNo: string;
    total: number;
    createdAt: string;
  }>;
}>();
</script>

<template>
  <div
    class="bg-surface rounded-2xl h-43.5 p-4 overflow-y-auto max-h-65 scrollbar scrollbar-thumb-foreground scrollbar-track-border scrollbar-hover:scrollbar-thumb-surface"
  >
    <h2 class="font-semibold mb-4">Transaksi Terakhir</h2>

    <div v-if="transactions.length === 0" class="text-sm text-muted">
      Belum ada transaksi.
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="trx in transactions"
        :key="trx.id"
        class="flex justify-between text-sm"
      >
        <div>
          <p>{{ trx.invoiceNo }}</p>
          <p class="text-xs text-muted">
            {{ new Date(trx.createdAt).toLocaleString("id-ID") }}
          </p>
        </div>
        <span class="font-medium">
          Rp
          {{
            trx.total.toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}
        </span>
      </div>
    </div>
  </div>
</template>
