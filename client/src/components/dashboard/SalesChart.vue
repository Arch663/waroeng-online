<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useLineSalesChart } from "@/composables/7daysChart";

const props = defineProps<{
  points: Array<{
    day: string;
    revenue: number;
  }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { render, observeTheme, destroy } = useLineSalesChart();

const labels = computed(() => props.points.map((point) => point.day));
const values = computed(() => props.points.map((point) => point.revenue));

function draw() {
  if (!canvasRef.value) return;
  if (labels.value.length === 0) return;

  const input = {
    labels: labels.value,
    values: values.value,
  };

  render(canvasRef.value, input);
  observeTheme(canvasRef.value, input);
}

watch(
  () => props.points,
  () => {
    draw();
  },
  { deep: true },
);

onMounted(() => {
  draw();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<template>
  <div class="bg-surface rounded-2xl p-4 sm:h-87.5">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
