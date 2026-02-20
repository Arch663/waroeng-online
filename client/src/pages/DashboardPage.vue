<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import StatGrid from "@/components/dashboard/StatGrid.vue";
import TransactionVolumeChart from "@/components/dashboard/TransactionVolumeChart.vue";
import ProfitChart from "@/components/dashboard/ProfitChart.vue";
import ComparisonChart from "@/components/dashboard/ComparisonChart.vue";
import MonthlyRevenueChart from "@/components/dashboard/MonthlyRevenueChart.vue";
import TopProductsChart from "@/components/dashboard/TopProductsChart.vue";
import CategoryDistributionChart from "@/components/dashboard/CategoryDistributionChart.vue";
import PageTitle from "@/components/ui/PageTitle.vue";
import Skeleton from "@/components/ui/Skeleton.vue";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/services/dashboardApi";

const loading = ref(false);
const error = ref("");
const summary = ref<DashboardSummary>({
  stats: {
    omzetToday: 0,
    transaksiToday: 0,
    productsSoldToday: 0,
    lowStockCount: 0,
    omzetMonth: 0,
    transaksiMonth: 0,
    profitToday: 0,
    profitMonth: 0,
  },
  lowStockItems: [],
  recentTransactions: [],
  topProducts: [],
  weeklySales: [],
  monthlySales: [],
  dailyMonthSales: [],
  categorySales: [],
  purchaseStats: {
    purchasesToday: 0,
    purchasesMonth: 0,
  },
  weeklyPurchases: [],
  monthlyPurchases: [],
  weeklyProfit: [],
  monthlyProfit: [],
});

const maxDailyRevenue = computed(() => {
  if (
    !summary.value?.dailyMonthSales ||
    summary.value.dailyMonthSales.length === 0
  ) {
    return 1;
  }
  return Math.max(...summary.value.dailyMonthSales.map((item) => item.revenue));
});

const statsForGrid = computed(() => ({
  ...summary.value.stats,
  purchasesToday:
    summary.value.stats.purchasesToday ??
    summary.value.purchaseStats?.purchasesToday ??
    0,
  purchasesMonth:
    summary.value.stats.purchasesMonth ??
    summary.value.purchaseStats?.purchasesMonth ??
    0,
}));

async function loadSummary() {
  loading.value = true;
  error.value = "";

  try {
    summary.value = await getDashboardSummary();
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : "Gagal memuat dashboard.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadSummary();
});
</script>

