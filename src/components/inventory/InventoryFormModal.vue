<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  item: any;
}>();

const emit = defineEmits(["update:open"]);

const form = ref({
  name: "",
  price: 0,
  stock: 0,
});

watch(
  () => props.item,
  (val) => {
    if (val) form.value = { ...val };
    else
      form.value = {
        name: "",
        price: 0,
        stock: 0,
      };
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
  >
    <div class="bg-surface text-foreground rounded-2xl p-6 w-full max-w-md space-y-4">
      <h2 class="font-semibold text-xl">
        {{ item ? "Edit" : "Tambah" }}
        Barang
      </h2>
      <label for="form.name">Nama Barang</label>
      <input
      v-model="form.name"
      placeholder="input nama barang"
      class="w-full border border-border rounded-lg px-3 py-2"
      />
      
      <label for="form.price">Harga</label>
      <input
      v-model.number="form.price"
      type="number"
      placeholder="input harga barang"
      class="w-full border border-border rounded-lg px-3 py-2"
      />
      
      <label for="form.stock">Jumlah Stock</label>
      <input
        v-model.number="form.stock"
        type="number"
        placeholder="Input stok barang"
        class="w-full border border-border rounded-lg px-3 py-2"
      />

      <div class="flex justify-end gap-2">
        <button
          @click="emit('update:open', false)"
          class="px-4 py-2 border rounded-lg"
        >
          Batal
        </button>

        <button class="px-4 py-2 bg-accent text-white rounded-lg">
          Simpan
        </button>
      </div>
    </div>
  </div>
</template>
