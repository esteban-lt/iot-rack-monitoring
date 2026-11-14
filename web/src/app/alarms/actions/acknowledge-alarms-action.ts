import { runInBatches } from '@/lib/run-in-batches';
import { alarmApi } from '../api/alarm-api';

// ThingsBoard has no bulk endpoint, so each alarm is acknowledged with its own request
export const acknowledgeAlarmsAction = (alarmIds: string[]) => runInBatches(alarmIds, alarmApi.acknowledgeAlarm);
