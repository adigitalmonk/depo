import type {
  DefinerOptions,
  IDefine,
  Resolveable,
  Store,
  StoreItem,
} from "../types.d.ts";

import { resolveDeps } from "./load.ts";

export default function definer(store: Store): IDefine {
  return function define(
    name: string,
    resolveable?: Resolveable,
    deps?: string[],
    opts?: DefinerOptions,
  ) {
    if (store[name] && !opts?.override) {
      return false;
    }

    if (opts?.eager && typeof (resolveable) === "function") {
      resolveable = resolveable(...resolveDeps(store, deps || []));
    }

    const item: StoreItem = {
      resolveable,
      deps: deps || [],
    };

    store[name] = item;
    return true;
  };
}
