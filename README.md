# real-favicon

Build-time favicon generation with a framework-agnostic core and explicit adapters.

**real-favicon** wraps the official RealFaviconGenerator toolchain into a deterministic, build-time pipeline that produces:

* static favicon assets (PNG, SVG, ICO, manifests, etc.)
* deterministic HTML `<link>` / `<meta>` markup

Generation happens **before your application build**. The resulting artifacts are written to disk and then consumed by your application through standard, explicit mechanisms.

There is **no runtime generation**, **no framework lock-in**, and **no hidden behavior**.

---

## Upstream dependency

This project is a thin, opinionated wrapper around the official RealFaviconGenerator libraries:

* [https://github.com/RealFaviconGenerator/realfavicongenerator](https://github.com/RealFaviconGenerator/realfavicongenerator)

All image processing, transformations, and favicon semantics are provided by the upstream project. `real-favicon` focuses strictly on orchestration, determinism, and integration.

---

## Why this project exists

RealFaviconGenerator is intentionally low-level and unopinionated. It does not decide:

* when generation should run
* how files should be persisted
* how HTML should be injected
* how builds should be orchestrated

In real projects, those decisions matter.

`real-favicon` provides a **minimal, explicit structure** around RealFaviconGenerator while deliberately avoiding:

* framework coupling
* HTML mutation
* runtime behavior
* convention guessing

You get **repeatable artifacts**, not magic.

---

## Design goals

* **Build-time only** – favicons are static assets, not runtime behavior
* **Deterministic output** – identical inputs always produce identical files
* **Framework-agnostic core** – usable from any build system
* **Explicit filesystem outputs** – everything is written to disk
* **No runtime dependencies** – nothing executes in production
* **Thin adapters** – orchestration layers, not abstractions

This project is intentionally small and opinionated. It solves one problem and stops.

---

## Installation

```bash
npm install real-favicon
```

Requirements:

* Node.js **18+**
* A build step (CI, scripts, or bundler)

---

## Recommended usage: Node / pre-build script

**This is the recommended integration path.**

Favicons are build artifacts. Running generation *before* your bundler avoids lifecycle ordering issues and guarantees that all generated files exist before the module graph is evaluated.

### Example: real-world pre-build script

```ts
import { generateFaviconsNode } from 'real-favicon'
import { IconTransformationType } from '@realfavicongenerator/generate-favicon'

await generateFaviconsNode({
  skipIfExists: false,
  copyIcoToRoot: true,
  source: './src/lib/assets/images/jturbide-logo-140x160.png',
  htmlOutput: './src/lib/generated/favicons.html',
  outputDir: './static/favicons',
  rootDir: './static',
  path: '/favicons/',
  icon: {
    desktop: {
      regularIconTransformation: {
        type: IconTransformationType.Background,
        backgroundColor: '#ffffff',
        backgroundRadius: 0.4,
        imageScale: 1,
        brightness: 0,
      },
      darkIconTransformation: {
        type: IconTransformationType.Background,
        backgroundColor: '#ffffff',
        backgroundRadius: 0.4,
        imageScale: 1,
        brightness: 0,
      },
      darkIconType: 'none',
    },
    touch: {
      transformation: {
        type: IconTransformationType.Background,
        backgroundColor: '#ffffff',
        backgroundRadius: 0,
        imageScale: 1,
        brightness: 0,
      },
      appTitle: 'jTurbide',
    },
    webAppManifest: {
      transformation: {
        type: IconTransformationType.Background,
        backgroundColor: '#ffffff',
        backgroundRadius: 0,
        imageScale: 0.7,
        brightness: 0,
      },
      backgroundColor: '#ffffff',
      themeColor: '#39464a',
      name: 'Julien Turbide',
      shortName: 'jTurbide',
    },
  },
  hooks: {
    onStart: () => console.info('Generating favicons'),
    onSkipFiles: () => console.info('Favicon assets already exist, skipping'),
    onFileWritten: f => console.log('Created', f),
    onIcoCopied: f => console.log('Copied', f),
    onHtmlWritten: f => console.log('Generated HTML', f),
  },
})
```

Typical usage:

```json
{
  "scripts": {
    "prebuild": "node scripts/generate-favicon.js",
    "build": "vite build"
  }
}
```

Characteristics:

* runs once per build, or on demand
* works identically in CI and local environments
* avoids bundler lifecycle constraints
* guarantees files exist before imports

---

## Optional: Vite adapter

If you prefer bundler-managed orchestration, you can use the Vite adapter, or even make your own.

```ts
import { defineConfig } from 'vite'
import { realFavicon } from 'real-favicon'

export default defineConfig({
  plugins: [
    realFavicon({
      source: './logo.png',
      outputDir: './public/favicons',
      htmlOutput: './src/generated/favicons.html',
      path: '/favicons/',
      icon: {
        // RealFaviconGenerator settings
      },
    }),
  ],
})
```

Behavior:

* runs once at build start
* generates favicon files
* emits HTML markup
* performs no HTML injection

Using the Node adapter is often simpler and more predictable.

---

## Core API (advanced)

The framework-agnostic core can be called directly.

```ts
import { generateFavicons } from 'real-favicon'

await generateFavicons({
  source: './logo.png',
  outputDir: './public/favicons',
  htmlOutput: './src/generated/favicons.html',
  path: '/favicons/',
  icon: {
    // settings
  },
})
```

The core:

* performs no path normalization
* makes no assumptions about project structure
* does not log by default
* exposes lifecycle hooks for observability

---

## Observability with hooks

Lifecycle hooks allow logging and metrics without coupling the library to any logging framework.

Available hooks:

* `onStart`
* `onSkipFiles`
* `onFileWritten`
* `onHtmlWritten`
* `onIcoCopied`

Hooks are synchronous, optional, and best-effort.

---

## Framework integration examples

### SvelteKit

In your `hooks.server.ts`

```ts
import favicons from '$lib/generated/favicons.html?raw'

export const handle = ({ event, resolve }) => {
  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%favicons.head%', favicons),
  })
}
```

### Astro

```astro
---
import favicons from '../generated/favicons.html'
---
<head set:html={favicons} />
```

### Any framework

Treat the generated HTML as a static fragment and include it during build or templating.

---

## Idempotency and rebuilds

By default:

* favicon **files** are skipped if the output directory already exists
* HTML markup is always regenerated

This makes repeated builds safe and deterministic.

---

## Non-goals

This project intentionally does **not** provide:

* runtime favicon generation
* dev-server or HMR behavior
* framework-specific HTML injection
* configuration inference or conventions
* smart defaults or heuristics

If you need any of the above, this library is not the right tool.

---

## License

MIT
