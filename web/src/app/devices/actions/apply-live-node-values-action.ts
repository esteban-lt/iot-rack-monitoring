import type { NodeSummary } from '@/interfaces/node-summary';
import type { EntityData } from '@/services/api/interfaces/get-entities-query-response';
import { toTelemetrySample } from './get-latest-telemetry-sample-action';

export const applyLiveNodeValuesAction = (summary: NodeSummary, latest: EntityData['latest']): NodeSummary => {
  const active = latest.ATTRIBUTE?.active?.value;
  const isActive = active === undefined ? summary.node.isActive : active === 'true';
  const telemetry = Object.fromEntries(Object.entries(latest.TIME_SERIES ?? {}).map(([key, value]) => [key, [value]]));

  return {
    node: { ...summary.node, isActive },
    latest: isActive ? toTelemetrySample(telemetry) ?? summary.latest : undefined,
  };
}
