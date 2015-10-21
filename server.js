/* Copyright Temasys Communications, 2014 */
var connect = require('connect');
var fs = require('fs');
var http = require('http');
var https = require('https');
var app = connect();
app.use(connect.static(__dirname));

http.createServer(app).listen(8081);
console.log("Server start @ 8081 (HTTP)");

fs.stat('certificates/server.key', function(err, stat) {
    if(err == null) {
      https.createServer({
        key: fs.readFileSync('certificates/server.key'),
        cert: fs.readFileSync('certificates/server.crt')
      }, app).listen(8082);
      console.warn("\nNOTE: Running HTTP server has been deprecated as " +
        "getUserMedia() has been deprecated for HTTP on Chrome 42 and above. " +
        "Please run demo on HTTPS as recommended\n\n-\n");
      console.log("HTTP server instance running @ 8081 (deprecated)");
      console.log("HTTPS server instance running @ 8082");
    } else {
        console.warn("HTTPS server instance failed to start as" +
        + " certificate failed to load\n" +
        "Error (for certificates/server.key): " + err.code);
    }
});