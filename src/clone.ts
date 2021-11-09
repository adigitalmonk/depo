import type { Store } from "../types.d.ts";

export default function clone(store: Store) {
  const clonedStore: Store = {};
  for (const [storeKey, storeItem] of Object.entries(store)) {
    clonedStore[storeKey] = {
      deps: [...storeItem.deps],
      resolveable: storeItem.resolveable,
    };
  }
  return clonedStore;
}
