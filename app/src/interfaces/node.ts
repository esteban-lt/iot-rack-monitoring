export interface Node {
  id: string;
  name: string;
  mac: string;
  ip: string;
  firmwareVersion: string;
  isActive: boolean;
  lastActivityTs?: number;
  rackId?: string;
}
