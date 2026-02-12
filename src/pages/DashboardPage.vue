<script setup lang="ts">
import StatGrid from "@/components/dashboard/StatGrid.vue";
import SalesChart from "@/components/dashboard/SalesChart.vue";
import LowStockList from "@/components/dashboard/LowStockList.vue";
import RecentTransaction from "@/components/dashboard/RecentTransaction.vue";
import TopProduct from "@/components/dashboard/TopProduct.vue";
</script>

<template>
  <div class="space-y-5">
    <div class="px-4 md:px-6 pt-3">
      <h1 class="text-xl font-semibold">Dashboard</h1>
    </div>
    <StatGrid />
    <div class="grid gap-6 px-4 md:px-6 lg:grid-cols-4">
      <SalesChart class="md:col-span-3"/>
      <div class="space-y-5">
        <LowStockList />
        <RecentTransaction />
      </div>
      <TopProduct class="md:row-start-2 md:col-span-2"/>
      <TopProduct class="md:row-start-2 md:col-span-2"/>
      <div>
      </div>
    </div>
  </div>
</template>
