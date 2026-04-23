import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMenuData } from '../../hooks/useMenuData';
import { doc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Move, 
  Save, 
  Eye, 
  Type, 
  Image as ImageIcon,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ScreenEditor() {
  const { storeId, screenId } = useParams();
  const { data, loading, error } = useMenuData(storeId!, screenId!);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpdateScreen = async (updates: any) => {
    await updateDoc(doc(db, 'stores', storeId!, 'screens', screenId!), {
      ...updates,
      lastUpdated: new Date()
    });
  };

  const handleAddCategory = async () => {
    const name = prompt('Category Name:');
    if (!name) return;
    await addDoc(collection(db, 'stores', storeId!, 'screens', screenId!, 'categories'), {
      name,
      x: 50,
      y: 50,
      order: (data?.categories.length || 0) + 1
    });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all items?')) return;
    await deleteDoc(doc(db, 'stores', storeId!, 'screens', screenId!, 'categories', id));
    if (selectedCategoryId === id) setSelectedCategoryId(null);
  };

  const handleAddItem = async (catId: string) => {
    const name = prompt('Item Name:');
    if (!name) return;
    const priceLabel = prompt('Price String:');
    if (!priceLabel) return;
    
    const category = data?.categories.find(c => c.id === catId);
    await addDoc(collection(db, 'stores', storeId!, 'screens', screenId!, 'categories', catId, 'items'), {
      name,
      priceLabel,
      order: (category?.items.length || 0) + 1
    });
  };

  const handleMoveCategory = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedCategoryId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    // Update in UI immediately for performance, then sync to DB on mouseup? 
    // For simplicity, let's update DB after a small delay or on release.
    // Here we'll just update DB directly to keep it MVP.
    updateDoc(doc(db, 'stores', storeId!, 'screens', screenId!, 'categories', selectedCategoryId), { x, y });
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  if (!data) return <div className="p-20">Screen not found</div>;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-neutral-900 px-6 py-4 border-b border-white/5 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-lg">{data.name}</h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-none">Layout Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleUpdateScreen({ isStaging: !data.isStaging })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              data.isStaging ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
            }`}
          >
            {data.isStaging ? 'STAGING ON' : 'STAGING OFF'}
          </button>
          <a 
            href={`/display/${storeId}/${screenId}?preview=true`} 
            target="_blank"
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-xs font-bold"
          >
            <Eye size={14} /> Preview
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Layers & Settings */}
        <aside className="w-80 bg-neutral-900 border-r border-white/5 flex flex-col overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Background</h3>
            <div className="flex gap-2">
               <input 
                 className="bg-neutral-800 rounded-lg px-3 py-2 text-xs flex-1 outline-none focus:ring-1 focus:ring-orange-500"
                 placeholder="Image URL"
                 value={data.backgroundImage || ''}
                 onChange={(e) => handleUpdateScreen({ backgroundImage: e.target.value })}
               />
            </div>
          </div>

          <div className="p-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Categories</h3>
              <button 
                onClick={handleAddCategory}
                className="text-orange-500 hover:text-orange-400 p-1"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {data.categories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCategoryId === cat.id 
                    ? 'bg-orange-600/10 border-orange-500/50' 
                    : 'bg-neutral-800/50 border-white/5 hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm truncate">{cat.name}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="p-1 text-neutral-600 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {selectedCategoryId === cat.id && (
                    <div className="mt-3 flex flex-col gap-2 bg-black/20 p-2 rounded-lg">
                      {cat.items.map(item => (
                        <div key={item.id} className="flex justify-between text-[10px] items-center">
                          <span className="truncate">{item.name}</span>
                          <span className="text-orange-500 font-mono">{item.priceLabel}</span>
                        </div>
                      ))}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddItem(cat.id); }}
                        className="text-[10px] font-bold text-neutral-400 hover:text-white mt-1 border border-dashed border-white/10 rounded py-1"
                      >
                        + Add Item
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <div 
          className="flex-1 bg-neutral-950 p-12 overflow-auto flex items-center justify-center relative cursor-crosshair"
          onMouseMove={handleMoveCategory}
          onMouseUp={() => setIsDragging(false)}
          onTouchMove={handleMoveCategory}
          onTouchEnd={() => setIsDragging(false)}
        >
          <div 
            ref={containerRef}
            className="relative shadow-2xl bg-black aspect-video max-h-full max-w-full overflow-hidden"
            style={{ width: '1280px' }} // 720p base for preview
          >
            {data.backgroundImage ? (
               <img src={data.backgroundImage} className="w-full h-full object-cover pointer-events-none" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-neutral-800 border-2 border-dashed border-neutral-900">
                  <ImageIcon size={64} />
               </div>
            )}

            {data.categories.map((cat) => (
              <div 
                key={cat.id}
                onMouseDown={() => { setSelectedCategoryId(cat.id); setIsDragging(true); }}
                onTouchStart={() => { setSelectedCategoryId(cat.id); setIsDragging(true); }}
                style={{
                  position: 'absolute',
                  left: `${cat.x}%`,
                  top: `${cat.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`flex flex-col group p-4 border-2 rounded-lg transition-colors cursor-move ${
                  selectedCategoryId === cat.id 
                  ? 'border-orange-500 bg-orange-600/10' 
                  : 'border-transparent hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-orange-600 text-white text-[8px] font-bold px-1 rounded uppercase">
                  {cat.name} ({Math.round(cat.x)}%, {Math.round(cat.y)}%)
                </div>
                <h2 className="text-white font-sans font-bold text-xl uppercase tracking-tighter pointer-events-none drop-shadow-md">
                   {cat.name}
                </h2>
                <div className="flex flex-col gap-1 mt-1">
                   {cat.items.map(item => (
                     <div key={item.id} className="flex justify-between items-baseline gap-4 pointer-events-none">
                        <span className="text-white/90 text-sm whitespace-nowrap">{item.name}</span>
                        <span className="text-orange-400 font-mono font-bold text-sm">{item.priceLabel}</span>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-neutral-400 flex items-center gap-2">
            <Move size={12} /> DRAG CATEGORIES TO POSITION
          </div>
        </div>
      </div>
    </div>
  );
}
