import type { Container, Store } from "../types.d.ts";

import definer from "./definer.ts";
import provider from "./provider.ts";
import clone from "./clone.ts";

export default function create(store: Store): Container {
  return {
    define: definer(store),
    provide: provider(store),
    clone: () => {
      const clonedStore = clone(store);
      return create(clonedStore);
    },
  };
}
