<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart } from "chart.js/auto";

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

  const config: any = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: salesData,
          backgroundColor: c.accent + "33",
          hoverBackgroundColor: c.accent,
          borderColor: c.accent + "66",
          hoverBorderColor: c.accent,
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.5,
        },
        {
          label: "Stock Out",
          data: purchaseData,
          backgroundColor: c.accent + "55",
          hoverBackgroundColor: c.accent,
          borderColor: c.accent + "66",
          hoverBorderColor: c.accent,
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 0.5,
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
          align: "end",
          labels: {
            color: c.text,
            usePointStyle: true,
            boxWidth: 8,
            font: { weight: "black", size: 10 },
          },
        },
        tooltip: {
          backgroundColor: c.bg,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label(context: any) {
              return `${context.dataset.label}: Rp ${context.parsed.y.toLocaleString("id-ID")}`;
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: c.text, font: { weight: "bold", size: 10 } }, grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: {
            color: c.text,
            font: { size: 10 },
            callback: (val: any) => "Rp" + (val >= 1000 ? val / 1000 + "k" : val),
          },
          grid: { color: c.grid, drawTicks: false, borderDash: [5, 5] },
        },
      },
    },
  };

  chart = new Chart(ctx, config);
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
  <div class="p-8 h-80 flex flex-col">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xs font-black text-muted uppercase tracking-widest mb-2">Financial Flow</h3>
        <h2 class="text-2xl font-black text-foreground uppercase tracking-tight">Revenue vs Stok</h2>
      </div>
      <div class="w-10 h-10 flex items-center justify-center bg-accent/10 text-accent rounded-xl">
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 4-6" />
          <path d="M7 18h9" />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

