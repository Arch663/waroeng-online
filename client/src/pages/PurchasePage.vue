<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  getPurchases,
  createPurchase,
  type Purchase,
  type PurchasePayload,
} from "@/services/purchaseApi";
import { getSuppliers, type Supplier } from "@/services/supplierApi";
import { getInventoryItems, type InventoryItem } from "@/services/inventoryApi";
import PageTitle from "@/components/ui/PageTitle.vue";
import Pagination from "@/components/ui/Pagination.vue";
import TableCard from "@/components/ui/TableCard.vue";

type PurchaseSortColumn =
  | "purchase_date"
  | "product_name"
  | "supplier_name"
  | "quantity"
  | "cost_price"
  | "total_cost";

const purchases = ref<Purchase[]>([]);
const suppliers = ref<Supplier[]>([]);
const products = ref<InventoryItem[]>([]);
const loading = ref(false);
const showForm = ref(false);
const sortBy = ref<PurchaseSortColumn>("purchase_date");
const order = ref<"ASC" | "DESC">("DESC");
const currentPage = ref(1);
const pageSize = 10;

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
  const items = [...purchases.value];
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

onMounted(loadData);
</script>

<template>
  <div class="space-y-10 pb-12 px-2 md:px-0">
    <PageTitle
      title="Log"
      highlight="Pembelian"
      subtitle="Log_entry: stock acquisition protocol"
    >
      <template #action>
        <button
          @click="handleAdd"
          class="px-8 py-4 bg-accent text-background rounded-2xl font-black uppercase tracking-widest shadow-glass hover:shadow-accent/40 hover:-translate-y-1 transition-all active:scale-95 text-xs"
        >
          + Acquire New Units
        </button>
      </template>
    </PageTitle>

    <div v-if="loading" class="text-center py-12 text-muted">
      Memuat data...
    </div>

    <TableCard
      v-else
      wrapper-class="bg-surface rounded-3xl border border-border overflow-hidden"
    >
      <template #default>
        <table class="w-full text-left">
          <thead
            class="bg-muted/10 text-xs uppercase tracking-wider font-bold text-muted"
          >
            <tr>
              <th
                class="px-6 py-4 text-foreground cursor-pointer group"
                @click="handleSort('purchase_date')"
              >
                <div class="flex items-center gap-1">
                  Tanggal
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'purchase_date' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "purchase_date" && order === "ASC" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 cursor-pointer group" @click="handleSort('product_name')">
                <div class="flex items-center gap-1">
                  Produk
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'product_name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "product_name" && order === "ASC" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 cursor-pointer group" @click="handleSort('supplier_name')">
                <div class="flex items-center gap-1">
                  Supplier
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'supplier_name' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "supplier_name" && order === "ASC" ? "↑" : "↓" }}
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
                    {{ sortBy === "quantity" && order === "ASC" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right cursor-pointer group" @click="handleSort('cost_price')">
                <div class="flex items-center justify-end gap-1">
                  Harga Beli
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'cost_price' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "cost_price" && order === "ASC" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
              <th class="px-6 py-4 text-right cursor-pointer group" @click="handleSort('total_cost')">
                <div class="flex items-center justify-end gap-1">
                  Total
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="sortBy === 'total_cost' ? 'opacity-100 text-accent' : ''"
                  >
                    {{ sortBy === "total_cost" && order === "ASC" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
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
            <tr v-if="purchases.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-muted">
                Tidak ada riwayat pembelian.
              </td>
            </tr>
          </tbody>
        </table>
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
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      @click.self="showForm = false"
    >
      <div
        class="bg-surface rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-border flex flex-col max-h-dvh"
      >
        <div class="overflow-y-auto overflow-x-hidden pr-1 space-y-5 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent">
          <h2 class="text-2xl font-bold mb-1">Catat Pembelian Baru</h2>
          <form @submit.prevent="handleSave" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">Produk *</label>
              <select
                v-model="form.inventory_id"
                class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                required
              >
                <option :value="0" disabled>Pilih Produk</option>
                <option v-for="i in products" :key="i.id" :value="i.id">
                  {{ i.name }} (Stok: {{ i.stock }})
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">Supplier *</label>
              <select
                v-model="form.supplier_id"
                class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                required
              >
                <option :value="0" disabled>Pilih Supplier</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">Jumlah *</label>
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
                >Harga Beli Per Unit *</label
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
            <label class="text-sm font-medium text-muted">Catatan</label>
            <textarea
              v-model="form.notes"
              class="purchase-field w-full px-4 py-3 bg-surface/40 border border-border/70 rounded-2xl outline-none focus:ring-2 focus:ring-accent focus:ring-inset h-20 resize-none placeholder:text-muted/60"
              placeholder="Contoh: Pembelian stok Sembako bulanan"
            ></textarea>
          </div>

          <div class="p-4 bg-accent/5 rounded-2xl border border-accent/10">
            <div class="flex justify-between items-center text-sm">
              <span class="text-muted">Total Pengeluaran:</span>
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
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20"
            >
              Simpan Pembelian
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
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

