<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "@/components/ui/Skeleton.vue";

const props = defineProps<{
  stats: {
    omzetToday: number;
    transaksiToday: number;
    productsSoldToday: number;
    lowStockCount: number;
    omzetMonth: number;
    transaksiMonth: number;
    purchasesToday?: number;
    purchasesMonth?: number;
    profitToday?: number;
    profitMonth?: number;
  };
  loading?: boolean;
}>();

type StatIcon =
  | "money"
  | "transaction"
  | "profit"
  | "purchase"
  | "sold"
  | "monthRevenue"
  | "monthProfit"
  | "delivery"
  | "analytics"
  | "alert";

const cards = computed(() => [
  {
    label: "Omzet Hari Ini",
    value: Number(props.stats.omzetToday).toLocaleString("id-ID"),
    color: "text-accent",
    icon: "money" as StatIcon,
    prefix: "Rp",
  },
  {
    label: "Transaksi Hari Ini",
    value: props.stats.transaksiToday,
    color: "text-secondary",
    icon: "transaction" as StatIcon,
  },
  {
    label: "Laba Hari Ini",
    value: Number(props.stats.profitToday || 0).toLocaleString("id-ID"),
    color: "text-accent",
    icon: "profit" as StatIcon,
    prefix: "Rp",
  },
  {
    label: "Beli Stok (Hari)",
    value: Number(props.stats.purchasesToday || 0).toLocaleString("id-ID"),
    color: "text-accent",
    icon: "purchase" as StatIcon,
    prefix: "Rp",
  },
  {
    label: "Unit Terjual (Hari)",
    value: props.stats.productsSoldToday,
    color: "text-secondary",
    icon: "sold" as StatIcon,
  },
  {
    label: "Omzet Bulan Ini",
    value: Number(props.stats.omzetMonth).toLocaleString("id-ID"),
    color: "text-accent",
    icon: "monthRevenue" as StatIcon,
    prefix: "Rp",
  },
  {
    label: "Laba Bulan Ini",
    value: Number(props.stats.profitMonth || 0).toLocaleString("id-ID"),
    color: "text-accent",
    icon: "monthProfit" as StatIcon,
    prefix: "Rp",
  },
  {
    label: "Beli Stok (Bulan)",
    value: Number(props.stats.purchasesMonth || 0).toLocaleString("id-ID"),
    color: "text-accent",
    icon: "delivery" as StatIcon,
    prefix: "Rp",
  },
  {
    label: "Transaksi (Bulan)",
    value: props.stats.transaksiMonth,
    color: "text-secondary",
    icon: "analytics" as StatIcon,
  },
  {
    label: "Alert: Low Stock",
    value: props.stats.lowStockCount,
    color: props.stats.lowStockCount > 0 ? "text-secondary" : "text-secondary/40",
    icon: "alert" as StatIcon,
  },
]);

const iconPaths: Record<StatIcon, string[]> = {
  money: ["M2 7h20v10H2z", "M12 10a2 2 0 100 4 2 2 0 000-4", "M6 9v6M18 9v6"],
  transaction: ["M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z", "M3 10h18"],
  profit: ["M3 3v18h18", "M7 14l4-4 3 3 4-6"],
  purchase: ["M3 3h2l.4 2M7 13h10l4-8H5.4", "M7 13l-1.5 6h11"],
  sold: ["M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z", "M9 12l2 2 4-4"],
  monthRevenue: ["M3 3v18h18", "M7 16l3-4 4 2 3-5"],
  monthProfit: ["M3 3v18h18", "M7 15l4-4 3 2 4-6"],
  delivery: ["M1 6h15v9H1z", "M16 9h4l3 3v3h-7z", "M5 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3", "M18 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3"],
  analytics: ["M4 19h16", "M7 16v-4", "M12 16V8", "M17 16v-6"],
  alert: ["M12 3l10 18H2L12 3z", "M12 9v5", "M12 18h.01"],
};
</script>

<template>
  <div>
    <div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="card in cards"
        :key="card.label"
        class="bg-surface/30 backdrop-blur-2xl rounded-2xl p-6 shadow-glass border border-border/50 group hover:border-accent/40 transition-all duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs uppercase tracking-widest font-black text-muted/50">
            {{ card.label }}
          </p>
          <div class="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 transition-all group-hover:bg-accent group-hover:text-background group-hover:scale-110">
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path v-for="path in iconPaths[card.icon]" :key="path" :d="path" />
            </svg>
          </div>
        </div>
        <div v-if="props.loading" class="space-y-1">
          <Skeleton height="20px" width="60%" borderRadius="4px" />
        </div>
        <div v-else class="flex items-baseline gap-1 min-w-0">
          <span v-if="card.prefix" class="text-xs font-bold text-muted uppercase">{{ card.prefix }}</span>
          <h3
            :class="[
              'text-lg font-black tabular-nums transition-colors tracking-tighter truncate',
              card.color,
            ]"
          >
            {{ card.value }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>


