
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("card-stats", className)}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs flex items-center mt-1",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span className={cn("inline-block", trend.isPositive ? "rotate-0" : "rotate-180")}>↑</span>
              <span className="ml-1">{trend.value}% desde o mês passado</span>
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="bg-primary/10 rounded-full p-2 h-10 w-10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
