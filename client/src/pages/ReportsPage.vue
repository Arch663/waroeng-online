<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { getReportsSummary, type ReportSummary } from "@/services/dashboardApi";
import { getInventoryItems } from "@/services/inventoryApi";
import Skeleton from "@/components/ui/Skeleton.vue";
import PageTitle from "@/components/ui/PageTitle.vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const loading = ref(false);
const period = ref("month");
const summary = ref<ReportSummary | null>(null);

async function loadReport() {
  loading.value = true;
  try {
    const data = await getReportsSummary(period.value);
    summary.value = data;
  } catch (err) {
    console.error("Gagal memuat laporan:", err);
  } finally {
    loading.value = false;
  }
}

async function handleDownloadPDF() {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString("id-ID");

  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241);
  doc.text("Laporan Bisnis Waroeng Online", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Periode: ${period.value.toUpperCase()} | Dicetak pada: ${dateStr}`,
    14,
    28,
  );

  if (summary.value) {
    autoTable(doc, {
      startY: 35,
      head: [["Metrik", "Nilai"]],
      body: [
        ["Total Transaksi", summary.value.sales.total_sales.toString()],
        [
          "Omzet Kotor",
          `Rp ${Number(summary.value.sales.gross_revenue || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        ],
        [
          "Pengeluaran (Stok)",
          `Rp ${Number(summary.value.sales.total_expenses || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        ],
        [
          "Profit Bersih",
          `Rp ${Number(summary.value.sales.profit || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
    });
  }

  if (summary.value?.topProducts.length) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Produk Terlaris", 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Produk", "Qty Terjual", "Revenue"]],
      body: summary.value.topProducts.map((p) => [
        p.name || "-",
        p.total_qty.toString(),
        `Rp ${Number(p.total_revenue || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      ]),
    });
  }

  try {
    const invRes = await getInventoryItems({ limit: 100 });
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("Status Stok Inventaris", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Nama Barang", "SKU", "Kategori", "Harga", "Stok"]],
      body: invRes.items.map((i) => [
        i.name || "-",
        i.sku || "-",
        i.category || "Lainnya",
        `Rp ${Number(i.price || 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        (i.stock || 0).toString(),
      ]),
      styles: { fontSize: 9 },
    });
  } catch (err) {
    console.error("Gagal memuat stok untuk PDF:", err);
  }

  doc.save(`Laporan_${period.value}_${dateStr}.pdf`);
}

watch(period, loadReport);
onMounted(loadReport);
</script>

