export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 px-5 py-4 rounded-xl text-sm bg-danger-bg text-danger border border-danger-border">
      {message}
    </div>
  );
}
