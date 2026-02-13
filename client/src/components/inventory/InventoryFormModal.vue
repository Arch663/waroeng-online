<script setup lang="ts">
import { ref, watch } from "vue";
import type { InventoryItem, InventoryPayload } from "@/services/inventoryApi";

const props = defineProps<{
  open: boolean;
  item: InventoryItem | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [payload: InventoryPayload];
}>();

const form = ref<InventoryPayload>({
  sku: "",
  name: "",
  price: 0,
  stock: 0,
  category: "Lainnya",
  image: "",
});

watch(
  () => props.item,
  (item) => {
    if (!item) {
      form.value = {
        sku: "",
        name: "",
        price: 0,
        stock: 0,
        category: "Lainnya",
        image: "",
      };
      return;
    }

    form.value = {
      sku: item.sku ?? "",
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: item.category,
      image: item.image ?? "",
    };
  },
  { immediate: true },
);

function submit() {
  emit("save", {
    sku: form.value.sku?.trim() || undefined,
    name: form.value.name.trim(),
    price: Number(form.value.price),
    stock: Number(form.value.stock),
    category: form.value.category.trim(),
    image: form.value.image?.trim() || undefined,
  });
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
  >
    <div class="bg-surface text-foreground rounded-2xl p-6 w-full max-w-md space-y-4">
      <h2 class="font-semibold text-xl">
        {{ item ? "Edit" : "Tambah" }} Barang
      </h2>

      <label for="sku">SKU</label>
      <input
        id="sku"
        v-model="form.sku"
        placeholder="Contoh: BRG-001"
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <label for="name">Nama Barang</label>
      <input
        id="name"
        v-model="form.name"
        placeholder="Input nama barang"
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <label for="price">Harga</label>
      <input
        id="price"
        v-model.number="form.price"
        type="number"
        min="0"
        placeholder="Input harga barang"
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <label for="stock">Jumlah Stok</label>
      <input
        id="stock"
        v-model.number="form.stock"
        type="number"
        min="0"
        placeholder="Input stok barang"
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <label for="category">Kategori</label>
      <input
        id="category"
        v-model="form.category"
        placeholder="Contoh: Sembako"
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <label for="image">URL Gambar (opsional)</label>
      <input
        id="image"
        v-model="form.image"
        placeholder="https://..."
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <div class="flex justify-end gap-2">
        <button
          :disabled="loading"
          @click="emit('update:open', false)"
          class="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Batal
        </button>

        <button
          :disabled="loading"
          @click="submit"
          class="px-4 py-2 bg-accent text-white rounded-lg disabled:opacity-50"
        >
          {{ loading ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>
    </div>
  </div>
</template>
