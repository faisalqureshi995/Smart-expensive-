export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 0, symbolPosition: 'before', flag: '🇵🇰' },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, symbolPosition: 'before', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, symbolPosition: 'before', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, symbolPosition: 'before', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2, symbolPosition: 'before', flag: '🇸🇦' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, symbolPosition: 'before', flag: '🇮🇳' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, symbolPosition: 'before', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', decimals: 2, symbolPosition: 'before', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, symbolPosition: 'before', flag: '🇯🇵' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'SG$', decimals: 2, symbolPosition: 'before', flag: '🇸🇬' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, symbolPosition: 'before', flag: '🇨🇭' },
];

export function getCurrencyConfig(code: string): CurrencyConfig {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return (
    found || {
      code,
      name: code,
      symbol: code,
      decimals: 2,
      symbolPosition: 'before',
      flag: '🌐',
    }
  );
}

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  compact: boolean = false
): string {
  const config = getCurrencyConfig(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber: string;

  if (compact && absAmount >= 1_000_000) {
    formattedNumber = (absAmount / 1_000_000).toFixed(1) + 'M';
  } else if (compact && absAmount >= 10_000) {
    formattedNumber = (absAmount / 1_000).toFixed(1) + 'k';
  } else {
    formattedNumber = absAmount.toLocaleString(undefined, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });
  }

  const sign = isNegative ? '-' : '';
  if (config.symbolPosition === 'before') {
    return `${sign}${config.symbol}${formattedNumber}`;
  } else {
    return `${sign}${formattedNumber} ${config.symbol}`;
  }
}
