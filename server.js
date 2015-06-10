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
      console.log("Server start @ 8082 (HTTPS)");
    } else {
        console.warn('Server cannot start @ 8082 (HTTPS)'
        + ' Certificate File error: ' + err.code 
        + ' for certificates/server.key'); 
    }
});
