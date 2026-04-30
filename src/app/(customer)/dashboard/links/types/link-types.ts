/**
 * @file link-types.ts
 * @description Tipe data terpusat untuk fitur Links.
 * Digunakan di seluruh komponen (tabel, detail, sheet) agar konsisten dan reusable.
 */

/** Tipe untuk menampilkan Original Link di tabel utama `/dashboard/links` */
export type OriginalLinkItem = {
  id: string;
  url: string;
  domain: string | null;
  title: string | null;
  image: string | null;
  totalCustomLinks: number;
  createdAt: string; // format: YYYY/MM/DD
};

/** Tipe untuk menampilkan Custom Link di tabel detail `/dashboard/links/[id]` */
export type CustomLinkItem = {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  image: string | null;
  totalClicks: number;
  isActive: boolean;
  createdAt: string; // format: YYYY/MM/DD
  generateUrl: string;
};

/** Tipe untuk detail lengkap Custom Link (Sheet) */
export type CustomLinkDetail = CustomLinkItem & {
  originalUrl: string;
  originalDomain: string | null;
  updatedAt: string;
};
