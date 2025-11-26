import Barcode from 'react-barcode';
import type { BarcodeFormat } from '../types/card';

interface BarcodeViewProps {
  value: string;
  format: BarcodeFormat;
  showValue?: boolean;
  darkMode?: boolean;
}

// Map our formats to react-barcode formats
const FORMAT_MAP: Record<BarcodeFormat, string> = {
  'CODE128': 'CODE128',
  'EAN13': 'EAN13',
  'EAN8': 'EAN8',
  'UPC': 'UPC',
  'CODE39': 'CODE39',
  'QR': 'CODE128', // Fallback since react-barcode doesn't do QR
};

export function BarcodeView({ value, format, showValue = true, darkMode = false }: BarcodeViewProps) {
  const barcodeFormat = FORMAT_MAP[format] || 'CODE128';
  const cleanValue = value.replace(/[\s-]/g, '');

  const textColor = darkMode ? '#FFFFFF' : '#000000';
  const bgColor = darkMode ? 'transparent' : '#FFFFFF';

  if (format === 'QR') {
    return (
      <div className="flex flex-col items-center">
        <div
          className="rounded-xl p-6 flex items-center justify-center min-h-[120px]"
          style={{ backgroundColor: bgColor }}
        >
          <p className="text-center" style={{ color: darkMode ? '#8E8E93' : '#636366' }}>
            QR Code format<br />
            <span className="font-mono text-sm" style={{ color: textColor }}>{cleanValue}</span>
          </p>
        </div>
        {showValue && (
          <p
            className="mt-4 font-mono text-lg tracking-wider text-center"
            style={{ color: textColor }}
          >
            {value}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="overflow-hidden flex items-center justify-center">
        <Barcode
          value={cleanValue}
          format={barcodeFormat as any}
          width={2}
          height={80}
          displayValue={false}
          background="transparent"
          lineColor="#000000"
        />
      </div>
      {showValue && (
        <p
          className="mt-3 font-mono text-xl tracking-widest text-center"
          style={{ color: textColor }}
        >
          {value}
        </p>
      )}
    </div>
  );
}
