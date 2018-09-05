## Installation:

     sudo npm i lualog -g

In case you don't have node.js installed, you should run the following commands first:

     curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

     sudo apt install -y nodejs build-essential

Or you can just execute the follow commands:

     curl -s https://raw.githubusercontent.com/he110world/lualog/master/install.sh | bash

## Usage:

     lualog [path] [options]

Both [path] and [options] are optional.

**You can POST to http://<server-address>:<server-port>/lualog/<user_id> to add or append to logs**

**You can GET the log list from http://<server-address>:<server-port>/lualog**

**Click the log link to view the log**

## Available Options:

`-p` Port to use (defaults to 8080)

`-a` Address to use (defaults to 0.0.0.0)

`-d` Show directory listings (defaults to `true`)

`-i` Display autoIndex (defaults to `true`)

`-g` or `--gzip` When enabled (defaults to `false`) it will serve `./public/some-file.js.gz` in place of `./public/some-file.js` when a gzipped version of the file exists and the request accepts gzip encoding.

`-e` or `--ext` Default file extension if none supplied (defaults to `html`)

`-s` or `--silent` Suppress log messages from output

`--cors` Enable CORS via the `Access-Control-Allow-Origin` header

`-o` Open browser window after starting the server

`-c` Set cache time (in seconds) for cache-control max-age header, e.g. `-c10` for 10 seconds (defaults to `3600`). To disable caching, use `-c-1`.

`-U` or `--utc` Use UTC time format in log messages.

`-P` or `--proxy` Proxies all requests which can't be resolved locally to the given url. e.g.: -P http://someurl.com

`-S` or `--ssl` Enable https.

`-C` or `--cert` Path to ssl cert file (default: `cert.pem`).

`-K` or `--key` Path to ssl key file (default: `key.pem`).

`-r` or `--robots` Provide a /robots.txt (whose content defaults to `User-agent: *\nDisallow: /`)

`-h` or `--help` Print this list and exit.
