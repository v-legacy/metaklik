/**
 * @file TableLinks.tsx
 * @description Komponen tabel untuk menampilkan daftar Original Links.
 * Menampilkan URL, Domain, Jumlah Custom Links, Created At, dan tombol Action (Detail).
 * Digunakan di halaman utama `/dashboard/links`.
 */
'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OriginalLinkItem } from '../types/link-types';

interface TableLinksProps {
  links: OriginalLinkItem[];
}

export default function TableLinks({ links }: TableLinksProps) {
  const router = useRouter();

  return (
    <Table>
      <TableCaption>Daftar Original Links Anda.</TableCaption>
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
        {links.map((link, index) => (
          <TableRow key={link.id} className='hover:bg-muted/50 transition-colors'>
            <TableCell className='font-medium'>{index + 1}</TableCell>
            <TableCell className='max-w-[300px]'>
              <div className='flex flex-col gap-0.5'>
                <span className='font-medium text-sm truncate'>
                  {link.title || 'Untitled'}
                </span>
                <span className='text-xs text-muted-foreground truncate'>
                  {link.url}
                </span>
              </div>
            </TableCell>
            <TableCell className='text-sm'>{link.domain || '-'}</TableCell>
            <TableCell className='text-center'>
              <span className='inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'>
                {link.totalCustomLinks}
              </span>
            </TableCell>
            <TableCell className='text-sm text-muted-foreground'>
              {link.createdAt}
            </TableCell>
            <TableCell className='text-center'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 hover:bg-blue-100 hover:text-blue-800 transition-colors'
                onClick={() => router.push(`/dashboard/links/${link.id}`)}
                title='Lihat Detail'
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
