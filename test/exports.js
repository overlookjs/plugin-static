/* --------------------
 * @overlook/plugin-static module
 * Tests
 * Test function to ensure all exports present
 * ------------------*/

/* eslint-disable jest/no-export */

'use strict';

// Exports

module.exports = function itExports(staticPlugin) {
	describe('symbols', () => {
		it.each([
			'STATIC_FILE',
			'GET_STATIC_FILE',
			'STATIC_FILE_HEADERS',
			'GET_STATIC_FILE_HEADERS'
		])('%s', (key) => {
			expect(typeof staticPlugin[key]).toBe('symbol');
		});
	});

	describe('properties', () => {
		it('File', () => { // eslint-disable-line jest/lowercase-name
			expect(staticPlugin.File).toBeFunction();
		});
	});
};
