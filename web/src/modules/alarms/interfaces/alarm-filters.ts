import type { DateRange } from 'react-day-picker';
import type { AlarmSeverity } from '@/interfaces/alarm';

export interface AlarmFilters {
  severity: AlarmSeverity | 'all';
  status: 'all' | 'active' | 'unack' | 'cleared';
  nodeId: string;
  dateRange?: DateRange;
}
