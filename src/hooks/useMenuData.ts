import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FullScreenData, Category, Item } from '../types';

export function useMenuData(storeId: string, screenId: string) {
  const [data, setData] = useState<FullScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!storeId || !screenId) return;

    setLoading(true);
    
    // Listen to screen metadata
    const screenRef = doc(db, 'stores', storeId, 'screens', screenId);
    
    const unsubscribeScreen = onSnapshot(screenRef, (screenSnap) => {
      if (!screenSnap.exists()) {
        setError(new Error('Screen not found'));
        setLoading(false);
        return;
      }

      const screenBase = { id: screenSnap.id, ...screenSnap.data() } as any;

      // Listen to categories
      const categoriesRef = collection(db, 'stores', storeId, 'screens', screenId, 'categories');
      const q = query(categoriesRef, orderBy('order', 'asc'));

      const unsubscribeCategories = onSnapshot(q, (categoriesSnap) => {
        const categories: (Category & { items: Item[] })[] = [];
        
        // This is a bit complex since we need items for each category
        // In a production app with huge categories, we'd optimize
        const categoryPromises = categoriesSnap.docs.map(catDoc => {
          const catData = { id: catDoc.id, ...catDoc.data() } as Category;
          
          return new Promise<void>((resolve) => {
            const itemsRef = collection(db, 'stores', storeId, 'screens', screenId, 'categories', catDoc.id, 'items');
            const itemsQ = query(itemsRef, orderBy('order', 'asc'));
            
            // Note: Since we want a single state update, we'll keep tracking items
            // However, nested listeners can be tricky. Let's simplify.
            // For this specific kiosk use case, categories are few.
            onSnapshot(itemsQ, (itemsSnap) => {
              const items = itemsSnap.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() } as Item));
              
              const existingIndex = categories.findIndex(c => c.id === catDoc.id);
              if (existingIndex > -1) {
                categories[existingIndex] = { ...catData, items };
              } else {
                categories.push({ ...catData, items });
              }
              
              // Sort categories by order if they were pushed out of sync
              categories.sort((a, b) => (a.order || 0) - (b.order || 0));
              
              setData({ ...screenBase, categories });
              setLoading(false);
              resolve();
            });
          });
        });

        if (categoriesSnap.empty) {
          setData({ ...screenBase, categories: [] });
          setLoading(false);
        }
      }, (err) => {
        setError(err);
        setLoading(false);
      });

      return () => {
        unsubscribeCategories();
      };
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => {
      unsubscribeScreen();
    };
  }, [storeId, screenId]);

  return { data, loading, error };
}
