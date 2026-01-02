import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { CSSProperties } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  className?: string;
  style?: CSSProperties;
}

export const StatsCard = ({ title, value, change, icon: Icon, className, style }: StatsCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        "relative bg-transparent p-6 transition-all duration-300",
        className
      )}
      style={style}
    >
      <div className="relative flex flex-col items-center justify-center text-center space-y-3 h-full">
        {/* Icon at top */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        
        {/* Title in middle */}
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        
        {/* Count at bottom */}
        <p className="text-3xl font-display font-bold text-foreground tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;