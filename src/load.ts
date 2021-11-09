import type { Store } from "../types.d.ts";

export const resolveDeps: (store: Store, deps: string[]) => unknown[] = (
  store: Store,
  deps: string[],
) => deps.map((dep_name: string) => load(store, dep_name));

export default function load(store: Store, name: string): unknown {
  const item = store[name];
  if (!item) {
    return null;
  }

  if (typeof (item.resolveable) == "function") {
    const resolvedDeps = resolveDeps(store, item.deps);
    const resolveable = item.resolveable as (...args: unknown[]) => unknown;
    return resolveable(...resolvedDeps);
  }

  return item.resolveable;
}
