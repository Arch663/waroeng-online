<script setup lang="ts">
defineProps<{
  title: string;
  highlight: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="page-title-row">
    <div class="min-w-0">
      <h1 class="page-title-text">
        {{ title }}
        <span class="page-title-highlight">{{ highlight }}</span>
      </h1>
      <p class="page-title-subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-title-action">
      <slot name="action" />
    </div>
  </div>
</template>
