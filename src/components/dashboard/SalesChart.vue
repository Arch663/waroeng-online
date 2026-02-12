<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useLineSalesChart } from "@/composables/7daysChart";

const canvasRef = ref<HTMLCanvasElement | null>(null);

const { render, observeTheme, destroy } = useLineSalesChart();

onMounted(() => {
  if (!canvasRef.value) return;

  render(canvasRef.value);
  observeTheme(canvasRef.value);
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<template>
  <div class="bg-surface rounded-2xl w-150 p-4 sm:w-auto sm:h-87.5">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
