import { toAttributes } from '@/lib/to-attributes';
import { rackApi } from '@/modules/racks/api/rack-api';
import { deviceApi } from '../api/device-api';

export const getAssignedRackAction = async (deviceId: string) => {
  const [relation] = await deviceApi.getAssignedRacks(deviceId);
  if (!relation) return undefined;

  const attributes = await rackApi.getAttributes(relation.from.id, ['rack_name']);

  return {
    rackId: relation.from.id,
    rackName: String(toAttributes(attributes).rack_name ?? relation.fromName ?? ''),
  };
}
