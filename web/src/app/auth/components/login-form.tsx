import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useLogin } from '../hooks/use-login';
import { loginSchema, type LoginFormValues } from '../schemas/login-schema';

const RESET_PASSWORD_URL = `${import.meta.env.VITE_TB_API_URL}/login/resetPasswordRequest`;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const errorMessage = isAxiosError(error) && error.response?.status === 401
    ? 'Correo o contraseña incorrectos.'
    : 'No se pudo iniciar sesión. Intenta de nuevo.';

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutate(values, { onSuccess: () => navigate('/', { replace: true }) }))}
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Inicia sesión</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Usa tu cuenta de ThingsBoard para entrar
          </p>
        </div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input {...field} id="email" type="email" autoComplete="email" placeholder="tu@correo.com" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <a
                  href={RESET_PASSWORD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input {...field} id="password" type="password" autoComplete="current-password" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
          {error && <FieldError>{errorMessage}</FieldError>}
          <FieldDescription className="text-center">
            ¿No tienes cuenta? Solicita acceso al administrador.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
