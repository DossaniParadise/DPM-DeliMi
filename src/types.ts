export interface Store {
  id: string;
  name: string;
  theme?: {
    font: string;
    primaryColor: string;
  };
}

export interface Screen {
  id: string;
  name: string;
  backgroundImage?: string;
  lastUpdated?: any;
  isStaging?: boolean;
}

export interface Category {
  id: string;
  name: string;
  x: number;
  y: number;
  order: number;
}

export interface Item {
  id: string;
  name: string;
  priceLabel: string;
  order: number;
}

export interface FullScreenData extends Screen {
  categories: (Category & { items: Item[] })[];
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
