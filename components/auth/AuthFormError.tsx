type Props = {
  message: string;
};

export function AuthFormError({ message }: Props) {
  return (
    <div className="rounded-input border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
