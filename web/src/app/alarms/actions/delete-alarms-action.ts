import { runInBatches } from '@/lib/run-in-batches';
import { alarmApi } from '../api/alarm-api';

// ThingsBoard has no bulk endpoint, so each alarm is deleted with its own request
export const deleteAlarmsAction = (alarmIds: string[]) => runInBatches(alarmIds, alarmApi.deleteAlarm);
