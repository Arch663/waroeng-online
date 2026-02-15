<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import InventoryTable from "@/components/inventory/InventoryTable.vue";
import InventoryActionBar from "@/components/inventory/InventoryActionBar.vue";
import InventoryFormModal from "@/components/inventory/InventoryFormModal.vue";
import StockHistoryModal from "@/components/inventory/StockHistoryModal.vue";
import Pagination from "@/components/ui/Pagination.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import Skeleton from "@/components/ui/Skeleton.vue";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  type InventoryItem,
  type InventoryPayload,
  type InventoryResponse,
} from "@/services/inventoryApi";

const route = useRoute();
const router = useRouter();

const items = ref<InventoryItem[]>([]);
const meta = ref<InventoryResponse["meta"]>({
  totalItems: 0,
  totalPages: 0,
  currentPage: Number(route.query.page) || 1,
  limit: 10,
});

const searchQuery = ref((route.query.q as string) || "");
const sortBy = ref((route.query.sortBy as string) || "id");
const order = ref(((route.query.order as string) || "DESC") as "ASC" | "DESC");

const selectedItem = ref<InventoryItem | null>(null);
const showForm = ref(false);
const showHistory = ref(false);
const historyItem = ref<InventoryItem | null>(null);
const showDeleteConfirm = ref(false);
const itemToDelete = ref<number | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref("");

async function loadItems(page = meta.value.currentPage) {
  loading.value = true;
  error.value = "";
  try {
    const res = await getInventoryItems({
      q: searchQuery.value,
      page,
      limit: meta.value.limit,
      sortBy: sortBy.value,
      order: order.value,
    });
    items.value = res.items;
    meta.value = res.meta;
  } catch (loadError) {
    error.value =
      loadError instanceof Error
        ? loadError.message
        : "Gagal memuat inventory.";
  } finally {
    loading.value = false;
  }
}

let searchTimer: any = null;
function handleSearch(q: string) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.push({ query: { ...route.query, q: q || undefined, page: 1 } });
  }, 400);
}

function handleSort(column: string) {
  let newOrder: "ASC" | "DESC" = "ASC";
  if (sortBy.value === column) {
    newOrder = order.value === "ASC" ? "DESC" : "ASC";
  } else {
    // Default sort for specific columns
    newOrder = column === "name" ? "ASC" : "DESC";
  }
  router.push({
    query: { ...route.query, sortBy: column, order: newOrder, page: 1 },
  });
}

watch(
  () => route.query,
  () => {
    searchQuery.value = (route.query.q as string) || "";
    sortBy.value = (route.query.sortBy as string) || "id";
    order.value = ((route.query.order as string) || "DESC") as "ASC" | "DESC";
    loadItems(Number(route.query.page) || 1);
  },
  { deep: true },
);

function handlePageChange(p: number) {
  router.push({ query: { ...route.query, page: p } });
}

function handleAdd() {
  selectedItem.value = null;
  showForm.value = true;
}

function handleEdit(item: InventoryItem) {
  selectedItem.value = item;
  showForm.value = true;
}

function handleViewHistory(item: InventoryItem) {
  historyItem.value = item;
  showHistory.value = true;
}

function handleDelete(id: number) {
  itemToDelete.value = id;
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  if (itemToDelete.value === null) return;

  try {
    await deleteInventoryItem(itemToDelete.value);
    showDeleteConfirm.value = false;
    itemToDelete.value = null;
    await loadItems();
  } catch (deleteError) {
    error.value =
      deleteError instanceof Error
        ? deleteError.message
        : "Gagal menghapus item.";
    showDeleteConfirm.value = false;
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  itemToDelete.value = null;
}

async function handleSave(payload: InventoryPayload) {
  saving.value = true;
  error.value = "";

  try {
    if (selectedItem.value) {
      await updateInventoryItem(selectedItem.value.id, payload);
    } else {
      await createInventoryItem(payload);
    }
    showForm.value = false;
    await loadItems();
  } catch (saveError) {
    error.value =
      saveError instanceof Error ? saveError.message : "Gagal menyimpan data.";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadItems(Number(route.query.page) || 1);
});
</script>

<template>
  <div class="space-y-6 pb-12">
    <InventoryActionBar
      :search-query="searchQuery"
      @add="handleAdd"
      @search="handleSearch"
    />

    <p
      v-if="error"
      class="text-sm text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
    >
      {{ error }}
    </p>

    <div class="relative min-h-100">
      <div v-if="loading" class="space-y-4">
        <div
          class="bg-surface/60 backdrop-blur-xl rounded-3xl p-6 border border-border"
        >
          <div class="flex gap-4 mb-6">
            <Skeleton v-for="i in 5" :key="i" height="20px" />
          </div>
          <div
            v-for="i in 5"
            :key="i"
            class="flex gap-4 mb-4 border-b border-border/50 pb-4"
          >
            <Skeleton height="50px" width="50px" borderRadius="12px" />
            <Skeleton height="50px" className="grow" />
            <Skeleton height="50px" width="100px" />
          </div>
        </div>
      </div>

      <template v-else-if="items.length > 0">
        <InventoryTable
          :items="items"
          :sort-by="sortBy"
          :order="order"
          @sort="handleSort"
          @edit="handleEdit"
          @delete="handleDelete"
          @history="handleViewHistory"
        />

        <Pagination
          :current-page="meta.currentPage"
          :total-pages="meta.totalPages"
          @page-change="handlePageChange"
        />
      </template>

      <div
        v-else
        class="py-20 text-center text-muted bg-surface/40 backdrop-blur-xl rounded-3xl border border-border mt-6"
      >
        <p class="text-6xl mb-4">📦</p>
        <p class="font-medium text-lg">Tidak ada barang ditemukan.</p>
        <p v-if="searchQuery" class="text-sm">
          Coba kata kunci lain atau periksa SKU Anda.
        </p>
      </div>
    </div>

    <InventoryFormModal
      v-model:open="showForm"
      :item="selectedItem"
      :loading="saving"
      @save="handleSave"
    />

    <StockHistoryModal
      v-model:open="showHistory"
      :item-id="historyItem?.id ?? null"
      :item-name="historyItem?.name ?? ''"
    />

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Hapus Barang"
      :message="
        itemToDelete
          ? `Apakah Anda yakin ingin menghapus '${items.find((i) => i.id === itemToDelete)?.name}'? Tindakan ini tidak dapat dibatalkan.`
          : 'Apakah Anda yakin ingin menghapus barang ini?'
      "
      confirm-text="Hapus"
      cancel-text="Batal"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
