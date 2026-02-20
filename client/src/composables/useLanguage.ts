import { ref, watch } from "vue";

export type AppLanguage = "id" | "en";

const storageKey = "app_language";
const initial = (localStorage.getItem(storageKey) as AppLanguage | null) ?? "id";
const language = ref<AppLanguage>(initial === "en" ? "en" : "id");

watch(
  language,
  (value) => {
    localStorage.setItem(storageKey, value);
    document.documentElement.lang = value;
  },
  { immediate: true },
);

export function useLanguage() {
  return { language };
}

