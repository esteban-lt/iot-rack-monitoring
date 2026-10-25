import * as z from 'zod';

export const THRESHOLD_LIMITS = {
  tiltMinDeg: 1,
  tiltMaxDeg: 90,
  tiltMinGapDeg: 1,
  impactMinG: 1.5,
  impactMaxG: 4,
};

const requiredNumber = { error: 'Ingresa un número' };

export const thresholdsSchema = z
  .object({
    tiltWarnDeg: z
      .number(requiredNumber)
      .min(THRESHOLD_LIMITS.tiltMinDeg, `Mínimo ${THRESHOLD_LIMITS.tiltMinDeg}°`)
      .max(THRESHOLD_LIMITS.tiltMaxDeg, `Máximo ${THRESHOLD_LIMITS.tiltMaxDeg}°`),
    tiltAlarmDeg: z
      .number(requiredNumber)
      .min(THRESHOLD_LIMITS.tiltMinDeg, `Mínimo ${THRESHOLD_LIMITS.tiltMinDeg}°`)
      .max(THRESHOLD_LIMITS.tiltMaxDeg, `Máximo ${THRESHOLD_LIMITS.tiltMaxDeg}°`),
    impactG: z
      .number(requiredNumber)
      .min(THRESHOLD_LIMITS.impactMinG, `Mínimo ${THRESHOLD_LIMITS.impactMinG} g`)
      .max(THRESHOLD_LIMITS.impactMaxG, `Máximo ${THRESHOLD_LIMITS.impactMaxG} g`),
  })
  .refine(({ tiltWarnDeg, tiltAlarmDeg }) => tiltAlarmDeg - tiltWarnDeg >= THRESHOLD_LIMITS.tiltMinGapDeg, {
    path: ['tiltAlarmDeg'],
    error: `La alarma debe superar a la advertencia por al menos ${THRESHOLD_LIMITS.tiltMinGapDeg}°`,
  });
