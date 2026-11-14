import type { RackStatus } from '@/interfaces/rack-summary';
import type { Thresholds } from '@/interfaces/thresholds';
import { statusColors } from '@/lib/rack-status';
import { cn } from '@/lib/utils';

interface Props {
  tilt: number;
  status: RackStatus;
  thresholds: Thresholds;
}

// The bar ends a bit past the alarm threshold, so both marks always fit
export const TiltGauge = ({ tilt, status, thresholds }: Props) => {
  const { tiltWarnDeg, tiltAlarmDeg } = thresholds;
  const percent = (degrees: number) => `${Math.min(degrees / (tiltAlarmDeg * 1.5), 1) * 100}%`;

  return (
    <div className="grid gap-1">
      <div className="relative h-2 rounded-full bg-muted">
        <div className={cn('h-full rounded-full', statusColors[status])} style={{ width: percent(tilt) }} />
        {[tiltWarnDeg, tiltAlarmDeg].map((degrees) => (
          <span key={degrees} className="absolute -top-0.5 h-3 w-0.5 bg-foreground/40" style={{ left: percent(degrees) }} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Advertencia {tiltWarnDeg}° · Alarma {tiltAlarmDeg}°</p>
    </div>
  );
}
