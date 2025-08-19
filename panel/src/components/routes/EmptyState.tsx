interface EmptyStateProps {
  colSpan: number;
}

export function EmptyState({ colSpan }: EmptyStateProps) {
  return (
    <tr>
      <td className="p-6 text-gray-500" colSpan={colSpan}>
        Sin resultados
      </td>
    </tr>
  );
}
