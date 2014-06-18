/******************************************************************
 Copyright Temasys Communications, 2014
******************************************************************/
var express = require('express');
var connect = require('connect');
var cryptoJS = require('crypto-js');
var server = express();
// Keep this secret close to your server
var skywayJSSecret = 'tm2r8ns4u8hvv';

// Body Parsers
server.use(express.bodyParser());
server.use(server.router);
server.use(express.methodOverride());
server.use(express.static(__dirname));

// Add headers
server.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

server.post('/generateCredentials', function (req, res) {
  console.info('POST [/generateCredentials] - Received Params');
  console.log(req.body);
  var room = (!req.body.room) ? 'TestRoom' : req.body.room;
  var duration = (!req.body.duration) ? 200 : req.body.duration;
  var startDateTime = (!req.body.start) ?
    (new Date()).toISOString() : req.body.startDateTime;
  var hash = cryptoJS.HmacSHA1(
    room + '_' + duration + '_' + startDateTime, skywayJSSecret
  );
  var credential = encodeURIComponent(hash.toString(cryptoJS.enc.Base64));
  console.log('Generated Hash: ' + hash);
  res.send(JSON.stringify({
    room : room,
    credential: credential,
    duration : duration,
    startDateTime : startDateTime
  }));
});
server.listen(8081);