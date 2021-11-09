import type { IProvide, Store } from "../types.d.ts";
import { resolveDeps } from "./load.ts";

export default function provider(store: Store): IProvide {
  return function provide(deps: string[], callback: CallableFunction) {
    return callback(...resolveDeps(store, deps));
  };
}
