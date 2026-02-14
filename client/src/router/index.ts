import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

import Dashboard from "@/pages/DashboardPage.vue";
import Kasir from "@/pages/KasirPage.vue";
import Inventory from "@/pages/InventoryPage.vue";
import Supplier from "@/pages/SupplierPage.vue";
import Purchase from "@/pages/PurchasePage.vue";
import Reports from "@/pages/ReportsPage.vue";
import Login from "@/pages/LoginPage.vue";
import Register from "@/pages/RegisterPage.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { public: true },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { public: true },
  },
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: { roles: ["admin", "manager"] },
  },
  {
    path: "/kasir",
    name: "kasir",
    component: Kasir,
    meta: { roles: ["admin", "cashier"] },
  },
  {
    path: "/inventory",
    name: "inventory",
    component: Inventory,
    meta: { roles: ["admin", "manager"] },
  },
  {
    path: "/suppliers",
    name: "suppliers",
    component: Supplier,
    meta: { roles: ["admin", "manager"] },
  },
  {
    path: "/purchases",
    name: "purchases",
    component: Purchase,
    meta: { roles: ["admin", "manager"] },
  },
  {
    path: "/reports",
    name: "reports",
    component: Reports,
    meta: { roles: ["admin", "manager"] },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

let isInitialLoad = true;

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const auth = useAuthStore();

    // On initial load, try to fetch current user if token exists
    if (isInitialLoad && auth.token) {
      await auth.fetchMe();
      isInitialLoad = false;
    }

    // Handle public routes
    if (to.meta.public) {
      if (auth.isAuthenticated) {
        return next({ name: "dashboard" });
      }
      return next();
    }

    // Protected routes
    if (!auth.isAuthenticated) {
      return next({ name: "login" });
    }

    // Role checking
    const allowedRoles = to.meta.roles as string[];
    if (allowedRoles && !allowedRoles.includes(auth.user?.role || "")) {
      // Redirect based on role if unauthorized for this page
      if (auth.user?.role === "cashier") {
        return next({ name: "kasir" });
      }
      // Default fallback
      return next({ name: "login" });
    }

    next();
  },
);
