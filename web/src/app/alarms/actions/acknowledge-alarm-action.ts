import { alarmApi } from '../api/alarm-api';

export const acknowledgeAlarmAction = (alarmId: string) => alarmApi.acknowledgeAlarm(alarmId);
