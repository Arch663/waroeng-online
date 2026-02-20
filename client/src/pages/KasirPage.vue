<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "@/composables/useI18n";
import CategoryTabs from "@/components/ui/CategoryTabs.vue";
import ProductGrid from "@/components/kasir/ProductGrid.vue";
import OrderList from "@/components/kasir/OrderList.vue";
import PaymentSummary from "@/components/kasir/PaymentSummary.vue";
import Pagination from "@/components/ui/Pagination.vue";
import Skeleton from "@/components/ui/Skeleton.vue";
import PageTitle from "@/components/ui/PageTitle.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
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
const active = ref((route.query.category as string) || "all");
const searchQuery = ref((route.query.q as string) || "");
const pageSize = ref(Number(route.query.limit) || 12);
const loading = ref(false);
const checkoutLoading = ref(false);
const error = ref("");
const successMessage = ref("");
const showCartMobile = ref(false);
const { t } = useI18n();

const categories = computed(() => {
  return ["all", ...categoriesData.value.map((c) => c.name)];
});

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
      limit: pageSize.value,
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
    meta.value = {
      ...res.meta,
      limit: pageSize.value,
    };

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
      category: newCat !== "all" ? newCat : undefined,
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
    active.value = (route.query.category as string) || "all";
    pageSize.value = Number(route.query.limit) || 12;
    meta.value.limit = pageSize.value;
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

function handlePageSizeChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value) || 12;
  router.push({
    query: {
      ...route.query,
      limit: value,
      page: 1,
    },
  });
}

onMounted(async () => {
  await loadCategories();
  loadInventory(Number(route.query.page) || 1);
});
</script>

<template>
  <div class="space-y-10 pb-12 px-2 md:px-0">
    <div class="space-y-8">
      <PageTitle
        :title="t('kasir_title')"
        :highlight="t('kasir_highlight')"
        :subtitle="t('kasir_subtitle')"
      >
        <template #action>
          <button
            @click="showCartMobile = !showCartMobile"
            class="lg:hidden relative p-4 bg-accent text-background rounded-2xl active:scale-90 transition-all"
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
              class="absolute -top-2 -right-2 bg-foreground text-background text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-background font-black"
            >
              {{ cart.items.length }}
            </span>
          </button>
        </template>
      </PageTitle>

      <SearchBar v-model="searchQuery" :placeholder="t('kasir_search')" />
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
        class="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-accent/35 scrollbar-track-transparent"
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
            class="bg-surface rounded-2xl p-4 border border-border shadow-xl"
          >
            <Skeleton height="140px" borderRadius="1.5rem" className="mb-3" />
            <Skeleton width="80%" height="20px" className="mb-2" />
            <Skeleton width="60%" height="16px" />
          </div>
        </div>

        <template v-else>
          <div class="flex items-center justify-end gap-2">
            <label for="kasir-page-size" class="text-xs text-muted">{{ t("kasir_items_per_page") }}</label>
            <select
              id="kasir-page-size"
              :value="pageSize"
              @change="handlePageSizeChange"
              class="px-3 py-2 rounded-xl border border-border bg-surface text-sm"
            >
              <option :value="8">8</option>
              <option :value="12">12</option>
              <option :value="18">18</option>
              <option :value="24">24</option>
            </select>
          </div>

          <ProductGrid :products="products" @add="cart.add" />

          <div
            v-if="products.length === 0"
            class="py-20 text-center text-muted bg-surface/40 backdrop-blur-md rounded-2xl border border-border border-dashed"
          >
            <div class="mx-auto mb-4 w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <p class="font-bold text-lg">{{ t("kasir_not_found") }}</p>
            <p class="text-sm mt-2">
              {{ t("kasir_try_other") }}
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

    <Transition
      enter-active-class="transition-transform duration-300"
      leave-active-class="transition-transform duration-300"
      enter-from-class="translate-y-full"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="showCartMobile"
        class="fixed inset-0 z-50 lg:hidden flex flex-col bg-background"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-border bg-surface"
        >
          <h2 class="text-lg font-bold">{{ t("kasir_cart_detail") }}</h2>
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






