import { deviceApi } from '@/app/devices/api/device-api';

export type NodeCommand =
  | { method: 'silenceAlarm' }
  | { method: 'setBuzzer'; enabled: boolean }
  | { method: 'calibrate' };

export class NodeCommandRejectedError extends Error {}

export const sendNodeCommandAction = async (nodeId: string, command: NodeCommand) => {
  const params = command.method === 'setBuzzer' ? command.enabled : {};
  const reply = await deviceApi.sendRpc(nodeId, command.method, params);

  if (typeof reply === 'object' && reply !== null && 'ok' in reply && reply.ok === false) {
    throw new NodeCommandRejectedError(String('error' in reply ? reply.error : 'rejected'));
  }
}
