interface OrderAmountDisplayProps {
  amountCents?: number | null;
  currency?: string | null;
  className?: string;
}

export default function OrderAmountDisplay({ amountCents, currency, className = "" }: OrderAmountDisplayProps) {
  if (amountCents == null) {
    return <span className={`text-gray-500 ${className}`}>-</span>;
  }

  const formattedAmount = (amountCents / 100).toFixed(2);
  const displayCurrency = currency || "ARS";

  return (
    <span className={`font-medium ${className}`}>
      ${formattedAmount} {displayCurrency}
    </span>
  );
}
