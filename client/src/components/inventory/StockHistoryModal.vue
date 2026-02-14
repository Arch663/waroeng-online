<script setup lang="ts">
import { ref, watch } from "vue";
import { DATABASE_API_URL } from "@/config/api";

const props = defineProps<{
  open: boolean;
  itemId: number | null;
  itemName: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const movements = ref<any[]>([]);
const loading = ref(false);

async function fetchMovements() {
  if (!props.itemId) return;
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${DATABASE_API_URL}/inventory/${props.itemId}/movements`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      movements.value = await res.json();
    }
  } catch (error) {
    console.error("Gagal memuat riwayat stok:", error);
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      fetchMovements();
    }
  },
);

function formatType(type: string) {
  switch (type) {
    case "sale":
      return { label: "Penjualan", class: "bg-blue-500/10 text-blue-500" };
    case "purchase":
      return { label: "Pembelian", class: "bg-green-500/10 text-green-500" };
    case "adjustment":
      return {
        label: "Penyesuaian",
        class: "bg-yellow-500/10 text-yellow-500",
      };
    case "return":
      return { label: "Retur", class: "bg-red-500/10 text-red-500" };
    default:
      return { label: type, class: "bg-gray-500/10 text-gray-500" };
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    @click.self="emit('update:open', false)"
  >
    <div
      class="bg-surface text-foreground rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-dvh overflow-hidden border border-border"
    >
      <div
        class="p-6 border-b border-border flex justify-between items-center bg-muted/5"
      >
        <div>
          <h2 class="font-bold text-2xl">Riwayat Stok</h2>
          <p class="text-muted text-sm">{{ itemName }}</p>
        </div>
        <button
          @click="emit('update:open', false)"
          class="p-2 hover:bg-muted/10 rounded-full transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="grow overflow-y-auto p-0">
        <div v-if="loading" class="p-12 text-center text-muted">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-r-transparent mb-4"
          ></div>
          <p>Memuat riwayat...</p>
        </div>

        <div
          v-else-if="movements.length === 0"
          class="p-12 text-center text-muted"
        >
          <p class="text-5xl mb-4">ðŸ“œ</p>
          <p>Belum ada riwayat pergerakan stok untuk barang ini.</p>
        </div>

        <table v-else class="w-full text-left border-collapse">
          <thead
            class="sticky top-0 bg-surface shadow-sm text-xs uppercase tracking-wider text-muted font-bold"
          >
            <tr>
              <th class="px-6 py-4">Tanggal</th>
              <th class="px-6 py-4">Tipe</th>
              <th class="px-6 py-4 text-right">Jumlah</th>
              <th class="px-6 py-4 text-right">Sisa Stok</th>
              <th class="px-6 py-4">Oleh</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="m in movements"
              :key="m.id"
              class="hover:bg-muted/5 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium">
                  {{ new Date(m.created_at).toLocaleDateString() }}
                </div>
                <div class="text-xs text-muted">
                  {{
                    new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-xs font-bold leading-none',
                    formatType(m.movement_type).class,
                  ]"
                >
                  {{ formatType(m.movement_type).label }}
                </span>
                <div
                  class="text-xs text-muted mt-1 truncate max-w-30]"
                  :title="m.notes"
                >
                  {{ m.notes }}
                </div>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap">
                <span
                  :class="[
                    'font-bold',
                    m.quantity > 0 ? 'text-green-500' : 'text-red-500',
                  ]"
                >
                  {{ m.quantity > 0 ? "+" : "" }}{{ m.quantity }}
                </span>
              </td>
              <td class="px-6 py-4 text-right font-medium">
                {{ m.stock_after }}
              </td>
              <td class="px-6 py-4 text-sm text-muted whitespace-nowrap">
                {{ m.created_by_name || "System" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 border-t border-border bg-muted/5 flex justify-end">
        <button
          @click="emit('update:open', false)"
          class="px-6 py-2.5 bg-muted/10 hover:bg-muted/20 text-foreground font-semibold rounded-xl transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

