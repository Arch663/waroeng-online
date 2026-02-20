<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "@/composables/useI18n";
import {
  getPurchases,
  createPurchase,
  type Purchase,
  type PurchasePayload,
} from "@/services/purchaseApi";
import { getSuppliers, type Supplier } from "@/services/supplierApi";
import { getInventoryItems, type InventoryItem } from "@/services/inventoryApi";
import PageTitle from "@/components/ui/PageTitle.vue";
import PageActionButton from "@/components/ui/PageActionButton.vue";
import Pagination from "@/components/ui/Pagination.vue";
import TableCard from "@/components/ui/TableCard.vue";
import FormModalShell from "@/components/ui/FormModalShell.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import DataTable from "@/components/ui/DataTable.vue";

type PurchaseSortColumn =
  | "purchase_date"
  | "product_name"
  | "supplier_name"
  | "quantity"
  | "cost_price"
  | "total_cost";

const route = useRoute();
const router = useRouter();
const purchases = ref<Purchase[]>([]);
const suppliers = ref<Supplier[]>([]);
const products = ref<InventoryItem[]>([]);
const loading = ref(false);
const showForm = ref(false);
const sortBy = ref<PurchaseSortColumn>("purchase_date");
const order = ref<"ASC" | "DESC">("DESC");
const searchQuery = ref((route.query.q as string) || "");
const currentPage = ref(1);
const pageSize = 10;
const { t, language } = useI18n();

function sortArrow(isActive: boolean, sortOrder: "ASC" | "DESC") {
  if (!isActive) return "↕";
  return sortOrder === "ASC" ? "↑" : "↓";
}

const form = ref<PurchasePayload>({
  supplier_id: 0,
  inventory_id: 0,
  quantity: 1,
  cost_price: 0,
  notes: "",
});

async function loadData() {
  loading.value = true;
  try {
    const [p, s, invRes] = await Promise.all([
      getPurchases(),
      getSuppliers(),
      getInventoryItems({ limit: 100 }), 
    ]);
    purchases.value = p;
    suppliers.value = s;
    products.value = invRes.items;
    currentPage.value = 1;
  } catch (err) {
    console.error("Gagal memuat data:", err);
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  if (form.value.supplier_id === 0 || form.value.inventory_id === 0) {
    alert("Pilih supplier dan produk.");
    return;
  }
  try {
    await createPurchase(form.value);
    showForm.value = false;
    await loadData();
  } catch (err) {
    alert("Gagal menyimpan pembelian.");
  }
}

function handleAdd() {
  form.value = {
    supplier_id: 0,
    inventory_id: 0,
    quantity: 1,
    cost_price: 0,
    notes: "",
  };
  showForm.value = true;
}

function handleSort(column: PurchaseSortColumn) {
  if (sortBy.value === column) {
    order.value = order.value === "ASC" ? "DESC" : "ASC";
  } else {
    sortBy.value = column;
    order.value = "ASC";
  }
  currentPage.value = 1;
}

const sortedPurchases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const filtered = q
    ? purchases.value.filter((p) => {
        return (
          String(p.product_name ?? "").toLowerCase().includes(q) ||
          String(p.supplier_name ?? "").toLowerCase().includes(q) ||
          String(p.notes ?? "").toLowerCase().includes(q)
        );
      })
    : purchases.value;

  const items = [...filtered];
  items.sort((a, b) => {
    const key = sortBy.value;
    const left = a[key];
    const right = b[key];

    if (key === "purchase_date") {
      const leftTs = new Date(String(left ?? "")).getTime();
      const rightTs = new Date(String(right ?? "")).getTime();
      return order.value === "ASC" ? leftTs - rightTs : rightTs - leftTs;
    }

    if (key === "quantity" || key === "cost_price" || key === "total_cost") {
      const leftNum = Number(left ?? 0);
      const rightNum = Number(right ?? 0);
      return order.value === "ASC" ? leftNum - rightNum : rightNum - leftNum;
    }

    const leftText = String(left ?? "").toLowerCase();
    const rightText = String(right ?? "").toLowerCase();
    return order.value === "ASC"
      ? leftText.localeCompare(rightText)
      : rightText.localeCompare(leftText);
  });
  return items;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedPurchases.value.length / pageSize));
});

const paginatedPurchases = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedPurchases.value.slice(start, start + pageSize);
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

watch(
  () => route.query,
  () => {
    searchQuery.value = (route.query.q as string) || "";
    currentPage.value = Number(route.query.page) || 1;
  },
  { deep: true },
);

onMounted(loadData);
</script>

