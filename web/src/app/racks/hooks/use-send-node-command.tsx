import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendNodeCommandAction, type NodeCommand } from '../actions/send-node-command-action';

export const useSendNodeCommand = (nodeId: string) => {
  const queryClient = useQueryClient();
  const refreshControl = () => queryClient.invalidateQueries({ queryKey: ['node-control', nodeId] });

  const mutation = useMutation({
    mutationFn: (command: NodeCommand) => sendNodeCommandAction(nodeId, command),
    onSuccess: (_data, command) => {
      refreshControl();
      // The node reports its new calibration status a moment after answering the RPC
      if (command.method === 'calibrate') setTimeout(refreshControl, 1500);
    },
  });

  return mutation;
}
