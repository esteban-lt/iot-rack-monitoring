import { useMutation } from '@tanstack/react-query'
import { loginAction } from '../actions/login-action';

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: loginAction,
  });

  return mutation;
}
