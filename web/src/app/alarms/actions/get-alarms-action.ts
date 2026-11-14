import { endOfDay, startOfDay } from 'date-fns';
import type { Alarm, AlarmSeverity, AlarmStatus } from '@/interfaces/alarm';
import { getRfidLinksAction } from '@/app/racks/actions/get-rfid-links-action';
import { alarmApi } from '../api/alarm-api';
import type { AlarmFilters } from '../interfaces/alarm-filters';

export const getAlarmsAction = async (filters: AlarmFilters, pageSize: number = 10, page: number = 0) => {
  const { severity, status, nodeId, dateRange } = filters;

  const [response, links] = await Promise.all([
    alarmApi.getAlarms({
      pageSize,
      page,
      nodeId: nodeId === 'all' ? undefined : nodeId,
      severityList: severity === 'all' ? undefined : severity.toUpperCase(),
      statusList: status === 'all' ? undefined : status.toUpperCase(),
      startTime: dateRange?.from && startOfDay(dateRange.from).getTime(),
      endTime: dateRange?.from && endOfDay(dateRange.to ?? dateRange.from).getTime(),
    }),
    getRfidLinksAction(),
  ]);

  const alarms = response.data.map((alarm): Alarm => ({
    id: alarm.id.id,
    nodeId: alarm.originator.id,
    rackId: links.rackByNodeId[alarm.originator.id]?.id,
    rackName: links.rackByNodeId[alarm.originator.id]?.name,
    type: alarm.type,
    severity: alarm.severity.toLowerCase() as AlarmSeverity,
    status: alarm.status.toLowerCase().replace('_', '-') as AlarmStatus,
    createdTs: alarm.createdTime,
    ackTs: alarm.ackTs || undefined,
    clearTs: alarm.clearTs || undefined,
  }));

  return { alarms, totalPages: response.totalPages };
}
