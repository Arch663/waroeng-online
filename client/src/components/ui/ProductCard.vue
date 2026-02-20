<script setup lang="ts">
import type { Product } from "@/types/product";
import { useI18n } from "@/composables/useI18n";

defineProps<{
  product: Product;
}>();

defineEmits(["add"]);

const { t } = useI18n();
</script>

<template>
  <div
    class="group flex flex-col justify-between bg-surface rounded-2xl w-full p-4 shadow-sm shadow-border transition text-center cursor-pointer hover:shadow-md hover:-translate-y-1"
    :class="
      product.stock <= 0
        ? 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-sm'
        : ''
    "
    @click="product.stock > 0 && $emit('add', product)"
  >
    <div class="flex justify-center">
      <img
        :src="product.image || '/default.svg'"
        :alt="product.name"
        class="w-16 h-16 object-contain"
      />
    </div>

    <div class="mt-3 space-y-1.5">
      <h3 class="text-foreground text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
        {{ product.name }}
      </h3>

      <p class="text-accent font-bold whitespace-nowrap">
        Rp
        {{
          Number(product.price).toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        }}
      </p>

      <p class="text-xs text-muted">{{ t('common_stock') }}: {{ product.stock }}</p>
    </div>
  </div>
</template>


