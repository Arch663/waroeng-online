<script setup lang="ts">
defineProps<{
  searchQuery: string;
}>();

defineEmits(["add", "search"]);
</script>

<template>
  <div class="pt-3 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl md:text-3xl font-bold text-foreground">Inventory</h1>
      <button
        @click="$emit('add')"
        class="px-5 py-2.5 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-transform active:scale-95"
      >
        + Tambah Barang
      </button>
    </div>

    <!-- Search Bar -->
    <div class="relative group">
      <div
        class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-accent"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        :value="searchQuery"
        type="text"
        placeholder="Cari SKU atau nama barang..."
        class="w-full bg-surface/60 backdrop-blur-xl border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent shadow-sm transition-all placeholder:text-muted/60"
        @input="$emit('search', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
