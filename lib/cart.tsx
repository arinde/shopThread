"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type CartLine = {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  unitKobo: number;
  qty: number;
  image: string | null;
};

type CartContextValue = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty: number) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  clear: () => void;
  subtotalKobo: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: { productId: string; variantId: string | null }, b: { productId: string; variantId: string | null }) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

const EMPTY_LINES: CartLine[] = [];
const CHANGE_EVENT = "shopthread-cart-change";

// useSyncExternalStore requires getSnapshot to return a stable reference
// when nothing changed, so parsed results are cached by the raw string they
// came from rather than re-parsed (and re-allocated) on every call.
const snapshotCache = new Map<string, { raw: string | null; parsed: CartLine[] }>();

function readLines(storageKey: string): CartLine[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    raw = null;
  }

  const cached = snapshotCache.get(storageKey);
  if (cached && cached.raw === raw) {
    return cached.parsed;
  }

  let parsed: CartLine[] = EMPTY_LINES;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = EMPTY_LINES;
    }
  }

  snapshotCache.set(storageKey, { raw, parsed });
  return parsed;
}

function writeLines(storageKey: string, lines: CartLine[]) {
  let raw: string | null = null;
  try {
    raw = JSON.stringify(lines);
    localStorage.setItem(storageKey, raw);
  } catch {
    raw = null; // storage unavailable; the in-memory cache below still reflects the change for this tab
  }
  snapshotCache.set(storageKey, { raw, parsed: lines });
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function CartProvider({ storeSlug, children }: { storeSlug: string; children: React.ReactNode }) {
  const storageKey = `shopthread-cart-${storeSlug}`;

  const lines = useSyncExternalStore(
    subscribe,
    () => readLines(storageKey),
    () => EMPTY_LINES
  );

  const add = useCallback(
    (line: Omit<CartLine, "qty">, qty: number) => {
      const current = readLines(storageKey);
      const existing = current.find((l) => sameLine(l, line));
      const next = existing
        ? current.map((l) => (sameLine(l, line) ? { ...l, qty: l.qty + qty } : l))
        : [...current, { ...line, qty }];
      writeLines(storageKey, next);
    },
    [storageKey]
  );

  const setQty = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      const current = readLines(storageKey);
      const next =
        qty <= 0
          ? current.filter((l) => !sameLine(l, { productId, variantId }))
          : current.map((l) => (sameLine(l, { productId, variantId }) ? { ...l, qty } : l));
      writeLines(storageKey, next);
    },
    [storageKey]
  );

  const remove = useCallback(
    (productId: string, variantId: string | null) => {
      const current = readLines(storageKey);
      writeLines(
        storageKey,
        current.filter((l) => !sameLine(l, { productId, variantId }))
      );
    },
    [storageKey]
  );

  const clear = useCallback(() => writeLines(storageKey, []), [storageKey]);

  const subtotalKobo = useMemo(() => lines.reduce((sum, l) => sum + l.unitKobo * l.qty, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const value: CartContextValue = { lines, add, setQty, remove, clear, subtotalKobo, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
