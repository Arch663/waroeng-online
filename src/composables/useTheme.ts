import { ref, watchEffect } from "vue";

const isDark = ref(true);

export function useTheme() {
  watchEffect(() => {
    document.documentElement.classList.toggle("dark", isDark.value);
  });

  return { isDark };
}
