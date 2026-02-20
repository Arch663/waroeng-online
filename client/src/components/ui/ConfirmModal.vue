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
      return "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30";
    case "warning":
      return "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30";
    default:
      return "bg-accent hover:bg-accent/90 text-background";
  }
});
</script>

<template>
  <Transition name="modal">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-center justify-center p-6 bg-background/60 backdrop-blur-md"
      @click.self="emit('cancel')"
    >
      <div
        class="bg-surface/30 backdrop-blur-3xl border border-glass-border rounded-4xl max-w-md w-full p-10 space-y-8 relative overflow-hidden transition-all duration-300 scale-100"
      >
        <!-- Decorative bar -->
        <div 
          class="absolute top-0 left-0 w-2 h-full"
          :class="variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-orange-500' : 'bg-accent'"
        ></div>

        <div class="space-y-4">
          <div class="flex flex-col">
            <span class="text-xs font-black text-accent tracking-widest uppercase mb-2">Decision_Required</span>
            <h3 class="text-3xl font-black text-foreground uppercase tracking-tighter leading-none">
              {{ title || "Confirm" }}
            </h3>
          </div>
          <p class="text-sm font-bold text-muted uppercase tracking-widest leading-loose opacity-70">
            {{ message || "Please confirm the execution of this protocol to proceed with the operation." }}
          </p>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            @click="emit('cancel')"
            class="flex-1 py-4 text-xs font-black uppercase tracking-widest border border-glass-border rounded-xl hover:bg-muted/10 transition-all text-foreground"
          >
            {{ cancelText || "Abort" }}
          </button>
          <button
            @click="emit('confirm')"
            :class="[
              variantClasses,
              'flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95',
            ]"
          >
            {{ confirmText || "Execute" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

</style>


