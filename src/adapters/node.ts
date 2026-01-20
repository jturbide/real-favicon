/**
 * Node.js adapter for real-favicon.
 *
 * This module provides a convenience wrapper around the core generator
 * for direct Node, CLI, and CI usage.
 *
 * Responsibilities:
 *   - normalize filesystem paths relative to the current working directory
 *   - forward all options and lifecycle hooks to the core generator
 *
 * It does NOT:
 *   - introduce new behavior
 *   - add logging
 *   - make framework assumptions
 *   - alter generation semantics
 *
 * This adapter exists purely for ergonomics and clarity.
 */

import path from 'node:path'

import { generateFavicons } from '../core/generate'
import type {
  RealFaviconOptions,
  GenerateFaviconsHooks,
} from '../core/types'

/* -------------------------------------------------------------------------- */
/* Node adapter                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Generate favicons in a Node.js environment.
 *
 * All filesystem paths are resolved relative to the current
 * working directory to match typical script and CI expectations.
 *
 * This function is safe to call from:
 *   - build scripts
 *   - CI pipelines
 *   - local tooling
 *
 * It forwards all lifecycle hooks unchanged to the core generator.
 */
export async function generateFaviconsNode(
  options: RealFaviconOptions & {
    /**
     * Optional path where the generated HTML markup
     * (<link> and <meta> tags) should be written.
     */
    htmlOutput?: string

    /**
     * Optional lifecycle hooks for observability.
     *
     * Hooks are forwarded verbatim to the core generator.
     */
    hooks?: GenerateFaviconsHooks
  },
): Promise<void> {
  const cwd = process.cwd()

  await generateFavicons({
    ...options,

    /**
     * Normalize all filesystem paths relative to the
     * current working directory.
     *
     * This ensures consistent behavior across:
     *   - local development
     *   - CI environments
     *   - different invocation contexts
     */
    source: path.resolve(cwd, options.source),
    outputDir: path.resolve(cwd, options.outputDir),
    rootDir: options.rootDir
      ? path.resolve(cwd, options.rootDir)
      : undefined,
    htmlOutput: options.htmlOutput
      ? path.resolve(cwd, options.htmlOutput)
      : undefined,
  })
}
