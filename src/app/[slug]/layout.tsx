/**
 * @file layout.tsx
 * @description Minimal layout untuk halaman publik shortlink.
 * Tidak menyertakan sidebar, navbar, atau komponen dashboard.
 * Hanya wrapper sederhana agar halaman shortlink tampil bersih.
 */
export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
