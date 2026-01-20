/**
 * Public type definitions for real-favicon.
 *
 * This file defines the contract between:
 *   - the framework-agnostic core
 *   - adapters (Vite, scripts, CI)
 *   - consuming applications
 *
 * These types are intentionally explicit.
 * They favor clarity and correctness over convenience.
 */

import type {
  FaviconSettings,
  MasterIcon,
} from '@realfavicongenerator/generate-favicon'

/* -------------------------------------------------------------------------- */
/* Lifecycle hooks                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Optional lifecycle hooks exposed by the favicon generator.
 *
 * These hooks provide observability without coupling the core
 * logic to any logging, tracing, or metrics system.
 *
 * All hooks are synchronous and best-effort:
 * failures inside hooks must not affect generation.
 */
export type GenerateFaviconsHooks = {
  /**
   * Called at the very beginning of the generation process.
   *
   * This is useful for initializing logs, timers, or spans.
   */
  onStart?: () => void

  /**
   * Called when favicon file generation is skipped
   * because the output directory already exists.
   */
  onSkipFiles?: (outputDir: string) => void

  /**
   * Called for each favicon file written to disk.
   *
   * The provided path is absolute or resolved by the caller.
   */
  onFileWritten?: (filePath: string) => void

  /**
   * Called when the generated favicon HTML markup
   * has been written to disk.
   */
  onHtmlWritten?: (filePath: string) => void

  /**
   * Called when favicon.ico has been copied
   * to the configured root directory.
   */
  onIcoCopied?: (filePath: string) => void
}

/* -------------------------------------------------------------------------- */
/* Core options                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Core options for favicon generation.
 *
 * This interface extends RealFaviconGenerator's FaviconSettings
 * with explicit I/O, lifecycle, and execution controls.
 *
 * Nothing here is framework-specific.
 */
export interface RealFaviconOptions extends FaviconSettings {
  /**
   * Path to the source icon.
   *
   * Can be SVG or raster (PNG, JPG, etc.).
   * Raster images are converted to SVG internally.
   *
   * Example:
   *   "./src/assets/logo.png"
   */
  source: string

  /**
   * Directory where favicon files will be written.
   *
   * This directory will be created if it does not exist.
   *
   * Example:
   *   "./public/favicons"
   */
  outputDir: string

  /**
   * Skip favicon file generation if outputDir already exists.
   *
   * This makes the generator idempotent and avoids
   * unnecessary work in repeated builds.
   *
   * Note:
   *   Skipping file generation does NOT skip HTML generation.
   *
   * Default: true
   */
  skipIfExists?: boolean

  /**
   * Copy the generated favicon.ico to a root directory.
   *
   * This is useful for:
   *   - legacy crawlers
   *   - tools that only check /favicon.ico
   *
   * Requires `rootDir` to be set.
   */
  copyIcoToRoot?: boolean

  /**
   * Root directory where favicon.ico should be copied.
   *
   * Example:
   *   "./public"
   */
  rootDir?: string

  /**
   * Optional lifecycle hooks for observability.
   *
   * Hooks allow callers to implement logging, metrics,
   * or tracing without polluting the core logic.
   */
  hooks?: GenerateFaviconsHooks
}

/* -------------------------------------------------------------------------- */
/* Re-exports                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Re-export selected upstream types for convenience.
 *
 * This allows consumers to import everything from
 * a single entry point without depending directly
 * on RealFaviconGenerator internals.
 */
export type { FaviconSettings, MasterIcon }
