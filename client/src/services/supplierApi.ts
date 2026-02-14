import { API_BASE_URL } from "@/config/api";

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  address?: string;
}

export async function getSuppliers(params?: {
  sortBy?: string;
  order?: "ASC" | "DESC";
}): Promise<Supplier[]> {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams();
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.order) query.append("order", params.order);
  const res = await fetch(
    `${API_BASE_URL}/suppliers${query.toString() ? "?" + query.toString() : ""}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error("Gagal memuat supplier.");
  return res.json();
}

export async function createSupplier(
  payload: Omit<Supplier, "id">,
): Promise<Supplier> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menambah supplier.");
  return res.json();
}

export async function updateSupplier(
  id: number,
  payload: Omit<Supplier, "id">,
): Promise<Supplier> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal memperbarui supplier.");
  return res.json();
}

export async function deleteSupplier(id: number): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal menghapus supplier.");
}
