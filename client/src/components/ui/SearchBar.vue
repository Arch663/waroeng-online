<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <div class="relative group">
    <div
      class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-accent"
    >
      <svg
        class="w-5 h-5 opacity-40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full bg-surface border border-border/50 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder:text-muted/30 placeholder:font-black placeholder:text-xs placeholder:tracking-widest"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