<template>
  <div class="space-y-6 md:space-y-10 pb-10 md:pb-12 px-0 md:px-2 overflow-x-hidden">
    <PageTitle
      title="Analisis"
      highlight="Dashboard"
      subtitle="Status: beroperasi normal"
    >
      <template #action>
        <button 
          @click="loadSummary" 
          class="group p-4 bg-surface/40 backdrop-blur-xl border border-border rounded-2xl hover:bg-accent/10 transition-all text-accent active:scale-90"
          :disabled="loading"
        >
          <svg
            class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 11-2.64-6.36M21 3v6h-6" />
          </svg>
        </button>
      </template>
    </PageTitle>

    <p
      v-if="error"
      class="text-xs font-black text-red-500 bg-red-500/10 p-5 rounded-2xl border border-red-500/30 uppercase tracking-widest shadow-lg"
    >
      [ALERTI] SISTEM ERROR: {{ error }}
    </p>

    <!-- Stat Grid -->
    <StatGrid :stats="statsForGrid" :loading="loading" />

    <!-- Main Charts Row -->
    <div class="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div
          v-if="loading"
          class="h-80 md:h-96 bg-surface/40 backdrop-blur-xl rounded-3xl p-5 md:p-8 border border-border"
        >
          <Skeleton height="30px" width="40%" className="mb-8" />
          <Skeleton height="260px" borderRadius="16px" />
        </div>
        <div
          v-else
          class="h-80 md:h-96 bg-surface/40 backdrop-blur-xl rounded-3xl p-5 md:p-8 border border-border"
        >
          <TransactionVolumeChart :points="summary.dailyMonthSales" />
        </div>
      </div>
      <div class="lg:col-span-1">
        <div
          v-if="loading"
          class="h-80 md:h-96 bg-surface/40 backdrop-blur-xl rounded-3xl p-5 md:p-8 border border-border"
        >
          <Skeleton height="30px" width="60%" className="mb-8" />
          <Skeleton
            height="220px"
            borderRadius="100%"
            width="220px"
            className="mx-auto"
          />
        </div>
        <div
          v-else
          class="h-80 md:h-96 bg-surface/40 backdrop-blur-xl rounded-3xl border border-border"
        >
          <TopProductsChart :points="summary.topProducts" />
        </div>
      </div>
    </div>

    <!-- Monthly Detailed Analysis -->
    <div class="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
      <div
        class="lg:col-span-2 h-80 md:h-96 bg-surface/40 backdrop-blur-2xl rounded-3xl border border-border overflow-hidden group transition-all duration-500 hover:border-accent/40 flex flex-col"
      >
        <div
          class="p-4 md:p-5 border-b border-border bg-accent/5 flex items-center justify-between gap-3"
        >
          <div>
            <h2 class="font-black text-base md:text-lg text-foreground uppercase tracking-tight">Kurva Omzet Harian</h2>
            <p class="text-xs text-muted font-bold mt-1 uppercase tracking-widest opacity-60">Visualisasi pendapatan realtime</p>
          </div>
          <span
            class="text-xs bg-accent text-background px-3 py-1 rounded-sm font-black uppercase tracking-widest"
            >Live Analysis</span
          >
        </div>
        <div class="p-4 md:p-5 flex-1 min-h-0">
          <div
            v-if="loading"
            class="h-full flex items-end gap-1"
          >
            <Skeleton
              v-for="i in 30"
              :key="i"
              :height="Math.random() * 80 + 20 + '%'"
              className="grow"
              borderRadius="2px"
            />
          </div>
          <div v-else class="h-full flex items-end gap-1 group/chart relative">
            <div
              v-for="point in summary?.dailyMonthSales"
              :key="point.day"
              class="grow bg-accent/20 hover:bg-accent hover rounded-sm transition-all duration-300 relative group/bar"
              :style="{ height: Math.max(5, (point.revenue / maxDailyRevenue) * 100) + '%' }"
            >
              <div
                class="absolute -top-14 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-2 rounded-md opacity-0 group-hover/bar:opacity-100 transition-all duration-300 scale-90 group-hover/bar:scale-100 whitespace-nowrap z-30 font-black shadow-2xl border border-background/20"
              >
                 TGL {{ point.day }}: Rp {{ Number(point.revenue).toLocaleString("id-ID") }}
              </div>
            </div>
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
              <div v-for="i in 5" :key="i" class="border-t border-foreground w-full"></div>
            </div>
          </div>
          <div
            class="hidden md:grid grid-cols-6 mt-4 text-xs font-black text-muted uppercase tracking-widest border-t border-border pt-3 gap-y-2"
          >
            <span class="text-left">Start_Date</span>
            <span class="text-center">Minimum</span>
            <span class="text-center col-span-2">Mid_Point</span>
            <span class="text-center">Maximum</span>
            <span class="text-right">Today_Sync</span>
          </div>
        </div>
      </div>

      <div
        class="h-80 md:h-96 bg-surface/40 backdrop-blur-2xl rounded-3xl border border-border overflow-hidden transition-all duration-500"
      >
        <div v-if="loading" class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="55%" className="mb-8" />
          <Skeleton height="260px" borderRadius="100%" width="260px" className="mx-auto" />
        </div>
        <CategoryDistributionChart v-else :points="summary.categorySales" />
      </div>
    </div>

    <!-- Comparison & Profit -->
    <div class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
      <div class="h-80 bg-surface/40 rounded-3xl border border-border overflow-hidden transition-all duration-300 hover:border-accent/40">
        <ComparisonChart
          v-if="!loading"
          :sales="summary.weeklySales"
          :purchases="summary.weeklyPurchases || []"
        />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>

      <div class="h-80 bg-surface/40 rounded-3xl border border-border overflow-hidden transition-all duration-300 hover:border-accent/40">
        <ProfitChart
          v-if="!loading"
          :points="summary.weeklyProfit"
          title="Kurva Laba (7H)"
          type="day"
        />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
      <div class="lg:col-span-2 h-80 bg-surface/40 rounded-3xl border border-border overflow-hidden transition-all duration-300 hover:border-accent/40">
        <MonthlyRevenueChart v-if="!loading" :points="summary.monthlySales" />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>
      <div class="lg:col-span-1 h-80 bg-surface/40 rounded-3xl border border-border overflow-hidden transition-all duration-300 hover:border-accent/40">
        <ProfitChart
          v-if="!loading"
          :points="summary.monthlyProfit"
          title="Laba Kumulatif"
          type="month"
        />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>
    </div>

    <!-- Transaction Log -->
    <div class="grid gap-4 md:gap-6 grid-cols-1 items-start">
      <div
        class="h-88 md:h-96 bg-surface/40 backdrop-blur-3xl rounded-3xl border border-border overflow-hidden flex flex-col"
      >
        <div class="p-5 md:p-8 border-b border-border bg-accent/5 flex items-center justify-between gap-3">
          <h2 class="font-black text-lg md:text-xl text-foreground uppercase tracking-tight">Log Transaksi Terakhir</h2>
          <span class="text-xs bg-muted/20 px-3 py-1.5 rounded-sm font-black uppercase tracking-widest">Database_Sync</span>
        </div>
        <div class="p-4 md:p-6 flex-1 min-h-0 overflow-y-auto">
          <div v-if="loading" class="grid sm:grid-cols-2 gap-6">
            <Skeleton v-for="i in 4" :key="i" height="80px" borderRadius="16px" />
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div
              v-for="trx in summary?.recentTransactions"
              :key="trx.id"
              class="flex items-center justify-between p-6 bg-surface/20 border border-border rounded-2xl hover:bg-accent/5 transition-all duration-500 shadow-sm hover group"
            >
              <div class="min-w-0 pr-4">
                <p class="font-black text-xs md:text-sm text-foreground uppercase tracking-tighter truncate group-hover:text-accent transition-colors">
                  {{ trx.invoiceNo }}
                </p>
                <p class="text-xs text-muted font-bold mt-2 tracking-widest opacity-60 uppercase">
                  {{ new Date(trx.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-black text-sm md:text-lg text-accent tabular-nums tracking-tighter">
                  Rp{{ (trx.total / 1000).toLocaleString('id-ID') }}K
                </p>
              </div>
            </div>
          </div>
          <p
            v-if="summary?.recentTransactions.length === 0 && !loading"
            class="text-center py-20 text-muted font-bold uppercase tracking-widest opacity-30"
          >
            BUFFER EMPTY: NO ACTIVE TRANSACTIONS
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


