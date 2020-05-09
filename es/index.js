/* --------------------
 * @overlook/plugin-static module
 * ESM entry point
 * Re-export CJS with named exports
 * ------------------*/

// Exports

import staticPlugin from '../lib/index.js';

export default staticPlugin;
export const {
	STATIC_FILE_PATH,
	GET_STATIC_FILE_PATH,
	STATIC_FILE_HEADERS,
	GET_STATIC_FILE_HEADERS
} = staticPlugin;
