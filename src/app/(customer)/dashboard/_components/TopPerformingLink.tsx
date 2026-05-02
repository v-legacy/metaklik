'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'A mixed bar chart';

export function TopPerformingLink({ data = [] }: { data?: { title: string; clicks: number }[] }) {
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
        label: item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title,
        color: `var(--chart-${(index % 5) + 1})`,
      },
    }), {}),
  } satisfies ChartConfig;

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader>
        <CardTitle>Top Performing Links</CardTitle>
        <CardDescription>Dari platform sosial media</CardDescription>
      </CardHeader>
      <CardContent>
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
