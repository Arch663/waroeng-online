<script setup lang="ts">
defineEmits(["add"]);
</script>

<template>
  <div
    class="flex flex-col px-4 md:px-6 pt-3 sm:flex-row sm:items-center sm:justify-between gap-4"
  >
  <h1 class="text-xl font-semibold">Inventory</h1>

    <button
      @click="$emit('add')"
      class="px-4 py-2 bg-accent text-white rounded-xl "
    >
      + Tambah Barang
    </button>
  </div>
</template>
