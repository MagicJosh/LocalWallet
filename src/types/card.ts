export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'QR';

export interface Card {
  id: string;
  storeName: string;
  cardNumber: string;
  logoUrl: string | null;
  brandColor: string;
  barcodeFormat: BarcodeFormat;
  isFavorite: boolean;
  createdAt: number;
  lastUsedAt: number | null;
}

export interface CardInput {
  storeName: string;
  cardNumber: string;
  barcodeFormat?: BarcodeFormat;
}
