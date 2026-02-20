<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart } from "chart.js/auto";

const props = defineProps<{
  points: Array<{ day?: string; count?: number }>;
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
  const labels = props.points.map((p) => p.day || "");
  const data = props.points.map((p) => p.count || 0);

  if (chart) chart.destroy();

  const config: any = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Volume Transaksi",
          data,
          backgroundColor: c.accent + "33",
          hoverBackgroundColor: c.accent,
          borderColor: c.accent + "66",
          hoverBorderColor: c.accent,
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.bg,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        x: {
          ticks: { color: c.text, font: { weight: "bold", size: 10 } },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: c.text,
            stepSize: 1,
            font: { size: 10 },
          },
          grid: { color: c.grid, drawTicks: false, borderDash: [5, 5] },
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
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xs font-black text-muted uppercase tracking-widest mb-1">Pulse Monitor</h3>
        <h2 class="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">Volume Transaksi</h2>
      </div>
      <div class="w-9 h-9 flex items-center justify-center bg-accent/10 text-accent rounded-xl">
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
        </svg>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

