import type { Alarm, AlarmSeverity } from '@/interfaces/alarm';

export const severityLabels: Record<AlarmSeverity, string> = {
  critical: 'Crítica',
  major: 'Mayor',
  minor: 'Menor',
  warning: 'Advertencia',
  indeterminate: 'Indeterminada',
};

export const severityVariants = {
  critical: 'danger',
  major: 'warning',
  minor: 'secondary',
  warning: 'secondary',
  indeterminate: 'outline',
} as const;

export const isActive = (alarm: Alarm) => alarm.status.startsWith('active');
export const isUnack = (alarm: Alarm) => alarm.status.endsWith('-unack');
