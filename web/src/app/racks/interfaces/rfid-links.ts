export interface LinkedEntity {
  id: string;
  name: string;
}

export interface DetectedTag {
  uid: string;
  nodeName: string;
  ts: number;
}

export interface RfidLinks {
  nodeByRackId: Record<string, LinkedEntity>;
  rackByNodeId: Record<string, LinkedEntity>;
  detectedTags: DetectedTag[];
}
