<script setup lang="ts">
import type { InventoryItem } from "@/services/inventoryApi";

defineProps<{
  items: InventoryItem[];
  sortBy?: string;
  order?: "ASC" | "DESC";
}>();

const emit = defineEmits(["edit", "delete", "history", "sort"]);

function handleSort(column: string) {
  emit("sort", column);
}
</script>

<template>
  <div>
    <div
      class="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border overflow-hidden shadow-xl"
    >
      <div class="overflow-x-auto w-full">
        <table class="text-sm w-full">
          <thead class="text-left text-foreground bg-muted/20">
            <tr>
              <th
                class="px-4 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell cursor-pointer group/h"
                @click="handleSort('sku')"
              >
                <div class="flex items-center gap-1">
                  SKU
                  <span
                    class="text-xs opacity-0 group-hover/h:opacity-100 transition-opacity"
                    :class="sortBy === 'sku' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "sku" && order === "ASC" ? "â–²" : "â–¼" }}
                  </span>
                </div>
              </th>
              <th
                class="px-4 md:px-6 py-4 whitespace-nowrap cursor-pointer group/h"
                @click="handleSort('name')"
              >
                <div class="flex items-center gap-1">
                  Nama Barang
                  <span
                    class="text-xs opacity-0 group-hover/h:opacity-100 transition-opacity"
                    :class="sortBy === 'name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "name" && order === "ASC" ? "â–²" : "â–¼" }}
                  </span>
                </div>
              </th>
              <th
                class="px-4 md:px-6 py-4 whitespace-nowrap text-right sm:text-left cursor-pointer group/h"
                @click="handleSort('price')"
              >
                <div
                  class="flex items-center gap-1 justify-end sm:justify-start"
                >
                  Harga
                  <span
                    class="text-xs opacity-0 group-hover/h:opacity-100 transition-opacity"
                    :class="sortBy === 'price' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "price" && order === "ASC" ? "â–²" : "â–¼" }}
                  </span>
                </div>
              </th>
              <th
                class="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell cursor-pointer group/h"
                @click="handleSort('stock')"
              >
                <div class="flex items-center gap-1">
                  Stok
                  <span
                    class="text-xs opacity-0 group-hover/h:opacity-100 transition-opacity"
                    :class="sortBy === 'stock' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "stock" && order === "ASC" ? "â–²" : "â–¼" }}
                  </span>
                </div>
              </th>
              <th
                class="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell cursor-pointer group/h"
                @click="handleSort('category')"
              >
                <div class="flex items-center gap-1">
                  Kategori
                  <span
                    class="text-xs opacity-0 group-hover/h:opacity-100 transition-opacity"
                    :class="
                      sortBy === 'category' ? 'opacity-100 text-accent' : ''
                    "
                  >
                    {{ sortBy === "category" && order === "ASC" ? "â–²" : "â–¼" }}
                  </span>
                </div>
              </th>
              <th class="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border">
            <tr
              v-for="item in items"
              :key="item.id"
              class="hover:bg-muted/5 transition-colors group"
            >
              <td
                class="px-4 md:px-6 py-4 whitespace-nowrap text-muted hidden sm:table-cell"
              >
                {{ item.sku || "-" }}
              </td>
              <td class="px-4 md:px-6 py-4">
                <div class="font-medium text-foreground">{{ item.name }}</div>
                <div class="text-xs text-muted md:hidden mt-0.5">
                  Stok: {{ item.stock }}
                </div>
              </td>
              <td
                class="px-4 md:px-6 py-4 tabular-nums whitespace-nowrap text-right sm:text-left"
              >
                Rp
                {{
                  Number(item.price).toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
              </td>
              <td
                class="px-4 md:px-6 py-4 tabular-nums whitespace-nowrap hidden md:table-cell"
              >
                {{ item.stock }}
              </td>
              <td
                class="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell"
              >
                <span
                  class="px-2 py-1 text-xs rounded-lg bg-accent/10 text-accent"
                >
                  {{ item.category }}
                </span>
              </td>
              <td class="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                <div class="flex justify-end gap-2">
                  <button
                    @click="$emit('history', item)"
                    class="p-2 text-foreground hover:bg-muted/10 rounded-xl transition-all text-xs font-semibold"
                    title="Riwayat Stok"
                  >
                    <span class="hidden md:inline">Riwayat</span>
                    <svg
                      class="w-4 h-4 md:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>

                  <button
                    @click="$emit('edit', item)"
                    class="p-2 text-accent hover:bg-accent/10 rounded-xl transition-all text-xs font-semibold"
                    title="Edit"
                  >
                    <span class="hidden md:inline">Edit</span>
                    <svg
                      class="w-4 h-4 md:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button
                    @click="$emit('delete', item.id)"
                    class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-xs font-semibold"
                    title="Hapus"
                  >
                    <span class="hidden md:inline">Hapus</span>
                    <svg
                      class="w-4 h-4 md:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

