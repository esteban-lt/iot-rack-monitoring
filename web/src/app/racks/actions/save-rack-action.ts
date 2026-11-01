import { rackApi } from '../api/rack-api';
import type { RackFormValues } from '../schemas/rack-schema';

export const saveRackAction = async (values: RackFormValues, rackId?: string) => {
  const id = rackId ?? (await rackApi.createAsset(values.name)).id.id;

  await rackApi.saveAttributes(id, {
    rack_name: values.name,
    location: values.location,
    rfid_uid: values.rfidUid,
  });

  return id;
}
