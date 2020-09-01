/* --------------------
 * @overlook/plugin-static module
 * Tests
 * CJS export
 * ------------------*/

'use strict';

// Modules
const Plugin = require('@overlook/plugin'),
	staticPlugin = require('@overlook/plugin-static');

// Imports
const itExports = require('./exports.js');

// Tests

describe('CJS export', () => {
	it('is an instance of Plugin class', () => {
		expect(staticPlugin).toBeInstanceOf(Plugin);
	});

	describe('has properties', () => {
		itExports(staticPlugin);
	});
});
