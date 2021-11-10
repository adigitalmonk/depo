# Depo - A Dependency Injection Tool

![CI Status](https://github.com/adigitalmonk/depo/actions/workflows/test.yml/badge.svg)

Depo is a dependency injection library for JavaScript inspired by require.js. It
allows for the registration of dependencies which can later be injected into
other function calls.

## Installation

Currently, only Depo is intended to be used with Deno.

```javascript
import depo from "https://github.com/adigitalmonk/depo/raw/v1.0.0/mod.ts";
```

Installation instructions for Node are coming soon.

## Usage

Depo's usage is very simple. There are three functions exposed from the main
entry point:

- `define` is responsible for registering dependencies into the container
- `provide` is responsible pulling dependencies out of the container
- `clone` is responsible for cloning a container

### Defining Dependencies

The `define` function is responsible for adding a new dependency to the DI
container.

```javascript
import depo from "./mod.ts";

const { define } = depo();

define("SeedValue", 0);
```

This will register `'SeedValue'` as a dependency into the container, which will
resolve to `0`.

You can also register functions, and even provide dependencies for them.

```javascript
define("salutation", "Hello");
define("greeter", (saluation) => `${salution}, world!`, ["salutation"]);
// 'greeter' will return 'Hello, world!'
```

This will register a dependency with the name 'greeter', with the first argument
being the dependency named `'salutation'`. Dependencies will always be injected
in the order listed.

Depo dependencies are lazy-loaded, so in the above example, we could can use the
`override` option to swap out the saluation later.

```javascript
define("salutation", "Bonjour", { override: true });
// 'greeter' will now return 'Bonjour, world!'
```

Depo does allow for eagar loading which will instead register the result of the
provided function. This is the only way to provide dependencies for
scalar/simple dependencies.

```javascript
define("Initial", 10);
define("InitialPlus2", (initial) => initial + 2, ["initial"], { eager: true });
// 'InitialPlus2' will always return 12 even if 'Initial' changes later.
```

You can register factory functions as well, or specific instances of an class.

```javascript
class MyClass {}

// Will always return a new instance of MyClass when provided
define("MyClass", () => new MyClass());

// Will always return the same instance
// Class instances are objects, not functions.
define("MyClass", new MyClass());

// If you'd like to have grab some dependencies out of the container...
define("MyClass", (someConfig) => new MyClass(), ["someConfig"]); // Factory
define("MyClass", (someConfig) => new MyClass(), ["someConfig"], {
  eager: true,
}); // Instance
```

#### Caveats

Dependencies can be of any type with one minor caveat; a limitation stemming
from the nature of JavaScript classes. Because both a class and a function are
of type `function`. If you want to register just a class as a dependency, it has
to be wrapped in a function. Otherwise, the resolver will fail when resolving
the dependency.

```javascript
class MyClass {}

// This will fail
// MyClass, being a class, is considered a function (but can't be called without `new`)
define("MyClass", MyClass);

// This will not fail
// Resolves to the class instance at call time (lazy loaded)
define("MyClass", () => MyClass);
```

#### Circular Dependencies

There is nothing in place to prevent you from defining a circular dependency. If
you try to inject a circular dependency, your application will crash.

### Providing Dependencies

In order to make the most out of the container, the `provide` function allows us
to inject function calls with items from our container. After resolving the
dependencies, it will call the provided callback with the dependencies as the
arguments in order. This is essentially the same as the `define` functionality,
except that it will return the result to you.

```javascript
define("salution", "Hello");
const greeting = provide(
  ["salutation"],
  (salutation) => `${salutation}, world!`,
);
```

The real value here is to generate factory methods which inject dependencies
into closures.

**Note: Undeclared dependencies will resolve as `null`**

Here's an example that's a bit more realistic.

```javascript
// redis.ts
import { connect } from "https://deno.land/x/redis/mod.ts";
const config = {
  hostname: "127.0.0.1",
  port: 6379,
};

export default function openRedis(define) {
  // Add a container instance named 'redis' which is a connection to the redis server
  define("redis", await connect(config));
}

// server.ts
import { Application } from "https://deno.land/x/oak/mod.ts";
import depo from "https://github.com/adigitalmonk/depo/raw/main/mod.ts";
import openRedis from "./redis.ts";

const { define, provide } = depo();
const app = new Application();

// Pass the `define` method over to another method to prepare our dependencies.
openRedis(define);

// Create some controller that returns a closure, allowing us to inject
// only the dependencies we need to exist for it.
const redisStatusController = (redis) =>
  (ctx) => {
    ctx.response.body = `Redis is ${
      redis.isConnected() ? "healthy" : "unhealthy"
    }`;
  };

// Set up the application with the controller we created
// `provide` will inject redis into the first argument of `redisStatusController`
const app = new Application();
app.use(provide(["redis"], redisStatusController));
await app.listen({ port: 8000 });
```

### Cloning Containers

The `clone` function will create a duplicate container with new versions of the
same dependencies. This can be useful if you want to have a child container with
extra dependencies not available to the source.

```javascript
const { define, provide, clone } = depo();
define("test1", "test1");

const { define: defineClone, provide: provideClone } = clone();
defineClone("test2", "test2");

provide(["test1"], (testValue: string) => testValue); // 'test1'
provideClone(["test1"], (testValue: string) => testValue); // "test1"

provide(["test2"], (testValue: string) => testValue); // null
provideClone(["test2"], (testValue: string) => testValue); // 'test2'
```

Note though, that items in the container will have the same actual reference to
the item. E.g., an object stored as an instance, when cloned, will be the same
object in both containers.
