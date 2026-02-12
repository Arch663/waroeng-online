import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as any[],
  }),

  getters: {
    total: (s) => s.items.reduce((t, i) => t + i.price * i.qty, 0),
  },

  actions: {
    add(product: any) {
      const exist = this.items.find((i) => i.id === product.id);
      if (exist) return;
      this.items.push({
        ...product,
        qty: 1,
      });
    },
  },
});
