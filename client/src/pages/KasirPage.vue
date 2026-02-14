<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CardStat from "@/components/ui/CardStat.vue";
import CategoryTabs from "@/components/ui/CategoryTabs.vue";
import ProductGrid from "@/components/kasir/ProductGrid.vue";
import OrderList from "@/components/kasir/OrderList.vue";
import PaymentSummary from "@/components/kasir/PaymentSummary.vue";
import Pagination from "@/components/ui/Pagination.vue";
import Skeleton from "@/components/ui/Skeleton.vue";
import moneyIcon from "@/assets/money.svg";
import profitIcon from "@/assets/profit.svg";
import { useCartStore } from "@/stores/useCartStore";
import type { Product } from "@/types/product";
import {
  getInventoryItems,
  type InventoryResponse,
} from "@/services/inventoryApi";
import { getCategories, type Category } from "@/services/categoryApi";
import { checkout } from "@/services/cashierApi";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const products = ref<Product[]>([]);
const meta = ref<InventoryResponse["meta"]>({
  totalItems: 0,
  totalPages: 0,
  currentPage: Number(route.query.page) || 1,
  limit: 12,
});
const categoriesData = ref<Category[]>([]);
const active = ref((route.query.category as string) || "Semua");
const searchQuery = ref((route.query.q as string) || "");
const loading = ref(false);
const checkoutLoading = ref(false);
const error = ref("");
const successMessage = ref("");
const showCartMobile = ref(false);

const categories = computed(() => {
  return ["Semua", ...categoriesData.value.map((c) => c.name)];
});

const availableProducts = computed(() => meta.value.totalItems);

async function loadInventory(page = 1) {
  loading.value = true;
  error.value = "";

  try {
    const activeCatId = categoriesData.value.find(
      (c) => c.name === active.value,
    )?.id;
    const res = await getInventoryItems({
      q: searchQuery.value,
      page,
      limit: meta.value.limit,
      category_id: activeCatId,
    });

    products.value = res.items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: item.category,
      image: item.image,
    }));
    meta.value = res.meta;

    cart.items = cart.items.map((cartItem) => {
      const source = products.value.find((row) => row.id === cartItem.id);
      if (source) {
        cartItem.stock = source.stock;
        if (cartItem.qty > source.stock) {
          cartItem.qty = source.stock;
        }
      }
      return cartItem;
    });
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : "Gagal memuat data produk.";
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    categoriesData.value = await getCategories();
  } catch (err) {
    console.error("Gagal memuat kategori:", err);
  }
}

watch(active, (newCat) => {
  router.push({
    query: {
      ...route.query,
      category: newCat !== "Semua" ? newCat : undefined,
      page: 1,
    },
  });
});

let searchTimer: any = null;
watch(searchQuery, (newQ) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.push({ query: { ...route.query, q: newQ || undefined, page: 1 } });
  }, 400);
});

watch(
  () => route.query,
  () => {
    searchQuery.value = (route.query.q as string) || "";
    active.value = (route.query.category as string) || "Semua";
    loadInventory(Number(route.query.page) || 1);
  },
  { deep: true },
);

