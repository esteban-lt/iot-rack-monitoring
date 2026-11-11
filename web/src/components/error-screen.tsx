interface Props {
  title: string;
  message: string;
}

export const ErrorScreen = ({ title, message }: Props) => {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <h1 className="mr-5 border-r pr-6 text-2xl font-medium">{title}</h1>
      <p className="text-sm">{message}</p>
    </div>
  );
}
