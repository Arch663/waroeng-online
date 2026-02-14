<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useLineSalesChart } from "@/composables/7daysChart";

const props = defineProps<{
  points: Array<{
    day?: string;
    month?: string;
    revenue: number;
  }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const { render, observeTheme, destroy } = useLineSalesChart();

const labels = computed(
  () => props.points?.map((p) => p.day ?? p.month ?? "") ?? [],
);

const values = computed(() => props.points?.map((p) => p.revenue ?? 0) ?? []);

function draw() {
  if (!canvasRef.value) return;

  const input = {
    labels: labels.value,
    values: values.value,
  };

  destroy();
  render(canvasRef.value, input);
  observeTheme(canvasRef.value, input);
}

watch(
  () => props.points,
  async () => {
    await nextTick();
    draw();
  },
);

onMounted(async () => {
  await nextTick();
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
