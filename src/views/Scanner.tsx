/**
 * Scanner - Barcode scanning view
 *
 * Features:
 * - Full-screen camera view
 * - Real barcode scanning with html5-qrcode
 * - Manual entry fallback
 * - Animated viewfinder
 */

import { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useViewStack } from '../lib/ViewStack';

export function Scanner() {
  const { pop, currentView } = useViewStack();
  const onScan = currentView.params?.onScan as ((code: string) => void) | undefined;

  const [isInitializing, setIsInitializing] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Laser line animation
  const laserSpring = useSpring({
    from: { top: '10%' },
    to: { top: '90%' },
    loop: { reverse: true },
    config: { duration: 2000 },
  });

  // Initialize scanner
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        setIsInitializing(true);

        html5QrCode = new Html5Qrcode('scanner-container', {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
        });

        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: window.innerHeight / window.innerWidth,
          },
          (decodedText) => {
            // Successfully scanned
            setScanResult(decodedText);

            // Vibrate for feedback if supported
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            // Stop scanner and pass result
            html5QrCode?.stop().then(() => {
              if (onScan) {
                onScan(decodedText);
              }
              pop();
            });
          },
          () => {
            // QR code parse failure - ignore, keep scanning
          }
        );

        setHasPermission(true);
        setIsInitializing(false);
      } catch (error) {
        console.error('Scanner error:', error);
        setHasPermission(false);
        setIsInitializing(false);
      }
    };

    startScanner();

    // Cleanup
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [onScan, pop]);

  // Handle manual entry
  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      if (onScan) {
        onScan(manualCode.trim());
      }
      pop();
    }
  };

  // Handle close
  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }
    pop();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera view */}
      <div
        id="scanner-container"
        ref={containerRef}
        className="absolute inset-0"
        style={{ opacity: hasPermission ? 1 : 0 }}
      />

      {/* Overlay with viewfinder cutout */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 h-[30%] bg-black/70" />
        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-black/70" />
        {/* Left overlay */}
        <div className="absolute top-[30%] left-0 w-[10%] h-[30%] bg-black/70" />
        {/* Right overlay */}
        <div className="absolute top-[30%] right-0 w-[10%] h-[30%] bg-black/70" />

        {/* Viewfinder */}
        <div className="absolute top-[30%] left-[10%] right-[10%] h-[30%] border-2 border-white/50 rounded-xl overflow-hidden">
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

          {/* Animated laser line */}
          <animated.div
            style={laserSpring}
            className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          />
        </div>
      </div>

      {/* Header */}
      <header
        className="absolute top-0 left-0 right-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-black/40 backdrop-blur rounded-full flex items-center justify-center active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h1 className="text-white font-semibold bg-black/40 backdrop-blur px-4 py-2 rounded-full">
            Scan Barcode
          </h1>

          <div className="w-10" />
        </div>
      </header>

      {/* Loading state */}
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Permission denied state */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center px-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Camera Access Denied</h3>
            <p className="text-gray-400 text-sm mb-6">
              Please allow camera access in your browser settings to scan barcodes.
            </p>
            <button
              onClick={() => setShowManualEntry(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold"
            >
              Enter Code Manually
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {scanResult && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Scanned!</p>
            <p className="text-gray-400 font-mono mt-2">{scanResult}</p>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div
        className="absolute bottom-0 left-0 right-0 p-5"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))' }}
      >
        <button
          onClick={() => setShowManualEntry(true)}
          className="w-full py-4 bg-white text-black rounded-xl font-semibold active:scale-[0.98] transition-transform"
        >
          Enter Code Manually
        </button>
      </div>

      {/* Manual entry modal */}
      {showManualEntry && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-20">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Enter Barcode</h3>

            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Card number or barcode"
              className="w-full h-14 bg-black/50 rounded-xl px-4 font-mono text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowManualEntry(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="flex-1 py-3 bg-blue-500 disabled:bg-gray-700 text-white rounded-xl font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
