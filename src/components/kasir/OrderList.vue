<script setup lang="ts">
import { useCartStore } from "@/stores/useCartStore";
const cart = useCartStore();

function increment(item: any) {
  if (item.qty < 100) {
    item.qty++;
  }
}

function decrement(item: any) {
  if (item.qty > 0) {
    item.qty--;
  }
}

function clampQty(item: any) {
  let val = Number(item.qty);

  if (isNaN(val)) val = 0;
  if (val < 0) val = 0;
  if (val > 100) val = 100;

  item.qty = Math.floor(val);
}
</script>

<template>
  <div
    class="overflow-y-auto max-h-65 bg-surface rounded-2xl p-4 shadow-sm scrollbar scrollbar-thumb-foreground scrollbar-track-border scrollbar-hover:scrollbar-thumb-surface"
  >
    <h2 class="font-semibold text-foreground mb-4">Pesanan Baru</h2>
    <div
      v-for="item in cart.items"
      :key="item.id"
      class="flex justify-between py-2 border-b border-border"
    >
      <div>
        <p class="font-semibold text-foreground">{{ item.name }}</p>
        <p class="text-foreground">Rp {{ item.price }}</p>
        <div class="flex items-center gap-1 mt-2">
          <div class="flex items-center gap-1">
            <button
              @click="decrement(item)"
              :disabled="item.qty <= 0"
              class="px-2 border border-border rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              –
            </button>
            <input
              v-model.number="item.qty"
              type="number"
              min="0"
              max="100"
              step="1"
              @input="clampQty(item)"
              class="qty-input w-12 text-center border border-border rounded focus:outline-none focus:ring-0"
            />
            <button
              @click="increment(item)"
              :disabled="item.qty >= 100"
              class="px-2 border border-border rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <b> Rp {{ item.qty * item.price }} </b>
    </div>
  </div>
</template>

<style scoped>
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-input {
  appearance: textfield;
}
</style>
