import { ref } from "vue";
import breadImage from "@/assets/bread.svg";
import coffeeImage from "@/assets/coffee.svg";
import milkImage from "@/assets/milk.svg";
import noodlesImage from "@/assets/noodles.svg";
import riceImage from "@/assets/rice.svg";
import sardenImage from "@/assets/sarden.svg";
import soapImage from "@/assets/soap.svg";
import sugarImage from "@/assets/sugar.svg";
import teaImage from "@/assets/tea.svg";
import toothpasteImage from "@/assets/toothpaste.svg";
import waterImage from "@/assets/water.svg";
import minyakGorengImage from "@/assets/minyak-goreng.svg";

export const products = ref([
  {
    id: 1,
    sku: "BRG-001",
    name: "Beras 5kg",
    price: 65000,
    category: "Sembako",
    image: riceImage,
  },
  {
    id: 2,
    sku: "BRG-002",
    name: "Minyak Goreng 2L",
    price: 38000,
    category: "Sembako",
    image: minyakGorengImage,
  },
  {
    id: 3,
    sku: "BRG-003",
    name: "Gula Pasir 1kg",
    price: 14500,
    category: "Sembako",
    image: sugarImage,
  },
  {
    id: 4,
    sku: "BRG-004",
    name: "Mie Instan",
    price: 3500,
    category: "Makanan",
    image: noodlesImage,
  },
  {
    id: 5,
    sku: "BRG-005",
    name: "Sarden",
    price: 12000,
    category: "Makanan",
    image: sardenImage,
  },
  {
    id: 6,
    sku: "BRG-006",
    name: "Es Teh",
    price: 5000,
    category: "Minuman",
    image: teaImage,
  },
  {
    id: 7,
    sku: "BRG-007",
    name: "Air Mineral",
    price: 4000,
    category: "Minuman",
    image: waterImage,
  },
  {
    id: 8,
    sku: "BRG-008",
    name: "Kopi",
    price: 18000,
    category: "Minuman",
    image: coffeeImage,
  },
  {
    id: 9,
    sku: "BRG-009",
    name: "Sabun",
    price: 4500,
    category: "Kebutuhan Rumah",
    image: soapImage,
  },
  {
    id: 10,
    sku: "BRG-010",
    name: "Pasta Gigi",
    price: 9500,
    category: "Kebutuhan Rumah",
    image: toothpasteImage,
  },
  {
    id: 11,
    sku: "BRG-011",
    name: "Susu",
    price: 18000,
    category: "Minuman",
    image: milkImage,
  },
  {
    id: 12,
    sku: "BRG-012",
    name: "Roti Tawar",
    price: 15000,
    category: "Makanan",
    image: breadImage,
  },
]);
