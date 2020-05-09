/* --------------------
 * @overlook/plugin-static module
 * Entry point
 * ------------------*/

'use strict';

// Exports

// Modules
const Plugin = require('@overlook/plugin'),
	{INIT_PROPS, INIT_ROUTE} = require('@overlook/route'),
	{HANDLE_ROUTE} = require('@overlook/plugin-match'),
	{RES} = require('@overlook/plugin-serve-http'),
	{sendFile} = require('express').response,
	invariant = require('simple-invariant'),
	{isObject, isFullString} = require('is-it-type');

// Imports
const pkg = require('../package.json');

// Exports

const staticPlugin = new Plugin(
	pkg,
	{
		symbols: [
			'STATIC_FILE_PATH', 'GET_STATIC_FILE_PATH',
			'STATIC_FILE_HEADERS', 'GET_STATIC_FILE_HEADERS'
		]
	},
	extend
);

module.exports = staticPlugin;

const {
	STATIC_FILE_PATH, GET_STATIC_FILE_PATH,
	STATIC_FILE_HEADERS, GET_STATIC_FILE_HEADERS
} = staticPlugin;

function extend(Route) {
	// Extend `[HANDLE_ROUTE]()` if defined, otherwise extend `handle()`
	const handleRouteMethodName = Route.prototype[HANDLE_ROUTE] ? HANDLE_ROUTE : 'handle';

	return class StaticRoute extends Route {
		/**
		 * Init props used by plugin.
		 * @param {Object} props - Props
		 */
		[INIT_PROPS](props) {
			super[INIT_PROPS](props);
			this[STATIC_FILE_PATH] = undefined;
			this[STATIC_FILE_HEADERS] = undefined;
		}

		/**
		 * Determine path of file to serve and response headers.
		 */
		async [INIT_ROUTE]() {
			// Delegate to superior
			await super[INIT_ROUTE]();

			// Determine file path
			let path = this[STATIC_FILE_PATH];
			if (path != null) {
				invariant(
					isFullString(path),
					`[STATIC_FILE_PATH] must be a non-empty string if provided - received ${path}`
				);
			} else if (path === undefined) {
				path = this[GET_STATIC_FILE_PATH]();
				invariant(
					path == null || isFullString(path),
					`[GET_STATIC_FILE_PATH]() must return a non-empty string or null/undefined - returned ${path}`
				);
				this[STATIC_FILE_PATH] = path;
			}

			// Determine response headers
			let headers = this[STATIC_FILE_HEADERS];
			if (headers != null) {
				invariant(
					isObject(headers),
					`[STATIC_FILE_HEADERS] must be an object if provided - received ${headers}`
				);
			} else if (path) {
				headers = this[GET_STATIC_FILE_HEADERS]();
				invariant(
					headers == null || isObject(headers),
					`[GET_STATIC_FILE_HEADERS]() must return an object or null/undefined - returned ${headers}`
				);
				this[STATIC_FILE_HEADERS] = headers;
			}
		}

		/**
		 * Serve file in response to request.
		 * Uses express's `res.sendFile()` method.
		 * @param {Object} req - Request object
		 * @returns {Promise<undefined>}
		 */
		[handleRouteMethodName](req) {
			// Delegate to superiors
			const result = super[handleRouteMethodName](req);
			if (result) return result;

			const path = this[STATIC_FILE_PATH];
			if (!path) return null;

			// Serve file
			return new Promise((resolve, reject) => {
				const options = {dotfiles: 'allow'};
				const headers = this[STATIC_FILE_HEADERS];
				if (headers) options.headers = headers;

				sendFile.call(req[RES], path, options, (err) => {
					if (!err || err.code === 'ECONNABORTED') {
						resolve();
					} else {
						reject(err);
					}
				});
			});
		}

		/**
		 * Get path of file to serve.
		 * Intended to be overridden by subclasses.
		 * Should return `undefined` if no opinion, `null` if definitively no file to be served.
		 * Subclass overrides of this method should call super method and only change value if `undefined`.
		 * @returns {string|null|undefined} - Path of file to serve
		 */
		[GET_STATIC_FILE_PATH]() { // eslint-disable-line class-methods-use-this
			return undefined;
		}

		/**
		 * Get response headers.
		 * Intended to be overridden by subclasses.
		 * Should return `undefined` if no opinion, `null` if definitively no headers.
		 * Subclass overrides of this method should call super method and only change value if `undefined`.
		 * @returns {Object|null|undefined} - Headers to be added to response
		 */
		[GET_STATIC_FILE_HEADERS]() { // eslint-disable-line class-methods-use-this
			return undefined;
		}
	};
}
