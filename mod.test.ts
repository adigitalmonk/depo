import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.113.0/testing/asserts.ts";

import type { Newable } from "./types.d.ts";
import depo from "./mod.ts";

Deno.test("Depo :: Returns a DI Object", () => {
  const container = depo();

  assertEquals(typeof (container.define), "function");
  assertEquals(typeof (container.provide), "function");
  assertEquals(typeof (container.clone), "function");
});

Deno.test("Depo :: Injecting Scalars", () => {
  const { define, provide } = depo();
  define("test", "test");

  const result = provide(["test"], (testValue: any) => testValue);
  assertEquals(result, "test");
});

Deno.test("Depo :: Injecting complex values", () => {
  const { define, provide } = depo();
  define("test", () => "test");

  const result = provide(["test"], (testValue: any) => testValue);
  assertEquals(result, "test");
});

class Test {
  someValue: string;
  constructor(someValue: string) {
    this.someValue = someValue;
  }

  value() {
    return this.someValue;
  }
}

Deno.test("Depo :: Eager-eval Classes", () => {
  const { define, provide } = depo();

  define("test", new Test("InputValue"));
  const resolvedClass = provide(["test"], (instance: Test) => instance) as Test;
  const resolvedClass2 = provide(
    ["test"],
    (instance: Test) => instance,
  ) as Test;

  assert(resolvedClass === resolvedClass2);
  assertEquals(resolvedClass.value(), "InputValue");
  assertEquals(resolvedClass2.value(), "InputValue");
});

Deno.test("Depo :: Lazy-eval factory methods", () => {
  const { define, provide } = depo();

  define("test", "test");
  define("testInstance", new Test("test"));

  const instanceA = provide(["testInstance"], (instance: any) => instance);
  const instanceB = provide(["testInstance"], (instance: any) => instance);
  assert(instanceA === instanceB);

  define("testClass", () => Test);
  define(
    "testFactory",
    (testValue: string, testClass: Newable) => new testClass(testValue),
    ["test", "testClass"],
  );
  const factoryResultA = provide(
    ["testFactory"],
    (newInstance: any) => newInstance,
  ) as Test;
  const factoryResultB = provide(
    ["testFactory"],
    (newInstance: any) => newInstance,
  ) as Test;

  assert(factoryResultA !== factoryResultB);
});

Deno.test("Depo :: Eager-eval methods", () => {
  const { define, provide } = depo();

  define("test", "test");
  define("testEager", (test: string) => new Test(test), ["test"], {
    eager: true,
  });

  const instanceA = provide(["testEager"], (instance: any) => instance);
  const instanceB = provide(["testEager"], (instance: any) => instance);
  assert(instanceA === instanceB);
});

Deno.test("Depo :: Cloning a container", () => {
  const { define, provide, clone } = depo();
  define("test1", "test1");
  const { define: defineClone, provide: provideClone } = clone();
  defineClone("test2", "test2");

  assertEquals(provide(["test1"], (testValue: string) => testValue), "test1");
  assertEquals(
    provideClone(["test1"], (testValue: string) => testValue),
    "test1",
  );

  assertEquals(provide(["test2"], (testValue: string) => testValue), null);
  assertEquals(
    provideClone(["test2"], (testValue: string) => testValue),
    "test2",
  );
});

Deno.test("Depo :: Injection into Factory", () => {
  const { define, provide } = depo();
  define("Seed", 1);
  const Incrementer = provide(
    ["Seed"],
    (seedValue: number) => () => seedValue++,
  ) as CallableFunction;

  assertEquals(Incrementer(), 1);
  assertEquals(Incrementer(), 2);
  assertEquals(Incrementer(), 3);
});

Deno.test("Depo :: Eager resolution vs. Lazy resolution", () => {
  const { define, provide } = depo();
  define("salutation", "Hello");
  define("greeter1", (salutation: string) => `${salutation}, world!`, [
    "salutation",
  ], { eager: true });
  define("greeter2", (salutation: string) => `${salutation}, world!`, [
    "salutation",
  ]);

  define("salutation", "Bonjour", [], { override: true });

  const greeting1 = provide(["greeter1"], (greeting: string) => greeting);
  const greeting2 = provide(["greeter2"], (greeting: string) => greeting);

  assertEquals(greeting1, "Hello, world!", "should match initial salutation");
  assertEquals(greeting2, "Bonjour, world!", "should match second salutation");
});
