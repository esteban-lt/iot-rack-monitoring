import { toAttributes } from '@/lib/to-attributes';
import { rackApi } from '../api/rack-api';
import { parseRackModel } from '../schemas/rack-model-schema';

export const getRackModelAction = async (rackId: string) => {
  const attribute = toAttributes(await rackApi.getAttributes(rackId, ['model_config']));

  return parseRackModel(attribute.model_config);
}
