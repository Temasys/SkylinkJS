var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var app = express();
app.use(express.static(__dirname));

console.log('====== STARTING SERVERS =======');
http.createServer(app).listen(8081);
console.log('http server: 8081 port on localhost');

https.createServer({
  key: fs.readFileSync('localhost/server.key'),
  cert: fs.readFileSync('localhost/server.crt')
}, app).listen(8082);

console.log('https server: 8082 port on localhost');