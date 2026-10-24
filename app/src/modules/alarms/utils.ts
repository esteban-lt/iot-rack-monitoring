import type { Alarm, AlarmSeverity, AlarmType } from '@/interfaces/alarm';

export const typeLabels: Record<AlarmType, string> = {
  'high-tilt': 'Inclinación alta',
  'critical-tilt': 'Inclinación crítica',
  impact: 'Impacto detectado',
  offline: 'Nodo sin conexión',
};

export const typeUnits: Record<AlarmType, string> = {
  'high-tilt': '°',
  'critical-tilt': '°',
  impact: ' g',
  offline: '',
};

export const severityLabels: Record<AlarmSeverity, string> = {
  warning: 'Advertencia',
  major: 'Mayor',
  critical: 'Crítica',
};

export const severityVariants = {
  warning: 'secondary',
  major: 'warning',
  critical: 'danger',
} as const;

export const isActive = (alarm: Alarm) => alarm.status.startsWith('active');
export const isUnack = (alarm: Alarm) => alarm.status.endsWith('-unack');
