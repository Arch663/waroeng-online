<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart } from "chart.js/auto";
import { useI18n } from "@/composables/useI18n";

const props = defineProps<{
  points: Array<{ name: string; revenue: number }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;
const { t } = useI18n();

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
  const topPoints = [...props.points]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const labels = topPoints.map((item) => item.name);
  const data = topPoints.map((item) => item.revenue);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: t("dashboard_chart_revenue"),
          data,
          backgroundColor: c.accent + "33",
          hoverBackgroundColor: c.accent,
          borderColor: c.accent + "66",
          hoverBorderColor: c.accent,
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.bg,
          titleColor: c.text,
          bodyColor: c.text,
          borderColor: c.grid,
          borderWidth: 1,
          callbacks: {
            label(context: any) {
              return `${t("dashboard_chart_revenue")}: Rp ${context.parsed.x.toLocaleString("id-ID")}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: c.text,
            font: { size: 10 },
            callback(value: string | number) {
              const numValue = Number(value);
              return numValue >= 1000 ? `${Math.round(numValue / 1000)}K` : numValue;
            },
          },
          grid: { color: c.grid, drawTicks: false },
        },
        y: {
          ticks: {
            color: c.text,
            font: { weight: "bold", size: 10 },
          },
          grid: { display: false },
        },
      },
    },
  });
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
        <h3 class="text-xs font-black text-muted uppercase tracking-widest mb-1">{{ t("dashboard_chart_revenue_ranking") }}</h3>
        <h2 class="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight">{{ t("dashboard_chart_top_products") }}</h2>
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
          <path d="M12 2l2.9 5.88L21 8.76l-4.5 4.39 1.06 6.2L12 16.77 6.44 19.35l1.06-6.2L3 8.76l6.1-.88L12 2z" />
        </svg>
      </div>
    </div>
    <div class="flex-1 min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

