/**
 * @file TableLinksSkeleton.tsx
 * @description Komponen skeleton loading yang menyerupai tabel Original Links.
 * Digunakan sebagai fallback oleh <Suspense> saat data sedang dimuat.
 */
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TableLinksSkeleton() {
  const rows = [
    { titleW: 'w-40', urlW: 'w-56', domainW: 'w-20', dateW: 'w-24' },
    { titleW: 'w-48', urlW: 'w-52', domainW: 'w-24', dateW: 'w-24' },
    { titleW: 'w-36', urlW: 'w-60', domainW: 'w-16', dateW: 'w-24' },
    { titleW: 'w-44', urlW: 'w-48', domainW: 'w-28', dateW: 'w-24' },
    { titleW: 'w-40', urlW: 'w-56', domainW: 'w-20', dateW: 'w-24' },
  ];

  return (
    <Table>
      <TableCaption>
        <Skeleton className='h-4 w-40 mx-auto' />
      </TableCaption>
      <TableHeader className='bg-blue-950'>
        <TableRow>
          <TableHead className='w-[60px] text-white font-bold'>#</TableHead>
          <TableHead className='text-white font-bold'>Title / URL</TableHead>
          <TableHead className='text-white font-bold'>Domain</TableHead>
          <TableHead className='text-white font-bold text-center'>Custom Links</TableHead>
          <TableHead className='text-white font-bold'>Created At</TableHead>
          <TableHead className='text-white font-bold text-center'>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow
            key={index}
            className='animate-pulse'
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <TableCell>
              <Skeleton className='h-4 w-4 rounded' />
            </TableCell>
            <TableCell>
              <div className='flex flex-col gap-1'>
                <Skeleton className={`h-4 ${row.titleW} rounded`} />
                <Skeleton className={`h-3 ${row.urlW} rounded`} />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className={`h-4 ${row.domainW} rounded`} />
            </TableCell>
            <TableCell className='text-center'>
              <Skeleton className='h-5 w-8 rounded-full mx-auto' />
            </TableCell>
            <TableCell>
              <Skeleton className={`h-4 ${row.dateW} rounded`} />
            </TableCell>
            <TableCell className='text-center'>
              <Skeleton className='h-8 w-8 rounded mx-auto' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
