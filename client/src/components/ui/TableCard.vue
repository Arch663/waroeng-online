<script setup lang="ts">
withDefaults(
  defineProps<{
    wrapperClass?: string;
    tableWrapperClass?: string;
    headerClass?: string;
    footerClass?: string;
  }>(),
  {
    wrapperClass:
      "bg-surface/60 backdrop-blur-xl rounded-2xl border border-border",
    tableWrapperClass: "overflow-x-auto",
    headerClass:
      "p-6 border-b border-border bg-muted/5 flex items-center justify-between",
    footerClass: "px-4",
  },
);
</script>

<template>
  <div :class="wrapperClass">
    <div v-if="$slots.header" :class="headerClass">
      <slot name="header" />
    </div>

    <div :class="tableWrapperClass">
      <slot />
    </div>

    <div v-if="$slots.footer" :class="footerClass">
      <slot name="footer" />
    </div>
  </div>
</template>
