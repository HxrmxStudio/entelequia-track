interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
  );
}
