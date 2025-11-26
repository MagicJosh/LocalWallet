/**
 * ScannerModal.tsx - Camera Barcode Scanner
 *
 * Full-screen camera modal for scanning barcodes and QR codes.
 * Uses the html5-qrcode library for camera access and decoding.
 *
 * FEATURES:
 * - Full-screen camera view with custom overlay
 * - Scanning box with corner markers and red laser line
 * - Loading spinner while camera initializes
 * - Error handling for denied permissions
 * - Vibration feedback on successful scan
 *
 * TO MODIFY:
 * - Scanning box size: Change "w-[85%] max-w-sm aspect-[1.8]" classes
 * - Corner marker color: Change "border-blue-500" to another color
 * - Laser line color: Change "bg-red-500" to another color
 * - Camera config: Edit the 'config' object in startScanner()
 *
 * LIBRARY: html5-qrcode (https://github.com/mebjas/html5-qrcode)
 */

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

/**
 * ScannerModal Props
 * @param isOpen - Whether the modal is visible
 * @param onClose - Called when user closes modal or scan completes
 * @param onScan - Called with the decoded barcode string on success
 */
interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function ScannerModal({ isOpen, onClose, onScan }: ScannerModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setError(null);
    setLoading(true);

    // Small delay to allow UI to mount before starting camera
    const timer = setTimeout(() => {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          // Using qrbox here to define the region, but we hide the default border in CSS
          const config = { fps: 10, qrbox: { width: 300, height: 180 }, aspectRatio: 1.8 };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              if (mounted) {
                // Vibrate on success if available
                if (navigator.vibrate) {
                  navigator.vibrate(100);
                }
                html5QrCode.stop().then(() => {
                  onScan(decodedText);
                  onClose();
                }).catch(console.error);
              }
            },
            () => {} // Ignore continuous scan errors
          );

          if (mounted) {
            setLoading(false);
          }
        } catch (err) {
          console.error("Camera Error", err);
          if (mounted) {
            setLoading(false);
            if (err instanceof Error) {
              if (err.message.includes('Permission') || err.message.includes('denied')) {
                setError('Camera permission denied. Please allow camera access.');
              } else if (err.message.includes('No cameras')) {
                setError('No camera found on this device.');
              } else {
                setError('Could not start camera. Please try again.');
              }
            }
          }
        }
      };

      startScanner();
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isOpen, onClose, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black animate-fade-in">
      {/* 1. Camera Feed: We make it slightly dimmer for better contrast */}
      <div id="reader" className="w-full h-full object-cover opacity-80"></div>

      {/* 2. Interface Layer (Centered Perfectly) */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">

        {/* Loading Spinner - Absolutely centered */}
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-slate-500 font-medium">Starting Camera...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-8">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">Camera Unavailable</p>
            <p className="text-white/60 text-sm mb-8 max-w-xs text-center">{error}</p>
            <button
              onClick={onClose}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl active-shrink pointer-events-auto"
            >
              Enter Manually
            </button>
          </div>
        )}

        {/* Scanning Box - Fixed Alignment and Larger Size (85% width) */}
        {!loading && !error && (
          // w-[85%] ensures it scales appropriately on mobile
          <div className="relative w-[85%] max-w-sm aspect-[1.8] rounded-2xl border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]">
            {/* Corner Markers - Made slightly larger */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500 -ml-[2px] -mt-[2px] rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500 -mr-[2px] -mt-[2px] rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500 -ml-[2px] -mb-[2px] rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500 -mr-[2px] -mb-[2px] rounded-br-xl"></div>

            {/* Laser */}
            <div className="absolute top-1/2 w-full h-[2px] bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse"></div>
          </div>
        )}

        {!loading && !error && (
          <p className="mt-8 text-white/80 font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            Align barcode within frame
          </p>
        )}
      </div>

      {/* Close Button - Fixed Position */}
      <button
        onClick={onClose}
        // Using mt-safe-top helps push the button below the notch area
        className="absolute top-0 right-6 z-50 mt-safe-top pt-5 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 active-shrink"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Style override to hide the library's UI */}
      <style>{`
        #reader video { object-fit: cover; width: 100%; height: 100%; }
        #reader__scan_region,
        #reader__dashboard_section_csr,
        #reader__dashboard_section,
        #reader__camera_selection,
        #reader__scan_region img,
        #reader div[style*="border"] {
          display: none !important;
          border: none !important;
          opacity: 0 !important;
        }
        #reader canvas {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