async function handleCheckout(paymentInfo: { paid: number; change: number }) {
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
      paid: paymentInfo.paid,
      change: paymentInfo.change,
    });

    successMessage.value = `Transaksi ${result.invoiceNo} berhasil dibuat. Kembalian: Rp ${result.change.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    cart.clear();
    showCartMobile.value = false;
    await loadInventory(meta.value.currentPage);
  } catch (checkoutError) {
    error.value =
      checkoutError instanceof Error
        ? checkoutError.message
        : "Checkout gagal diproses.";
  } finally {
    checkoutLoading.value = false;
  }
}

function handlePageChange(p: number) {
  router.push({ query: { ...route.query, page: p } });
}

onMounted(async () => {
  await loadCategories();
  loadInventory(Number(route.query.page) || 1);
});
</script>

<template>
  <div class="space-y-6 pb-12">
    <div class="pt-3 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl md:text-3xl font-bold text-foreground">Kasir</h1>
        <button
          @click="showCartMobile = !showCartMobile"
          class="lg:hidden relative p-3 bg-accent text-white rounded-xl shadow-lg"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span
            v-if="cart.items.length > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface font-bold"
          >
            {{ cart.items.length }}
          </span>
        </button>
      </div>

      <div class="relative group">
        <div
          class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-accent"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari SKU atau nama barang..."
          class="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-muted/60"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <CardStat
        title="Keranjang"
        :value="`Rp ${Number(cart.total).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`"
      >
        <template #icon>
          <img
            :src="moneyIcon"
            class="w-8 h-8 md:w-10 md:h-10"
            alt="nilai keranjang"
          />
        </template>
      </CardStat>
      <CardStat
        title="Produk Ada"
        :value="availableProducts.toLocaleString('id-ID')"
      >
        <template #icon>
          <img
            :src="profitIcon"
            class="w-8 h-8 md:w-10 md:h-10"
            alt="produk tersedia"
          />
        </template>
      </CardStat>
      <CardStat
        title="Total Items"
        :value="meta.totalItems.toLocaleString('id-ID')"
        class="col-span-2 md:col-span-1"
      >
        <template #icon>
          <div
            class="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black"
          >
            #
          </div>
        </template>
      </CardStat>
    </div>

    <div v-if="error || successMessage">
      <p
        v-if="error"
        class="text-sm text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
      >
        {{ error }}
      </p>
      <p
        v-if="successMessage"
        class="text-sm text-green-600 bg-green-500/10 p-3 rounded-xl border border-green-500/20"
      >
        {{ successMessage }}
      </p>
    </div>

    <div>
      <div
        v-if="loading"
        class="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
      >
        <Skeleton
          v-for="i in 6"
          :key="i"
          width="100px"
          height="40px"
          borderRadius="12px"
          class="shrink-0"
        />
      </div>
      <CategoryTabs v-else v-model="active" :categories="categories" />
    </div>

    <div class="grid gap-6 items-start lg:grid-cols-[1fr_380px]">
      <div class="space-y-6">
        <div
          v-if="loading"
          class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="bg-surface/60 backdrop-blur-xl rounded-3xl p-4 border border-border shadow-xl"
          >
            <Skeleton height="140px" borderRadius="1.5rem" className="mb-3" />
            <Skeleton width="80%" height="20px" className="mb-2" />
            <Skeleton width="60%" height="16px" />
          </div>
        </div>

        <template v-else>
          <ProductGrid :products="products" @add="cart.add" />

          <div
            v-if="products.length === 0"
            class="py-20 text-center text-muted bg-surface/40 backdrop-blur-md rounded-3xl border border-border border-dashed"
          >
            <p class="text-6xl mb-4 grayscale opacity-30">📦</p>
            <p class="font-bold text-lg">Barang tidak ditemukan</p>
            <p class="text-sm mt-2">
              Coba kata kunci lain atau pilih kategori berbeda.
            </p>
          </div>

          <Pagination
            v-if="products.length > 0"
            :current-page="meta.currentPage"
            :total-pages="meta.totalPages"
            @page-change="handlePageChange"
          />
        </template>
      </div>

      <div class="hidden lg:flex flex-col sticky top-6">
        <OrderList />
        <PaymentSummary :loading="checkoutLoading" @checkout="handleCheckout" />
      </div>
    </div>

    <Transition name="slide-up">
      <div
        v-if="showCartMobile"
        class="fixed inset-0 z-50 lg:hidden flex flex-col bg-background"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-border bg-surface"
        >
          <h2 class="text-lg font-bold">Detail Pesanan</h2>
          <button
            @click="showCartMobile = false"
            class="p-2 hover:bg-muted rounded-full"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <OrderList />
        </div>
        <div class="p-4 border-t border-border bg-surface">
          <PaymentSummary
            :loading="checkoutLoading"
            @checkout="handleCheckout"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
