import { createRouter, createWebHistory } from "vue-router";

import Dashboard from "@/pages/DashboardPage.vue";
import Kasir from "@/pages/KasirPage.vue";
import Inventory from "@/pages/InventoryPage.vue";
// import Laporan from "@/pages/LaporanPage.vue";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
  },
  {
    path: "/kasir",
    name: "kasir",
    component: Kasir,
  },
  {
    path: "/inventory",
    name: "inventory",
    component: Inventory,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
