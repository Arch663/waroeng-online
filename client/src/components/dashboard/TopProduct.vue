<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Pagination from "@/components/ui/Pagination.vue";

type TopProduct = {
  id: number;
  name: string;
  sold: number;
  revenue: number;
};

const props = defineProps<{
  products: TopProduct[];
}>();

const currentPage = ref(1);
const pageSize = 5;
const sortBy = ref<"name" | "sold" | "revenue">("sold");
const order = ref<"ASC" | "DESC">("DESC");

function handleSort(column: "name" | "sold" | "revenue") {
  if (sortBy.value === column) {
    order.value = order.value === "ASC" ? "DESC" : "ASC";
  } else {
    sortBy.value = column;
    order.value = column === "name" ? "ASC" : "DESC";
  }
  currentPage.value = 1;
}

const sortedProducts = computed(() => {
  const items = [...props.products];
  items.sort((a, b) => {
    if (sortBy.value === "name") {
      const left = a.name.toLowerCase();
      const right = b.name.toLowerCase();
      return order.value === "ASC"
        ? left.localeCompare(right)
        : right.localeCompare(left);
    }

    const left = Number(a[sortBy.value]);
    const right = Number(b[sortBy.value]);
    return order.value === "ASC" ? left - right : right - left;
  });
  return items;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedProducts.value.length / pageSize));
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedProducts.value.slice(start, start + pageSize);
});

function handlePageChange(page: number) {
  currentPage.value = page;
}

watch(
  () => props.products,
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);
</script>

<template>
  <div class="bg-surface rounded-2xl p-4">
    <div class="mb-4">
      <h2 class="font-semibold">Produk Terlaris</h2>
      <p class="text-sm text-muted">Berdasarkan volume penjualan</p>
    </div>

    <div v-if="products.length === 0" class="text-sm text-muted">
      Belum ada data penjualan.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-muted">
          <tr>
            <th class="py-2 cursor-pointer" @click="handleSort('name')">
              <span class="inline-flex items-center gap-1">
                Produk
                <span :class="sortBy === 'name' ? 'text-accent' : ''">
                  {{ sortBy === "name" && order === "ASC" ? "↑" : "↓" }}
                </span>
              </span>
            </th>
            <th class="py-2 cursor-pointer" @click="handleSort('sold')">
              <span class="inline-flex items-center gap-1">
                Terjual
                <span :class="sortBy === 'sold' ? 'text-accent' : ''">
                  {{ sortBy === "sold" && order === "ASC" ? "↑" : "↓" }}
                </span>
              </span>
            </th>
            <th class="py-2 text-right cursor-pointer" @click="handleSort('revenue')">
              <span class="inline-flex items-center gap-1">
                Omzet
                <span :class="sortBy === 'revenue' ? 'text-accent' : ''">
                  {{ sortBy === "revenue" && order === "ASC" ? "↑" : "↓" }}
                </span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="product in paginatedProducts"
            :key="product.id"
            class="border-t border-border"
          >
            <td class="py-2 font-medium">{{ product.name }}</td>
            <td class="py-2">{{ product.sold }}</td>
            <td class="py-2 text-right tabular-nums">
              Rp
              {{
                Number(product.revenue).toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              }}
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
