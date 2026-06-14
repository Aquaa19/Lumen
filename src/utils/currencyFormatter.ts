/**
 * Crash-safe utility to format numbers/strings in Indian Currency System (Lakh/Crore)
 * without relying on `toLocaleString`, avoiding Hermes engine bugs.
 */

export const formatIndianCurrency = (amountStr: string | number): string => {
  // Convert to string and strip existing formatting
  let cleanStr = String(amountStr).replace(/,/g, '');
  if (!cleanStr || cleanStr === 'NaN') return '0';

  const parts = cleanStr.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // If it's just a negative sign or empty/zero, handle it simply
  if (integerPart === '-' || integerPart === '') {
    return integerPart + decimalPart;
  }

  const isNegative = integerPart.startsWith('-');
  const absInteger = isNegative ? integerPart.slice(1) : integerPart;

  // Format the absolute integer part with Indian commas (e.g. 12,34,567)
  let formattedInteger = '';
  if (absInteger.length <= 3) {
    formattedInteger = absInteger;
  } else {
    const lastThree = absInteger.slice(-3);
    const otherParts = absInteger.slice(0, -3);
    formattedInteger = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return (isNegative ? '-' : '') + formattedInteger + decimalPart;
};
