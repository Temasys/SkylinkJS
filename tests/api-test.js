var test = require('tape');

var adapter = null;

var skylink  = require('./../publish/skylink.debug.js');

var sw = new skylink.Skylink();

var valid_apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

var fake_apikey = 'YES-I-AM-FAKE';
var fake_secret = 'xxxxxxxxxxx';
var default_room = 'DEFAULT';

var fake_roomserver = 'http://test.com';


test('Testing ready state reliability', function (t) {
  t.plan(1);

  var array = [];

  var temp_xhr = XMLHttpRequest;
  XMLHttpRequest = null;

  sw.on('readyStateChange', function (state, error) {
    if (error) {
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO) {
        array.push(1);
        window.io = require('socket.io-client');
        sw.init(fake_apikey);
      }
      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT) {
        array.push(2);
        XMLHttpRequest = temp_xhr;
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

  sw.init(fake_apikey);

  setTimeout(function () {
    t.deepEqual(array, [1, 2, 3, 4], 'Ready state errors triggers as it should');
  }, 10000);
});

test('Testing ready state changes', function (t) {
  t.plan(1);

  var array = [];

  sw.on('readyStateChange', function (state) {
    array.push(state);
  });

  sw.init(valid_apikey);

  setTimeout(function () {
    t.deepEqual(array, [
      sw.READY_STATE_CHANGE.INIT,
      sw.READY_STATE_CHANGE.LOADING,
      sw.READY_STATE_CHANGE.COMPLETED
    ], 'Ready state changes are trigged correctly');
  }, 1000);
});

test('Testing init options', function (t) {
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
      TURNServerTransport: sw._TURNTransport,
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

    var test_string = fake_roomserver + '/api/' + fake_apikey + '/' + default_room +
      '/' + start_date + '/' + 500 + '?&cred=' + credentials + '&rg=' + sw.REGIONAL_SERVER.APAC1;

    if (sw._path.indexOf(test_string) === 0) {
      t.pass('Path string format is correct');
    } else {
      t.fail('Path string format is incorrect');
    }
  }, 1000);
});

test('Testing fallback of default room', function (t) {
  t.plan(1);

  sw.init(fake_apikey);

  setTimeout(function () {
    // check if matches
    t.deepEqual(sw._defaultRoom, fake_apikey, 'If init selected defaultRoom matches');
  }, 1000);
});