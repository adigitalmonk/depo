import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";

import type { Store } from "../types.d.ts";
import create from "./create.ts";

Deno.test("Create :: Returns a DI Object", () => {
  const store: Store = {};
  const container = create(store);

  assertEquals(typeof (container.define), "function");
  assertEquals(typeof (container.provide), "function");
  assertEquals(typeof (container.clone), "function");
});
