import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointerClick, Link as LinkIcon, Activity } from 'lucide-react';

export function KPICards({
  totalClicks,
  activeLinks,
  totalLinks,
}: {
  totalClicks: number;
  activeLinks: number;
  totalLinks: number;
}) {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Clicks</CardTitle>
          <MousePointerClick className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {totalClicks.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            Total semua klik dari seluruh link
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Links</CardTitle>
          <LinkIcon className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalLinks.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground'>
            Shortlink yang pernah kamu buat
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Links</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {activeLinks.toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            Shortlink yang saat ini aktif
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
