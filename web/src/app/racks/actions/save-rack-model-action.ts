import { rackApi } from '../api/rack-api';
import { resolveParams } from '../lib/rack-builder';
import type { RackModelConfig } from '../schemas/rack-model-schema';

export const saveRackModelAction = async (rackId: string, config: RackModelConfig) => {
  const { uprights, sensorPost } = resolveParams(config);
  const saved = { ...config, uprights, sensorPost };

  await rackApi.saveAttributes(rackId, { model_config: saved });

  return saved;
}
