import { ChartActivity } from './_components/ChartActivity';
import { LinkActive } from './_components/LinkActive';
import { Referrer } from './_components/Referrer';
import { TopPerformingLink } from './_components/TopPerformingLink';

export default function DashboardPage() {
  return (
    <>
      <div className='lg:grid lg:auto-rows-min gap-2 lg:grid-cols-3'>
        <div className='aspect-video rounded-xl bg-muted/50 w-full p-4'>
          <Referrer />
        </div>
        <div className='aspect-video rounded-xl bg-muted/50 p-4'>
          <TopPerformingLink />
        </div>
        <div className='aspect-video rounded-xl bg-muted/50 p-4'>
          <LinkActive />
        </div>
      </div>
      <div className='w-full md:flex-1 rounded-xl bg-muted/50 md:min-h-min'>
        <div className='w-full md:flex-1 p-4 rounded-lg'>
          <ChartActivity />
        </div>
      </div>
    </>
  );
}
