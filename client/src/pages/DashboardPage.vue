<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "@/composables/useI18n";
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
const { t } = useI18n();
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
  <div class="space-y-6 pb-10 md:pb-12 px-0 md:px-2 overflow-x-hidden">
    <PageTitle
      :title="t('dashboard_title')"
      :highlight="t('dashboard_highlight')"
      :subtitle="t('dashboard_subtitle')"
    >
      <template #action>
        <button 
          @click="loadSummary" 
          class="group p-3 bg-surface border border-border rounded-xl hover:bg-accent/5 transition-colors text-accent"
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
      class="text-xs font-bold text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/30 uppercase tracking-wider"
    >
      [ALERTI] SISTEM ERROR: {{ error }}
    </p>

    <!-- Stat Grid -->
    <StatGrid :stats="statsForGrid" :loading="loading" />

    <!-- Main Charts Row -->
    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div
          v-if="loading"
          class="h-80 md:h-96 bg-surface rounded-2xl p-5 md:p-6 border border-border"
        >
          <Skeleton height="30px" width="40%" className="mb-8" />
          <Skeleton height="260px" borderRadius="16px" />
        </div>
        <div
          v-else
          class="h-80 md:h-96 bg-surface rounded-2xl p-5 md:p-6 border border-border"
        >
          <TransactionVolumeChart :points="summary.dailyMonthSales" />
        </div>
      </div>
      <div class="lg:col-span-1">
        <div
          v-if="loading"
          class="h-80 md:h-96 bg-surface rounded-2xl p-5 md:p-6 border border-border"
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
          class="h-80 md:h-96 bg-surface rounded-2xl border border-border"
        >
          <TopProductsChart :points="summary.topProducts" />
        </div>
      </div>
    </div>

    <!-- Monthly Detailed Analysis -->
    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <div
        class="lg:col-span-2 h-80 md:h-96 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col"
      >
        <div
          class="p-4 md:p-5 border-b border-border bg-surface flex items-center justify-between gap-3"
        >
          <div>
            <h2 class="font-bold text-base text-foreground">{{ t("dashboard_chart_monthly_revenue") }}</h2>
            <p class="text-xs text-muted mt-1">{{ t("dashboard_chart_revenue_growth") }}</p>
          </div>
          <span
            class="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-md font-semibold"
            >Live</span
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
          <div v-else class="h-full flex items-end gap-1 relative">
            <div
              v-for="point in summary?.dailyMonthSales"
              :key="point.day"
              class="grow bg-accent/25 hover:bg-accent/60 rounded-sm transition-colors duration-200 relative group/bar"
              :style="{ height: Math.max(5, (point.revenue / maxDailyRevenue) * 100) + '%' }"
            >
              <div
                class="absolute -top-14 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-3 py-2 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 font-semibold border border-background/20"
              >
                 {{ t("reports_period_day") }} {{ point.day }}: Rp {{ Number(point.revenue).toLocaleString("id-ID") }}
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

      <div class="h-80 md:h-96 bg-surface rounded-2xl border border-border overflow-hidden">
        <div v-if="loading" class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="55%" className="mb-8" />
          <Skeleton height="260px" borderRadius="100%" width="260px" className="mx-auto" />
        </div>
        <CategoryDistributionChart v-else :points="summary.categorySales" />
      </div>
    </div>

    <!-- Comparison & Profit -->
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
      <div class="h-80 bg-surface rounded-2xl border border-border overflow-hidden">
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

      <div class="h-80 bg-surface rounded-2xl border border-border overflow-hidden">
        <ProfitChart
          v-if="!loading"
          :points="summary.weeklyProfit"
          :title="`${t('dashboard_chart_profit_analysis')} (7D)`"
          type="day"
        />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <div class="lg:col-span-2 h-80 bg-surface rounded-2xl border border-border overflow-hidden">
        <MonthlyRevenueChart v-if="!loading" :points="summary.monthlySales" />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>
      <div class="lg:col-span-1 h-80 bg-surface rounded-2xl border border-border overflow-hidden">
        <ProfitChart
          v-if="!loading"
          :points="summary.monthlyProfit"
          :title="t('dashboard_chart_net_profit')"
          type="month"
        />
        <div v-else class="h-full p-5 md:p-8">
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" borderRadius="16px" />
        </div>
      </div>
    </div>

    <!-- Transaction Log -->
    <div class="grid gap-4 grid-cols-1 items-start">
      <div
        class="h-88 md:h-96 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col"
      >
        <div class="p-5 md:p-6 border-b border-border bg-surface flex items-center justify-between gap-3">
          <h2 class="font-bold text-lg text-foreground">{{ t("dashboard_recent_transactions") }}</h2>
          <span class="text-xs bg-muted/20 px-2.5 py-1 rounded-md font-semibold">Synced</span>
        </div>
        <div class="p-4 md:p-6 flex-1 min-h-0 overflow-y-auto">
          <div v-if="loading" class="grid sm:grid-cols-2 gap-6">
            <Skeleton v-for="i in 4" :key="i" height="80px" borderRadius="16px" />
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div
              v-for="trx in summary?.recentTransactions"
              :key="trx.id"
              class="flex items-center justify-between p-4 bg-background/35 border border-border rounded-xl hover:bg-surface transition-colors duration-200 group"
            >
              <div class="min-w-0 pr-4">
                <p class="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">
                  {{ trx.invoiceNo }}
                </p>
                <p class="text-xs text-muted mt-1.5 opacity-80">
                  {{ new Date(trx.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-semibold text-sm md:text-base text-accent tabular-nums">
                  Rp{{ (trx.total / 1000).toLocaleString('id-ID') }}K
                </p>
              </div>
            </div>
          </div>
          <p
            v-if="summary?.recentTransactions.length === 0 && !loading"
            class="text-center py-20 text-muted font-bold uppercase tracking-widest opacity-30"
          >
            {{ t("dashboard_no_transactions") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>




