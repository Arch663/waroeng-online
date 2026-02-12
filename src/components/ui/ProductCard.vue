<script setup lang="ts">
import type { Product } from "@/types/product";

defineProps<{
  product: Product;
}>();

defineEmits(["add"]);
</script>

<template>
  <div
    class="flex flex-col justify-around bg-surface rounded-2xl max-h-44 max-w-56 p-4 shadow-sm shadow-border cursor-pointer hover:shadow-md hover:-translate-y-1.5 transition text-center items-center min-w-24"
    @click="$emit('add', product)"
  >
    <img :src="product.image" class="w-16 h-16 mx-auto object-contain" />
    <h3
      class="mt-3 text-foreground text-sm font-medium text-center leading-tight line-clamp-2 min-h-8 sm:min-h-8"
    >
      {{ product.name }}
    </h3>
    <p class="text-accent font-bold text-center whitespace-nowrap">
      Rp {{ product.price.toLocaleString() }}
    </p>
  </div>
</template>
