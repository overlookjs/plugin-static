/* --------------------
 * @overlook/plugin-static
 * Tests utils to start/stop HTTP server
 * ------------------*/

'use strict';

// Modules
const {Server} = require('http');

// Constants
const PORT = 5000,
	URL = `http://localhost:${PORT}/`;

// Exports

module.exports = {
	startServer,
	stopServer,
	URL
};

let server = null;

async function startServer(handle) {
	server = new Server((req, res) => {
		req.res = res;
		res.req = req;
		handle(req);
	});

	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(PORT, () => {
			server.off('error', reject);
			resolve();
		});
	});
}

async function stopServer() {
	if (!server) return;

	await new Promise((resolve, reject) => {
		server.close((err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});

	server = null;
}
