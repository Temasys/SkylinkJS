/* eslint-disable import/no-extraneous-dependencies */
const finalhandler = require('finalhandler');
const http = require('http');
const https = require('https');
const serveStatic = require('serve-static');
const fs = require('fs');

const serve = serveStatic('./');
const HTTP_PORT = 3001;
const HTTPS_PORT = 8082;

const httpServer = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res));
});

httpServer.listen(HTTP_PORT);
console.log(`HTTP server instance running @ ${HTTP_PORT}`);

fs.stat('certificates/server.key', (err) => {
  if (err == null) {
    const options = {
      key: fs.readFileSync('certificates/server.key'),
      cert: fs.readFileSync('certificates/server.crt'),
    };

    const httpsServer = https.createServer(options, (req, res) => {
      serve(req, res, finalhandler(req, res));
    });

    httpsServer.listen(HTTPS_PORT);
    console.warn('\nNOTE: Running HTTP server has been removed as getUserMedia() has been deprecated for HTTP on Chrome 42 and above. Please run demo on HTTPS as recommended\n\n-\n');
    console.log(`HTTPS server instance running @ ${HTTPS_PORT}`);
  } else {
    console.warn(`HTTPS server instance failed to start as certificate failed to load. Error (for certificates/server.key): ${err.code}`);
  }
});
