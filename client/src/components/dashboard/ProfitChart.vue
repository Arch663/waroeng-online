<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart } from "chart.js/auto";

const props = defineProps<{
  points: Array<{ day?: string; month?: string; profit: number }>;
  title?: string;
  type?: "day" | "month";
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
  const labels = props.points.map((p) => (props.type === "day" ? p.day : p.month) || "");
  const data = props.points.map((p) => p.profit);

  if (chart) chart.destroy();

  const config: any = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Laba Bersih",
          data,
          borderColor: c.accent,
          backgroundColor: c.accent + "22",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 9,
          pointBackgroundColor: c.accent,
          pointBorderColor: c.bg,
          pointBorderWidth: 2,
          borderWidth: 3,
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
          displayColors: false,
          callbacks: {
            label(context: any) {
              return `Laba: Rp ${context.parsed.y.toLocaleString("id-ID")}`;
            },
          },
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
            font: { size: 10 },
            callback: (val: any) => "Rp " + (val >= 1000 ? val / 1000 + "k" : val),
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
  <div class="p-8 h-80 flex flex-col">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="text-xs font-black text-muted uppercase tracking-widest mb-2">Efficiency Analysis</h3>
        <h2 class="text-2xl font-black text-foreground uppercase tracking-tight">{{ title || "Analisis Laba" }}</h2>
      </div>
      <div class="w-10 h-10 flex items-center justify-center bg-accent/10 text-accent rounded-xl shadow-glass">
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
          <path d="M7 15l4-4 3 2 4-6" />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

