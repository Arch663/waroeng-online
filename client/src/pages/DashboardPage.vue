<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import StatGrid from "@/components/dashboard/StatGrid.vue";
import SalesChart from "@/components/dashboard/SalesChart.vue";
import CategoryDistributionChart from "@/components/dashboard/CategoryDistributionChart.vue";
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
  <div class="space-y-6 pb-10">
    <div class="pt-3">
      <h1 class="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
      <p
        v-if="error"
        class="text-sm text-red-500 mt-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20 inline-block"
      >
        {{ error }}
      </p>
    </div>
    <StatGrid :stats="summary.stats" :loading="loading" />
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div
          v-if="loading"
          class="h-80 bg-surface rounded-3xl p-6 border border-border"
        >
          <Skeleton height="30px" width="40%" className="mb-6" />
          <Skeleton height="200px" />
        </div>
        <SalesChart v-else :points="summary.weeklySales" />
      </div>
      <div>
        <div
          v-if="loading"
          class="h-80 bg-surface rounded-3xl p-6 border border-border"
        >
          <Skeleton height="30px" width="60%" className="mb-6" />
          <Skeleton
            height="180px"
            borderRadius="100%"
            width="180px"
            className="mx-auto"
          />
        </div>
        <CategoryDistributionChart v-else :points="summary.categorySales" />
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div
        class="lg:col-span-2 bg-surface/60 backdrop-blur-xl rounded-2xl border border-border shadow-xl overflow-hidden transition-all duration-300"
      >
        <div
          class="p-6 border-b border-border bg-muted/5 flex items-center justify-between"
        >
          <h2 class="font-bold text-lg">Analisis Pendapatan</h2>
          <span
            class="text-[10px] bg-muted/20 px-2 py-1 rounded-lg font-black text-muted uppercase tracking-widest"
            >Live Updates</span
          >
        </div>
        <div class="p-6">
          <div
            v-if="loading"
            class="h-64 sm:h-80 flex items-end gap-2 md:gap-4"
          >
            <Skeleton
              v-for="i in 12"
              :key="i"
              :height="Math.random() * 100 + 40 + 'px'"
              className="grow"
              borderRadius="12px"
            />
          </div>
          <div v-else class="h-64 sm:h-80 flex items-end gap-2 md:gap-4 group">
            <div
              v-for="point in summary?.dailyMonthSales"
              :key="point.day"
              class="grow bg-accent/20 hover:bg-accent/40 rounded-t-xl transition-all relative group/bar"
              :style="{ height: (point.revenue / maxDailyRevenue) * 100 + '%' }"
            >
              <div
                class="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-black"
              >
                Rp
                {{
                  Number(point.revenue).toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
              </div>
            </div>
          </div>
          <div
            class="flex justify-between mt-4 text-[10px] font-black text-muted uppercase tracking-widest"
          >
            <span>Awal Bulan</span>
            <span>Akhir Bulan</span>
          </div>
        </div>
      </div>

      <div
        class="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border shadow-xl overflow-hidden transition-all duration-300"
      >
        <div class="p-6 border-b border-border bg-muted/5">
          <h2 class="font-bold text-lg">Produk Terlaris</h2>
        </div>
        <div class="p-4 space-y-4">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 4" :key="i" class="flex gap-4">
              <Skeleton width="48px" height="48px" borderRadius="12px" />
              <div class="grow space-y-2">
                <Skeleton height="16px" width="70%" />
                <Skeleton height="12px" width="40%" />
              </div>
            </div>
          </div>
          <div
            v-for="product in summary?.topProducts"
            :key="product.id"
            class="flex items-center gap-4 p-2 hover:bg-muted/10 rounded-xl transition-colors"
          >
            <div
              class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent text-xl font-bold"
            >
              {{ product.name.charAt(0) }}
            </div>
            <div class="grow min-w-0">
              <h4 class="font-bold text-sm truncate">{{ product.name }}</h4>
              <p class="text-xs text-muted font-medium">
                {{ product.sold }} terjual
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs font-black text-accent tabular-nums">
                Rp
                {{
                  Number(product.revenue).toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div
        class="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border shadow-xl overflow-hidden transition-all duration-300"
      >
        <div
          class="p-6 border-b border-border bg-muted/5 flex items-center justify-between"
        >
          <h2 class="font-bold text-lg">Stok Hampir Habis</h2>
          <span
            class="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-lg font-black uppercase tracking-widest"
            >Warning</span
          >
        </div>
        <div class="p-4">
          <div v-if="loading" class="space-y-3">
            <Skeleton
              v-for="i in 3"
              :key="i"
              height="50px"
              borderRadius="12px"
            />
          </div>
          <div class="space-y-2">
            <div
              v-for="item in summary?.lowStockItems"
              :key="item.id"
              class="flex items-center justify-between p-4 bg-muted/5 border border-border/50 rounded-xl hover:bg-red-500/5 transition-colors"
            >
              <span class="font-bold text-sm">{{ item.name }}</span>
              <span
                class="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black"
                >Sisa {{ item.stock }}</span
              >
            </div>
            <p
              v-if="summary?.lowStockItems.length === 0"
              class="text-center py-8 text-muted text-sm font-medium italic"
            >
              Semua stok masih aman.
            </p>
          </div>
        </div>
      </div>

      <div
        class="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border shadow-xl overflow-hidden transition-all duration-300"
      >
        <div class="p-6 border-b border-border bg-muted/5">
          <h2 class="font-bold text-lg">Transaksi Terakhir</h2>
        </div>
        <div class="p-4">
          <div v-if="loading" class="space-y-3">
            <Skeleton
              v-for="i in 3"
              :key="i"
              height="60px"
              borderRadius="12px"
            />
          </div>
          <div class="space-y-2">
            <div
              v-for="trx in summary?.recentTransactions"
              :key="trx.id"
              class="flex items-center justify-between p-4 bg-muted/5 border border-border/50 rounded-xl hover:bg-accent/5 transition-colors"
            >
              <div>
                <p
                  class="font-black text-sm text-foreground uppercase tracking-tight"
                >
                  {{ trx.invoiceNo }}
                </p>
                <p class="text-[10px] text-muted font-bold">
                  {{ new Date(trx.createdAt).toLocaleTimeString() }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-black text-accent tabular-nums">
                  Rp
                  {{
                    Number(trx.total).toLocaleString("id-ID", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  }}
                </p>
              </div>
            </div>
            <p
              v-if="summary?.recentTransactions.length === 0"
              class="text-center py-8 text-muted text-sm"
            >
              Belum ada transaksi hari ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
