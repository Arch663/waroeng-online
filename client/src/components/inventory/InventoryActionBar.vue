<script setup lang="ts">
import PageTitle from "@/components/ui/PageTitle.vue";

defineProps<{
  searchQuery: string;
}>();

defineEmits(["add", "search"]);
</script>

<template>
  <div class="pt-6 space-y-8">
    <PageTitle
      title="Inventori"
      highlight="Barang"
      subtitle="Unit-00: stock management system"
    >
      <template #action>
        <button
          @click="$emit('add')"
          class="px-6 py-4 bg-accent text-background rounded-2xl font-black uppercase tracking-widest shadow-glass hover:shadow-accent/40 hover:-translate-y-1 transition-all active:scale-95 text-xs md:text-sm"
        >
          + Add New Unit
        </button>
      </template>
    </PageTitle>

    <!-- Search Bar -->
    <div class="relative group">
      <div
        class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-accent"
      >
        <svg
          class="w-5 h-5 opacity-50"
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
        placeholder="SCAN SKU OR IDENTIFY UNIT NAME..."
        class="w-full bg-surface/40 backdrop-blur-2xl border border-border rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent shadow-glass transition-all placeholder:text-muted/40 placeholder:font-black placeholder:text-xs placeholder:tracking-widest"
        @input="$emit('search', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

