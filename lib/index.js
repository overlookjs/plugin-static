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
	{File} = require('@overlook/plugin-fs'),
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
			'STATIC_FILE', 'GET_STATIC_FILE',
			'STATIC_FILE_HEADERS', 'GET_STATIC_FILE_HEADERS'
		]
	},
	(Route, {
		STATIC_FILE, GET_STATIC_FILE, STATIC_FILE_HEADERS, GET_STATIC_FILE_HEADERS
	}) => {
		// Extend `[HANDLE_ROUTE]()` if defined, otherwise extend `handle()`
		const handleRouteMethodName = Route.prototype[HANDLE_ROUTE] ? HANDLE_ROUTE : 'handle';

		return class StaticRoute extends Route {
			/**
			 * Init props used by plugin.
			 * @param {Object} props - Props
			 */
			[INIT_PROPS](props) {
				super[INIT_PROPS](props);
				this[STATIC_FILE] = undefined;
				this[STATIC_FILE_HEADERS] = undefined;
			}

			/**
			 * Determine path of file to serve and response headers.
			 */
			async [INIT_ROUTE]() {
				// Delegate to superior
				await super[INIT_ROUTE]();

				// Determine file path
				let file = this[STATIC_FILE];
				if (file != null) {
					const {path} = file;
					invariant(
						isFullString(path),
						`[STATIC_FILE] must be a File object with path if provided - received ${file}`
					);
				} else if (file === undefined) {
					file = this[GET_STATIC_FILE]();
					invariant(
						file == null || isFullString(file.path),
						`[GET_STATIC_FILE]() must return a File object with path or null/undefined - returned ${file}`
					);
					if (file) this[STATIC_FILE] = file;
				}

				// Determine response headers
				let headers = this[STATIC_FILE_HEADERS];
				if (headers != null) {
					invariant(
						isObject(headers),
						`[STATIC_FILE_HEADERS] must be an object if provided - received ${headers}`
					);
				} else if (file) {
					headers = this[GET_STATIC_FILE_HEADERS]();
					invariant(
						headers == null || isObject(headers),
						`[GET_STATIC_FILE_HEADERS]() must return an object or null/undefined - returned ${headers}`
					);
					if (headers) this[STATIC_FILE_HEADERS] = headers;
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
				const res = super[handleRouteMethodName](req);
				if (res !== undefined) return res;

				const file = this[STATIC_FILE];
				if (!file) return null;

				// Serve file
				return new Promise((resolve, reject) => {
					const options = {dotfiles: 'allow'};
					const headers = this[STATIC_FILE_HEADERS];
					if (headers) options.headers = headers;

					sendFile.call(req[RES], file.path, options, (err) => {
						if (!err || err.code === 'ECONNABORTED') {
							resolve();
						} else {
							reject(err);
						}
					});
				});
			}

			/**
			 * Get File object representing file to serve.
			 * Intended to be overridden by subclasses.
			 * Should return `undefined` if no opinion, `null` if definitively no file to be served.
			 * Subclass overrides of this method should call super method and only change value if `undefined`.
			 * @returns {Object|null|undefined} - File object for file to serve
			 */
			[GET_STATIC_FILE]() { // eslint-disable-line class-methods-use-this
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
);

staticPlugin.File = File;

module.exports = staticPlugin;
