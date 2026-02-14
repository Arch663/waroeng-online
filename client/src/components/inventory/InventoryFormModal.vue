<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import type { InventoryItem, InventoryPayload } from "@/services/inventoryApi";
import { getCategories, type Category } from "@/services/categoryApi";

const props = defineProps<{
  open: boolean;
  item: InventoryItem | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [payload: InventoryPayload];
}>();

const categories = ref<Category[]>([]);
const form = ref<InventoryPayload>({
  sku: "",
  name: "",
  price: 0,
  stock: 0,
  category_id: undefined,
  image: "",
});

async function loadCategories() {
  try {
    categories.value = await getCategories();
    if (categories.value.length > 0 && !form.value.category_id) {
      const defaultCat =
        categories.value.find((c) => c.name === "Sembako") ||
        categories.value[0];
      form.value.category_id = defaultCat?.id;
    }
  } catch (error) {
    console.error("Gagal memuat kategori:", error);
  }
}

watch(
  () => props.item,
  (item) => {
    if (!item) {
      form.value = {
        sku: "",
        name: "",
        price: 0,
        stock: 0,
        category_id:
          categories.value.find((c) => c.name === "Lainnya")?.id ??
          categories.value[0]?.id,
        image: "",
      };
      return;
    }

    form.value = {
      sku: item.sku ?? "",
      name: item.name,
      price: item.price,
      stock: item.stock,
      category_id: item.category_id,
      image: item.image ?? "",
    };
  },
  { immediate: true },
);

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Validate size (max 2MB for performance/DB consideration)
  if (file.size > 2 * 1024 * 1024) {
    alert("Ukuran gambar terlalu besar (Maks 2MB)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    form.value.image = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function submit() {
  emit("save", {
    sku: form.value.sku?.trim() || undefined,
    name: form.value.name.trim(),
    price: Number(form.value.price),
    stock: Number(form.value.stock),
    category_id: form.value.category_id,
    image: form.value.image?.trim() || undefined,
  });
}

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    @click.self="emit('update:open', false)"
  >
    <div
      class="bg-surface text-foreground rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]"
    >
      <div class="p-6 overflow-y-auto space-y-4">
        <h2 class="font-semibold text-xl border-b border-border pb-2">
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
        <select
          id="category"
          v-model.number="form.category_id"
          class="w-full border border-border rounded-lg px-3 py-2 bg-background"
        >
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <label for="image">Gambar Produk</label>
        <div class="space-y-3">
          <!-- Preview -->
          <div
            v-if="form.image"
            class="relative w-32 h-32 rounded-xl overflow-hidden border border-border bg-muted/20"
          >
            <img :src="form.image" class="w-full h-full object-contain" />
            <button
              @click="form.image = ''"
              class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs shadow-lg"
              type="button"
            >
              ✕
            </button>
          </div>

          <!-- Upload Toggle -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <label
                class="flex-1 cursor-pointer bg-muted/10 hover:bg-muted/20 border border-border border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-all"
              >
                <span class="text-2xl">📸</span>
                <span class="text-xs font-medium text-muted"
                  >Upload dari Local</span
                >
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileUpload"
                />
              </label>
            </div>

            <div class="relative flex items-center gap-2">
              <div class="h-px bg-border grow"></div>
              <span
                class="text-[10px] text-muted font-bold uppercase tracking-widest"
                >atau</span
              >
              <div class="h-px bg-border grow"></div>
            </div>

            <input
              id="image"
              v-model="form.image"
              placeholder="Masukan URL Gambar (https://...)"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

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
  </div>
</template>
