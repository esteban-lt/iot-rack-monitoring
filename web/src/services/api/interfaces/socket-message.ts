import type { EntityData } from './get-entities-query-response';

export interface SocketMessage {
  cmdId:     number;
  data?:     { data: EntityData[] } | null;
  update?:   EntityData[] | null;
  count?:    number;
  errorCode: number;
  errorMsg:  string | null;
}

export interface SocketCommand {
  type: string;
  [key: string]: unknown;
}
