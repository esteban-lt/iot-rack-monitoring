export type CalibrationStatus = 'none' | 'scheduled' | 'running' | 'ok' | 'failed';

export interface NodeControl {
  buzzerEnabled: boolean;
  calibrated: boolean;
  calibrationStatus: CalibrationStatus;
  calibratedAt?: number;
}
