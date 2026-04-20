'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import type { CartItem } from '@/types/marketplace';

// ============================================
// State + Actions
// ============================================

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; productId: string }
  | { type: 'updateQty'; productId: string; quantity: number }
  | { type: 'clear' }
  | { type: 'replace'; items: CartItem[] };

const STORAGE_KEY = 'ophyra:cart:v1';
const MAX_QTY_PER_LINE = 20;
const MAX_LINES = 20;

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      // Si ya existe, sumar quantity (capada)
      const existing = state.items.find(
        (i) => i.product_id === action.item.product_id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === action.item.product_id
              ? {
                  ...i,
                  quantity: Math.min(
                    i.quantity + action.item.quantity,
                    MAX_QTY_PER_LINE,
                  ),
                }
              : i,
          ),
        };
      }
      // Si no existe y no superamos el límite de líneas, añadir
      if (state.items.length >= MAX_LINES) return state;
      return { items: [...state.items, action.item] };
    }

    case 'remove':
      return {
        items: state.items.filter((i) => i.product_id !== action.productId),
      };

    case 'updateQty': {
      const qty = Math.max(1, Math.min(action.quantity, MAX_QTY_PER_LINE));
      return {
        items: state.items.map((i) =>
          i.product_id === action.productId ? { ...i, quantity: qty } : i,
        ),
      };
    }

    case 'clear':
      return { items: [] };

    case 'replace':
      return { items: action.items };

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

export interface AppliedCoupon {
  code: string;
  type: 'percent' | 'amount';
  percent_off: number | null;
  amount_off_cents: number | null;
  discount_cents: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal_cents: number;
  currency: string;
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  // Drawer
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  // Coupon
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ============================================
// Provider
// ============================================

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  // hydrated: prevents SSR/CSR mismatch — el badge del icono renderiza 0
  // hasta que esto sea true
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // 1) Hydrate desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'replace', items: parsed as CartItem[] });
        }
      }
    } catch (err) {
      console.error('Cart hydration failed:', err);
    }
    // Patrón canónico de hidratación: marcamos como hidratado UNA SOLA VEZ
    // al montar, justo después de leer localStorage. Sin esto el badge del
    // CartIcon parpadearía con valores incorrectos en SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // 2) Persistir cambios a localStorage (solo después de hidratar)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (err) {
      console.error('Cart persist failed:', err);
    }
  }, [state.items, hydrated]);

  // 3) Sync entre tabs: si otra pestaña cambia el cart en localStorage,
  //    nos enteramos y actualizamos
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) {
          dispatch({ type: 'replace', items: parsed as CartItem[] });
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Derivados
  const count = useMemo(
    () => state.items.reduce((acc, i) => acc + i.quantity, 0),
    [state.items],
  );

  const subtotal_cents = useMemo(
    () => state.items.reduce((acc, i) => acc + i.unit_price_cents * i.quantity, 0),
    [state.items],
  );

  // Asume que todos los items tienen la misma currency (validado al añadir).
  // Para v1 todo es EUR.
  const currency = state.items[0]?.currency || 'eur';

  const value: CartContextValue = {
    items: state.items,
    hydrated,
    count,
    subtotal_cents,
    currency,
    add: (item) => {
      // Si el cart ya tiene items con currency distinta, rechazamos.
      // Para v1 nunca debería pasar (todo EUR), pero defensive.
      if (
        state.items.length > 0 &&
        state.items[0].currency !== item.currency
      ) {
        console.error('Cart currency mismatch, ignoring add');
        return;
      }
      dispatch({ type: 'add', item });
      setDrawerOpen(true);
    },
    remove: (productId) => dispatch({ type: 'remove', productId }),
    updateQty: (productId, quantity) =>
      dispatch({ type: 'updateQty', productId, quantity }),
    clear: () => {
      dispatch({ type: 'clear' });
      setAppliedCoupon(null);
    },
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    toggleDrawer: () => setDrawerOpen((v) => !v),
    appliedCoupon,
    applyCoupon: (c) => setAppliedCoupon(c),
    removeCoupon: () => setAppliedCoupon(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
