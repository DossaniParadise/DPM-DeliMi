import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Store, Screen } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Monitor, ChevronRight, Store as StoreIcon, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardHome() {
  const [stores, setStores] = useState<Store[]>([]);
  const [screensMap, setScreensMap] = useState<Record<string, Screen[]>>({});
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');

  useEffect(() => {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
      setStores(storesList);
      setLoading(false);

      // Listen for screens in each store
      storesList.forEach(store => {
        const screensRef = collection(db, 'stores', store.id, 'screens');
        onSnapshot(screensRef, (screenSnap) => {
          setScreensMap(prev => ({
            ...prev,
            [store.id]: screenSnap.docs.map(d => ({ id: d.id, ...d.data() } as Screen))
          }));
        });
      });
    });

    return () => unsubscribe();
  }, []);

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    try {
      await addDoc(collection(db, 'stores'), { name: newStoreName, theme: { font: 'Inter', primaryColor: '#f97316' } });
      setNewStoreName('');
      setIsCreating(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddScreen = async (storeId: string) => {
    const name = prompt('Enter screen name:');
    if (!name) return;
    try {
      await addDoc(collection(db, 'stores', storeId, 'screens'), {
        name,
        backgroundImage: '',
        isStaging: true,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="p-12 flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Digital Signage</h1>
          <p className="text-neutral-500">Manage screens across all your deli locations.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <Plus size={20} />
          New Store
        </button>
      </header>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-neutral-900 border border-white/5 p-6 rounded-3xl mb-8"
          >
            <form onSubmit={handleAddStore} className="flex gap-4">
              <input 
                autoFocus
                className="bg-neutral-800 border-none rounded-xl px-4 py-3 flex-1 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Store Name (e.g. PQ5 Uptown)"
                value={newStoreName}
                onChange={e => setNewStoreName(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-neutral-500 hover:text-white px-4"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8">
        {stores.map(store => (
          <section key={store.id} className="bg-neutral-900/50 rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 bg-neutral-900 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <StoreIcon className="text-orange-500" />
                <h2 className="text-xl font-bold">{store.name}</h2>
              </div>
              <button 
                onClick={() => handleAddScreen(store.id)}
                className="text-xs bg-white/5 hover:bg-white/10 text-neutral-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
              >
                <Plus size={14} /> Add Screen
              </button>
            </div>
            
            <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {screensMap[store.id]?.map(screen => (
                <div key={screen.id} className="group bg-neutral-800/50 hover:bg-neutral-800 rounded-2xl p-6 border border-white/5 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-neutral-700/50 rounded-xl flex items-center justify-center group-hover:bg-neutral-700 transition-colors">
                      <Monitor className="text-neutral-400 group-hover:text-white" size={24} />
                    </div>
                    {screen.isStaging && (
                      <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Staging</span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1">{screen.name}</h3>
                  <p className="text-xs text-neutral-500 mb-6 uppercase tracking-tighter">
                    Last Update: {screen.lastUpdated?.toDate?.() ? screen.lastUpdated.toDate().toLocaleDateString() : 'New'}
                  </p>

                  <div className="mt-auto flex flex-col gap-2">
                    <Link 
                      to={`/admin/editor/${store.id}/${screen.id}`}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      Layout Editor <ChevronRight size={16} />
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        to={`/admin/quick-edit/${store.id}/${screen.id}`}
                        className="bg-neutral-700 hover:bg-neutral-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        Quick Price
                      </Link>
                      <a 
                        href={`/display/${store.id}/${screen.id}?preview=true`}
                        target="_blank"
                        className="bg-neutral-700 hover:bg-neutral-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        Preview <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {(!screensMap[store.id] || screensMap[store.id].length === 0) && (
                <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-neutral-600 border-2 border-dashed border-white/5 rounded-2xl">
                  No screens added to this location yet.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
