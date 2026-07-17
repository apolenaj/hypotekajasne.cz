export const CALCULATOR_DISCLAIMER =
  "Ilustrační model splátky založený na orientační sazbě. Nejedná se o závaznou ani individuální nabídku banky.";

export function CalculatorDisclaimer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p
      className={`text-xs leading-relaxed text-gray-500 ${className}`.trim()}
    >
      {CALCULATOR_DISCLAIMER}
    </p>
  );
}
