import { AppLogo } from '@/components/app-logo';
import { Navigate } from 'react-router';
import { session } from '@/services/api/session';
import { LoginForm } from './components/login-form';

const Index = () => {
  if (session.getToken()) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center gap-2 font-medium md:justify-start">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <AppLogo className="size-4" />
          </div>
          Monitoreo de racks
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <img src="/images/login.webp" alt="" className="hidden size-full object-cover lg:block" />
    </div>
  );
}

export default Index;
