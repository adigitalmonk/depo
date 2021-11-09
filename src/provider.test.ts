import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";
import type { Store } from "../types.d.ts";

import provider from "./provider.ts";
import definer from "./definer.ts";

Deno.test("Provider :: Missing dependency returns null", () => {
  const store: Store = {};
  const provide = provider(store);
  const resolvedValue = provide(["UnknownKey"], (input: any) => input);
  assertEquals(resolvedValue, null);
});

Deno.test("Provider :: Loads Scalar Items", () => {
  const store: Store = {};
  const define = definer(store);

  const testKey = "test";
  const testValue = "test";
  define(testKey, testValue);

  const provide = provider(store);
  const resolvedValue = provide([testKey], (input: any) => input);
  assertEquals(resolvedValue, testValue);
});

Deno.test("Provider :: Loads Lazy Items", () => {
  const store: Store = {};
  const define = definer(store);
  const provide = provider(store);

  const testKey = "test";
  define(testKey, () => 1);

  const testResolution = provide([testKey], (testValue: any) => testValue);
  assertEquals(testResolution, 1);
});

Deno.test("Provider :: Loads Dependent Items", () => {
  const store: Store = {};
  const define = definer(store);
  const provide = provider(store);

  const seedKey = "seed";
  const testKey = "test";

  define(seedKey, 1);
  define(testKey, (seedValue: number) => seedValue * 2, [seedKey]);

  const testResult = provide([testKey], (testValue: any) => testValue);

  assertEquals(testResult, 2);
});
