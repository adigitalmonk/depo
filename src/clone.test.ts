import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.113.0/testing/asserts.ts";

import { Store } from "../types.d.ts";
import clone from "./clone.ts";
import definer from "./definer.ts";

const dummyValue = "dummy";

Deno.test("Clone :: Returns new store with no objects", () => {
  const store: Store = {};
  const clonedStore = clone(store);

  // Different reeferences
  assert(store != clonedStore);
  assert(store !== clonedStore);
});

Deno.test("Clone :: Returns a new store with new objects", () => {
  const store: Store = {};
  const define = definer(store);
  define("testScalar", dummyValue);
  define("testComplex", () => {
    dummyValue;
  });
  const clonedStore = clone(store);

  const originalScalarItem = store["testScalar"];
  const clonedScalarItem = clonedStore["testScalar"];

  assert(
    originalScalarItem !== clonedScalarItem,
    "scalar container items should be different references",
  );
  assert(
    originalScalarItem.deps !== clonedScalarItem.deps,
    "scalar container item dependency lists should be different references",
  );
  assert(
    originalScalarItem.resolveable === clonedScalarItem.resolveable,
    "scalar contain item resolvables should be same references",
  );
  assert(
    typeof (originalScalarItem.resolveable) ===
      typeof (clonedScalarItem.resolveable),
    "scalar contain item resolvables should be same type",
  );

  const originalComplexItem = store["testComplex"];
  const clonedComplexItem = clonedStore["testComplex"];

  assert(
    originalComplexItem !== clonedComplexItem,
    "complex container items should be different references",
  );
  assert(
    originalComplexItem.deps !== clonedComplexItem.deps,
    "complex container item dependency lists should be different references",
  );
  assert(
    originalComplexItem.resolveable === clonedComplexItem.resolveable,
    "complex container items will be the same reference",
  );
  assert(
    typeof (originalComplexItem.resolveable) ===
      typeof (clonedComplexItem.resolveable),
    "scalar contain item resolvables should be same type",
  );
});

Deno.test("Clone :: Actions on the original container don't affect the clone", () => {
  const store: Store = {};
  const define = definer(store);
  define("original", dummyValue);
  const clonedStore = clone(store);
  define("postClone", dummyValue);

  assert(store["original"].resolveable, dummyValue);
  assert(clonedStore["original"].resolveable, dummyValue);

  assertEquals(store["postClone"].resolveable, dummyValue);
  assertEquals(clonedStore["postClone"], undefined);
});

Deno.test("Clone :: Actions on the clone don't affect the original", () => {
  const store: Store = {};
  const define = definer(store);
  define("dummy", dummyValue);
  define("dummy2", dummyValue);
  const clonedStore = clone(store);
  delete clonedStore["dummy2"];

  assertEquals(store["dummy"].resolveable, dummyValue);
  assertEquals(clonedStore["dummy"].resolveable, dummyValue);

  assertEquals(store["dummy2"].resolveable, dummyValue);
  assertEquals(clonedStore["dummy2"], undefined);
});
