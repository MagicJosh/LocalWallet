/**
 * Scanner - Barcode scanning view
 *
 * Features:
 * - Full-screen camera view
 * - Real barcode scanning with html5-qrcode
 * - Manual entry fallback
 * - Animated viewfinder
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpring, animated } from 'react-spring';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
import { useViewStack } from '../lib/ViewStack';

export function Scanner() {
  const { pop, currentView } = useViewStack();
  const onScan = currentView.params?.onScan as ((code: string) => void) | undefined;

  const [isInitializing, setIsInitializing] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [restartToken, setRestartToken] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const restartScanner = useCallback(() => {
    setRestartToken((token) => token + 1);
  }, []);

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
    let isCancelled = false;

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setHasPermission(null);
        setScanResult(null);

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
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => ({
              width: Math.floor(viewfinderWidth * 0.8),
              height: Math.floor(viewfinderHeight * 0.3),
            }),
            aspectRatio: window.innerWidth / window.innerHeight,
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

        if (isCancelled) {
          html5QrCode.stop().catch(() => {});
          return;
        }

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
      isCancelled = true;
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
      if (scannerRef.current === html5QrCode) {
        scannerRef.current = null;
      }
    };
  }, [onScan, pop, restartToken]);

  // Pause/resume camera scanning while manual entry is open (iOS can pause video when keyboard opens)
  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    if (showManualEntry) {
      try {
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          scanner.pause(true);
        }
      } catch {
        // Ignore - scanner might not be running yet
      }
      return;
    }

    let timeoutId: number | undefined;

    const resumeOrRestartIfNeeded = () => {
      const activeScanner = scannerRef.current;
      if (!activeScanner) return;

      try {
        if (activeScanner.getState() === Html5QrcodeScannerState.PAUSED) {
          activeScanner.resume();
        }
      } catch {
        // Ignore - we'll fallback to restart checks below
      }

      timeoutId = window.setTimeout(() => {
        const currentScanner = scannerRef.current;
        if (!currentScanner) return;

        const state = currentScanner.getState();
        const video = containerRef.current?.querySelector('video');
        const isVideoStalled = !!video && (video.paused || video.readyState === 0);

        if (state === Html5QrcodeScannerState.NOT_STARTED || isVideoStalled) {
          restartScanner();
        }
      }, 250);
    };

    resumeOrRestartIfNeeded();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [showManualEntry, restartScanner]);

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
        <div className="app-container py-4 flex items-center justify-between">
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
        className="absolute bottom-0 left-0 right-0"
      >
        <div
          className="app-container pt-5"
          style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 20px))' }}
        >
          <button
            onClick={() => setShowManualEntry(true)}
            className="w-full py-4 bg-white text-black rounded-xl font-semibold active:scale-[0.98] transition-transform"
          >
            Enter Code Manually
          </button>
        </div>
      </div>

      {/* Manual entry modal */}
      {showManualEntry && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[480px] mx-auto animate-slide-up">
            <div
              className="bg-gray-900/95 rounded-t-3xl px-6 pt-4"
              style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 20px))' }}
            >
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />

              <h3 className="text-white font-semibold text-lg mb-3">Enter Barcode</h3>

              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Card number or barcode"
                className="w-full h-16 bg-black/50 rounded-2xl px-4 font-mono text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="flex-1 h-12 bg-white/10 text-white rounded-full font-semibold active:scale-[0.98] transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="flex-1 h-12 bg-blue-500 disabled:bg-gray-700 text-white rounded-full font-semibold active:scale-[0.98] transition-transform"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
