/**
 * Public API surface for real-favicon.
 *
 * This file defines the ONLY supported import paths.
 * Everything else in the repository is an implementation detail.
 *
 * Consumers MUST import from:
 *
 *   import {
 *     generateFavicons,
 *     generateFaviconsNode,
 *     realFavicon,
 *   } from 'real-favicon'
 *
 * Direct imports from internal paths are not supported
 * and may break without notice.
 */

/* -------------------------------------------------------------------------- */
/* Core generator                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Framework-agnostic core favicon generator.
 *
 * This function performs all real work:
 *   - favicon file generation
 *   - deterministic static artifact emission
 *   - optional HTML markup materialization
 *
 * It is usable from:
 *   - Node scripts
 *   - CI pipelines
 *   - custom build systems
 *
 * It does NOT:
 *   - inject HTML
 *   - depend on any framework
 *   - perform runtime or per-request logic
 */
export {generateFavicons} from './core/generate'

/* -------------------------------------------------------------------------- */
/* Node adapter                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Node.js adapter for scripts, tooling, and CI usage.
 *
 * This is a thin convenience wrapper around the core generator
 * that normalizes filesystem paths relative to process.cwd().
 *
 * It introduces no new behavior.
 */
export {generateFaviconsNode} from './adapters/node'

/* -------------------------------------------------------------------------- */
/* Vite adapter                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Optional Vite adapter.
 *
 * This adapter wires the core generator into Vite’s
 * build lifecycle and runs once at build start.
 *
 * It is provided for convenience only.
 * Using a pre-build script with the Node adapter
 * is equally valid and often preferable.
 */
export {realFavicon} from './adapters/vite'

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Default favicon settings.
 *
 * These are provided purely as a convenience
 * for common use cases.
 *
 * Consumers are free to ignore or override them.
 */
export {defaultFaviconSettings} from './core/defaults'

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Public type definitions.
 *
 * These types define the stable contract between:
 *   - the core generator
 *   - adapters (Node, Vite, CI)
 *   - consuming applications
 *
 * Re-exporting them here avoids forcing consumers
 * to depend on internal paths.
 */
export type {
  RealFaviconOptions,
  GenerateFaviconsHooks,
} from './core/types'
