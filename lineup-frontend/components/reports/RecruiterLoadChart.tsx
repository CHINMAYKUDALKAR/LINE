import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RecruiterLoadData } from '@/types/reports';
import { Skeleton } from '@/components/ui/skeleton';

interface RecruiterLoadChartProps {
  data: RecruiterLoadData[];
  isLoading?: boolean;
}

export function RecruiterLoadChart({ data, isLoading }: RecruiterLoadChartProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <Skeleton className="h-5 w-44 mb-4" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Interview Load by Recruiter</h3>
        <span className="text-xs text-muted-foreground">Total interviews</span>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="recruiter"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              stackId="a"
              maxBarSize={40}
            />
            <Bar
              dataKey="pending"
              name="Pending"
              fill="hsl(var(--primary) / 0.4)"
              radius={[4, 4, 0, 0]}
              stackId="a"
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
