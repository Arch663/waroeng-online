<script setup lang="ts">
import { onMounted, ref } from "vue";
import StatGrid from "@/components/dashboard/StatGrid.vue";
import SalesChart from "@/components/dashboard/SalesChart.vue";
import LowStockList from "@/components/dashboard/LowStockList.vue";
import RecentTransaction from "@/components/dashboard/RecentTransaction.vue";
import TopProduct from "@/components/dashboard/TopProduct.vue";
import { getDashboardSummary, type DashboardSummary } from "@/services/dashboardApi";

const loading = ref(false);
const error = ref("");
const summary = ref<DashboardSummary>({
  stats: {
    omzetToday: 0,
    transaksiToday: 0,
    productsSoldToday: 0,
    lowStockCount: 0,
  },
  lowStockItems: [],
  recentTransactions: [],
  topProducts: [],
  weeklySales: [],
});

async function loadSummary() {
  loading.value = true;
  error.value = "";

  try {
    summary.value = await getDashboardSummary();
  } catch (loadError) {
    error.value = loadError instanceof Error ? loadError.message : "Gagal memuat dashboard.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadSummary();
});
</script>

<template>
  <div class="space-y-5">
    <div class="px-4 md:px-6 pt-3">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <p v-if="loading" class="text-sm text-muted mt-1">Memuat ringkasan...</p>
      <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
    </div>
    <StatGrid :stats="summary.stats" />
    <div class="grid gap-6 px-4 md:px-6 lg:grid-cols-4">
      <SalesChart class="md:col-span-3" :points="summary.weeklySales" />
      <div class="space-y-5">
        <LowStockList :items="summary.lowStockItems" />
        <RecentTransaction :transactions="summary.recentTransactions" />
      </div>
      <TopProduct class="md:col-span-4" :products="summary.topProducts" />
    </div>
  </div>
</template>
