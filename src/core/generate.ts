/**
 * Core favicon generation logic.
 *
 * This module is intentionally framework-agnostic and build-time only.
 * It is responsible for:
 *   - generating favicon files
 *   - emitting deterministic static artifacts
 *   - optionally materializing HTML markup to disk
 *
 * It MUST NOT:
 *   - depend on Vite, SvelteKit, or any framework
 *   - perform runtime or per-request logic
 *   - assume any project structure
 *
 * Logging, user feedback, and UX concerns are explicitly delegated
 * to the caller via optional lifecycle hooks.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

import {
  generateFaviconFiles,
  generateFaviconHtml,
} from '@realfavicongenerator/generate-favicon'

import {
  getNodeImageAdapter,
  loadAndConvertToSvg,
} from '@realfavicongenerator/image-adapter-node'

import type { RealFaviconOptions, GenerateFaviconsHooks } from './types'

/* -------------------------------------------------------------------------- */
/* Generator                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Generate favicon assets and optional HTML markup.
 *
 * This function is designed to be:
 *   - deterministic
 *   - idempotent (when skipIfExists is enabled)
 *   - safe to run in CI and build pipelines
 *
 * It does NOT inject anything into HTML or frameworks.
 * Consumers decide how and where the generated artifacts are used.
 */
export async function generateFavicons(
  options: RealFaviconOptions & {
    /**
     * Optional path where the generated HTML markup
     * (favicon <link> and <meta> tags) should be written.
     *
     * Example:
     *   "src/lib/generated/favicons.html"
     */
    htmlOutput?: string

    /**
     * Optional lifecycle hooks for observability.
     */
    hooks?: GenerateFaviconsHooks
  },
): Promise<void> {
  const {
    source,
    outputDir,
    htmlOutput,
    skipIfExists = true,
    copyIcoToRoot,
    rootDir,
    hooks,
    ...faviconSettings
  } = options

  if (!source) {
    throw new Error('real-favicon: "source" icon path is required')
  }

  if (!outputDir) {
    throw new Error('real-favicon: "outputDir" is required')
  }

  hooks?.onStart?.()

  /* ------------------------------------------------------------------------ */
  /* Asset generation (idempotent)                                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Detect whether the output directory already exists.
   *
   * This check is intentionally separated from HTML generation:
   * skipping favicon files must NOT skip HTML emission.
   */
  let outputDirExists = false

  if (skipIfExists) {
    try {
      await fs.access(outputDir)
      outputDirExists = true
      hooks?.onSkipFiles?.(outputDir)
    } catch {
      outputDirExists = false
    }
  }

  if (!outputDirExists) {
    /**
     * Ensure output directory exists.
     */
    await fs.mkdir(outputDir, { recursive: true })

    /**
     * Load and normalize the source icon.
     *
     * The RealFaviconGenerator API expects SVG input,
     * so raster formats are converted transparently.
     */
    const masterIcon = {
      icon: await loadAndConvertToSvg(source),
    }

    /**
     * Use the official Node image adapter.
     *
     * This keeps the core logic portable, explicit,
     * and free from implicit environment assumptions.
     */
    const imageAdapter = await getNodeImageAdapter()

    /**
     * Generate all favicon files in memory.
     */
    const files = await generateFaviconFiles(
      masterIcon,
      faviconSettings,
      imageAdapter,
    )

    /**
     * Persist generated favicon files to disk.
     *
     * Content may be:
     *   - Blob
     *   - string
     *   - Uint8Array / Buffer-like
     *
     * All cases are normalized to Buffer.
     */
    await Promise.all(
      Object.entries(files).map(async ([fileName, fileContent]) => {
        const targetPath = path.join(outputDir, fileName)

        const data =
          fileContent instanceof Blob
            ? Buffer.from(await fileContent.arrayBuffer())
            : typeof fileContent === 'string'
              ? Buffer.from(fileContent, 'utf-8')
              : Buffer.from(fileContent)

        await fs.writeFile(targetPath, data)
        hooks?.onFileWritten?.(targetPath)
      }),
    )

    /**
     * Optionally copy favicon.ico to a root directory.
     *
     * This is useful for legacy crawlers and SEO tools
     * that only look for /favicon.ico.
     */
    if (copyIcoToRoot) {
      if (!rootDir) {
        throw new Error(
          'real-favicon: "rootDir" is required when copyIcoToRoot is enabled',
        )
      }

      const sourceIco = path.join(outputDir, 'favicon.ico')
      const targetIco = path.join(rootDir, 'favicon.ico')

      await fs.copyFile(sourceIco, targetIco)
      hooks?.onIcoCopied?.(targetIco)
    }
  }

  /* ------------------------------------------------------------------------ */
  /* HTML generation (always runs)                                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Generate favicon HTML markup (<link>, <meta>, etc.).
   *
   * This output is:
   *   - pure
   *   - deterministic
   *   - inexpensive to compute
   *
   * It is intentionally regenerated on every invocation
   * to ensure consistency with the provided settings.
   */
  const html = generateFaviconHtml(faviconSettings).markups.join('')

  /**
   * Optionally materialize the HTML to disk.
   *
   * This enables:
   *   - static imports via ?raw
   *   - template-based injection
   *   - zero runtime recomputation
   */
  if (htmlOutput) {
    await fs.mkdir(path.dirname(htmlOutput), { recursive: true })
    await fs.writeFile(htmlOutput, html, 'utf-8')
    hooks?.onHtmlWritten?.(htmlOutput)
  }
}
