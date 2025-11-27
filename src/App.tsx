import { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, CreditCard, X, ArrowLeft,
  Wallet, Camera, Share, ShieldCheck, Heart
} from 'lucide-react';

// --- 1. MOCK SERVICES (Internalized for Single-File Execution) ---

// Types
type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'QR' | 'PDF417' | 'AZTEC' | 'DATAMATRIX' | 'CODABAR' | 'CODE39' | 'ITF';

interface Card {
  id: string;
  storeName: string;
  cardNumber: string;
  barcodeFormat: BarcodeFormat;
  brandColor?: string;
  dateAdded: number;
  lastUsed?: number;
}

// Storage Service
const STORAGE_KEY = 'LOCAL_WALLET_CARDS';

const getAllCards = (): Card[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const createCard = async (data: Omit<Card, 'id' | 'dateAdded'>): Promise<Card> => {
  const cards = getAllCards();
  const newCard: Card = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    dateAdded: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cards, newCard]));
  return newCard;
};

const deleteCard = (id: string) => {
  const cards = getAllCards().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

// Barcode Service
const detectBarcodeFormat = (code: string): BarcodeFormat => {
  if (!code) return 'CODE128';
  if (/^[0-9]{13}$/.test(code)) return 'EAN13';
  if (/^[0-9]{12}$/.test(code)) return 'UPC';
  return 'CODE128'; // Default fallback
};

// --- 2. SHARED COMPONENTS ---

// Global Styles for "Native Feel"
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    
    html, body {
      overscroll-behavior-y: none;
      height: 100%;
      overflow-x: hidden;
      position: fixed;
      width: 100%;
      background-color: #000;
      font-family: 'Inter', -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    #root {
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* Hide Scrollbar */
    ::-webkit-scrollbar { display: none; }
    * { -ms-overflow-style: none; scrollbar-width: none; }

    /* Safe Area Utilities */
    .pt-safe-top { padding-top: env(safe-area-inset-top, 20px); }
    .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }

    /* Animation Utilities */
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    
    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .active-shrink { transition: transform 0.2s; }
    .active-shrink:active { transform: scale(0.95); }
  `}</style>
);

const NativePage = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`min-h-screen bg-black text-white pt-safe-top pb-safe-bottom flex flex-col ${className}`}>
    {children}
  </div>
);

// SVG Barcode Component (Replaces external lib)
const SvgBarcode = ({ value, width = 2, height = 80 }: { value: string, width?: number, height?: number }) => {
  if (!value) return null;
  // Pattern generator for visual simulation
  const bars = Array.from({ length: 40 }).map((_, i) => {
    const isThick = Math.random() > 0.7;
    const barWidth = isThick ? width * 2.5 : width;
    const xPos = i * (width * 3.5); 
    return <rect key={i} x={xPos} y="0" width={barWidth} height={height} fill="black" />;
  });

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${40 * width * 3.5} ${height}`} preserveAspectRatio="none" style={{ maxWidth: '300px' }}>
        {bars}
      </svg>
      <p className="font-mono text-sm mt-2 tracking-widest">{value}</p>
    </div>
  );
};

