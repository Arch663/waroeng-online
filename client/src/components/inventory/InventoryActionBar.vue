<script setup lang="ts">
import PageTitle from "@/components/ui/PageTitle.vue";
import PageActionButton from "@/components/ui/PageActionButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import { useI18n } from "@/composables/useI18n";

defineProps<{
  searchQuery: string;
}>();

defineEmits(["add", "search"]);

const { t } = useI18n();
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      :title="t('inventory_title')"
      :highlight="t('inventory_highlight')"
      :subtitle="t('inventory_subtitle')"
    >
      <template #action>
        <PageActionButton :label="t('inventory_add')" @click="$emit('add')" />
      </template>
    </PageTitle>

    <SearchBar
      :model-value="searchQuery"
      :placeholder="t('inventory_search')"
      @update:model-value="$emit('search', $event)"
    />
  </div>
</template>
