import type { EntityID } from './entity-id';

export interface GetEntitiesQueryResponse {
  data:          EntityData[];
  totalPages:    number;
  totalElements: number;
  hasNext:       boolean;
}

export interface EntityData {
  entityId: EntityID;
  latest:   Record<string, Record<string, LatestValue>>;
}

export interface LatestValue {
  ts:    number;
  value: string;
}
