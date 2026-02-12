<script setup lang="ts">
import CardStat from "@/components/ui/CardStat.vue";
import CategoryTabs from "@/components/ui/CategoryTabs.vue";
import ProductGrid from "@/components/kasir/ProductGrid.vue";
import OrderList from "@/components/kasir/OrderList.vue";
import PaymentSummary from "@/components/kasir/PaymentSummary.vue";
import { products } from "@/composables/product";
import { useCartStore } from "@/stores/useCartStore";
import AppHeader from "@/components/layout/AppHeader.vue";
import { ref } from "vue";

const cart = useCartStore();
const categories = ["Semua", "Sembako", "Makanan", "Minuman"];
const active = ref("Semua");
</script>

<template>
  <AppHeader />
  <div class="p-4 md:p-6">
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <CardStat title="Omset" value="Rp 1.250.000">
        <template #icon>
          <img src="/src/assets/money.svg" class="w-10 h-10" alt="omset" />
        </template>
      </CardStat>
      <CardStat title="total keuntungan" value="Rp 1.250.000">
        <template #icon>
          <img src="/src/assets/profit.svg" class="w-10 h-10" />
        </template>
      </CardStat>
      <CardStat title="total keuntungan" value="Rp 1.250.000">
        <template #icon>
          <div class="w-10 h-10 bg-accent rounded-xl" />
        </template>
      </CardStat>
    </div>
    <CategoryTabs v-model="active" :categories="categories" class="mb-6" />
    <div class="grid lg:grid-cols-1 gap-6 items-start">
      <ProductGrid :products="products" @add="cart.add" />
      <div class="flex flex-col">
        <OrderList />
        <PaymentSummary />
      </div>
    </div>
  </div>
</template>
