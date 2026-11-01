import type { EntityID } from '@/services/api/interfaces/entity-id';

export interface GetCurrentUserResponse {
  id:        EntityID;
  email:     string;
  firstName: string | null;
  lastName:  string | null;
  authority: string;
}