<template>
  <div class="space-y-8 md:space-y-10 pb-12 px-2 md:px-0">
    <PageTitle
      :title="t('purchase_title')"
      :highlight="t('purchase_highlight')"
      :subtitle="t('purchase_subtitle')"
    >
      <template #action>
        <PageActionButton :label="t('purchase_add')" @click="handleAdd" />
      </template>
    </PageTitle>

    <SearchBar
      v-model="searchQuery"
      :placeholder="language === 'id' ? 'Cari produk / supplier / catatan...' : 'Search product / supplier / notes...'"
    />

    <div v-if="loading" class="text-center py-12 text-muted">
      {{ t("common_loading") }}
    </div>

    <TableCard
      v-else
      wrapper-class="bg-surface rounded-2xl border border-border overflow-hidden"
    >
      <template #default>
        <DataTable
          :has-data="sortedPurchases.length > 0"
          :columns="6"
          :empty-text="language === 'id' ? 'Tidak ada riwayat pembelian.' : 'No purchase history.'"
        >
          <template #head>
            <tr>
              <th
                class="px-6 py-4 text-foreground cursor-pointer group"
                @click="handleSort('purchase_date')"
              >
                <div class="flex items-center gap-1">
                  {{ language === "id" ? "Tanggal" : "Date" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'purchase_date' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "purchase_date", order) }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 cursor-pointer group" @click="handleSort('product_name')">
                <div class="flex items-center gap-1">
                  {{ language === "id" ? "Produk" : "Product" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'product_name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "product_name", order) }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 cursor-pointer group" @click="handleSort('supplier_name')">
                <div class="flex items-center gap-1">
                  {{ language === "id" ? "Supplier" : "Supplier" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'supplier_name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "supplier_name", order) }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right cursor-pointer group" @click="handleSort('quantity')">
                <div class="flex items-center justify-end gap-1">
                  Qty
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'quantity' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "quantity", order) }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right cursor-pointer group" @click="handleSort('cost_price')">
                <div class="flex items-center justify-end gap-1">
                  {{ language === "id" ? "Harga Beli" : "Cost Price" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'cost_price' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "cost_price", order) }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right cursor-pointer group" @click="handleSort('total_cost')">
                <div class="flex items-center justify-end gap-1">
                  {{ language === "id" ? "Total" : "Total" }}
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'total_cost' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortArrow(sortBy === "total_cost", order) }}
                  </span>
                </div>
              </th>
            </tr>
          </template>
          <template #body>
            <tr
              v-for="p in paginatedPurchases"
              :key="p.id"
              class="hover:bg-muted/5 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-foreground">
                  {{ new Date(p.purchase_date).toLocaleDateString() }}
                </div>
                <div class="text-xs text-muted">
                  {{
                    new Date(p.purchase_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                {{ p.product_name }}
              </td>
              <td class="px-6 py-4 text-sm text-muted">
                {{ p.supplier_name }}
              </td>
              <td class="px-6 py-4 text-right font-bold text-accent">
                +{{ p.quantity }}
              </td>
              <td class="px-6 py-4 text-right text-sm tabular-nums text-muted">
                Rp
                {{
                  Number(p.cost_price).toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
              </td>
              <td
                class="px-6 py-4 text-right font-bold tabular-nums text-foreground"
              >
                Rp
                {{
                  Number(p.total_cost).toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                }}
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

    <!-- Purchase Form Modal -->
    <FormModalShell :open="showForm" max-width-class="max-w-lg" @close="showForm = false">
          <h2 class="text-2xl font-bold mb-1">{{ language === "id" ? "Catat Pembelian Baru" : "Record New Purchase" }}</h2>
          <form @submit.prevent="handleSave" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">{{ language === "id" ? "Produk *" : "Product *" }}</label>
              <select
                v-model="form.inventory_id"
                class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                required
              >
                <option :value="0" disabled>{{ language === "id" ? "Pilih Produk" : "Select Product" }}</option>
                <option v-for="i in products" :key="i.id" :value="i.id">
                  {{ i.name }} (Stok: {{ i.stock }})
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">{{ language === "id" ? "Supplier *" : "Supplier *" }}</label>
              <select
                v-model="form.supplier_id"
                class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                required
              >
                <option :value="0" disabled>{{ language === "id" ? "Pilih Supplier" : "Select Supplier" }}</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">{{ language === "id" ? "Jumlah *" : "Quantity *" }}</label>
              <input
                v-model.number="form.quantity"
                type="number"
                min="1"
                class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                required
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted"
                >{{ language === "id" ? "Harga Beli Per Unit *" : "Cost Per Unit *" }}</label
              >
              <input
                v-model.number="form.cost_price"
                type="number"
                min="0"
                class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-muted">{{ language === "id" ? "Catatan" : "Notes" }}</label>
            <textarea
              v-model="form.notes"
              class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset h-20 resize-none placeholder:text-muted/60"
              :placeholder="language === 'id' ? 'Contoh: Pembelian stok Sembako bulanan' : 'Example: Monthly stock purchase'"
            ></textarea>
          </div>

          <div class="p-4 bg-accent/5 rounded-2xl border border-accent/10">
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted">{{ language === "id" ? "Total Pengeluaran:" : "Total Expense:" }}</span>
              <span class="text-xl font-bold text-accent"
                >Rp
                {{
                  Number(form.quantity * form.cost_price).toLocaleString(
                    "id-ID",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    },
                  )
                }}</span
              >
            </div>
          </div>

          <div class="pt-2 flex gap-3">
            <button
              type="button"
              @click="showForm = false"
              class="flex-1 py-4 bg-muted/10 text-foreground rounded-2xl font-bold"
            >
              {{ t("common_cancel") }}
            </button>
            <button
              type="submit"
              class="flex-1 py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20"
            >
              {{ t("common_save") }}
            </button>
          </div>
          </form>
    </FormModalShell>
  </div>
</template>

<style scoped>
.purchase-field {
  background-color: var(--surface) !important;
  color: var(--foreground);
}

.purchase-field:focus {
  background-color: var(--surface) !important;
}

.purchase-field:-webkit-autofill,
.purchase-field:-webkit-autofill:hover,
.purchase-field:-webkit-autofill:focus,
.purchase-field:-webkit-autofill:active {
  -webkit-text-fill-color: var(--foreground);
  transition: background-color 9999s ease-in-out 0s;
}
</style>





