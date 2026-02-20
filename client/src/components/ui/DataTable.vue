<script setup lang="ts">
withDefaults(
  defineProps<{
    hasData: boolean;
    columns: number;
    emptyText: string;
    tableClass?: string;
    theadClass?: string;
    tbodyClass?: string;
    emptyRowClass?: string;
  }>(),
  {
    tableClass: "w-full text-left",
    theadClass: "bg-muted/10 text-xs uppercase tracking-wider font-bold text-muted",
    tbodyClass: "divide-y divide-border",
    emptyRowClass: "px-6 py-12 text-center text-muted",
  },
);
</script>

<template>
  <table :class="tableClass">
    <thead :class="theadClass">
      <slot name="head" />
    </thead>
    <tbody :class="tbodyClass">
      <slot name="body" />
      <tr v-if="!hasData">
        <td :colspan="columns" :class="emptyRowClass">
          {{ emptyText }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

