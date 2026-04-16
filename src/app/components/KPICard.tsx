import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subtitle?: string;
}

export function KPICard({ title, value, icon: Icon, color, bgColor, subtitle }: KPICardProps) {
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-3 rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`${bgColor} p-2 rounded-lg`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-semibold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
