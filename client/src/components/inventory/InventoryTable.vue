<script setup lang="ts">
import type { InventoryItem } from "@/services/inventoryApi";
import { useI18n } from "@/composables/useI18n";
import DataTable from "@/components/ui/DataTable.vue";

const props = defineProps<{
  items: InventoryItem[];
  sortBy?: string;
  order?: "ASC" | "DESC";
}>();

const emit = defineEmits(["edit", "delete", "history", "sort"]);
const { language, t } = useI18n();

function handleSort(column: string) {
  emit("sort", column);
}

function sortArrow(column: string) {
  if (props.sortBy !== column) return "↕";
  return props.order === "ASC" ? "↑" : "↓";
}
</script>

<template>
  <div class="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border overflow-hidden">
    <div class="overflow-x-auto w-full">
      <DataTable
        :has-data="items.length > 0"
        :columns="6"
        :empty-text="language === 'id' ? 'Tidak ada data barang.' : 'No inventory data.'"
        table-class="text-sm w-full"
        thead-class="text-left text-foreground bg-muted/20"
      >
        <template #head>
          <tr>
            <th class="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell cursor-pointer" @click="handleSort('sku')">SKU <span :class="props.sortBy === 'sku' ? 'text-accent' : 'opacity-50'">{{ sortArrow("sku") }}</span></th>
            <th class="px-4 md:px-6 py-4 whitespace-nowrap cursor-pointer" @click="handleSort('name')">{{ language === "id" ? "Nama Barang" : "Item Name" }} <span :class="props.sortBy === 'name' ? 'text-accent' : 'opacity-50'">{{ sortArrow("name") }}</span></th>
            <th class="px-4 md:px-6 py-4 whitespace-nowrap text-right sm:text-left cursor-pointer" @click="handleSort('price')">{{ language === "id" ? "Harga" : "Price" }} <span :class="props.sortBy === 'price' ? 'text-accent' : 'opacity-50'">{{ sortArrow("price") }}</span></th>
            <th class="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell cursor-pointer" @click="handleSort('stock')">{{ t("common_stock") }} <span :class="props.sortBy === 'stock' ? 'text-accent' : 'opacity-50'">{{ sortArrow("stock") }}</span></th>
            <th class="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell cursor-pointer" @click="handleSort('category')">{{ language === "id" ? "Kategori" : "Category" }} <span :class="props.sortBy === 'category' ? 'text-accent' : 'opacity-50'">{{ sortArrow("category") }}</span></th>
            <th class="px-4 md:px-6 py-4 text-right whitespace-nowrap">{{ language === "id" ? "Aksi" : "Action" }}</th>
          </tr>
        </template>
        <template #body>
          <tr v-for="item in items" :key="item.id" class="hover:bg-muted/5 transition-colors">
            <td class="px-4 md:px-6 py-4 whitespace-nowrap text-muted hidden sm:table-cell">{{ item.sku || "-" }}</td>
            <td class="px-4 md:px-6 py-4">
              <div class="font-medium text-foreground">{{ item.name }}</div>
              <div class="text-xs text-muted md:hidden mt-0.5">{{ t("common_stock") }}: {{ item.stock }}</div>
            </td>
            <td class="px-4 md:px-6 py-4 tabular-nums whitespace-nowrap text-right sm:text-left">
              Rp {{ Number(item.price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
            </td>
            <td class="px-4 md:px-6 py-4 tabular-nums whitespace-nowrap hidden md:table-cell">{{ item.stock }}</td>
            <td class="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
              <span class="px-2 py-1 text-xs rounded-lg bg-accent/10 text-accent">{{ item.category }}</span>
            </td>
            <td class="px-4 md:px-6 py-4 text-right whitespace-nowrap">
              <div class="flex justify-end gap-2">
                <button @click="$emit('history', item)" class="p-2 text-foreground hover:bg-muted/10 rounded-xl transition-all text-xs font-semibold" :title="language === 'id' ? 'Riwayat Stok' : 'Stock History'">
                  <span class="hidden md:inline">{{ language === "id" ? "Riwayat" : "History" }}</span>
                </button>
                <button @click="$emit('edit', item)" class="p-2 text-accent hover:bg-accent/10 rounded-xl transition-all text-xs font-semibold" :title="t('common_edit')">
                  <span class="hidden md:inline">{{ t("common_edit") }}</span>
                </button>
                <button @click="$emit('delete', item.id)" class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-xs font-semibold" :title="t('common_delete')">
                  <span class="hidden md:inline">{{ t("common_delete") }}</span>
                </button>
              </div>
            </td>
          </tr>
        </template>
      </DataTable>
    </div>
  </div>
</template>
