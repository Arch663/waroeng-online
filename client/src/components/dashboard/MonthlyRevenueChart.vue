<script setup lang="ts">
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
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

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps<{
  points: Array<{
    month?: string;
    revenue: number;
  }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart<"bar"> | null>(null);
const { isDark } = useTheme();

const labels = computed(() => props.points?.map((p) => p.month ?? "") ?? []);
const values = computed(() => props.points?.map((p) => p.revenue ?? 0) ?? []);

function buildConfig() {
  const text = isDark.value ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const grid = isDark.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return {
    type: "bar" as const,
    data: {
      labels: labels.value,
      datasets: [
        {
          label: "Pendapatan",
          data: values.value,
          backgroundColor: "#6366F1",
          borderRadius: 8,
          hoverBackgroundColor: "#4F46E5",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
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
              return `Rp ${context.parsed.y.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: text },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: text,
            callback: (value: any) => "Rp " + value / 1000 + "k",
          },
          grid: { color: grid },
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
      <h3 class="font-bold text-lg">Pendapatan Bulanan</h3>
      <span
        class="text-xs font-medium text-muted px-2 py-1 bg-muted/10 rounded-lg"
        >6 Bulan</span
      >
    </div>
    <div class="grow min-h-0">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
