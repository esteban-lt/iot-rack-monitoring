import { useEffect } from 'react';
import { hashKey, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { mergeLatestValues, RACK_LINK_QUERIES, rackTagChanged } from '@/app/racks/actions/apply-live-values-action';
import { rackSocket } from '@/app/racks/api/rack-socket';
import type { NodeSummary } from '@/interfaces/node-summary';
import type { EntityData } from '@/services/api/interfaces/get-entities-query-response';
import { applyLiveNodeValuesAction } from '../actions/apply-live-node-values-action';

export const useLiveNodes = (queryKey: QueryKey, nodeIds: string[]) => {
  const queryClient = useQueryClient();
  const queryHash = hashKey(queryKey);
  const nodeIdsKey = nodeIds.join(',');

  useEffect(() => {
    if (!nodeIdsKey) return;

    const latestByNodeId = new Map<string, EntityData['latest']>();

    return rackSocket.subscribeToNodes(nodeIdsKey.split(','), (nodes) => {
      let rackLinksChanged = false;

      nodes.forEach(({ entityId, latest }) => {
        const previous = latestByNodeId.get(entityId.id);
        const merged = mergeLatestValues(previous, latest);
        if (rackTagChanged(previous, merged)) rackLinksChanged = true;
        latestByNodeId.set(entityId.id, merged);
      });

      if (rackLinksChanged) {
        RACK_LINK_QUERIES.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
        return;
      }

      queryClient.setQueryData<NodeSummary[]>(JSON.parse(queryHash), (cached) =>
        cached?.map((summary) => {
          const latest = latestByNodeId.get(summary.node.id);
          return latest ? applyLiveNodeValuesAction(summary, latest) : summary;
        }),
      );
    });
  }, [queryClient, queryHash, nodeIdsKey]);
}
