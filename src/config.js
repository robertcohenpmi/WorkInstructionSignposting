// src/config.js
const qs = new URLSearchParams(location.search);

/**
 * Allows overriding the WI JSON path via URL, e.g.:
 *   ?src=WI_Export.json
 *   ?src=data/WI_Export.json
 *
 * NOTE: Path is relative to index.html at runtime.
 * If your Pages site root is /docs, ensure the file lives under /docs as well.
 */
export const JSON_PATH = qs.get('src') || 'WI_Export.json';

export const SALESFORCE_DOMAIN = 'https://mypmi.lightning.force.com';

/** Theme key for light/dark preference */
export const THEME_KEY = 'pc_wi_theme';

/** App state key for localStorage persistence */
export const STATE_KEY = 'pc_wi_state_v2';
