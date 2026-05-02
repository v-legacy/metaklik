import { ChartActivity } from './_components/ChartActivity';
import { Referrer } from './_components/Referrer';
import { TopPerformingLink } from './_components/TopPerformingLink';
import { TopCountries } from './_components/TopCountries';
import { KPICards } from './_components/KPICards';

import { getDashboardStats } from './actions/get-dashboard-stats';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className='flex flex-col gap-6'>
      <div className='w-full'>
        <KPICards 
          totalClicks={stats.totalClicksCount} 
          activeLinks={stats.activeLinksCount} 
          totalLinks={stats.totalLinksCount} 
        />
      </div>

      <div className='w-full'>
        <ChartActivity data={stats.activityData} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Referrer data={stats.topReferrers} />
        <TopPerformingLink data={stats.topLinks} />
        <TopCountries data={stats.topCountries} />
      </div>
    </div>
  );
}
