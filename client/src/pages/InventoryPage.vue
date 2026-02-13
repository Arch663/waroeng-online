<script setup lang="ts">
import { onMounted, ref } from "vue";
import InventoryTable from "@/components/inventory/InventoryTable.vue";
import InventoryActionBar from "@/components/inventory/InventoryActionBar.vue";
import InventoryFormModal from "@/components/inventory/InventoryFormModal.vue";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  type InventoryItem,
  type InventoryPayload,
} from "@/services/inventoryApi";

const items = ref<InventoryItem[]>([]);
const selectedItem = ref<InventoryItem | null>(null);
const showForm = ref(false);
const loading = ref(false);
const saving = ref(false);
const error = ref("");

async function loadItems() {
  loading.value = true;
  error.value = "";
  try {
    items.value = await getInventoryItems();
  } catch (loadError) {
    error.value = loadError instanceof Error ? loadError.message : "Gagal memuat inventory.";
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  selectedItem.value = null;
  showForm.value = true;
}

function handleEdit(item: InventoryItem) {
  selectedItem.value = item;
  showForm.value = true;
}

async function handleDelete(id: number) {
  try {
    await deleteInventoryItem(id);
    await loadItems();
  } catch (deleteError) {
    error.value = deleteError instanceof Error ? deleteError.message : "Gagal menghapus item.";
  }
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
    error.value = saveError instanceof Error ? saveError.message : "Gagal menyimpan data.";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadItems();
});
</script>

<template>
  <div class="space-y-5">
    <InventoryActionBar @add="handleAdd" />

    <p v-if="error" class="px-4 md:px-6 text-sm text-red-500">{{ error }}</p>
    <p v-if="loading" class="px-4 md:px-6 text-sm text-muted">Memuat data inventory...</p>

    <InventoryTable :items="items" @edit="handleEdit" @delete="handleDelete" />
    <InventoryFormModal
      v-model:open="showForm"
      :item="selectedItem"
      :loading="saving"
      @save="handleSave"
    />
  </div>
</template>
