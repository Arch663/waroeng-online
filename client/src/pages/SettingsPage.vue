<script setup lang="ts">
import { computed } from "vue";
import PageTitle from "@/components/ui/PageTitle.vue";
import { useTheme } from "@/composables/useTheme";
import { useLanguage } from "@/composables/useLanguage";
import { useAuthStore } from "@/stores/useAuthStore";

const { isDark } = useTheme();
const { language } = useLanguage();
const auth = useAuthStore();

const text = computed(() =>
  language.value === "id"
    ? {
        title: "Pengaturan",
        highlight: "Akun",
        subtitle: "Atur preferensi tampilan dan bahasa",
        profile: "Profil Pengguna",
        theme: "Tema Aplikasi",
        language: "Bahasa",
        dark: "Gelap",
        light: "Terang",
      }
    : {
        title: "Settings",
        highlight: "Account",
        subtitle: "Manage your theme and language preferences",
        profile: "User Profile",
        theme: "Application Theme",
        language: "Language",
        dark: "Dark",
        light: "Light",
      },
);
</script>

<template>
  <div class="space-y-6 pb-12 px-2 md:px-0">
    <PageTitle
      :title="text.title"
      :highlight="text.highlight"
      :subtitle="text.subtitle"
    />

    <section class="bg-surface border border-border rounded-2xl p-5 md:p-6">
      <p class="text-sm text-muted mb-3">{{ text.profile }}</p>
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-foreground/10 border border-foreground/10 flex items-center justify-center text-sm font-semibold">
          {{ auth.user?.full_name?.charAt(0) || "U" }}
        </div>
        <div>
          <p class="text-sm font-semibold">{{ auth.user?.full_name || "-" }}</p>
          <p class="text-xs text-muted">{{ auth.user?.role || "-" }}</p>
        </div>
      </div>
    </section>

    <section class="bg-surface border border-border rounded-2xl p-5 md:p-6">
      <p class="text-sm text-muted mb-3">{{ text.theme }}</p>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-lg text-sm border transition-colors"
          :class="!isDark ? 'bg-accent text-background border-accent' : 'border-border hover:bg-background/60'"
          @click="isDark = false"
        >
          {{ text.light }}
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm border transition-colors"
          :class="isDark ? 'bg-accent text-background border-accent' : 'border-border hover:bg-background/60'"
          @click="isDark = true"
        >
          {{ text.dark }}
        </button>
      </div>
    </section>

    <section class="bg-surface border border-border rounded-2xl p-5 md:p-6">
      <p class="text-sm text-muted mb-3">{{ text.language }}</p>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-lg text-sm border transition-colors"
          :class="language === 'id' ? 'bg-accent text-background border-accent' : 'border-border hover:bg-background/60'"
          @click="language = 'id'"
        >
          Indonesia
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm border transition-colors"
          :class="language === 'en' ? 'bg-accent text-background border-accent' : 'border-border hover:bg-background/60'"
          @click="language = 'en'"
        >
          English
        </button>
      </div>
    </section>
  </div>
</template>

