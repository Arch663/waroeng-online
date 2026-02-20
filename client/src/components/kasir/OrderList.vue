<script setup lang="ts">
import { ref } from "vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { useCartStore } from "@/stores/useCartStore";

const cart = useCartStore();
const pendingDeleteId = ref<number | null>(null);

const update = (id: number, val: number, stock: number) => {
  if (val < 1) return;
  cart.setQty(id, Math.min(val, stock));
};

const askRemove = (id: number) => {
  pendingDeleteId.value = id;
};

const confirmRemove = () => {
  if (pendingDeleteId.value === null) return;
  cart.remove(pendingDeleteId.value);
  pendingDeleteId.value = null;
};

const cancelRemove = () => {
  pendingDeleteId.value = null;
};
</script>

<template>
  <div
    class="overflow-y-auto max-h-65 bg-surface rounded-2xl p-4 scrollbar scrollbar-thumb-foreground scrollbar-track-border scrollbar-hover:scrollbar-thumb-surface"
  >
    <h2 class="font-semibold text-foreground mb-4">Pesanan Baru</h2>
    <div
      v-for="item in cart.items"
      :key="item.id"
      class="py-3 border-b border-border"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-semibold text-foreground truncate">{{ item.name }}</p>
          <p class="text-foreground text-sm">
            Rp
            {{
              Number(item.price).toLocaleString("id-ID", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            }}
          </p>
        </div>
        <b class="text-foreground tabular-nums text-sm shrink-0">
          Rp
          {{
            Number(item.qty * item.price).toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          }}
        </b>
      </div>

      <div class="mt-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-1">
          <button
            @click="update(item.id, item.qty - 1, item.stock)"
            :disabled="item.qty <= 1"
            class="px-2 border border-border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/10 transition-colors"
          >
            -
          </button>
          <input
            :value="item.qty"
            @input="(e) => update(item.id, +(e.target as HTMLInputElement).value || 1, item.stock)"
            type="number"
            min="1"
            :max="item.stock"
            class="w-12 text-center border border-border rounded focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
          <button
            @click="update(item.id, item.qty + 1, item.stock)"
            :disabled="item.qty >= item.stock"
            class="px-2 border border-border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/10 transition-colors"
          >
            +
          </button>
        </div>

        <button
          @click="askRemove(item.id)"
          class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-500/20"
          title="Hapus item"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal
    :open="pendingDeleteId !== null"
    title="Hapus Item"
    message="Yakin ingin menghapus item ini dari keranjang?"
    confirm-text="Hapus"
    cancel-text="Batal"
    variant="danger"
    @confirm="confirmRemove"
    @cancel="cancelRemove"
  />
</template>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
}
</style>
