import { API_BASE_URL } from "@/config/api";

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export async function getCategories(): Promise<Category[]> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/categories`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Gagal memuat kategori.");
  }
  return response.json();
}
