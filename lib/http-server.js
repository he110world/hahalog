'use strict';

var fs = require('fs'),
	path = require('path'),
	union = require('union'),
	ecstatic = require('ecstatic'),
	httpProxy = require('http-proxy'),
	corser = require('corser'),
	dateformat = require('dateformat'),
	director = require('director');

var router = new director.http.Router();

//
// Remark: backwards compatibility for previous
// case convention of HTTP
//
exports.HttpServer = exports.HTTPServer = HttpServer;

/**
 * Returns a new instance of HttpServer with the
 * specified `options`.
 */
exports.createServer = function (options) {
	return new HttpServer(options);
};

/**
 * Constructor function for the HttpServer object
 * which is responsible for serving static files along
 * with other HTTP-related features.
 */
function HttpServer(options) {
	options = options || {};

	//create lualog directory
	const log_dir = path.join(process.cwd(), options.logDir || 'lualog')
	if (!fs.existsSync(log_dir)) {
		fs.mkdirSync(log_dir)
	}


	if (options.root) {
		this.root = options.root;
	}
	else {
		try {
			fs.lstatSync('./public');
			this.root = './public';
		}
		catch (err) {
			this.root = './';
		}
	}

	this.headers = options.headers || {};

	this.cache = options.cache === undefined ? 3600 : options.cache; // in seconds.
	this.showDir = options.showDir !== 'false';
	this.autoIndex = options.autoIndex !== 'false';
	this.showDotfiles = options.showDotfiles;
	this.gzip = options.gzip === true;
	this.contentType = options.contentType || 'application/octet-stream';

	if (options.ext) {
		this.ext = options.ext === true
			? 'html'
			: options.ext;
	}

	var before = options.before ? options.before.slice() : [];

	before.push(function (req, res) {
		if (options.logFn) {
			options.logFn(req, res);
		}

		res.emit('next');
	});

	//handling lua error logs
	before.push(function (req, res) {
		const found = router.dispatch(req, res);
		if (!found) {
			res.emit('next');
		}
	});

	//write logs
	router.post('/lualog/:user_id', { stream: true }, function (user_id) {
		const req = this.req, res = this.res
		let writeStream;

		//get user id
		if (!user_id) {
			res.emit('next')
			return
		}

		//append to existing log file
		const file_name = `${user_id}.log`
		const date_time = dateformat(new Date(), 'yyyy-mm-dd H:MM:ss,l')
		writeStream = fs.createWriteStream(path.join(log_dir,file_name), {flags:'a'});
		writeStream.write(`\n\n[${date_time}]\n`)

		//add date time
		req.pipe(writeStream);

		writeStream.on('close', function () {
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('');
		});
	});

	if (options.cors) {
		this.headers['Access-Control-Allow-Origin'] = '*';
		this.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Range';
		if (options.corsHeaders) {
			options.corsHeaders.split(/\s*,\s*/)
.forEach(function (h) { this.headers['Access-Control-Allow-Headers'] += ', ' + h; }, this);
		}
		before.push(corser.create(options.corsHeaders ? {
			requestHeaders: this.headers['Access-Control-Allow-Headers'].split(/\s*,\s*/)
		} : null));
	}

	if (options.robots) {
		before.push(function (req, res) {
			if (req.url === '/robots.txt') {
				res.setHeader('Content-Type', 'text/plain');
				var robots = options.robots === true
					? 'User-agent: *\nDisallow: /'
					: options.robots.replace(/\\n/, '\n');

					return res.end(robots);
			}

			res.emit('next');
		});
	}

	before.push(ecstatic({
		root: this.root,
		cache: this.cache,
		showDir: this.showDir,
		showDotfiles: this.showDotfiles,
		autoIndex: this.autoIndex,
		defaultExt: this.ext,
		gzip: this.gzip,
		contentType: this.contentType,
		handleError: typeof options.proxy !== 'string'
	}));

	if (typeof options.proxy === 'string') {
		var proxy = httpProxy.createProxyServer({});
		before.push(function (req, res) {
			proxy.web(req, res, {
				target: options.proxy,
				changeOrigin: true
			});
		});
	}

	var serverOptions = {
		before: before,
		headers: this.headers,
		onError: function (err, req, res) {
			if (options.logFn) {
				options.logFn(req, res, err);
			}

			res.end();
		}
	};

	if (options.https) {
		serverOptions.https = options.https;
	}

	this.server = union.createServer(serverOptions);
}

HttpServer.prototype.listen = function () {
	this.server.listen.apply(this.server, arguments);
};

HttpServer.prototype.close = function () {
	return this.server.close();
};
