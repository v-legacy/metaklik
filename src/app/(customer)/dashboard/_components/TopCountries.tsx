'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function TopCountries({ data = [] }: { data?: { country: string; clicks: number }[] }) {
  const chartData = data.map((item, index) => ({
    id: `item${index}`,
    visitors: item.clicks,
    fill: `var(--color-item${index})`,
  }));

  const chartConfig = {
    visitors: { label: 'Clicks' },
    ...data.reduce((acc, item, index) => ({
      ...acc,
      [`item${index}`]: {
        label: item.country.length > 25 ? item.country.substring(0, 25) + '...' : item.country,
        color: `var(--chart-${(index % 5) + 1})`,
      },
    }), {}),
  } satisfies ChartConfig;

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>
        <CardDescription>Negara asal pengunjung</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 w-full'>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Belum ada data
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout='vertical'
              margin={{
                left: 60,
              }}
            >
              <YAxis
                dataKey='id'
                type='category'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
              <XAxis dataKey='visitors' type='number' hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey='visitors' layout='vertical' radius={5} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
