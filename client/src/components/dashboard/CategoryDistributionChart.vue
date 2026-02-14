<script setup lang="ts">
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useTheme } from "@/composables/useTheme";

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

const props = defineProps<{
  points: Array<{
    category: string;
    revenue: number;
  }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart<"doughnut"> | null>(null);
const { isDark } = useTheme();

const labels = computed(
  () => props.points?.map((p) => p.category ?? "Lainnya") ?? [],
);

const values = computed(() => props.points?.map((p) => p.revenue ?? 0) ?? []);

function buildConfig() {
  const text = isDark.value ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";

  return {
    type: "doughnut" as const,
    data: {
      labels: labels.value,
      datasets: [
        {
          data: values.value,
          backgroundColor: [
            "#6366F1", // Indigo
            "#10B981", // Emerald
            "#F59E0B", // Amber
            "#EC4899", // Pink
            "#8B5CF6", // Violet
            "#06B6D4", // Cyan
          ],
          borderWidth: 0,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: text,
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: isDark.value ? "#1e1e1e" : "#fff",
          titleColor: isDark.value ? "#fff" : "#000",
          bodyColor: isDark.value ? "#fff" : "#000",
          borderColor: isDark.value
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label(context: any) {
              const val = context.parsed;
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0,
              );
              const percentage = ((val / total) * 100).toFixed(1) + "%";
              return `${context.label}: Rp ${val.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} (${percentage})`;
            },
          },
        },
      },
    },
  };
}

function createChart() {
  if (!canvasRef.value) return;
  if (chartInstance.value) chartInstance.value.destroy();
  chartInstance.value = new Chart(canvasRef.value, buildConfig() as any);
}

function updateChart() {
  if (!chartInstance.value) {
    createChart();
    return;
  }
  const cfg = buildConfig();
  chartInstance.value.data = cfg.data;
  chartInstance.value.options = cfg.options as any;
  chartInstance.value.update();
}

watch(
  () => props.points,
  async () => {
    await nextTick();
    updateChart();
  },
  { deep: true },
);

watch(isDark, updateChart);

onMounted(async () => {
  await nextTick();
  createChart();
});

onBeforeUnmount(() => {
  chartInstance.value?.destroy();
});
</script>

<template>
  <div
    class="bg-surface rounded-3xl p-6 h-80 flex flex-col border border-border"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-lg">Distribusi Kategori</h3>
      <span
        class="text-[10px] font-black text-muted px-2 py-0.5 bg-muted/10 rounded-full uppercase tracking-wider"
        >Share</span
      >
    </div>
    <div class="grow min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
