import { defineStore } from "pinia";
import type { Product } from "@/types/product";

export interface CartItem extends Product {
  qty: number;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    total: (s) => s.items.reduce((t, i) => t + i.price * i.qty, 0),
    totalQty: (s) => s.items.reduce((t, i) => t + i.qty, 0),
  },

  actions: {
    add(product: Product) {
      if (product.stock <= 0) return;

      const exist = this.items.find((i) => i.id === product.id);
      if (exist) {
        return;
      }

      this.items.push({
        ...product,
        qty: 1,
      });
    },
    setQty(id: number, qty: number) {
      const item = this.items.find((row) => row.id === id);
      if (!item) return;

      const clamped = Math.max(0, Math.min(qty, item.stock));
      item.qty = Math.floor(clamped);
      if (item.qty === 0) {
        this.remove(id);
      }
    },
    remove(id: number) {
      this.items = this.items.filter((item) => item.id !== id);
    },
    clear() {
      this.items = [];
    },
  },
});
