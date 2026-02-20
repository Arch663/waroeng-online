<script setup lang="ts">
import type { Product } from "@/types/product";
import ProductCard from "@/components/ui/ProductCard.vue";

defineProps<{
  products: Product[];
}>();

defineEmits(["add"]);
</script>

<template>
  <div
    class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
      @add="$emit('add', $event)"
    />
  </div>
</template>
