<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "@/composables/useI18n";
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
const { language, t } = useI18n();

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
    <div class="bg-surface rounded-3xl w-full max-w-md p-8 border border-border flex flex-col max-h-dvh">
      <div class="overflow-y-auto overflow-x-hidden pr-1 space-y-5 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent">
        <h2 class="text-2xl font-bold mb-1">
          {{ item ? t("common_edit") : (language === "id" ? "Tambah" : "Add") }} {{ language === "id" ? "Barang" : "Item" }}
        </h2>

        <div class="space-y-2">
          <label for="sku" class="text-sm font-medium text-muted">SKU</label>
          <input
            id="sku"
            v-model="form.sku"
            placeholder="Contoh: BRG-001"
            class="inventory-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
          />
        </div>

        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-muted">{{ language === "id" ? "Nama Barang *" : "Item Name *" }}</label>
          <input
            id="name"
            v-model="form.name"
            placeholder="Input nama barang"
            class="inventory-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="price" class="text-sm font-medium text-muted">Harga *</label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              min="0"
              placeholder="Input harga barang"
              class="inventory-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
            />
          </div>

          <div class="space-y-2">
            <label for="stock" class="text-sm font-medium text-muted">{{ language === "id" ? "Jumlah Stok *" : "Stock Quantity *" }}</label>
            <input
              id="stock"
              v-model.number="form.stock"
              type="number"
              min="0"
              placeholder="Input stok barang"
              class="inventory-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="category" class="text-sm font-medium text-muted">{{ language === "id" ? "Kategori *" : "Category *" }}</label>
          <select
            id="category"
            v-model.number="form.category_id"
            class="inventory-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset text-foreground"
          >
            <option :value="undefined" disabled>Pilih Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label for="image" class="text-sm font-medium text-muted">{{ language === "id" ? "Gambar Produk" : "Product Image" }}</label>
          <div class="space-y-3">
            <div
              v-if="form.image"
              class="relative w-32 h-32 rounded-xl overflow-hidden border border-border bg-muted/20"
            >
              <img :src="form.image" class="w-full h-full object-contain" />
              <button
                @click="form.image = ''"
                class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                type="button"
              >
                ×
              </button>
            </div>

            <div v-if="!form.image" class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <label
                  class="flex-1 cursor-pointer bg-muted/10 hover:bg-muted/20 border border-border border-dashed rounded-xl py-6 flex flex-col items-center gap-2 transition-all"
                >
                  <svg class="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span class="text-xs font-medium text-muted">{{ language === "id" ? "Upload dari Lokal" : "Upload from Local" }}</span>
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
                <span class="text-xs text-muted font-bold uppercase tracking-widest">atau</span>
                <div class="h-px bg-border grow"></div>
              </div>

              <input
                id="image"
                v-model="form.image"
                placeholder="Masukan URL Gambar (https://...)"
                class="inventory-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset text-sm placeholder:text-muted/60"
              />
            </div>

            <div v-else class="flex gap-2">
              <label class="flex-1 cursor-pointer text-center px-3 py-2 bg-muted/10 hover:bg-muted/20 border border-border rounded-xl text-xs font-semibold text-foreground transition-all">
                {{ language === "id" ? "Ganti dari Lokal" : "Change from Local" }}
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileUpload"
                />
              </label>
              <button
                type="button"
                class="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-semibold text-red-500 transition-all"
                @click="form.image = ''"
              >
                {{ t("common_delete") }}
              </button>
            </div>
          </div>
        </div>

        <div class="pt-2 flex gap-3">
          <button
            :disabled="loading"
            @click="emit('update:open', false)"
            class="flex-1 py-3 bg-muted/10 text-foreground rounded-2xl font-bold disabled:opacity-50"
          >
            {{ t("common_cancel") }}
          </button>

          <button
            :disabled="loading"
            @click="submit"
            class="flex-1 py-3 bg-accent text-white rounded-2xl font-bold disabled:opacity-50"
          >
            {{ loading ? t("common_process") : t("common_save") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-field {
  background-color: var(--surface) !important;
  color: var(--foreground);
}

.inventory-field:focus {
  background-color: var(--surface) !important;
}

.inventory-field:-webkit-autofill,
.inventory-field:-webkit-autofill:hover,
.inventory-field:-webkit-autofill:focus,
.inventory-field:-webkit-autofill:active {
  -webkit-text-fill-color: var(--foreground);
  transition: background-color 9999s ease-in-out 0s;
}
</style>





