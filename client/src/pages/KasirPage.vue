<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import CardStat from "@/components/ui/CardStat.vue";
import CategoryTabs from "@/components/ui/CategoryTabs.vue";
import ProductGrid from "@/components/kasir/ProductGrid.vue";
import OrderList from "@/components/kasir/OrderList.vue";
import PaymentSummary from "@/components/kasir/PaymentSummary.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import moneyIcon from "@/assets/money.svg";
import profitIcon from "@/assets/profit.svg";
import { useCartStore } from "@/stores/useCartStore";
import type { Product } from "@/types/product";
import { getInventoryItems } from "@/services/inventoryApi";
import { checkout } from "@/services/cashierApi";

const cart = useCartStore();

const products = ref<Product[]>([]);
const active = ref("Semua");
const loading = ref(false);
const checkoutLoading = ref(false);
const error = ref("");
const successMessage = ref("");

const categories = computed(() => {
  const set = new Set(products.value.map((item) => item.category).filter(Boolean));
  return ["Semua", ...Array.from(set)];
});

const filteredProducts = computed(() => {
  if (active.value === "Semua") return products.value;
  return products.value.filter((item) => item.category === active.value);
});

const availableProducts = computed(() => products.value.filter((item) => item.stock > 0).length);
const stockTotal = computed(() => products.value.reduce((sum, item) => sum + item.stock, 0));

async function loadInventory() {
  loading.value = true;
  error.value = "";

  try {
    const items = await getInventoryItems();
    products.value = items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: item.category,
      image: item.image,
    }));

    cart.items = cart.items.filter((cartItem) => {
      const source = products.value.find((row) => row.id === cartItem.id);
      if (!source || source.stock <= 0) {
        return false;
      }
      cartItem.stock = source.stock;
      if (cartItem.qty > source.stock) {
        cartItem.qty = source.stock;
      }
      return cartItem.qty > 0;
    });
  } catch (loadError) {
    error.value = loadError instanceof Error ? loadError.message : "Gagal memuat data produk.";
  } finally {
    loading.value = false;
  }
}

async function handleCheckout() {
  if (cart.items.length === 0) return;

  checkoutLoading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const result = await checkout({
      items: cart.items.map((item) => ({
        id: item.id,
        qty: item.qty,
      })),
    });

    successMessage.value = `Transaksi ${result.invoiceNo} berhasil dibuat.`;
    cart.clear();
    await loadInventory();
  } catch (checkoutError) {
    error.value = checkoutError instanceof Error ? checkoutError.message : "Checkout gagal diproses.";
  } finally {
    checkoutLoading.value = false;
  }
}

onMounted(() => {
  loadInventory();
});
</script>

<template>
  <AppHeader />
  <div class="p-4 md:p-6">
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <CardStat title="Nilai Keranjang" :value="`Rp ${cart.total.toLocaleString()}`">
        <template #icon>
          <img :src="moneyIcon" class="w-10 h-10" alt="nilai keranjang" />
        </template>
      </CardStat>
      <CardStat title="Produk Tersedia" :value="availableProducts.toLocaleString()">
        <template #icon>
          <img :src="profitIcon" class="w-10 h-10" alt="produk tersedia" />
        </template>
      </CardStat>
      <CardStat title="Total Stok" :value="stockTotal.toLocaleString()">
        <template #icon>
          <div class="w-10 h-10 bg-accent rounded-xl" />
        </template>
      </CardStat>
    </div>

    <p v-if="error" class="mb-3 text-sm text-red-500">{{ error }}</p>
    <p v-if="successMessage" class="mb-3 text-sm text-green-600">{{ successMessage }}</p>

    <CategoryTabs v-model="active" :categories="categories" class="mb-6" />
    <div class="grid gap-6 items-start lg:grid-cols-[2fr_1fr]">
      <div v-if="loading" class="text-sm text-muted">Memuat produk...</div>
      <ProductGrid v-else :products="filteredProducts" @add="cart.add" />
      <div class="flex flex-col">
        <OrderList />
        <PaymentSummary :loading="checkoutLoading" @checkout="handleCheckout" />
      </div>
    </div>
  </div>
</template>
