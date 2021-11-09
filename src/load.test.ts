import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";

import { Store } from "../types.d.ts";
import load, { resolveDeps } from "./load.ts";
import definer from "./definer.ts";

Deno.test("Load :: Resolves scalar items", () => {
  const store: Store = {};
  const define = definer(store);
  define("test", "test");
  define("call", (testValue: string) => testValue, ["test"]);
  const resolved = load(store, "call");
  assertEquals(resolved, "test");
});

Deno.test("Load :: Resolved a list of dependencies in the correct order", () => {
  const store: Store = {};
  const define = definer(store);
  define("testKey", "testValue1");
  define("testKey2", "testValue2");
  define("testKey3", "testValue3");

  const [
    resolved1,
    resolved2,
    resolved3,
  ] = resolveDeps(store, [
    "testKey3",
    "testKey",
    "testKey2",
  ]);

  assertEquals(resolved1, "testValue3");
  assertEquals(resolved2, "testValue1");
  assertEquals(resolved3, "testValue2");
});
