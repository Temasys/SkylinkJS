(function() {

'use strict';

// Dependencies
var test = require('tape');
var adapter = null;
var skylink = require('./../publish/skylink.debug.js');
var sw = new skylink.Skylink();

// Testing attributes
var valid_apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';
var fake_apikey = 'YES-I-AM-FAKE';
var fake_secret = 'xxxxxxxxxxx';
var default_room = 'DEFAULT';
var fake_roomserver = 'http://test.com';


console.log('API: Tests the provided init() options if results are parsed correctly');
console.log('===============================================================================================');


test('init(): Testing ready state error states', function(t) {
  t.plan(1);

  var array = [];

  var temp_xhr = XMLHttpRequest;
  /* jshint ignore:start */
  XMLHttpRequest = null;
  /* jshint ignore:end */

  sw.on('readyStateChange', function(state, error) {
    if (error) {
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO) {
        array.push(1);
        window.io = require('socket.io-client');
        sw.init(fake_apikey);
      }
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT) {
        array.push(2);
        /* jshint ignore:start */
        XMLHttpRequest = temp_xhr;
        /* jshint ignore:end */
        sw.init(fake_apikey);
      }
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT) {
        array.push(3);
        adapter = require('./../node_modules/adapterjs/source/adapter.js');
        sw.init(fake_apikey);
      }
      if (error.errorCode > 4) {
        array.push(4);
      }
    }
  });

  sw.init(fake_apikey, function () {
    t.deepEqual(array, [1, 2, 3, 4], 'Ready state errors triggers as it should');
    sw.off('readyStateChange');
    t.end();
  });
});

test('init(): Testing ready state changes when valid API Key is provided', function(t) {
  t.plan(1);

  var array = [];

  sw.on('readyStateChange', function(state) {
    array.push(state);

    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
      t.deepEqual(array, [
        sw.READY_STATE_CHANGE.INIT,
        sw.READY_STATE_CHANGE.LOADING,
        sw.READY_STATE_CHANGE.COMPLETED
      ], 'Ready state changes are trigged correctly');
      t.end();
    }
  });

  sw.init(valid_apikey);

  setTimeout(function() {
    t.fail('Ready state changes does not trigger within timeout');
    t.end();
  }, 15000);
});

test('init(): Testing init parsing options', function(t) {
  t.plan(2);

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
    TURNServerTransport: sw.TURN_TRANSPORT.TCP,
    credentials: {
      startDateTime: start_date,
      duration: 500,
      credentials: credentials
    },
    audioFallback: true,
    forceSSL: true,
    socketTimeout: 5500,
    audioCodec: sw.AUDIO_CODEC.ISAC,
    videoCodec: sw.VIDEO_CODEC.H264
  };

  sw.init(options);

  setTimeout(function() {
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
      TURNServerTransport: sw._TURNTransport,
      credentials: {
        startDateTime: sw._roomStart,
        duration: sw._roomDuration,
        credentials: sw._roomCredentials
      },
      audioFallback: sw._audioFallback,
      forceSSL: sw._forceSSL,
      socketTimeout: sw._socketTimeout,
      audioCodec: sw._selectedAudioCodec,
      videoCodec: sw._selectedVideoCodec
    };
    // check if matches
    t.deepEqual(test_options, options, 'Selected init selected options matches parsed options stored');

    var pathItems = sw._path.split('?');
    var url = pathItems[0];
    var items = pathItems[1].split('&');
    var checker = {
      path: fake_roomserver + '/api/' + fake_apikey + '/' + default_room + '/' + start_date + '/' + 500,
      cred: credentials,
      rg: sw.REGIONAL_SERVER.APAC1
    };
    var passes = {
      path: false,
      cred: false,
      rg: false,
      rand: false
    }

    var i;

    for (i = 1; i < items.length; i += 1) {
      var subItems = items[i].split('=');

      if (subItems[0] === 'rand') {
        passes.rand = !!subItems[1];

      } else {
        passes[subItems[0]] = subItems[1] === checker[subItems[0]];
      }
    }

    // check path
    passes.path = checker.path === url;

    t.deepEqual(passes, {
      path: true,
      cred: true,
      rg: true,
      rand: true
    }, 'API path string is formatted correctly');
    t.end();
  }, 1000);
});

test('init(): Testing to a fallback default room when it is not provided', function(t) {
  t.plan(1);

  sw.init(fake_apikey);

  setTimeout(function() {
    // check if matches
    t.deepEqual(sw._defaultRoom, fake_apikey, 'Fallbacks to the API Key as defaultRoom when it is not provided');
    t.end();
  }, 1000);
});

})();