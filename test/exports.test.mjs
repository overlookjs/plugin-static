/* --------------------
 * @overlook/plugin-static module
 * Tests
 * ESM export
 * ------------------*/

// Modules
import Plugin from '@overlook/plugin';
import staticPlugin, * as namedExports from '@overlook/plugin-static/es';

// Imports
import itExports from './exports.js';

// Tests

describe('ESM export', () => { // eslint-disable-line jest/lowercase-name
	it('default export is an instance of Plugin class', () => {
		expect(staticPlugin).toBeInstanceOf(Plugin);
	});

	describe('default export has properties', () => {
		itExports(staticPlugin);
	});

	describe('named exports', () => {
		itExports(namedExports);
	});
});
