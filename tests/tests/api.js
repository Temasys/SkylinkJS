(function() {

'use strict';

// Dependencies
var exports = require('../config.js');
var sw = new Skylink();


// Testing attributes
var valid_apikey = apikey;
var fake_apikey = 'YES-I-AM-FAKE';
var fake_secret = 'xxxxxxxxxxx';
var default_room = 'DEFAULT';
var fake_roomserver = 'http://test.com';
var valid_roomserver = '//api.temasys.com.sg';


console.log('API: Tests the provided init() options if results are parsed correctly');
console.log('===============================================================================================');

test('init(): Testing ready state error states', function(t) {
  t.plan(1);

  var array = [];

  var temp_xhr = XMLHttpRequest;
  /* jshint ignore:start */
  XMLHttpRequest = null;
  /* jshint ignore:end */
  var temp_adapterJS = window.AdapterJS;
  window.AdapterJS = null;
  var temp_io = window.io;
  window.io = null;

  sw.on('readyStateChange', function(state, error, room) {
    console.info(state,error,room);
    if (typeof room !== 'string') {
      t.fail('"readyStateChange" event room parameter is not a ' +
        'typeof string (value:' + room + ')');
      return;
    }
    if (error) {
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED) {
        array.push(1);
        window.AdapterJS = temp_adapterJS;
        temp_adapterJS = null;

        sw.init(fake_apikey);
      }
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO) {
        array.push(2);
        window.io = temp_io;
        sw.init(fake_apikey);
      }
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT) {
        array.push(3);
        /* jshint ignore:start */
        XMLHttpRequest = temp_xhr;
        /* jshint ignore:end */
        sw.init(fake_apikey);
      }
      if (error.errorCode > 4 && error.errorCode !== 7) {
        array.push(4);
      }
    }
  });

  sw.init(fake_apikey);

  setTimeout(function() {
    t.deepEqual(array, [1, 2, 3, 4], 'Ready state errors triggers as it should');
    sw._EVENTS.readyStateChange = [];
    t.end();
  }, 7500);
});

test('init(): Testing ready state changes when valid API Key is provided', function(t) {
  t.plan(1);

  var array = [];
  var hasPassed = false;

  sw.on('readyStateChange', function(state, error, room) {
    console.info(state, error, room);
    if (typeof room !== 'string') {
      t.fail('"readyStateChange" event room parameter is not a ' +
        'typeof string (value:' + room + ')');
      return;
    }
    array.push(state);

    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
      t.deepEqual(array, [
        sw.READY_STATE_CHANGE.INIT,
        sw.READY_STATE_CHANGE.LOADING,
        sw.READY_STATE_CHANGE.COMPLETED
      ], 'Ready state changes are trigged correctly');
      sw._EVENTS.readyStateChange = [];
      hasPassed = true;
      t.end();
    }
  });

  sw.init(valid_apikey);

  setTimeout(function() {
    if (!hasPassed) {
      t.fail('Ready state changes does not trigger within timeout');
      sw._EVENTS.readyStateChange = [];
      t.end();
    }
  }, 15000);
});

