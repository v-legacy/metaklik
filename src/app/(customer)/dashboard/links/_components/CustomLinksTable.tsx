/**
 * @file CustomLinksTable.tsx
 * @description Komponen tabel untuk menampilkan daftar Custom Links milik satu Original Link.
 * Menampilkan Title, Total Clicks, Created At, Status (Switch), dan Action (Sheet Detail).
 * Digunakan di halaman detail `/dashboard/links/[id]`.
 */
'use client';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CustomLinkDetail } from '../types/link-types';
import CustomLinkSheet from './CustomLinkSheet';

interface CustomLinksTableProps {
  /** Array of Custom Link detail data */
  links: CustomLinkDetail[];
}

/**
 * Tabel Custom Links yang menampilkan data per-baris dengan toggle status dan tombol detail.
 *
 * @example
 * <CustomLinksTable links={customLinksData} />
 */
export default function CustomLinksTable({ links }: CustomLinksTableProps) {
  const [linkList, setLinkList] = useState<CustomLinkDetail[]>(links);

  /** Toggle status aktif/inaktif Custom Link (UI only, belum tersimpan ke DB) */
  const handleToggleActive = (id: string, newValue: boolean) => {
    setLinkList((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isActive: newValue } : link
      )
    );
  };

  return (
    <Table>
      <TableCaption>Daftar Custom Links untuk Original Link ini.</TableCaption>
      <TableHeader className='bg-blue-950'>
        <TableRow>
          <TableHead className='w-[60px] text-white font-bold'>#</TableHead>
          <TableHead className='text-white font-bold'>Title</TableHead>
          <TableHead className='text-white font-bold text-center'>Total Clicks</TableHead>
          <TableHead className='text-white font-bold'>Created At</TableHead>
          <TableHead className='text-white font-bold'>Status</TableHead>
          <TableHead className='text-white font-bold text-center'>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {linkList.map((link, index) => (
          <TableRow key={link.id} className='hover:bg-muted/50 transition-colors'>
            <TableCell className='font-medium'>{index + 1}</TableCell>
            <TableCell className='max-w-[250px]'>
              <span className='font-medium text-sm truncate block'>
                {link.title || 'Untitled'}
              </span>
            </TableCell>
            <TableCell className='text-center'>
              <span className='inline-flex items-center justify-center bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'>
                {link.totalClicks}
              </span>
            </TableCell>
            <TableCell className='text-sm text-muted-foreground'>
              {link.createdAt}
            </TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                <Switch
                  id={`is-active-${link.id}`}
                  checked={link.isActive}
                  onCheckedChange={(checked) => {
                    handleToggleActive(link.id, checked === true);
                  }}
                />
                <Label htmlFor={`is-active-${link.id}`} className='text-xs'>
                  {link.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </TableCell>
            <TableCell className='text-center'>
              <CustomLinkSheet link={link} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
