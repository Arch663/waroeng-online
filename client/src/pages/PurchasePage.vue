<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  getPurchases,
  createPurchase,
  type Purchase,
  type PurchasePayload,
} from "@/services/purchaseApi";
import { getSuppliers, type Supplier } from "@/services/supplierApi";
import { getInventoryItems, type InventoryItem } from "@/services/inventoryApi";

const purchases = ref<Purchase[]>([]);
const suppliers = ref<Supplier[]>([]);
const products = ref<InventoryItem[]>([]);
const loading = ref(false);
const showForm = ref(false);

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

onMounted(loadData);
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-foreground">
          Pembelian
        </h1>
        <p class="text-muted">Catat pembelian barang dari supplier</p>
      </div>
      <button
        @click="handleAdd"
        class="px-6 py-3 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        + Catat Pembelian
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-muted">
      Memuat data...
    </div>

    <div
      v-else
      class="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-muted/10 text-xs uppercase tracking-wider font-bold text-muted"
          >
            <tr>
              <th class="px-6 py-4 text-foreground">Tanggal</th>
              <th class="px-6 py-4">Produk</th>
              <th class="px-6 py-4">Supplier</th>
              <th class="px-6 py-4 text-right">Qty</th>
              <th class="px-6 py-4 text-right">Harga Beli</th>
              <th class="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="p in purchases"
              :key="p.id"
              class="hover:bg-muted/5 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-foreground">
                  {{ new Date(p.purchase_date).toLocaleDateString() }}
                </div>
                <div class="text-[10px] text-muted">
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
                Belum ada riwayat pembelian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Purchase Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      @click.self="showForm = false"
    >
      <div
        class="bg-surface rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-border"
      >
        <h2 class="text-2xl font-bold mb-6">Catat Pembelian Baru</h2>
        <form @submit.prevent="handleSave" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-muted">Produk *</label>
              <select
                v-model="form.inventory_id"
                class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
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
                class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
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
                class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
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
                class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-muted">Catatan</label>
            <textarea
              v-model="form.notes"
              class="w-full px-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-accent h-20 resize-none"
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
</template>
