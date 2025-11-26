import type { BarcodeFormat } from '../types/card';

export function detectBarcodeFormat(cardNumber: string): BarcodeFormat {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const isNumeric = /^\d+$/.test(cleaned);

  if (isNumeric && cleaned.length === 13) return 'EAN13';
  if (isNumeric && cleaned.length === 8) return 'EAN8';
  if (isNumeric && cleaned.length === 12) return 'UPC';
  if (/^[A-Z0-9\-\.\ \$\/\+\%]+$/.test(cleaned.toUpperCase()) && cleaned.length <= 20) {
    return 'CODE39';
  }
  if (cleaned.length > 30) return 'QR';

  return 'CODE128';
}

export function getFormatDisplayName(format: BarcodeFormat): string {
  const names: Record<BarcodeFormat, string> = {
    'CODE128': 'Code 128',
    'EAN13': 'EAN-13',
    'EAN8': 'EAN-8',
    'UPC': 'UPC-A',
    'CODE39': 'Code 39',
    'QR': 'QR Code',
  };
  return names[format];
}

export function getAllFormats(): { value: BarcodeFormat; label: string }[] {
  return [
    { value: 'CODE128', label: 'Code 128 (Default)' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPC', label: 'UPC-A' },
    { value: 'CODE39', label: 'Code 39' },
    { value: 'QR', label: 'QR Code' },
  ];
}
