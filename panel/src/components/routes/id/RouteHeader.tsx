interface RouteHeaderProps {
  title: string;
}

export function RouteHeader({ title }: RouteHeaderProps) {
  return (
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
  );
}
