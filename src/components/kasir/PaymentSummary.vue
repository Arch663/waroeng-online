<script setup lang="ts">
import { useCartStore } from "@/stores/useCartStore";
const cart = useCartStore();
</script>

<template>
  <div class="bg-surface rounded-2xl p-4 shadow-sm mt-4">
    <div class="flex justify-between mb-2">
      <span>Subtotal</span>
      <span>Rp {{ cart.total }}</span>
    </div>

    <div class="flex justify-between font-bold text-lg">
      <span class="text-foreground">Total</span>
      <span class="text-accent"> Rp {{ cart.total }} </span>
    </div>

    <button class="w-full mt-4 bg-accent text-white py-3 rounded-xl">
      Bayar
    </button>
  </div>
</template>
