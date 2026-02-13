<script setup lang="ts">
import type { InventoryItem } from "@/services/inventoryApi";

defineProps<{
  items: InventoryItem[];
}>();

defineEmits(["edit", "delete"]);
</script>

<template>
  <div class="px-4">
    <div class="bg-surface rounded-2xl border border-border overflow-hidden">
      <div class="overflow-x-auto w-full">
        <table class="text-sm w-full">
          <thead class="text-left text-foreground bg-muted/20">
            <tr>
              <th class="px-6 py-3 whitespace-nowrap">SKU</th>
              <th class="px-6 py-3 whitespace-nowrap">Nama</th>
              <th class="px-6 py-3 whitespace-nowrap">Harga</th>
              <th class="px-6 py-3 whitespace-nowrap">Stok</th>
              <th class="px-6 py-3 whitespace-nowrap">Kategori</th>
              <th class="px-6 py-3 text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              class="border-t border-border hover:bg-muted/10 transition"
            >
              <td class="px-6 py-3 whitespace-nowrap text-muted">
                {{ item.sku || "-" }}
              </td>
              <td class="px-6 py-3 font-medium whitespace-nowrap">
                {{ item.name }}
              </td>
              <td class="px-6 py-3 tabular-nums whitespace-nowrap">
                Rp {{ item.price.toLocaleString() }}
              </td>
              <td class="px-6 py-3 tabular-nums whitespace-nowrap">
                {{ item.stock }}
              </td>
              <td class="px-6 py-3 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs rounded-lg bg-accent/10 text-accent"
                >
                  {{ item.category }}
                </span>
              </td>
              <td class="px-6 py-3 text-right whitespace-nowrap">
                <div class="flex justify-end gap-2">
                  <button
                    @click="$emit('edit', item)"
                    class="px-3 py-1.5 text-xs bg-accent text-white rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    @click="$emit('delete', item.id)"
                    class="px-3 py-1.5 text-xs border border-border rounded-lg"
                  >
                    Hapus
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
