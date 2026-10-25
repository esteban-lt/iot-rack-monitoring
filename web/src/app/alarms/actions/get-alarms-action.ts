import { endOfDay, startOfDay } from 'date-fns';
import type { Alarm, AlarmSeverity, AlarmStatus } from '@/interfaces/alarm';
import { getAssignedRackAction } from '@/app/devices/actions/get-assigned-rack-action';
import { alarmApi } from '../api/alarm-api';
import type { AlarmFilters } from '../interfaces/alarm-filters';

export const getAlarmsAction = async (filters: AlarmFilters, pageSize: number = 10, page: number = 0) => {
  const { severity, status, nodeId, dateRange } = filters;

  const response = await alarmApi.getAlarms({
    pageSize,
    page,
    nodeId: nodeId === 'all' ? undefined : nodeId,
    severityList: severity === 'all' ? undefined : severity.toUpperCase(),
    statusList: status === 'all' ? undefined : status.toUpperCase(),
    startTime: dateRange?.from && startOfDay(dateRange.from).getTime(),
    endTime: dateRange?.from && endOfDay(dateRange.to ?? dateRange.from).getTime(),
  });

  const nodeIds = [...new Set(response.data.map((alarm) => alarm.originator.id))];
  const racks = await Promise.all(nodeIds.map(getAssignedRackAction));

  const alarms = response.data.map((alarm): Alarm => ({
    id: alarm.id.id,
    nodeId: alarm.originator.id,
    rackName: racks[nodeIds.indexOf(alarm.originator.id)]?.rackName,
    type: alarm.type,
    severity: alarm.severity.toLowerCase() as AlarmSeverity,
    status: alarm.status.toLowerCase().replace('_', '-') as AlarmStatus,
    createdTs: alarm.createdTime,
    ackTs: alarm.ackTs || undefined,
    clearTs: alarm.clearTs || undefined,
  }));

  return { alarms, totalPages: response.totalPages };
}
