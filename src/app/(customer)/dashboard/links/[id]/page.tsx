/**
 * @file page.tsx (Detail Original Link)
 * @description Halaman detail yang menampilkan info Original Link dan daftar Custom Links-nya.
 * Route: /dashboard/links/[id]
 */
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomLinks } from '../actions/get-custom-links';
import CustomLinksTable from '../_components/CustomLinksTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Calendar, LinkIcon } from 'lucide-react';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const result = await getCustomLinks(id);

  if (!result) {
    notFound();
  }

  const { originalLink, customLinks } = result;

  return (
    <div className='min-h-screen flex-1 rounded-xl bg-white md:min-h-min p-4 shadow-md'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-4'>
        <Link href='/dashboard/links'>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <div>
          <h2 className='text-2xl font-bold'>Detail Original Link</h2>
          <p className='text-sm text-muted-foreground'>
            Daftar Custom Links yang dibuat dari link ini.
          </p>
        </div>
      </div>

      {/* Original Link Info Card */}
      <div className='bg-muted/30 border rounded-lg p-4 mb-6'>
        <div className='flex flex-col gap-2'>
          <h3 className='font-semibold text-lg'>
            {originalLink.title || 'Untitled'}
          </h3>
          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5'>
              <Globe className='h-3.5 w-3.5' />
              {originalLink.domain || '-'}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <LinkIcon className='h-3.5 w-3.5' />
              {originalLink.totalCustomLinks} custom link(s)
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='h-3.5 w-3.5' />
              {originalLink.createdAt}
            </span>
          </div>
          <p className='text-xs text-muted-foreground break-all mt-1'>
            {originalLink.url}
          </p>
        </div>
      </div>

      {/* Custom Links Table */}
      {customLinks.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
          <p className='text-lg font-medium'>Belum ada custom link.</p>
          <p className='text-sm'>
            Buat custom link dari halaman{' '}
            <Link href='/dashboard/links/create' className='text-blue-600 hover:underline'>
              Create
            </Link>.
          </p>
        </div>
      ) : (
        <CustomLinksTable links={customLinks} />
      )}
    </div>
  );
}
