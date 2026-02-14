<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type Supplier,
} from "@/services/supplierApi";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import Skeleton from "@/components/ui/Skeleton.vue";

const suppliers = ref<Supplier[]>([]);
const loading = ref(false);
const error = ref("");
const showForm = ref(false);
const showDeleteConfirm = ref(false);
const selectedSupplier = ref<Supplier | null>(null);
const supplierToDelete = ref<Supplier | null>(null);

const sortBy = ref("name");
const order = ref<"ASC" | "DESC">("ASC");

const form = ref({
  name: "",
  contact_person: "",
  phone: "",
  address: "",
});

async function loadSuppliers() {
  loading.value = true;
  try {
    suppliers.value = await getSuppliers({
      sortBy: sortBy.value,
      order: order.value,
    });
  } catch (err) {
    error.value = "Gagal memuat supplier.";
  } finally {
    loading.value = false;
  }
}

function handleSort(column: string) {
  if (sortBy.value === column) {
    order.value = order.value === "ASC" ? "DESC" : "ASC";
  } else {
    sortBy.value = column;
    order.value = "ASC";
  }
  loadSuppliers();
}

function handleAdd() {
  selectedSupplier.value = null;
  form.value = { name: "", contact_person: "", phone: "", address: "" };
  showForm.value = true;
}

function handleEdit(s: Supplier) {
  selectedSupplier.value = s;
  form.value = {
    name: s.name,
    contact_person: s.contact_person || "",
    phone: s.phone || "",
    address: s.address || "",
  };
  showForm.value = true;
}

async function handleSave() {
  try {
    if (selectedSupplier.value) {
      await updateSupplier(selectedSupplier.value.id, form.value);
    } else {
      await createSupplier(form.value);
    }
    showForm.value = false;
    await loadSuppliers();
  } catch (err) {
    alert("Gagal menyimpan supplier.");
  }
}

function handleDelete(s: Supplier) {
  supplierToDelete.value = s;
  showDeleteConfirm.value = true;
}

async function confirmDelete() {
  if (!supplierToDelete.value) return;
  try {
    await deleteSupplier(supplierToDelete.value.id);
    showDeleteConfirm.value = false;
    await loadSuppliers();
  } catch (err) {
    alert("Gagal menghapus supplier.");
  }
}

onMounted(loadSuppliers);
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-foreground">Supplier</h1>
        <p class="text-muted">Kelola data pemasok barang</p>
      </div>
      <button
        @click="handleAdd"
        class="px-6 py-3 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        + Tambah Supplier
      </button>
    </div>

    <div
      v-if="loading && suppliers.length === 0"
      class="bg-surface/60 backdrop-blur-xl rounded-2xl p-8 border border-border shadow-xl"
    >
      <div class="flex gap-4 mb-6">
        <Skeleton v-for="i in 5" :key="i" height="20px" />
      </div>
      <div
        v-for="i in 5"
        :key="i"
        class="flex gap-4 mb-4 border-b border-border/50 pb-4"
      >
        <Skeleton height="40px" className="grow" />
        <Skeleton height="40px" width="120px" />
        <Skeleton height="40px" width="80px" />
      </div>
    </div>

    <div
      v-else
      class="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border overflow-hidden shadow-xl"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-muted/10 text-[10px] uppercase tracking-widest font-black text-muted"
          >
            <tr>
              <th
                class="px-6 py-4 text-foreground cursor-pointer group"
                @click="handleSort('name')"
              >
                <div class="flex items-center gap-1">
                  Nama Supplier
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "name" && order === "ASC" ? "▲" : "▼" }}
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 cursor-pointer group"
                @click="handleSort('contact_person')"
              >
                <div class="flex items-center gap-1">
                  PIC
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="
                      sortBy === 'contact_person'
                        ? 'opacity-100 text-accent'
                        : ''
                    "
                  >
                    {{
                      sortBy === "contact_person" && order === "ASC" ? "▲" : "▼"
                    }}
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 whitespace-nowrap cursor-pointer group"
                @click="handleSort('phone')"
              >
                <div class="flex items-center gap-1">
                  No. Telp
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'phone' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "phone" && order === "ASC" ? "▲" : "▼" }}
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 cursor-pointer group"
                @click="handleSort('address')"
              >
                <div class="flex items-center gap-1">
                  Alamat
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="
                      sortBy === 'address' ? 'opacity-100 text-accent' : ''
                    "
                  >
                    {{ sortBy === "address" && order === "ASC" ? "▲" : "▼" }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="s in suppliers"
              :key="s.id"
              class="hover:bg-muted/5 transition-colors group"
            >
              <td class="px-6 py-4 font-bold text-foreground">{{ s.name }}</td>
              <td class="px-6 py-4 text-sm text-muted">
                {{ s.contact_person || "-" }}
              </td>
              <td class="px-6 py-4 text-sm text-muted tabular-nums">
                {{ s.phone || "-" }}
              </td>
              <td class="px-6 py-4 text-sm text-muted max-w-xs truncate">
                {{ s.address || "-" }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="handleEdit(s)"
                    class="p-2 text-accent hover:bg-accent/10 rounded-xl transition-all"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(s)"
                    class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="suppliers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-muted">
                Belum ada data supplier.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      @click.self="showForm = false"
    >
      <div
        class="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 border border-border"
      >
        <h2 class="text-2xl font-bold mb-6">
          {{ selectedSupplier ? "Edit" : "Tambah" }} Supplier
        </h2>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted"
              >Nama Supplier *</label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted"
              >Person In Charge</label
            >
            <input
              v-model="form.contact_person"
              type="text"
              class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted">No. Telepon</label>
            <input
              v-model="form.phone"
              type="text"
              class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-muted">Alamat</label>
            <textarea
              v-model="form.address"
              class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent h-24 resize-none"
            ></textarea>
          </div>
          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="showForm = false"
              class="flex-1 py-3 bg-muted/10 text-foreground rounded-2xl font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :open="showDeleteConfirm"
      title="Hapus Supplier"
      :message="`Yakin ingin menghapus supplier '${supplierToDelete?.name}'?`"
      confirm-text="Hapus"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
      variant="danger"
    />
  </div>
</template>
