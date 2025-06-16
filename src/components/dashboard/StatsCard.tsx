import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
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
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  loading = false,
}) => {
  return (
    <Card className={cn("card-stats", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-24 animate-pulse bg-muted rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1">{value}</p>
            )}
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
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        {!loading && (
          <div className="flex items-center mt-4">
            {trend.isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ml-1 ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.value}%
            </span>
            <span className="text-sm text-muted-foreground ml-1">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
