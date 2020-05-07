/* --------------------
 * @overlook/plugin-static module
 * Tests
 * ------------------*/

'use strict';

// Modules
const staticPlugin = require('@overlook/plugin-static');

// Init
require('./support/index.js');

// Tests

describe('tests', () => {
	it.skip('all', () => { // eslint-disable-line jest/no-disabled-tests
		expect(staticPlugin).not.toBeUndefined();
	});
});
