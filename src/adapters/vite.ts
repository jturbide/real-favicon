/**
 * Vite adapter for real-favicon.
 *
 * This plugin runs at build start and delegates all real work
 * to the framework-agnostic core generator.
 *
 * Responsibilities:
 *   - integrate favicon generation into the Vite build lifecycle
 *   - normalize filesystem paths relative to the project root
 *   - forward all options and lifecycle hooks to the core generator
 *
 * It does NOT:
 *   - inject HTML
 *   - modify index.html
 *   - depend on SvelteKit, React, or any framework
 *   - introduce new behavior
 *
 * Its sole responsibility is orchestration.
 */

import path from 'node:path'
import type { Plugin } from 'vite'

import { generateFavicons } from '../core/generate'
import type {
  RealFaviconOptions,
  GenerateFaviconsHooks,
} from '../core/types'

/* -------------------------------------------------------------------------- */
/* Vite plugin                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Create a Vite plugin that generates favicon assets at build time.
 *
 * The plugin intentionally accepts explicit paths and settings.
 * It does not assume `public/`, `static/`, or any framework layout.
 *
 * This plugin is suitable for:
 *   - Vite-only projects
 *   - static site generation
 *   - build pipelines where a prebuild script is undesirable
 */
export function realFavicon(
  options: RealFaviconOptions & {
    /**
     * Optional path where the generated HTML markup
     * (<link> and <meta> tags) should be written.
     *
     * This path is resolved relative to the project root.
     */
    htmlOutput?: string

    /**
     * Optional lifecycle hooks for observability.
     *
     * Hooks are forwarded verbatim to the core generator.
     */
    hooks?: GenerateFaviconsHooks
  },
): Plugin {
  return {
    name: 'real-favicon',

    /**
     * Run once at the beginning of the build.
     *
     * Favicons are deterministic build artifacts and must
     * be generated before the module graph is finalized.
     *
     * They must never be generated during dev-server
     * request handling or runtime execution.
     */
    async buildStart() {
      /**
       * Resolve all paths relative to the project root.
       *
       * Using process.cwd() aligns with Vite’s own resolution
       * strategy and keeps behavior consistent across:
       *   - local development
       *   - CI environments
       *   - different invocation contexts
       */
      const root = process.cwd()

      await generateFavicons({
        ...options,

        /**
         * Normalize filesystem paths relative to the project root.
         */
        source: path.resolve(root, options.source),
        outputDir: path.resolve(root, options.outputDir),
        rootDir: options.rootDir
          ? path.resolve(root, options.rootDir)
          : undefined,
        htmlOutput: options.htmlOutput
          ? path.resolve(root, options.htmlOutput)
          : undefined,
      })
    },
  }
}
