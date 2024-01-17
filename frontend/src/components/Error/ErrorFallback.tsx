interface Props {
  error: Error;
}
export function ErrorFallback({ error }: Props) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}