test('init(): Testing init parsing options', function(t) {
  t.plan(2);

  var start_date = (new Date()).toISOString();
  var credentials = 'TEST';

  var options = {
    appKey: fake_apikey,
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
    videoCodec: sw.VIDEO_CODEC.H264,
    forceTURN: false,
    usePublicSTUN: true
  };

  sw.init(options);

  setTimeout(function() {
    // test options
    var test_options = {
      appKey: sw._appKey,
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
      videoCodec: sw._selectedVideoCodec,
      forceTURN: sw._forceTURN,
      usePublicSTUN: sw._usePublicSTUN
    };
    // check if matches
    t.deepEqual(options, test_options, 'Selected init selected options matches parsed options stored');

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
    };

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

test('init(): Testing forceTURNSSL', function(t) {
  t.plan(7);

  var givenTURNServers = { iceServers: [{
      url: 'stun:stun.l.google.com:19302'
    }, {
      url: 'stun:stun3.l.google.com:19302'
    }, {
      url: 'stun:stun4.l.google.com:19302'
    }, {
      url: 'stun:stun.schlund.de'
    }, {
      url: 'stun:stun.iptel.org'
    }, {
      url: 'stun:stun.ideasip.com'
    }, {
      url: 'stun:stun.ekiga.net'
    }, {
      url: 'turn:test1@turn.test.com.sg',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.testagain.com',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.test.com?transport=udp',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.testagain.com?transport=udp',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.test.com?transport=tcp',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.testagain.com?transport=tcp',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.test.com:443?transport=tcp',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }, {
      url: 'turn:test@turn.testagain.com:443?transport=tcp',
      credential: 'hv03VaiMOPuRY4OpSB92S8jVOa4='
    }]
  };

  var test1 = function() {
    sw.init({
      apiKey: valid_apikey,
      forceTURNSSL: true,
      roomServer: valid_roomserver
    }, function(error, data) {

      t.deepEqual(data.forceTURNSSL, true, 'TURN SSL (forceTURNSSL in success callback ' +
        'payload data) is configured as true');
      t.deepEqual(sw._forceTURNSSL, true, 'TURN SSL (._forceTURNSSL) is configured as true');

      var outputTURNServers = sw._setIceServers(givenTURNServers);
      var hasNonTURN = false;

      for (var i = 0; i < outputTURNServers.iceServers.length; i++) {
        var server = outputTURNServers.iceServers[i];

        if (server.url.indexOf('turn:') === 0 && server.url.indexOf(':443') === -1) {
          console.info(server);
          hasNonTURN = true;
          break;
        }
      }

      t.deepEqual(hasNonTURN, false, 'Filters out non-SSL TURN servers config in _setIceServers');
      t.notDeepEqual(outputTURNServers.iceServers.length, givenTURNServers.iceServers.length,
        'Expected the output TURN servers to be not the same length');

      test2();
    });
  };

  var test2 = function() {
    sw.init({
      apiKey: valid_apikey,
      forceTURNSSL: false,
      roomServer: valid_roomserver
    }, function(error, data) {

      t.deepEqual(data.forceTURNSSL, false, 'TURN SSL (forceTURNSSL in success callback ' +
        'payload data) is configured as false');
      t.deepEqual(sw._forceTURNSSL, false, 'TURN SSL (._forceTURNSSL) is configured as false');

      var outputTURNServers = sw._setIceServers(givenTURNServers);

      var expected = [];
      var actual = [];

      for (var i = 0; i < givenTURNServers.iceServers.length; i++) {
        var server = givenTURNServers.iceServers[i];
        if (server.url.indexOf('turn:') === 0) {
          expected.push(server);
        }
      }

      for (var j = 0; j < outputTURNServers.iceServers.length; j++) {
        var server = outputTURNServers.iceServers[j];
        if (server.url.indexOf('turn:') === 0) {
          actual.push(server);
        }
      }

      t.deepEqual(actual.length, expected.length,
        'Does not filter out all TURN servers in _setIceServers');

      t.end();
    });
  };

  test1();
});

test('init(): Testing appKey = apiKey', function(t) {
  t.plan(4);

  var test1 = function () {
    var options = {
      apiKey: valid_apikey
    };
    sw.init(options, function (error, data) {
      t.deepEqual(data.appKey, options.apiKey, 'Received appKey in success callback payload data is the same ' +
        'as passed in apiKey in init()');
      t.deepEqual(data.appKey, sw._appKey, '._appKey is the same as passed in apiKey in init()');

      test2();
    });
  };

  var test2 = function () {
    var options = {
      appKey: valid_apikey
    };
    sw.init(options, function (error, data) {
      t.deepEqual(data.appKey, options.appKey, 'Received appKey in success callback payload data is the same ' +
        'as passed in appKey in init()');
      t.deepEqual(data.appKey, sw._appKey, '._appKey is the same as passed in appKey in init()');
      t.end();
    });
  };

  test1();
});

})();
