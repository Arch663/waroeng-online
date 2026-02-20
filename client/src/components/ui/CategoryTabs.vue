<script setup lang="ts">
import { useI18n } from "@/composables/useI18n";

defineProps<{
  categories: string[];
}>();

const active = defineModel<string>();
const { t } = useI18n();
type I18nKey = Parameters<typeof t>[0];

const categoryKeyMap: Record<string, I18nKey> = {
  all: "kasir_category_all",
  "alat tulis": "kasir_category_writing_tools",
  "writing tools": "kasir_category_writing_tools",
  kesehatan: "kasir_category_health",
  health: "kasir_category_health",
  lainnya: "kasir_category_other",
  other: "kasir_category_other",
  makanan: "kasir_category_food",
  food: "kasir_category_food",
  minuman: "kasir_category_drink",
  drink: "kasir_category_drink",
  sembako: "kasir_category_basic",
};

function getCategoryLabel(category: string) {
  const key = categoryKeyMap[category.trim().toLowerCase()];
  return key ? t(key) : category;
}
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-2">
    <button
      v-for="c in categories"
      :key="c"
      @click="active = c"
      class="px-4 py-2 rounded-full text-foreground border border-border whitespace-nowrap"
      :class="active === c ? 'bg-accent/70 text-white' : 'bg-surface'"
    >
      {{ getCategoryLabel(c) }}
    </button>
  </div>
</template>
