# Depo - A Dependency Injection Tool

![CI Status](https://github.com/adigitalmonk/depo/actions/workflows/test.yml/badge.svg)

Depo is a dependency injection library for JavaScript inspired by require.js. It
allows for the registration of dependencies which can later be injected into
other function calls.

## Installation

Currently, only Depo is intended to be used with Deno.

```javascript
// Eventually, grab tagged version isntead of main / nightly
import depo from "https://github.com/adigitalmonk/depo/raw/main/mod.ts";
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
```

#### Caveats

Dependencies can be of any type, with one minor caveat: A limitation stemming
from the nature of JavaScript classes. Because both a class and a function are
of type `function`, if you want to register a class as a dependency, it has to
be wrapped in a function. Otherwise, the resolver will fail when resolving the
dependency.

```javascript
class MyClass {}

// This will fail
// MyClass, being a class, is considered a function (but can't be called)
define("MyClass", MyClass);

// This will not fail
// Resolves to the class instance at call time (lazy loaded)
define("MyClass", () => MyClass);
```

#### Circular Dependencies

There is nothing in place to prevent you from defining a circular dependency. If
you try to inject a circular dependency, your application will crash.

### Providing Dependencies

TBD.

### Cloning Containers

TBD.
