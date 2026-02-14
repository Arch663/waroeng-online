<script setup lang="ts">
defineProps<{
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}>();
</script>

<template>
  <div
    class="skeleton-base"
    :class="className"
    :style="{
      width: width || '100%',
      height: height || '1rem',
      borderRadius: borderRadius || '0.5rem',
    }"
  ></div>
</template>

<style scoped>
.skeleton-base {
  background: linear-gradient(
    90deg,
    rgba(var(--color-muted-rgb), 0.1) 25%,
    rgba(var(--color-muted-rgb), 0.2) 37%,
    rgba(var(--color-muted-rgb), 0.1) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

:root {
  --color-muted-rgb: 128, 128, 128;
}
</style>