// Scanner Modal Component
const ScannerModal = ({ onClose, onScanSuccess }: { onClose: () => void, onScanSuccess: (code: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, []);

  const handleManual = () => {
    const code = window.prompt("Enter barcode manually (Demo):");
    if (code) onScanSuccess(code);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black animate-fade-in">
      <video ref={videoRef} className="w-full h-full object-cover opacity-80" autoPlay muted playsInline />
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
         {loading && (
           <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-slate-500">Starting Camera...</p>
           </div>
         )}
         {!loading && (
            <div className="relative w-[85%] max-w-sm aspect-[1.8] rounded-2xl border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]">
              <div className="absolute top-1/2 w-full h-[2px] bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse"></div>
            </div>
         )}
         {!loading && <p className="mt-8 text-white/80 font-medium bg-black/40 px-4 py-2 rounded-full">Tap 'Enter Manually'</p>}
      </div>

      <button onClick={handleManual} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-blue-600 rounded-full font-bold text-white active-shrink">
        Enter Code Manually
      </button>
      <button onClick={onClose} className="absolute top-4 right-6 z-50 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white active-shrink">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- 3. PAGE COMPONENTS ---

// Card Preview Component
const CardPreview = ({ storeName, cardNumber, gradientClass }: { storeName: string, cardNumber: string, gradientClass: string }) => {
  const cleanName = storeName.toLowerCase().replace(/\s/g, '');
  
  return (
    <div className={`w-full aspect-[1.586] rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${gradientClass}`}>
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start gap-4">
          <span className="font-black text-2xl tracking-tighter text-white drop-shadow-md truncate flex-1 pr-2">
            {storeName || 'STORE NAME'}
          </span>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
            {storeName && cleanName.length > 0 ? (
              <img
                src={`https://logo.clearbit.com/${cleanName}.com`}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; ((e.target as HTMLElement).nextSibling as HTMLElement).style.display = 'flex'; }}
                className="w-full h-full object-contain p-1"
              />
            ) : null}
            <span className={`${!storeName ? 'flex' : 'hidden'} w-full h-full items-center justify-center bg-slate-200 text-black font-bold text-xs`}>
              {storeName ? storeName.slice(0, 2).toUpperCase() : 'ST'}
            </span>
          </div>
        </div>
        <div className="font-mono text-lg tracking-widest text-white/90 drop-shadow-sm truncate">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

// Helper for gradients
function getBrandGradient(storeName: string): string {
  const name = storeName.toLowerCase();
  if (name.includes('ikea')) return 'from-blue-600 to-yellow-500';
  if (name.includes('target')) return 'from-red-600 to-red-400';
  if (name.includes('starbucks')) return 'from-green-800 to-green-600';
  if (name.includes('costco')) return 'from-red-700 to-blue-800';
  if (name.includes('walmart')) return 'from-blue-600 to-blue-400';
  if (name.includes('amazon')) return 'from-orange-500 to-yellow-400';
  if (name.includes('apple')) return 'from-gray-800 to-gray-600';
  if (name.includes('best buy')) return 'from-blue-900 to-yellow-400';
  return 'from-slate-700 to-slate-800';
}

// --- APP VIEWS (ROUTED MANUALLY FOR SINGLE FILE) ---

function DashboardView({ setView, setSelectedCard }: any) {
  const [cards, setCards] = useState<Card[]>([]);
  const [term, setTerm] = useState('');

  useEffect(() => { setCards(getAllCards()); }, []);

  const filtered = cards.filter(c => c.storeName.toLowerCase().includes(term.toLowerCase()));

  return (
    <NativePage>
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-blue-500" /> Wallet
        </h1>
        <button onClick={() => setView('settings')} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center active-shrink">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
        </button>
      </header>

      <div className="pb-24 space-y-8 flex flex-col items-center mt-2">
        <div className="w-full max-w-sm px-[18px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search passes..."
              value={term}
              onChange={e => setTerm(e.target.value)}
              className="w-full h-14 bg-slate-900 rounded-2xl px-6 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="w-full max-w-sm px-[18px]">
          {cards.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-slate-500 opacity-50">
              <CreditCard className="w-16 h-16 mb-4" />
              <p>No cards yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(card => (
                <div key={card.id} onClick={() => { setSelectedCard(card); setView('detail'); }} className="cursor-pointer active-shrink">
                  <CardPreview storeName={card.storeName} cardNumber={card.cardNumber} gradientClass={card.brandColor || 'from-slate-700 to-slate-800'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-30">
        <button onClick={() => setView('add')} className="w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center active-shrink pointer-events-auto">
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>
    </NativePage>
  );
}

function AddCardView({ setView }: any) {
  const [storeName, setStoreName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [brandGradient, setBrandGradient] = useState('from-slate-700 to-slate-800');

  useEffect(() => { setBrandGradient(getBrandGradient(storeName)); }, [storeName]);

  const handleSave = async () => {
    if (!storeName || !cardNumber) return;
    await createCard({ storeName, cardNumber, barcodeFormat: detectBarcodeFormat(cardNumber), brandColor: brandGradient });
    setView('dashboard');
  };

  return (
    <NativePage>
      {showScanner && <ScannerModal onClose={() => setShowScanner(false)} onScanSuccess={(code) => { setCardNumber(code); setShowScanner(false); }} />}
      
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-blue-500 active-shrink">
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <h1 className="text-[17px] font-semibold absolute left-1/2 -translate-x-1/2">Add Card</h1>
        <div className="w-16" />
      </header>

      <div className="pb-12 flex-1 flex flex-col items-center">
        <div className="w-full max-w-sm px-[18px]">
          <div className="mt-4 mb-10 transform transition-all duration-300 hover:scale-[1.02]">
            <CardPreview storeName={storeName} cardNumber={cardNumber} gradientClass={brandGradient} />
            <p className="text-center text-slate-500 text-xs mt-4 font-medium tracking-wide uppercase">Preview</p>
          </div>

          {/* FIXED SPACING SECTION */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Store Details</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Store Name (e.g. Ikea)"
                className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl px-5 text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                autoFocus
              />
            </div>

            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number"
                className="w-full h-14 bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-14 font-mono text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
              <button onClick={() => setShowScanner(true)} className="absolute right-2 top-2 w-10 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors active-shrink">
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <div className="h-6"></div>

            <button
              onClick={handleSave}
              disabled={!storeName || !cardNumber}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 active-shrink flex items-center justify-center gap-2 text-[17px] transition-all"
            >
              Add to Wallet
            </button>
          </div>
        </div>
      </div>
    </NativePage>
  );
}

function CardDetailView({ card, setView }: { card: Card, setView: any }) {
  const [confirm, setConfirm] = useState(false);
  if (!card) return null;

  const handleDelete = () => {
    deleteCard(card.id);
    setView('dashboard');
  };

  return (
    <div className="fixed inset-0 z-40 bg-black text-white flex flex-col pt-safe-top pb-safe-bottom animate-slide-up">
      <header className="px-6 py-4 flex items-center justify-between bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <button onClick={() => setView('dashboard')} className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center active-shrink">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button className="w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center active-shrink">
          <Share className="w-5 h-5 text-white" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-12">
        <div className={`w-full aspect-[1.586] rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden bg-gradient-to-br ${card.brandColor || 'from-slate-800 to-black'}`}>
          <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <img src={`https://logo.clearbit.com/${card.storeName.toLowerCase().replace(/\s/g, '')}.com`} onError={(e) => (e.target as HTMLElement).style.display = 'none'} className="w-16 h-16 rounded-full bg-white p-1 object-contain shadow-sm" />
              <span className="font-bold text-3xl tracking-tight text-white drop-shadow-md">{card.storeName}</span>
            </div>
            <p className="font-mono text-xl tracking-widest text-white/90 drop-shadow-md">{card.cardNumber}</p>
          </div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="mt-8 bg-white text-black rounded-3xl p-8 shadow-lg flex flex-col items-center space-y-6">
          <div className="w-full flex justify-between items-center border-b border-gray-100 pb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member ID</span>
            <span className="font-mono font-bold text-lg">{card.cardNumber}</span>
          </div>
          <SvgBarcode value={card.cardNumber} />
          <p className="text-xs text-gray-400 text-center max-w-[200px]">Scan barcode at register</p>
        </div>

        <div className="mt-12">
          {!confirm ? (
            <button onClick={() => setConfirm(true)} className="w-full py-4 text-red-500 font-medium active-shrink rounded-xl hover:bg-slate-900 transition-colors">Remove Pass</button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setConfirm(false)} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold active-shrink">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold active-shrink shadow-lg">Confirm</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ setView }: any) {
  const count = getAllCards().length;
  const handleWipe = () => {
    if(window.confirm("Delete all data?")) {
      localStorage.removeItem(STORAGE_KEY);
      setView('dashboard');
    }
  };

  return (
    <NativePage>
      <header className="px-6 py-4 flex items-center gap-4 sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-blue-500 active-shrink">
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[17px] font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <div className="px-6 pb-12 space-y-8 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1">
            <span className="text-3xl font-black text-blue-500">{count}</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cards</span>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-1" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Offline</span>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-800">
          <button onClick={handleWipe} className="w-full flex items-center justify-between p-4 hover:bg-slate-800 active-shrink">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-500" /></div>
              <span className="font-medium text-[17px] text-red-500">Delete All Data</span>
            </div>
          </button>
        </div>
        <div className="pt-8 flex flex-col items-center justify-center space-y-4 opacity-50">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <p className="text-xs text-center max-w-[200px]">Built for privacy. No ads. Just cards.</p>
        </div>
      </div>
    </NativePage>
  );
}

// --- MAIN ENTRY POINT ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'add' | 'detail' | 'settings'>('dashboard');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  return (
    <>
      <GlobalStyles />
      {view === 'dashboard' && <DashboardView setView={setView} setSelectedCard={setSelectedCard} />}
      {view === 'add' && <AddCardView setView={setView} />}
      {view === 'detail' && selectedCard && <CardDetailView card={selectedCard} setView={setView} />}
      {view === 'settings' && <SettingsView setView={setView} />}
    </>
  );
}