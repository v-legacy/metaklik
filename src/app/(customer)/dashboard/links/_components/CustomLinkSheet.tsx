/**
 * @file CustomLinkSheet.tsx
 * @description Komponen Sheet (shadcn UI) untuk menampilkan detail lengkap Custom Link.
 * Muncul dari sisi kanan saat tombol detail diklik di tabel Custom Links.
 * Berisi info lengkap Custom Link + tombol Update & Delete (UI only).
 */
'use client';
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileSearch, Pencil, Trash2, ExternalLink, Copy } from 'lucide-react';
import { CustomLinkDetail } from '../types/link-types';

interface CustomLinkSheetProps {
  /** Data detail lengkap Custom Link */
  link: CustomLinkDetail;
}

/**
 * Sheet component yang menampilkan detail lengkap sebuah Custom Link.
 * Trigger-nya berupa tombol ikon `FileSearch`.
 *
 * @example
 * <CustomLinkSheet link={customLinkData} />
 */
export default function CustomLinkSheet({ link }: CustomLinkSheetProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(link.generateUrl);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 hover:bg-blue-100 hover:text-blue-800 transition-colors'
          title='Lihat Detail'
        >
          <FileSearch className='h-4 w-4' />
        </Button>
      </SheetTrigger>

      <SheetContent side='right' className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <SheetTitle className='text-lg'>Detail Custom Link</SheetTitle>
          <SheetDescription>
            Informasi lengkap mengenai custom link ini.
          </SheetDescription>
        </SheetHeader>

        {/* Image Preview */}
        {link.image && (
          <div className='px-4'>
            <div className='w-full h-40 rounded-lg overflow-hidden bg-muted'>
              <img
                src={link.image}
                alt={link.title || 'Link preview'}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        )}

        {/* Detail Fields */}
        <div className='px-4 space-y-4'>
          {/* Title */}
          <DetailField label='Title' value={link.title || 'Untitled'} />

          {/* Description */}
          <DetailField
            label='Description'
            value={link.description || 'Tidak ada deskripsi'}
          />

          <Separator />

          {/* Short URL */}
          <div>
            <p className='text-xs font-medium text-muted-foreground mb-1'>Short URL</p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 text-sm bg-muted px-3 py-2 rounded-md truncate'>
                {link.generateUrl}
              </code>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 shrink-0'
                onClick={handleCopyUrl}
                title='Copy URL'
              >
                <Copy className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>

          {/* Slug */}
          <DetailField label='Slug' value={link.slug} />

          <Separator />

          {/* Original URL */}
          <div>
            <p className='text-xs font-medium text-muted-foreground mb-1'>Original URL</p>
            <a
              href={link.originalUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-blue-600 hover:underline inline-flex items-center gap-1 break-all'
            >
              {link.originalUrl}
              <ExternalLink className='h-3 w-3 shrink-0' />
            </a>
          </div>

          {/* Domain */}
          <DetailField label='Domain' value={link.originalDomain || '-'} />

          <Separator />

          {/* Stats Row */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-1'>Total Clicks</p>
              <p className='text-2xl font-bold text-blue-800'>{link.totalClicks}</p>
            </div>
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-1'>Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  link.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {link.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Dates Row */}
          <div className='grid grid-cols-2 gap-4'>
            <DetailField label='Created At' value={link.createdAt} />
            <DetailField label='Updated At' value={link.updatedAt} />
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className='px-4 pb-4'>
          <div className='flex gap-2 w-full'>
            <Button
              variant='outline'
              className='flex-1 gap-2'
              onClick={() => {}}
            >
              <Pencil className='h-4 w-4' />
              Update
            </Button>
            <Button
              variant='destructive'
              className='flex-1 gap-2'
              onClick={() => {}}
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Komponen helper untuk menampilkan label + value secara konsisten.
 * Reusable di dalam Sheet detail.
 */
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-xs font-medium text-muted-foreground mb-1'>{label}</p>
      <p className='text-sm'>{value}</p>
    </div>
  );
}
