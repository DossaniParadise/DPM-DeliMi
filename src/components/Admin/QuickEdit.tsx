import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMenuData } from '../../hooks/useMenuData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  ArrowLeft, 
  Search, 
  Save, 
  Check, 
  X, 
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuickEdit() {
  const { storeId, screenId } = useParams();
  const { data, loading, error } = useMenuData(storeId!, screenId!);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const all = data.categories.flatMap(c => c.items.map(i => ({ ...i, categoryName: c.name, categoryId: c.id })));
    if (!searchTerm) return all;
    return all.filter(i => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handlePriceUpdate = async (catId: string, itemId: string) => {
    try {
      await updateDoc(doc(db, 'stores', storeId!, 'screens', screenId!, 'categories', catId, 'items', itemId), {
        priceLabel: tempPrice
      });
      setEditingItemId(null);
    } catch (err) {
      alert('Update failed: ' + err);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="bg-neutral-900 px-6 py-4 border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/admin" className="p-2 -ml-2 text-neutral-400">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-bold text-xl">Quick Price Edit</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            className="w-full bg-neutral-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-orange-500 text-white"
            placeholder="Search item or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 p-4 pb-24">
        <div className="space-y-3">
          {filteredItems.map(item => (
            <motion.div 
              layout
              key={item.id}
              className={`bg-neutral-900 border rounded-2xl p-4 transition-all ${
                editingItemId === item.id ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-white/5'
              }`}
            >
              {editingItemId === item.id ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">{item.categoryName}</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      className="flex-1 bg-neutral-800 rounded-xl px-4 py-3 text-lg font-bold text-orange-500 outline-none"
                      value={tempPrice}
                      onChange={e => setTempPrice(e.target.value)}
                    />
                    <button 
                      onClick={() => handlePriceUpdate(item.categoryId, item.id)}
                      className="bg-orange-600 p-4 rounded-xl text-white shadow-xl"
                    >
                      <Check />
                    </button>
                    <button 
                      onClick={() => setEditingItemId(null)}
                      className="bg-neutral-800 p-4 rounded-xl text-neutral-400"
                    >
                      <X />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center" onClick={() => { setEditingItemId(item.id); setTempPrice(item.priceLabel); }}>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">{item.name}</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{item.categoryName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-500 font-mono font-bold py-1 px-3 bg-orange-600/10 rounded-lg border border-orange-500/20">
                      {item.priceLabel}
                    </span>
                    <Edit2 size={16} className="text-neutral-700" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-20 text-neutral-600">
               No items found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none">
        <div className="bg-orange-600/10 border border-orange-500/20 backdrop-blur rounded-2xl p-4 text-center pointer-events-auto">
          <p className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">Tap an item to instantly change price</p>
        </div>
      </div>
    </div>
  );
}
