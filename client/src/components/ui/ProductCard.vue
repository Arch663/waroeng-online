<script setup lang="ts">
import type { Product } from "@/types/product";

defineProps<{
  product: Product;
}>();

defineEmits(["add"]);
</script>

<template>
  <div
    class="group flex flex-col bg-surface rounded-2xl h-44 w-full p-4 shadow-sm shadow-border transition text-center cursor-pointer hover:shadow-md hover:-translate-y-1"
    :class="
      product.stock <= 0
        ? 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-sm'
        : ''
    "
    @click="product.stock > 0 && $emit('add', product)"
  >
    <!-- IMAGE -->
    <div class="flex justify-center">
      <img
        :src="product.image || '/vite.svg'"
        :alt="product.name"
        class="w-16 h-16 object-contain"
      />
    </div>

    <!-- NAME -->
    <h3
      class="mt-3 text-foreground text-sm font-medium leading-tight line-clamp-2 min-h-10"
    >
      {{ product.name }}
    </h3>

    <!-- PRICE -->
    <p class="text-accent font-bold whitespace-nowrap">
      Rp
      {{
        Number(product.price).toLocaleString("id-ID", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      }}
    </p>

    <!-- STOCK -->
    <p class="text-xs text-muted mt-auto">Stok: {{ product.stock }}</p>
  </div>
</template>
