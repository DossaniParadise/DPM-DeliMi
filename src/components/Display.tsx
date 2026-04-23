import { useParams, useSearchParams } from 'react-router-dom';
import { useMenuData } from '../hooks/useMenuData';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Display() {
  const { storeId, screenId } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  
  const { data, loading, error } = useMenuData(storeId!, screenId!);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white font-sans text-2xl tracking-widest"
        >
          LOADING MENU...
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen w-screen bg-neutral-900 flex items-center justify-center text-white flex-col gap-4">
        <h1 className="text-4xl font-bold">SYSTEM ERROR</h1>
        <p className="text-neutral-400">{error?.message || 'Config not found'}</p>
      </div>
    );
  }

  // Filter if staging
  const shouldShow = isPreview || !data.isStaging;

  if (!shouldShow) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <p className="text-neutral-700 italic">Screen is in staging mode.</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {/* Background Image */}
      {data.backgroundImage ? (
        <img 
          src={data.backgroundImage} 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Menu Background"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
          <p className="text-neutral-700">No background image set.</p>
        </div>
      )}

      {/* Menu Overlays */}
      <AnimatePresence>
        {data.categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: `${category.x}%`,
              top: `${category.y}%`,
              transform: 'translate(-50%, -50%)', // Default centering, adjustable later
            }}
            className="flex flex-col gap-1 min-w-[200px]"
          >
            <h2 className="text-white font-sans font-black text-4xl mb-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase tracking-tight border-b-4 border-orange-500 pb-1 w-fit">
              {category.name}
            </h2>
            <div className="flex flex-col gap-2">
              {category.items.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline group relative">
                  <span className="text-white font-sans font-bold text-2xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] pr-4">
                    {item.name}
                  </span>
                  <div className="border-b-2 border-white/10 border-dotted grow mx-2 opacity-30" />
                  <span className="text-orange-400 font-sans font-black text-2xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] whitespace-nowrap">
                    {item.priceLabel}
                  </span>
                  
                  {/* Subtle highlight if price has a dollar sign early on - imitation of the circular tags */}
                  {item.priceLabel.startsWith('$') && parseFloat(item.priceLabel.slice(1)) > 5 && (
                    <div className="absolute -right-16 top-0 w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-black text-white bg-black/40 backdrop-blur-sm shadow-xl">
                      HOT
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Connectivity & Sync Info (Small, unobtrusive) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity duration-300">
        {!online && (
          <WifiOff className="w-4 h-4 text-red-500 animate-pulse" />
        )}
        <div className="flex flex-col items-end text-[10px] text-white font-mono uppercase tracking-tighter">
          <span>SYNC: ACTIVE</span>
          <span className="flex items-center gap-1">
            <Clock className="w-2 h-2" />
            {data.lastUpdated?.toDate?.() ? data.lastUpdated.toDate().toLocaleTimeString() : 'RECENT'}
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {isPreview && (
        <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1 font-bold rounded-full uppercase tracking-widest shadow-xl">
          STAGING PREVIEW
        </div>
      )}
    </div>
  );
}
