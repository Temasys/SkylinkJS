var test = require('tape');

window.io = require('socket.io-client');

var adapter = require('./../node_modules/adapterjs/source/adapter.js');
var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var valid_apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

var fake_apikey = 'YES-I-AM-FAKE';
var fake_secret = 'xxxxxxxxxxx';
var default_room = 'DEFAULT';

var fake_roomserver = 'http://test.com';

test('Testing init options', function (t) {
  t.plan(1);

  var array = [];

  var start_date = (new Date()).toISOString();
  var credentials = 'TEST';

  var options = {
    apiKey: fake_apikey,
    defaultRoom: default_room,
    roomServer: fake_roomserver,
    region: sw.REGIONAL_SERVER.APAC1,
    enableIceTrickle: false,
    enableDataChannel: false,
    enableTURNServer: false,
    enableSTUNServer: false,
    TURNTransport: sw.TURN_TRANSPORT.TCP,
    credentials: {
      startDateTime: start_date,
      duration: 500,
      credentials: credentials
    },
    audioFallback: true,
    forceSSL: true,
    socketTimeout: 5500,
  };

  sw.init(options);

  setTimeout(function () {
    // test options
    var test_options = {
      apiKey: sw._apiKey,
      defaultRoom: sw._defaultRoom,
      roomServer: sw._roomServer,
      region: sw._serverRegion,
      enableIceTrickle: sw._enableIceTrickle,
      enableDataChannel: sw._enableDataChannel,
      enableTURNServer: sw._enableTURN,
      enableSTUNServer: sw._enableSTUN,
      TURNTransport: sw._TURNTransport,
      credentials: {
        startDateTime: sw._roomStart,
        duration: sw._roomDuration,
        credentials: sw._roomCredentials
      },
      audioFallback: sw._audioFallback,
      forceSSL: sw._forceSSL,
      socketTimeout: sw._socketTimeout,
    };
    // check if matches
    t.deepEqual(test_options, options, 'If init selected options matches as it should');
  }, 1000);
});