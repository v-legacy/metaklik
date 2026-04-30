/**
 * @file LinkTableData.tsx
 * @description Async Server Component yang mengambil data Original Links dari database.
 * Dibungkus oleh <Suspense> di page.tsx untuk menampilkan skeleton saat loading.
 */
import TableLinks from './TableLInks';
import { getOriginalLinks } from '../actions/get-links';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';

export default async function LinkTableData() {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    redirect('/signin');
  }

  const linksData = await getOriginalLinks();

  if (linksData.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
        <p className='text-lg font-medium'>Belum ada link.</p>
        <p className='text-sm'>Klik tombol &quot;Create&quot; untuk membuat link pertama Anda.</p>
      </div>
    );
  }

  return <TableLinks links={linksData} />;
}
