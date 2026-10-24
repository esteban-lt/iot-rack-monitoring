export interface GetRelationsResponse {
  from:      EntityID;
  to:        EntityID;
  type:      string;
  typeGroup: string;
  toName:    string | null;
}

export interface EntityID {
  entityType: string;
  id:         string;
}
