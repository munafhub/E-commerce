import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "aurora_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    return {
      items,
      count,
      subtotal,
      add(product, qty = 1) {
        setItems((prev) => {
          const found = prev.find((i) => i.productId === product.id);
          if (found) {
            return prev.map((i) =>
              i.productId === product.id ? { ...i, qty: i.qty + qty } : i
            );
          }
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              qty,
            },
          ];
        });
      },
      setQty(productId, qty) {
        setItems((prev) =>
          prev
            .map((i) => (i.productId === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0)
        );
      },
      remove(productId) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
