<script setup lang="ts">
import { ref } from "vue";

import InventoryTable from "@/components/inventory/InventoryTable.vue";
import InventoryActionBar from "@/components/inventory/InventoryActionBar.vue";
import InventoryFormModal from "@/components/inventory/InventoryFormModal.vue";
const items = ref([
  {
    id: 1,
    name: "Indomie Goreng",
    price: 3500,
    category: "makanan",
    stock: 120,
  },
  {
    id: 2,
    name: "Minyak Goreng 2L",
    price: 15000,
    category: "sembako",
    stock: 45,
  },
  {
    id: 3,
    name: "Sabun",
    price: 25000,
    category: "sembako",
    stock: 55,
  },
]);

const selectedItem = ref<any>(null);
const showForm = ref(false);

function handleAdd() {
  selectedItem.value = null;
  showForm.value = true;
}

function handleEdit(item: any) {
  selectedItem.value = item;
  showForm.value = true;
}

function handleDelete(id: number) {
  items.value = items.value.filter((i) => i.id !== id);
}
</script>

<template>
  <div class="space-y-5">
    <InventoryActionBar @add="handleAdd" />
    <InventoryTable :items="items" @edit="handleEdit" @delete="handleDelete" />
    <InventoryFormModal v-model:open="showForm" :item="selectedItem" />
  </div>
</template>
