<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart } from "chart.js/auto";

const props = defineProps<{
  points: Array<{ category: string; revenue: number }>;
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
  const labels = props.points.map((p) => p.category || "Lainnya");
  const data = props.points.map((p) => p.revenue);
  const isDark = document.documentElement.classList.contains("dark");

  const lightPalette = [
    "#e44d26",
    "#ff6a3d",
    "#ff8a5b",
    "#d13b1f",
    "#f7982f",
    "#ffb36d",
  ];
  const darkPalette = [
    "#9cf431",
    "#7fe01d",
    "#61c10f",
    "#7a4db4",
    "#4f2d77",
    "#bcff66",
  ];
  const palette = isDark ? darkPalette : lightPalette;

  if (chart) chart.destroy();

  const config: any = {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: data.map((_, idx) => palette[idx % palette.length]),
          borderWidth: 1,
          borderColor: c.bg,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: c.text,
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
            font: { 
              size: 11,
              weight: 'black'
            }
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
              const val = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((val / total) * 100).toFixed(1) + "%";
              return `${context.label}: Rp ${val.toLocaleString("id-ID")} (${percentage})`;
            },
          },
        },
      },
    },
  };

  chart = new Chart(ctx, config);
}

watch(
  () => props.points,
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
  <div class="p-5 md:p-8 h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xs font-black text-muted uppercase tracking-widest mb-1">Category Split</h3>
        <h2 class="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">Penjualan Kategori</h2>
      </div>
      <div class="w-9 h-9 flex items-center justify-center bg-accent/10 text-accent rounded-xl shadow-glass">
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21.21 15.89A10 10 0 118 2.83" />
          <path d="M22 12A10 10 0 0012 2v10z" />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

