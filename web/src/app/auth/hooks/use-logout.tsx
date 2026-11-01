import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router';
import { logoutAction } from '../actions/logout-action';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  return mutation;
}
