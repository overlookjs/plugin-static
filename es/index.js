/* --------------------
 * @overlook/plugin-static module
 * ESM entry point
 * Re-export CJS with named exports
 * ------------------*/

// Exports

import staticPlugin from '../lib/index.js';

export default staticPlugin;
export const {
	STATIC_FILE,
	GET_STATIC_FILE,
	STATIC_FILE_HEADERS,
	GET_STATIC_FILE_HEADERS,
	// From @overlook/plugin-fs
	File
} = staticPlugin;
