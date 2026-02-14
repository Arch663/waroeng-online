<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart } from "chart.js";

const props = defineProps<{
  sales: Array<{ day?: string; revenue: number }>;
  purchases: Array<{ day?: string; amount: number }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function getChartColors() {
  const css = getComputedStyle(document.documentElement);
  return {
    text: css.getPropertyValue("--foreground").trim() || "#000",
    grid: css.getPropertyValue("--border").trim() || "#ccc",
    accent: css.getPropertyValue("--accent").trim() || "#6366f1",
    orange: "#ea580c", // tailwind orange-600
    bg: css.getPropertyValue("--background").trim() || "#fff",
  };
}

function draw() {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const c = getChartColors();
  const labels = props.sales.map((s) => s.day || "");
  const salesData = props.sales.map((s) => s.revenue);
  const purchaseData = props.purchases.map((p) => p.amount);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Pendapatan",
          data: salesData,
          backgroundColor: c.accent,
          borderRadius: 6,
        },
        {
          label: "Pengeluaran Stok",
          data: purchaseData,
          backgroundColor: c.orange,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { color: c.text, usePointStyle: true, boxWidth: 10 },
        },
        tooltip: {
          backgroundColor: c.bg,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          callbacks: {
            label(context: any) {
              return `${context.dataset.label}: Rp ${context.parsed.y.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: c.text }, grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: {
            color: c.text,
            callback: (val: any) => "Rp" + val / 1000 + "k",
          },
          grid: { color: c.grid },
        },
      },
    },
  });
}

watch(
  () => [props.sales, props.purchases],
  async () => {
    await nextTick();
    draw();
  },
  { deep: true },
);

onMounted(async () => {
  await nextTick();
  draw();
  window.addEventListener("resize", draw);
});

onBeforeUnmount(() => {
  if (chart) chart.destroy();
  window.removeEventListener("resize", draw);
});
</script>

<template>
  <div class="bg-surface rounded-3xl p-6 border border-border h-80">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-foreground">Revenue vs Expenses</h3>
      <p class="text-xs text-muted">7 Hari Terakhir</p>
    </div>
    <div class="flex-1 h-60">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
