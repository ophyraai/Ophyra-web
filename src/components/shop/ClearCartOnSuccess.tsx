'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

// Vacía el carrito cuando el usuario aterriza en esta página tras un pago
// exitoso (?checkout=success). Se ejecuta 1 vez, client-side.
export default function ClearCartOnSuccess() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
