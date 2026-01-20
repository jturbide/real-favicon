/**
 * Default favicon settings.
 *
 * These defaults are intentionally conservative and neutral.
 * They exist to:
 *   - reduce boilerplate for common use cases
 *   - provide a documented starting point
 *
 * They are NOT mandatory.
 * Consumers are free to override everything.
 */

import { IconTransformationType } from '@realfavicongenerator/generate-favicon'
import type { FaviconSettings } from './types'

/**
 * Minimal, production-safe defaults.
 *
 * Notes:
 * - White background is the safest cross-platform choice
 * - No dark icon variant by default (explicit is better)
 * - No branding assumptions (names are empty)
 */
export const defaultFaviconSettings: FaviconSettings = {
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
      appTitle: '',
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
      themeColor: '#000000',
      name: '',
      shortName: '',
    },
  },

  /**
   * Public URL path where favicon assets are served.
   *
   * This should match the location where `outputDir`
   * is exposed by the hosting environment.
   */
  path: '/favicons/',
}
