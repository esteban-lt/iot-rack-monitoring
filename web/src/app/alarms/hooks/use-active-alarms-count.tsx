import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notifyNewAlarmAction } from '../actions/notify-new-alarm-action';
import { alarmSocket } from '../api/alarm-socket';

export const useActiveAlarmsCount = () => {
  const queryClient = useQueryClient();
  const [count, setCount] = useState<number>();

  useEffect(() => {
    let previousCount: number | undefined;

    return alarmSocket.subscribeToActiveCount((nextCount) => {
      // A different count means alarms were raised, cleared or acknowledged: refresh the alarm tables
      if (previousCount !== undefined && nextCount !== previousCount) {
        queryClient.invalidateQueries({ queryKey: ['alarms'] });
      }
      if (previousCount !== undefined && nextCount > previousCount) {
        notifyNewAlarmAction(nextCount - previousCount).catch(() => {});
      }
      previousCount = nextCount;
      setCount(nextCount);
    });
  }, [queryClient]);

  return count;
}
