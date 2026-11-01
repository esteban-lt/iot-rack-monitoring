import { useEffect } from 'react';
import { hashKey, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { RackSummary } from '@/interfaces/rack-summary';
import type { EntityData } from '@/services/api/interfaces/get-entities-query-response';
import { applyLiveValuesAction, mergeLatestValues } from '../actions/apply-live-values-action';
import { rackSocket } from '../api/rack-socket';

export const useLiveRacks = (queryKey: QueryKey, nodeIds: string[]) => {
  const queryClient = useQueryClient();
  const queryHash = hashKey(queryKey);
  const nodeIdsKey = nodeIds.join(',');

  useEffect(() => {
    if (!nodeIdsKey) return;

    const latestByNodeId = new Map<string, EntityData['latest']>();

    const applyLiveValues = (summary: RackSummary) => {
      const latest = latestByNodeId.get(summary.rack.nodeId ?? '');
      return latest ? applyLiveValuesAction(summary, latest) : summary;
    };

    return rackSocket.subscribeToNodes(nodeIdsKey.split(','), (nodes) => {
      nodes.forEach(({ entityId, latest }) => {
        latestByNodeId.set(entityId.id, mergeLatestValues(latestByNodeId.get(entityId.id), latest));
      });

      queryClient.setQueryData<RackSummary | RackSummary[]>(JSON.parse(queryHash), (cached) =>
        Array.isArray(cached) ? cached.map(applyLiveValues) : cached && applyLiveValues(cached),
      );
    });
  }, [queryClient, queryHash, nodeIdsKey]);
}
