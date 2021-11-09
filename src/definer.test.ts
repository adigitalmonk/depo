import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";
import definer from "./definer.ts";
import type { Store } from "../types.d.ts";

Deno.test("Definer :: Add Items", () => {
  const store: Store = {};
  const define = definer(store);
  const testKey = "test";
  const testResolution = "test";
  define(testKey, testResolution);

  const item = store[testKey];
  assertEquals(item.resolveable, testResolution);
});

Deno.test("Definer :: Don't Override Items", () => {
  const store: Store = {};
  const define = definer(store);
  const testKey = "test";
  const testResolution = "test";
  assertEquals(
    define(testKey, testResolution),
    true,
    "define returned false but new item should be true",
  );

  const item = store[testKey];
  assertEquals(item.resolveable, testResolution);
  const overrideResolution = "test2";
  assertEquals(
    define(testKey, overrideResolution),
    false,
    "define returned true but no override should be false",
  );

  const notOverridenItem = store[testKey];
  assertEquals(notOverridenItem.resolveable, testResolution);
});

Deno.test("Definer :: Override Items Optionally", () => {
  const store: Store = {};
  const define = definer(store);
  const testKey = "test";
  const testResolution = "test";
  assertEquals(
    define(testKey, testResolution),
    true,
    "define returned false but new item should be true",
  );

  const item = store[testKey];
  assertEquals(item.resolveable, testResolution);

  const overrideResolution = "test2";
  assertEquals(
    define(testKey, overrideResolution, [], { override: true }),
    true,
    "define returned false but override should be true",
  );
  const overrideItem = store[testKey];
  assertEquals(overrideItem.resolveable, overrideResolution);
});

Deno.test("Definer :: Eager Register Items", () => {
  const store: Store = {};
  const define = definer(store);

  define("testKey", () => 4 * 4, [], { eager: true });
  assertEquals(store["testKey"].resolveable, 16);
});
