import type { Container, Store } from "./types.d.ts";
import create from "./src/create.ts";

export default function container(): Container {
  const store: Store = {};
  return create(store);
}