<template>
  <div class="space-y-10 pb-12 px-2 md:px-0">
    <PageTitle
      title="Laporan"
      highlight="Bisnis"
      subtitle="Documents: sales profit intelligence"
    >
      <template #action>
        <div class="flex flex-col sm:flex-row items-center gap-4">
        <div
          class="flex bg-surface/30 backdrop-blur-2xl p-1.5 rounded-2xl border border-border/50 shadow-glass"
        >
          <button
            v-for="p in [
              { id: 'day', l: 'Today' },
              { id: 'week', l: 'Week' },
              { id: 'month', l: 'Month' },
              { id: 'year', l: 'Year' },
            ]"
            :key="p.id"
            @click="period = p.id"
            :disabled="loading"
            :class="[
              'px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              period === p.id
                ? 'bg-accent text-background shadow-glass'
                : 'text-muted hover:text-foreground hover:bg-accent/5',
            ]"
          >
            {{ p.l }}
          </button>
        </div>

        <button
          @click="handleDownloadPDF"
          :disabled="loading || !summary"
          class="w-full sm:w-auto px-8 py-3.5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:shadow-glass hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-xs"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export PDF
        </button>
        </div>
      </template>
    </PageTitle>

    <div
      v-if="loading && !summary"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <Skeleton v-for="i in 4" :key="i" height="160px" border-radius="2rem" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="bg-surface/60 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl group hover:border-accent/30 transition-all duration-300"
      >
        <p
          class="text-xs font-black text-muted uppercase tracking-widest mb-2"
        >
          Total Transaksi
        </p>
        <h3 class="text-4xl font-black text-foreground">
          {{ summary?.sales.total_sales || 0 }}
        </h3>
        <div
          class="mt-4 flex items-center gap-2 text-xs text-accent font-black bg-accent/10 px-2 py-1 rounded-full w-fit uppercase"
        >
          <span>↑</span> Healthy
        </div>
      </div>

      <div
        class="bg-surface/60 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl border-l-4 border-l-secondary group hover:border-accent/40 transition-all duration-300"
      >
        <p
          class="text-xs font-black text-muted uppercase tracking-widest mb-2"
        >
          Omzet Kotor
        </p>
        <h3 class="text-3xl font-black text-foreground">
          <span class="text-sm font-medium mr-1 text-foreground/60">Rp</span
          >{{
            (Number(summary?.sales?.gross_revenue) || 0).toLocaleString("id-ID")
          }}
        </h3>
        <p
          class="text-xs text-muted mt-4 font-bold uppercase tracking-tight"
        >
          Total pendapatan
        </p>
      </div>

      <div
        class="bg-surface/60 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl border-l-4 border-l-foreground group hover:border-accent/40 transition-all duration-300"
      >
        <p
          class="text-xs font-black text-muted uppercase tracking-widest mb-2"
        >
          Pengeluaran (Stok)
        </p>
        <h3 class="text-3xl font-black text-foreground">
          <span class="text-sm font-medium mr-1 text-foreground/60">Rp</span
          >{{
            (Number(summary?.sales?.total_expenses) || 0).toLocaleString(
              "id-ID",
            )
          }}
        </h3>
        <p
          class="text-xs text-muted mt-4 font-bold uppercase tracking-tight"
        >
          Total pembelian barang
        </p>
      </div>

      <div
        class="bg-surface/60 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl border-l-4 border-l-accent group hover:border-accent/40 transition-all duration-300"
      >
        <p
          class="text-xs font-black text-muted uppercase tracking-widest mb-2"
        >
          Profit Bersih
        </p>
        <h3 class="text-3xl font-black text-accent">
          <span class="text-sm font-medium mr-1 text-accent/60">Rp</span>
          {{ (Number(summary?.sales?.profit) || 0).toLocaleString("id-ID") }}
        </h3>
        <p class="text-xs text-muted mt-4 font-medium italic opacity-60">
          * Omzet - Pengeluaran
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div
        v-if="loading && !summary"
        class="bg-surface/60 backdrop-blur-xl rounded-3xl p-6 h-96 border border-border"
      >
        <Skeleton height="30px" width="50%" className="mb-6" />
        <Skeleton v-for="i in 5" :key="i" height="40px" className="mb-3" />
      </div>

      <div
        v-else
        class="bg-surface/60 backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-xl"
      >
        <div
          class="p-6 border-b border-border bg-muted/5 flex items-center justify-between"
        >
          <h2 class="font-bold text-lg">Performa Kategori</h2>
          <span
            class="text-xs bg-muted/20 px-2 py-1 rounded-lg font-black text-muted uppercase tracking-widest"
            >Revenue</span
          >
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead
              class="bg-muted/5 text-xs uppercase font-black text-muted tracking-widest"
            >
              <tr>
                <th class="px-6 py-4">Kategori</th>
                <th class="px-6 py-4 text-center">Unit Terjual</th>
                <th class="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="c in summary?.categories"
                :key="c.name"
                class="hover:bg-muted/5 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-foreground">
                  {{ c.name }}
                </td>
                <td class="px-6 py-4 text-center text-sm font-medium">
                  {{ c.units_sold }}
                </td>
                <td
                  class="px-6 py-4 text-right tabular-nums font-black text-accent text-sm"
                >
                  Rp
                  {{
                    Number(c.revenue || 0).toLocaleString("id-ID", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="loading && !summary"
        class="bg-surface/60 backdrop-blur-xl rounded-2xl p-6 h-96 border border-border"
      >
        <Skeleton height="30px" width="50%" className="mb-6" />
        <Skeleton v-for="i in 5" :key="i" height="40px" className="mb-3" />
      </div>

      <div
        v-else
        class="bg-surface/60 backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-xl"
      >
        <div
          class="p-6 border-b border-border bg-muted/5 flex items-center justify-between"
        >
          <h2 class="font-bold text-lg">Produk Terlaris</h2>
          <span
            class="text-xs bg-muted/20 px-2 py-1 rounded-lg font-black text-muted uppercase tracking-widest"
            >Volume</span
          >
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead
              class="bg-muted/5 text-xs uppercase font-black text-muted tracking-widest"
            >
              <tr>
                <th class="px-6 py-4">Produk</th>
                <th class="px-6 py-4 text-center">Qty</th>
                <th class="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="p in summary?.topProducts"
                :key="p.name"
                class="hover:bg-muted/5 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="font-bold text-foreground text-sm">
                    {{ p.name }}
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span
                    class="px-2 py-1 bg-accent/10 text-accent rounded-lg text-xs font-black"
                    >{{ p.total_qty }}</span
                  >
                </td>
                <td class="px-6 py-4 text-right tabular-nums font-bold text-sm">
                  Rp
                  {{
                    Number(p.total_revenue || 0).toLocaleString("id-ID", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="!loading && (!summary || summary.categories.length === 0)"
      class="py-20 text-center text-muted"
    >
      <p class="text-6xl mb-4 grayscale opacity-50">ðŸ“Š</p>
      <p class="font-medium text-lg">Tidak ada data untuk periode ini.</p>
      <p class="text-sm opacity-60">
        Silakan pilih periode lain atau pastikan ada transaksi yang tercatat.
      </p>
    </div>
  </div>
</template>

