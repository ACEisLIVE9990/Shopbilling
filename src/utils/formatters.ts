/**
 * Indian Rupee and Date-Time Formatters
 * Includes Indian numbering system (Lakhs / Crores) and Rupees in words converter
 */

export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0.00';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Convert to fixed 2 decimal places
  const [integerPart, decimalPart] = absAmount.toFixed(2).split('.');
  
  // Format integer part using Indian comma separation (last 3 digits, then pairs of 2)
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return `${isNegative ? '-' : ''}₹ ${formattedInteger}.${decimalPart}`;
}

export function formatNumberOnly(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return amount.toFixed(2);
}

export function formatIndianDate(dateStringOrDate: string | Date | undefined): string {
  if (!dateStringOrDate) return '';
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
}

export function formatIndianDateOnly(dateStringOrDate: string | Date | undefined): string {
  if (!dateStringOrDate) return '';
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Converts numeric amount to Indian Rupee Words
 * Example: 1250.50 -> "Rupees One Thousand Two Hundred Fifty and Fifty Paise Only"
 */
export function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) res += ones[hundred] + ' Hundred';
    if (hundred > 0 && rest > 0) res += ' ';
    if (rest > 0) res += convertTwoDigits(rest);
    return res;
  }

  const [rupeesStr, paiseStr] = amount.toFixed(2).split('.');
  let rupees = parseInt(rupeesStr, 10);
  const paise = parseInt(paiseStr, 10);

  let result = '';

  const crores = Math.floor(rupees / 10000000);
  rupees %= 10000000;
  const lakhs = Math.floor(rupees / 100000);
  rupees %= 100000;
  const thousands = Math.floor(rupees / 1000);
  rupees %= 1000;
  const hundreds = rupees;

  if (crores > 0) result += convertTwoDigits(crores) + ' Crore ';
  if (lakhs > 0) result += convertTwoDigits(lakhs) + ' Lakh ';
  if (thousands > 0) result += convertTwoDigits(thousands) + ' Thousand ';
  if (hundreds > 0) result += convertThreeDigits(hundreds) + ' ';

  result = 'Rupees ' + (result.trim() || 'Zero');

  if (paise > 0) {
    result += ' and ' + convertTwoDigits(paise) + ' Paise';
  }

  return result + ' Only';
}
