<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCartStore } from "@/stores/useCartStore";

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  checkout: [payload: { paid: number; change: number }];
}>();

const cart = useCartStore();
const amountPaid = ref<number | null>(null);

const change = computed(() => {
  if (!amountPaid.value || amountPaid.value < cart.total) return 0;
  return amountPaid.value - cart.total;
});

const canCheckout = computed(() => {
  return (
    cart.items.length > 0 &&
    amountPaid.value !== null &&
    amountPaid.value >= cart.total
  );
});

function setAmount(amount: number) {
  amountPaid.value = amount;
}

function handleCheckout() {
  if (!canCheckout.value) return;
  emit("checkout", {
    paid: amountPaid.value as number,
    change: change.value,
  });
}

// Reset paid amount when cart total changes
watch(
  () => cart.total,
  (newTotal) => {
    if (amountPaid.value !== null && amountPaid.value < newTotal) {
      amountPaid.value = null;
    }
  },
);
</script>

<template>
  <div class="bg-surface rounded-2xl p-4 mt-4 border border-border">
    <div class="space-y-3">
      <div class="flex justify-between text-muted">
        <span>Subtotal</span>
        <span
          >Rp
          {{
            Number(cart.total).toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}</span
        >
      </div>

      <div
        class="flex justify-between font-bold text-xl border-t border-border pt-3"
      >
        <span class="text-foreground">Total</span>
        <span class="text-accent">
          Rp
          {{
            Number(cart.total).toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}
        </span>
      </div>

      <!-- Payment Input -->
      <div class="pt-4 space-y-2">
        <label class="text-sm font-medium text-muted">Uang Bayar</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            >Rp</span
          >
          <input
            v-model.number="amountPaid"
            type="number"
            placeholder="0"
            class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent outline-none text-lg font-semibold"
            @keyup.enter="handleCheckout"
          />
        </div>
      </div>

      <!-- Quick Buttons -->
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="amt in [50000, 100000, 200000]"
          :key="amt"
          @click="setAmount(amt)"
          class="py-2 px-1 text-xs bg-muted/10 hover:bg-muted/20 rounded-lg transition-colors border border-border"
        >
          {{ amt / 1000 }}k
        </button>
        <button
          @click="setAmount(cart.total)"
          class="col-span-3 py-2 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors border border-accent/20 font-medium"
        >
          Uang Pas
        </button>
      </div>

      <!-- Change Display -->
      <div v-if="amountPaid !== null" class="flex justify-between pt-2">
        <span class="text-sm text-muted">Kembalian</span>
        <span
          :class="[
            'font-bold',
            change > 0 ? 'text-green-600' : 'text-foreground',
          ]"
        >
          Rp
          {{
            Number(change).toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}
        </span>
      </div>
    </div>

    <button
      class="w-full mt-6 bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg hover:bg-accent/90 transition-all active:scale-95"
      :disabled="loading || !canCheckout"
      @click="handleCheckout"
    >
      <span v-if="loading">Memproses...</span>
      <span v-else>Konfirmasi Bayar</span>
    </button>
  </div>
</template>

