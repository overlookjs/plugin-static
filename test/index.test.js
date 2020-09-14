/* --------------------
 * @overlook/plugin-static module
 * Tests
 * ------------------*/

/* eslint-disable class-methods-use-this, lines-between-class-members */

'use strict';

// Modules
const pathJoin = require('path').join,
	Route = require('@overlook/route'),
	Plugin = require('@overlook/plugin'),
	pathPlugin = require('@overlook/plugin-path'),
	axios = require('axios'),
	staticPlugin = require('@overlook/plugin-static');

const {STATIC_FILE, STATIC_FILE_HEADERS, GET_STATIC_FILE, GET_STATIC_FILE_HEADERS, File} = staticPlugin;

// Imports
const {startServer, stopServer, URL} = require('./support/server.js');

// Init
require('./support/index.js');

// Tests

const StaticRoute = Route.extend(staticPlugin);

describe('Plugin', () => {
	it('is an instance of Plugin class', () => {
		expect(staticPlugin).toBeInstanceOf(Plugin);
	});

	describe('when passed to `Route.extend()`', () => {
		it('returns subclass of Route', () => {
			expect(StaticRoute).toBeFunction();
			expect(Object.getPrototypeOf(StaticRoute)).toBe(Route);
			expect(Object.getPrototypeOf(StaticRoute.prototype)).toBe(Route.prototype);
		});
	});
});

describe('Functionality', () => {
	describe('[INIT_PROPS]', () => {
		it('defines [STATIC_FILE] as undefined', () => {
			const route = new StaticRoute();
			expect(route).toContainEntry([STATIC_FILE, undefined]);
		});

		it('defines [STATIC_FILE_HEADERS] as undefined', () => {
			const route = new StaticRoute();
			expect(route).toContainEntry([STATIC_FILE, undefined]);
		});
	});

	describe('.init', () => {
		it('defines [STATIC_FILE] based on [GET_STATIC_FILE]', async () => {
			class CustomRoute extends StaticRoute {
				[GET_STATIC_FILE]() { return new File('/abc'); }
			}

			const route = new CustomRoute();
			await route.init();
			const file = route[STATIC_FILE];
			expect(file).toBeInstanceOf(File);
			expect(file.path).toBe('/abc');
		});

		it('defines [STATIC_FILE_HEADERS] based on [GET_STATIC_FILE_HEADERS]', async () => {
			const headers = {'X-Foo': 'abc'};
			class CustomRoute extends StaticRoute {
				[GET_STATIC_FILE]() { return new File('/abc'); }
				[GET_STATIC_FILE_HEADERS]() { return headers; }
			}

			const route = new CustomRoute();
			await route.init();
			expect(route[STATIC_FILE_HEADERS]).toBe(headers);
		});
	});

	describe('serves', () => {
		const htmlFilePath = pathJoin(__dirname, './fixtures/page.html');

		let handle;
		beforeEach(() => {
			startServer(req => handle(req));
		});
		afterEach(stopServer);

		describe('file specified with [STATIC_FILE]', () => {
			let res;
			beforeEach(async () => {
				const route = new StaticRoute({[STATIC_FILE]: new File(htmlFilePath)});
				await route.init();
				handle = req => route.handle(req);

				res = await axios(URL);
			});

			it('serves file', () => {
				expect(res.status).toEqual(200);
				expect(res.data).toEqual('<h1>Test</h1>\n');
			});

			it('response has correct content-length header', () => {
				expect(res.headers['content-length']).toEqual('14');
			});

			it('response has correct content-type header', () => {
				expect(res.headers['content-type']).toEqual('text/html; charset=UTF-8');
			});

			it('response has etag header', () => {
				expect(res.headers.etag).toMatch(/^W\/"e-[0-9a-f]{11}"$/);
			});
		});

		describe('file specified with [GET_STATIC_FILE]', () => {
			let res;
			beforeEach(async () => {
				class CustomRoute extends StaticRoute {
					[GET_STATIC_FILE]() { return new File(htmlFilePath); }
				}

				const route = new CustomRoute();
				await route.init();
				handle = req => route.handle(req);

				res = await axios(URL);
			});

			it('serves file', () => {
				expect(res.status).toEqual(200);
				expect(res.data).toEqual('<h1>Test</h1>\n');
			});

			it('response has correct content-length header', () => {
				expect(res.headers['content-length']).toEqual('14');
			});

			it('response has correct content-type header', () => {
				expect(res.headers['content-type']).toEqual('text/html; charset=UTF-8');
			});

			it('response has etag header', () => {
				expect(res.headers.etag).toMatch(/^W\/"e-[0-9a-f]{11}"$/);
			});
		});

		describe('custom headers defined with [STATIC_FILE_HEADERS]', () => {
			let res;
			beforeEach(async () => {
				const route = new StaticRoute({
					[STATIC_FILE]: new File(htmlFilePath),
					[STATIC_FILE_HEADERS]: {'X-Foo': 'abc'}
				});
				await route.init();
				handle = req => route.handle(req);

				res = await axios(URL);
			});

			it('serves file', () => {
				expect(res.status).toEqual(200);
				expect(res.data).toEqual('<h1>Test</h1>\n');
			});

			it('response has custom header', () => {
				expect(res.headers['x-foo']).toEqual('abc');
			});
		});

		describe('custom headers defined with [GET_STATIC_FILE_HEADERS]', () => {
			let res;
			beforeEach(async () => {
				class CustomRoute extends StaticRoute {
					[GET_STATIC_FILE]() { return new File(htmlFilePath); }
					[GET_STATIC_FILE_HEADERS]() { return {'X-Foo': 'def'}; }
				}

				const route = new CustomRoute();
				await route.init();
				handle = req => route.handle(req);

				res = await axios(URL);
			});

			it('serves file', () => {
				expect(res.status).toEqual(200);
				expect(res.data).toEqual('<h1>Test</h1>\n');
			});

			it('response has custom header', () => {
				expect(res.headers['x-foo']).toEqual('def');
			});
		});
	});

	describe('works with path routes', () => {
		const StaticPathRoute = Route.extend(pathPlugin).extend(staticPlugin);
		const htmlFilePath = pathJoin(__dirname, './fixtures/page.html');
		const htmlFilePath2 = pathJoin(__dirname, './fixtures/page2.html');

		beforeEach(async () => {
			const root = new StaticPathRoute({name: 'root', [STATIC_FILE]: new File(htmlFilePath)});
			const child = new StaticPathRoute({name: 'child', [STATIC_FILE]: new File(htmlFilePath2)});
			root.attachChild(child);
			await root.init();

			startServer(req => root.handle(req));
		});
		afterEach(stopServer);

		it('serves correct file for root', async () => {
			const res = await axios(URL);
			expect(res.status).toEqual(200);
			expect(res.data).toEqual('<h1>Test</h1>\n');
		});

		it('serves correct file for child', async () => {
			const res = await axios(`${URL}child`);
			expect(res.status).toEqual(200);
			expect(res.data).toEqual('<h1>Test2</h1>\n');
		});
	});
});
