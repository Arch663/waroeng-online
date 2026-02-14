<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case "danger":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "warning":
      return "bg-yellow-600 hover:bg-yellow-700 text-white";
    default:
      return "bg-accent hover:bg-accent/90 text-white";
  }
});
</script>

<template>
  <Transition name="modal">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="emit('cancel')"
    >
      <div
        class="bg-surface border border-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-in"
      >
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-foreground">
            {{ title || "Konfirmasi" }}
          </h3>
          <p class="text-sm text-muted">
            {{ message || "Apakah Anda yakin ingin melanjutkan aksi ini?" }}
          </p>
        </div>

        <div class="flex gap-3 justify-end pt-2">
          <button
            @click="emit('cancel')"
            class="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted/10 transition"
          >
            {{ cancelText || "Batal" }}
          </button>
          <button
            @click="emit('confirm')"
            :class="[
              variantClasses,
              'px-4 py-2 text-sm rounded-lg transition font-medium',
            ]"
          >
            {{ confirmText || "Konfirmasi" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
