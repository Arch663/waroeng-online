<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "@/composables/useI18n";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type Supplier,
} from "@/services/supplierApi";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import Skeleton from "@/components/ui/Skeleton.vue";
import PageTitle from "@/components/ui/PageTitle.vue";
import PageActionButton from "@/components/ui/PageActionButton.vue";
import Pagination from "@/components/ui/Pagination.vue";
import TableCard from "@/components/ui/TableCard.vue";
import FormModalShell from "@/components/ui/FormModalShell.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import DataTable from "@/components/ui/DataTable.vue";

const route = useRoute();
const router = useRouter();
const suppliers = ref<Supplier[]>([]);
const loading = ref(false);
const error = ref("");
const showForm = ref(false);
const showDeleteConfirm = ref(false);
const selectedSupplier = ref<Supplier | null>(null);
const supplierToDelete = ref<Supplier | null>(null);

const sortBy = ref("name");
const order = ref<"ASC" | "DESC">("ASC");
const searchQuery = ref((route.query.q as string) || "");
const currentPage = ref(1);
const pageSize = 10;
const { t, language } = useI18n();

function sortArrow(isActive: boolean, sortOrder: "ASC" | "DESC") {
  if (!isActive) return "↕";
  return sortOrder === "ASC" ? "↑" : "↓";
}

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

const filteredSuppliers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return suppliers.value;
  return suppliers.value.filter((s) => {
    return (
      String(s.name ?? "").toLowerCase().includes(q) ||
      String(s.contact_person ?? "").toLowerCase().includes(q) ||
      String(s.phone ?? "").toLowerCase().includes(q) ||
      String(s.address ?? "").toLowerCase().includes(q)
    );
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredSuppliers.value.length / pageSize));
});

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredSuppliers.value.slice(start, start + pageSize);
});

function handlePageChange(page: number) {
  currentPage.value = page;
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (newQ) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.push({
      query: {
        ...route.query,
        q: newQ || undefined,
        page: 1,
      },
    });
  }, 400);
});

function handleSort(column: string) {
  if (sortBy.value === column) {
    order.value = order.value === "ASC" ? "DESC" : "ASC";
  } else {
    sortBy.value = column;
    order.value = "ASC";
  }
  loadSuppliers();
  currentPage.value = 1;
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

watch(
  () => suppliers.value.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  },
);

watch(
  () => route.query,
  () => {
    searchQuery.value = (route.query.q as string) || "";
    currentPage.value = Number(route.query.page) || 1;
  },
  { deep: true },
);

onMounted(loadSuppliers);
</script>

<template>
  <div class="space-y-10 pb-12 px-2 md:px-0">
    <PageTitle
      :title="t('supplier_title')"
      :highlight="t('supplier_highlight')"
      :subtitle="t('supplier_subtitle')"
    >
      <template #action>
        <PageActionButton :label="t('supplier_add')" @click="handleAdd" />
      </template>
    </PageTitle>

    <SearchBar
      v-model="searchQuery"
      :placeholder="language === 'id' ? 'Cari supplier / PIC / telepon / alamat...' : 'Search supplier / PIC / phone / address...'"
    />

    <div
      v-if="loading && suppliers.length === 0"
      class="bg-surface rounded-2xl p-8 border border-border"
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

    <TableCard v-else>
      <template #default>
        <DataTable
          :has-data="filteredSuppliers.length > 0"
          :columns="5"
          :empty-text="language === 'id' ? 'Tidak ada data supplier.' : 'No supplier data.'"
          thead-class="bg-muted/10 text-xs uppercase tracking-widest font-black text-muted"
        >
          <template #head>
            <tr>
              <th
                class="px-6 py-4 text-foreground cursor-pointer group"
                @click="handleSort('name')"
              >
                <div class="flex items-center gap-1">
                  {{ language === "id" ? "Nama Supplier" : "Supplier Name" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "name", order) }}
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
                      sortArrow(sortBy === "contact_person", order)
                    }}
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 whitespace-nowrap cursor-pointer group"
                @click="handleSort('phone')"
              >
                <div class="flex items-center gap-1">
                  {{ language === "id" ? "Phone" : "Phone" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'phone' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "phone", order) }}
                  </span>
                </div>
              </th>
              <th
                class="px-6 py-4 cursor-pointer group"
                @click="handleSort('address')"
              >
                <div class="flex items-center gap-1">
                  {{ language === "id" ? "Alamat" : "Address" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="
                      sortBy === 'address' ? 'opacity-100 text-accent' : ''
                    "
                  >
                    {{
                      sortArrow(sortBy === "address", order)
                    }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right">{{ language === "id" ? "Aksi" : "Action" }}</th>
            </tr>
          </template>
          <template #body>
            <tr
              v-for="s in paginatedSuppliers"
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
                    {{ t("common_edit") }}
                  </button>
                  <button
                    @click="handleDelete(s)"
                    class="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    {{ t("common_delete") }}
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </DataTable>
      </template>
      <template #footer>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </template>
    </TableCard>

    <FormModalShell :open="showForm" @close="showForm = false">
          <h2 class="text-2xl font-bold mb-1">
            {{ selectedSupplier ? t("common_edit") : (language === "id" ? "Tambah" : "Add") }} Supplier
          </h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted"
                >{{ language === "id" ? "Nama Supplier *" : "Supplier Name *" }}</label
              >
              <input
                v-model="form.name"
                type="text"
                class="supplier-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
                required
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted"
                >{{ language === "id" ? "Penanggung Jawab" : "Person In Charge" }}</label
              >
              <input
                v-model="form.contact_person"
                type="text"
                class="supplier-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">{{ language === "id" ? "No. Telepon" : "Phone" }}</label>
              <input
                v-model="form.phone"
                type="text"
                class="supplier-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset placeholder:text-muted/60"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">{{ language === "id" ? "Alamat" : "Address" }}</label>
              <textarea
                v-model="form.address"
                class="supplier-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset h-24 resize-none placeholder:text-muted/60"
              ></textarea>
            </div>
            <div class="pt-4 flex gap-3">
              <button
                type="button"
                @click="showForm = false"
                class="flex-1 py-3 bg-muted/10 text-foreground rounded-2xl font-bold"
              >
                {{ t("common_cancel") }}
              </button>
              <button
                type="submit"
                class="flex-1 py-3 bg-accent text-white rounded-2xl font-bold"
              >
                {{ t("common_save") }}
              </button>
            </div>
          </form>
    </FormModalShell>

    <ConfirmModal
      :open="showDeleteConfirm"
      :title="`${t('common_delete')} Supplier`"
      :message="language === 'id' ? `Yakin ingin menghapus supplier '${supplierToDelete?.name}'?` : `Are you sure you want to delete supplier '${supplierToDelete?.name}'?`"
      :confirm-text="t('common_delete')"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
      variant="danger"
    />
  </div>
</template>

<style scoped>
.supplier-field {
  background-color: var(--surface) !important;
  color: var(--foreground);
}

.supplier-field:focus {
  background-color: var(--surface) !important;
}

.supplier-field:-webkit-autofill,
.supplier-field:-webkit-autofill:hover,
.supplier-field:-webkit-autofill:focus,
.supplier-field:-webkit-autofill:active {
  -webkit-text-fill-color: var(--foreground);
  transition: background-color 9999s ease-in-out 0s;
}
</style>