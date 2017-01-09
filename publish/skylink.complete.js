/*! skylinkjs - v0.6.16 - Wed Dec 28 2016 17:41:50 GMT+0800 (SGT) */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.io = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

module.exports =  _dereq_('./lib/');

},{"./lib/":2}],2:[function(_dereq_,module,exports){

module.exports = _dereq_('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = _dereq_('engine.io-parser');

},{"./socket":3,"engine.io-parser":19}],3:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = _dereq_('./transports');
var Emitter = _dereq_('component-emitter');
var debug = _dereq_('debug')('engine.io-client:socket');
var index = _dereq_('indexof');
var parser = _dereq_('engine.io-parser');
var parseuri = _dereq_('parseuri');
var parsejson = _dereq_('parsejson');
var parseqs = _dereq_('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Noop function.
 *
 * @api private
 */

function noop(){}

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket(uri, opts){
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure :
    (global.location && 'https:' == location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port ?
       location.port :
       (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;

  // other options for Node.js client
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }
  }

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = _dereq_('./transport');
Socket.transports = _dereq_('./transports');
Socket.parser = _dereq_('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function() {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function(transport){
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function(){
    self.onDrain();
  })
  .on('packet', function(packet){
    self.onPacket(packet);
  })
  .on('error', function(e){
    self.onError(e);
  })
  .on('close', function(){
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 })
    , failed = false
    , self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen(){
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' == msg.type && 'probe' == msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' == transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' == self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport() {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  //Handle any error that happens while probing
  function onerror(err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose(){
    onerror("transport closed");
  }

  //When the socket is closed while we're probing
  function onclose(){
    onerror("socket closed");
  }

  //When the socket is upgraded while we're probing
  function onupgrade(to){
    if (transport && to.name != transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  //Remove all listeners on the transport and on self
  function cleanup(){
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();

};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if  ('closed' == this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' == self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function(){
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function() {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' != this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if('function' == typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' == typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' == this.readyState || 'closed' == this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function() {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close() {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose() {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade() {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i<j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./transport":4,"./transports":5,"component-emitter":15,"debug":17,"engine.io-parser":19,"indexof":23,"parsejson":26,"parseqs":27,"parseuri":28}],4:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var parser = _dereq_('engine.io-parser');
var Emitter = _dereq_('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' == this.readyState || '' == this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' == this.readyState || 'open' == this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function(packets){
  if ('open' == this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function(data){
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":15,"engine.io-parser":19}],5:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
var XHR = _dereq_('./polling-xhr');
var JSONP = _dereq_('./polling-jsonp');
var websocket = _dereq_('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling(opts){
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname != location.hostname || port != opts.port;
    xs = opts.secure != isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./polling-jsonp":6,"./polling-xhr":7,"./websocket":9,"xmlhttprequest-ssl":10}],6:[function(_dereq_,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = _dereq_('./polling');
var inherit = _dereq_('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Callbacks count.
 */

var index = 0;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function(e){
    self.onError('jsonp poll error',e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  }
  else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
  
  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch(e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function(){
      if (self.iframe.readyState == 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./polling":8,"component-inherit":16}],7:[function(_dereq_,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
var Polling = _dereq_('./polling');
var Emitter = _dereq_('component-emitter');
var inherit = _dereq_('component-inherit');
var debug = _dereq_('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty(){}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR(opts){
  Polling.call(this, opts);

  if (global.location) {
    var isSSL = 'https:' == location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname != global.location.hostname ||
      port != opts.port;
    this.xs = opts.secure != isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function(opts){
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function(data, fn){
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function(err){
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function(){
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function(data){
    self.onData(data);
  });
  req.on('error', function(err){
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts){
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined != opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function(){
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' == this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.hasXDR()) {
      xhr.onload = function(){
        self.onLoad();
      };
      xhr.onerror = function(){
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function(){
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function(){
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function() {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(fromError){
  if ('undefined' == typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch(e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function(){
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function(){
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

if (global.document) {
  Request.requestsCount = 0;
  Request.requests = {};
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler() {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./polling":8,"component-emitter":15,"component-inherit":16,"debug":17,"xmlhttprequest-ssl":10}],8:[function(_dereq_,module,exports){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parseqs = _dereq_('parseqs');
var parser = _dereq_('engine.io-parser');
var inherit = _dereq_('component-inherit');
var yeast = _dereq_('yeast');
var debug = _dereq_('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function() {
  var XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function(){
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function(onPause){
  var pending = 0;
  var self = this;

  this.readyState = 'pausing';

  function pause(){
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function(){
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function(){
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function(){
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function(data){
  var self = this;
  debug('polling got data %s', data);
  var callback = function(packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' == self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' == packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' != this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' == this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function(){
  var self = this;

  function close(){
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' == this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function(packets){
  var self = this;
  this.writable = false;
  var callbackfn = function() {
    self.writable = true;
    self.emit('drain');
  };

  var self = this;
  parser.encodePayload(packets, this.supportsBinary, function(data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' == schema && this.port != 443) ||
     ('http' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"xmlhttprequest-ssl":10,"yeast":30}],9:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var Transport = _dereq_('../transport');
var parser = _dereq_('engine.io-parser');
var parseqs = _dereq_('parseqs');
var inherit = _dereq_('component-inherit');
var yeast = _dereq_('yeast');
var debug = _dereq_('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or the WebSocket-compatible interface
 * exposed by `ws` for Node environment.
 */

var WebSocket = BrowserWebSocket || (typeof window !== 'undefined' ? null : _dereq_('ws'));

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS(opts){
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function(){
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var self = this;
  var uri = this.uri();
  var protocols = void(0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }

  this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'buffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function(){
  var self = this;

  this.ws.onopen = function(){
    self.onOpen();
  };
  this.ws.onclose = function(){
    self.onClose();
  };
  this.ws.onmessage = function(ev){
    self.onData(ev.data);
  };
  this.ws.onerror = function(e){
    self.onError('websocket error', e);
  };
};

/**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */

if ('undefined' != typeof navigator
  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
  WS.prototype.onData = function(data){
    var self = this;
    setTimeout(function(){
      Transport.prototype.onData.call(self, data);
    }, 0);
  };
}

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function(packets){
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function(packet) {
      parser.encodePacket(packet, self.supportsBinary, function(data) {
        if (!BrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' == typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        //Sometimes the websocket has already been closed but the browser didn't
        //have a chance of informing us about it yet, in that case send will
        //throw an error
        try {
          if (BrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e){
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done(){
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function(){
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function(){
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function(){
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function(){
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' == schema && this.port != 443)
    || ('ws' == schema && this.port != 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function(){
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"ws":undefined,"yeast":30}],10:[function(_dereq_,module,exports){
// browser shim for xmlhttprequest module
var hasCORS = _dereq_('has-cors');

module.exports = function(opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch(e) { }
  }
}

},{"has-cors":22}],11:[function(_dereq_,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],12:[function(_dereq_,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],13:[function(_dereq_,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(chars){
  "use strict";

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i+1]);
      encoded3 = chars.indexOf(base64[i+2]);
      encoded4 = chars.indexOf(base64[i+3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

},{}],14:[function(_dereq_,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],15:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],16:[function(_dereq_,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],17:[function(_dereq_,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = _dereq_('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":18}],18:[function(_dereq_,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = _dereq_('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":25}],19:[function(_dereq_,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = _dereq_('./keys');
var hasBinary = _dereq_('has-binary');
var sliceBuffer = _dereq_('arraybuffer.slice');
var base64encoder = _dereq_('base64-arraybuffer');
var after = _dereq_('after');
var utf8 = _dereq_('utf8');

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = navigator.userAgent.match(/Android/i);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = _dereq_('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  // String data
  if (typeof data == 'string' || data === undefined) {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      try {
        data = utf8.decode(data);
      } catch (e) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!global.ArrayBuffer) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./keys":20,"after":11,"arraybuffer.slice":12,"base64-arraybuffer":13,"blob":14,"has-binary":21,"utf8":29}],20:[function(_dereq_,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],21:[function(_dereq_,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = _dereq_('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      if (obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"isarray":24}],22:[function(_dereq_,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],23:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],24:[function(_dereq_,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],25:[function(_dereq_,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],26:[function(_dereq_,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],27:[function(_dereq_,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],28:[function(_dereq_,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],29:[function(_dereq_,module,exports){
(function (global){
/*! https://mths.be/utf8js v2.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	function checkScalarValue(codePoint) {
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
			throw Error(
				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
				' is not a scalar value'
			);
		}
	}
	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			checkScalarValue(codePoint);
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				checkScalarValue(codePoint);
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var utf8 = {
		'version': '2.0.0',
		'encode': utf8encode,
		'decode': utf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return utf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = utf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in utf8) {
				hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.utf8 = utf8;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],30:[function(_dereq_,module,exports){
'use strict';

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;

},{}],31:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var url = _dereq_('./url');
var parser = _dereq_('socket.io-parser');
var Manager = _dereq_('./manager');
var debug = _dereq_('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup(uri, opts) {
  if (typeof uri == 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }

  return io.socket(parsed.path);
}

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = _dereq_('./manager');
exports.Socket = _dereq_('./socket');

},{"./manager":32,"./socket":34,"./url":35,"debug":39,"socket.io-parser":47}],32:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var eio = _dereq_('engine.io-client');
var Socket = _dereq_('./socket');
var Emitter = _dereq_('component-emitter');
var parser = _dereq_('socket.io-parser');
var on = _dereq_('./on');
var bind = _dereq_('component-bind');
var debug = _dereq_('debug')('socket.io-client:manager');
var indexOf = _dereq_('indexof');
var Backoff = _dereq_('backo2');

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager(uri, opts){
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' == typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function() {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function(){
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function(v){
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function(v){
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function(v){
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function(v){
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function(v){
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function(v){
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function() {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};


/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function(fn){
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function() {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function(data){
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function(){
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function(){
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function(){
  this.lastPing = new Date;
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function(){
  this.emitAll('pong', new Date - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function(data){
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function(packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function(err){
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function(nsp){
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function(){
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting() {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function(socket){
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function(packet){
  debug('writing packet %j', packet);
  var self = this;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function(encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function() {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function(){
  debug('cleanup');

  var sub;
  while (sub = this.subs.shift()) sub.destroy();

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function(){
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' == this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function(reason){
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function(){
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function(){
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function(err){
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function(){
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function(){
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":33,"./socket":34,"backo2":36,"component-bind":37,"component-emitter":38,"debug":39,"engine.io-client":1,"indexof":42,"socket.io-parser":47}],33:[function(_dereq_,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on(obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function(){
      obj.removeListener(ev, fn);
    }
  };
}

},{}],34:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var parser = _dereq_('socket.io-parser');
var Emitter = _dereq_('component-emitter');
var toArray = _dereq_('to-array');
var on = _dereq_('./on');
var bind = _dereq_('component-bind');
var debug = _dereq_('debug')('socket.io-client:socket');
var hasBin = _dereq_('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket(io, nsp){
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function() {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function(){
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function(){
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function(ev){
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' == typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function(packet){
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function(){
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' != this.nsp) {
    this.packet({ type: parser.CONNECT });
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function(reason){
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function(packet){
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function(packet){
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function(id){
  var self = this;
  var sent = false;
  return function(){
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function(packet){
  var ack = this.acks[packet.id];
  if ('function' == typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function(){
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function(){
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function(){
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function(){
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function(){
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function(compress){
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};

},{"./on":33,"component-bind":37,"component-emitter":38,"debug":39,"has-binary":41,"socket.io-parser":47,"to-array":51}],35:[function(_dereq_,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = _dereq_('parseuri');
var debug = _dereq_('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url(uri, loc){
  var obj = uri;

  // default to window.location
  var loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' == typeof uri) {
    if ('/' == uri.charAt(0)) {
      if ('/' == uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' != typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    }
    else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"debug":39,"parseuri":45}],36:[function(_dereq_,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],37:[function(_dereq_,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],38:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],39:[function(_dereq_,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"./debug":40,"dup":17}],40:[function(_dereq_,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"dup":18,"ms":44}],41:[function(_dereq_,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = _dereq_('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"isarray":43}],42:[function(_dereq_,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],43:[function(_dereq_,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"dup":24}],44:[function(_dereq_,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"dup":25}],45:[function(_dereq_,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28}],46:[function(_dereq_,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = _dereq_('isarray');
var isBuf = _dereq_('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{"./is-buffer":48,"isarray":43}],47:[function(_dereq_,module,exports){

/**
 * Module dependencies.
 */

var debug = _dereq_('debug')('socket.io-parser');
var json = _dereq_('json3');
var isArray = _dereq_('isarray');
var Emitter = _dereq_('component-emitter');
var binary = _dereq_('./binary');
var isBuf = _dereq_('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'BINARY_EVENT',
  'ACK',
  'BINARY_ACK',
  'ERROR'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = json.parse(str.substr(i));
    } catch(e){
      return error();
    }
  }

  debug('decoded %s as %j', str, p);
  return p;
}

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":46,"./is-buffer":48,"component-emitter":49,"debug":39,"isarray":43,"json3":50}],48:[function(_dereq_,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],49:[function(_dereq_,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],50:[function(_dereq_,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {})
},{}],51:[function(_dereq_,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}]},{},[31])(31)
});

/*! adapterjs - v0.14.0 - 2016-10-03 */

// Adapter's interface.
var AdapterJS = AdapterJS || {};

// Browserify compatibility
if(typeof exports !== 'undefined') {
  module.exports = AdapterJS;
}

AdapterJS.options = AdapterJS.options || {};

// uncomment to get virtual webcams
// AdapterJS.options.getAllCams = true;

// uncomment to prevent the install prompt when the plugin in not yet installed
// AdapterJS.options.hidePluginInstallPrompt = true;

// AdapterJS version
AdapterJS.VERSION = '0.14.0';

// This function will be called when the WebRTC API is ready to be used
// Whether it is the native implementation (Chrome, Firefox, Opera) or
// the plugin
// You may Override this function to synchronise the start of your application
// with the WebRTC API being ready.
// If you decide not to override use this synchronisation, it may result in
// an extensive CPU usage on the plugin start (once per tab loaded)
// Params:
//    - isUsingPlugin: true is the WebRTC plugin is being used, false otherwise
//
AdapterJS.onwebrtcready = AdapterJS.onwebrtcready || function(isUsingPlugin) {
  // The WebRTC API is ready.
  // Override me and do whatever you want here
};

// New interface to store multiple callbacks, private
AdapterJS._onwebrtcreadies = [];

// Sets a callback function to be called when the WebRTC interface is ready.
// The first argument is the function to callback.\
// Throws an error if the first argument is not a function
AdapterJS.webRTCReady = function (callback) {
  if (typeof callback !== 'function') {
    throw new Error('Callback provided is not a function');
  }

  if (true === AdapterJS.onwebrtcreadyDone) {
    // All WebRTC interfaces are ready, just call the callback
    callback(null !== AdapterJS.WebRTCPlugin.plugin);
  } else {
    // will be triggered automatically when your browser/plugin is ready.
    AdapterJS._onwebrtcreadies.push(callback);
  }
};

// Plugin namespace
AdapterJS.WebRTCPlugin = AdapterJS.WebRTCPlugin || {};

// The object to store plugin information
/* jshint ignore:start */
AdapterJS.WebRTCPlugin.pluginInfo = AdapterJS.WebRTCPlugin.pluginInfo || {
  prefix : 'Tem',
  plugName : 'TemWebRTCPlugin',
  pluginId : 'plugin0',
  type : 'application/x-temwebrtcplugin',
  onload : '__TemWebRTCReady0',
  portalLink : 'http://skylink.io/plugin/',
  downloadLink : null, //set below
  companyName: 'Temasys',
  downloadLinks : {
    mac: 'http://bit.ly/webrtcpluginpkg',
    win: 'http://bit.ly/webrtcpluginmsi'
  }
};
if(typeof AdapterJS.WebRTCPlugin.pluginInfo.downloadLinks !== "undefined" && AdapterJS.WebRTCPlugin.pluginInfo.downloadLinks !== null) {
  if(!!navigator.platform.match(/^Mac/i)) {
    AdapterJS.WebRTCPlugin.pluginInfo.downloadLink = AdapterJS.WebRTCPlugin.pluginInfo.downloadLinks.mac;
  }
  else if(!!navigator.platform.match(/^Win/i)) {
    AdapterJS.WebRTCPlugin.pluginInfo.downloadLink = AdapterJS.WebRTCPlugin.pluginInfo.downloadLinks.win;
  }
}

/* jshint ignore:end */

AdapterJS.WebRTCPlugin.TAGS = {
  NONE  : 'none',
  AUDIO : 'audio',
  VIDEO : 'video'
};

// Unique identifier of each opened page
AdapterJS.WebRTCPlugin.pageId = Math.random().toString(36).slice(2);

// Use this whenever you want to call the plugin.
AdapterJS.WebRTCPlugin.plugin = null;

// Set log level for the plugin once it is ready.
// The different values are
// This is an asynchronous function that will run when the plugin is ready
AdapterJS.WebRTCPlugin.setLogLevel = null;

// Defines webrtc's JS interface according to the plugin's implementation.
// Define plugin Browsers as WebRTC Interface.
AdapterJS.WebRTCPlugin.defineWebRTCInterface = null;

// This function detects whether or not a plugin is installed.
// Checks if Not IE (firefox, for example), else if it's IE,
// we're running IE and do something. If not it is not supported.
AdapterJS.WebRTCPlugin.isPluginInstalled = null;

 // Lets adapter.js wait until the the document is ready before injecting the plugin
AdapterJS.WebRTCPlugin.pluginInjectionInterval = null;

// Inject the HTML DOM object element into the page.
AdapterJS.WebRTCPlugin.injectPlugin = null;

// States of readiness that the plugin goes through when
// being injected and stated
AdapterJS.WebRTCPlugin.PLUGIN_STATES = {
  NONE : 0,           // no plugin use
  INITIALIZING : 1,   // Detected need for plugin
  INJECTING : 2,      // Injecting plugin
  INJECTED: 3,        // Plugin element injected but not usable yet
  READY: 4            // Plugin ready to be used
};

// Current state of the plugin. You cannot use the plugin before this is
// equal to AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY
AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.NONE;

// True is AdapterJS.onwebrtcready was already called, false otherwise
// Used to make sure AdapterJS.onwebrtcready is only called once
AdapterJS.onwebrtcreadyDone = false;

// Log levels for the plugin.
// To be set by calling AdapterJS.WebRTCPlugin.setLogLevel
/*
Log outputs are prefixed in some cases.
  INFO: Information reported by the plugin.
  ERROR: Errors originating from within the plugin.
  WEBRTC: Error originating from within the libWebRTC library
*/
// From the least verbose to the most verbose
AdapterJS.WebRTCPlugin.PLUGIN_LOG_LEVELS = {
  NONE : 'NONE',
  ERROR : 'ERROR',
  WARNING : 'WARNING',
  INFO: 'INFO',
  VERBOSE: 'VERBOSE',
  SENSITIVE: 'SENSITIVE'
};

// Does a waiting check before proceeding to load the plugin.
AdapterJS.WebRTCPlugin.WaitForPluginReady = null;

// This methid will use an interval to wait for the plugin to be ready.
AdapterJS.WebRTCPlugin.callWhenPluginReady = null;

// !!!! WARNING: DO NOT OVERRIDE THIS FUNCTION. !!!
// This function will be called when plugin is ready. It sends necessary
// details to the plugin.
// The function will wait for the document to be ready and the set the
// plugin state to AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY,
// indicating that it can start being requested.
// This function is not in the IE/Safari condition brackets so that
// TemPluginLoaded function might be called on Chrome/Firefox.
// This function is the only private function that is not encapsulated to
// allow the plugin method to be called.
__TemWebRTCReady0 = function () {
  if (document.readyState === 'complete') {
    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY;
    AdapterJS.maybeThroughWebRTCReady();
  } else {
    var timer = setInterval(function () {
      if (document.readyState === 'complete') {
        // TODO: update comments, we wait for the document to be ready
        clearInterval(timer);
        AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY;
        AdapterJS.maybeThroughWebRTCReady();
      }
    }, 100);
  }
};

AdapterJS.maybeThroughWebRTCReady = function() {
  if (!AdapterJS.onwebrtcreadyDone) {
    AdapterJS.onwebrtcreadyDone = true;

    // If new interface for multiple callbacks used
    if (AdapterJS._onwebrtcreadies.length) {
      AdapterJS._onwebrtcreadies.forEach(function (callback) {
        if (typeof(callback) === 'function') {
          callback(AdapterJS.WebRTCPlugin.plugin !== null);
        }
      });
    // Else if no callbacks on new interface assuming user used old(deprecated) way to set callback through AdapterJS.onwebrtcready = ...
    } else if (typeof(AdapterJS.onwebrtcready) === 'function') {
      AdapterJS.onwebrtcready(AdapterJS.WebRTCPlugin.plugin !== null);
    }
  }
};

// Text namespace
AdapterJS.TEXT = {
  PLUGIN: {
    REQUIRE_INSTALLATION: 'This website requires you to install a WebRTC-enabling plugin ' +
      'to work on this browser.',
    NOT_SUPPORTED: 'Your browser does not support WebRTC.',
    BUTTON: 'Install Now'
  },
  REFRESH: {
    REQUIRE_REFRESH: 'Please refresh page',
    BUTTON: 'Refresh Page'
  }
};

// The result of ice connection states.
// - starting: Ice connection is starting.
// - checking: Ice connection is checking.
// - connected Ice connection is connected.
// - completed Ice connection is connected.
// - done Ice connection has been completed.
// - disconnected Ice connection has been disconnected.
// - failed Ice connection has failed.
// - closed Ice connection is closed.
AdapterJS._iceConnectionStates = {
  starting : 'starting',
  checking : 'checking',
  connected : 'connected',
  completed : 'connected',
  done : 'completed',
  disconnected : 'disconnected',
  failed : 'failed',
  closed : 'closed'
};

//The IceConnection states that has been fired for each peer.
AdapterJS._iceConnectionFiredStates = [];


// Check if WebRTC Interface is defined.
AdapterJS.isDefined = null;

// This function helps to retrieve the webrtc detected browser information.
// This sets:
// - webrtcDetectedBrowser: The browser agent name.
// - webrtcDetectedVersion: The browser version.
// - webrtcMinimumVersion: The minimum browser version still supported by AJS.
// - webrtcDetectedType: The types of webRTC support.
//   - 'moz': Mozilla implementation of webRTC.
//   - 'webkit': WebKit implementation of webRTC.
//   - 'plugin': Using the plugin implementation.
AdapterJS.parseWebrtcDetectedBrowser = function () {
  var hasMatch = null;

  // Detect Opera (8.0+)
  if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
    hasMatch = navigator.userAgent.match(/OPR\/(\d+)/i) || [];

    webrtcDetectedBrowser   = 'opera';
    webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    webrtcMinimumVersion    = 26;
    webrtcDetectedType      = 'webkit';
    webrtcDetectedDCSupport = 'SCTP'; // Opera 20+ uses Chrome 33

  // Detect Bowser on iOS
  } else if (navigator.userAgent.match(/Bowser\/[0-9.]*/g)) {
    hasMatch = navigator.userAgent.match(/Bowser\/[0-9.]*/g) || [];

    var chromiumVersion = parseInt((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./i) || [])[2] || '0', 10);

    webrtcDetectedBrowser   = 'bowser';
    webrtcDetectedVersion   = parseFloat((hasMatch[0] || '0/0').split('/')[1], 10);
    webrtcMinimumVersion    = 0;
    webrtcDetectedType      = 'webkit';
    webrtcDetectedDCSupport = chromiumVersion > 30 ? 'SCTP' : 'RTP';


  // Detect Opera on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('OPiOS') > 0) {
    hasMatch = navigator.userAgent.match(/OPiOS\/([0-9]+)\./);

    // Browser which do not support webrtc yet
    webrtcDetectedBrowser   = 'opera';
    webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    webrtcMinimumVersion    = 0;
    webrtcDetectedType      = null;
    webrtcDetectedDCSupport = null;

  // Detect Chrome on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('CriOS') > 0) {
    hasMatch = navigator.userAgent.match(/CriOS\/([0-9]+)\./) || [];

    webrtcDetectedBrowser   = 'chrome';
    webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    webrtcMinimumVersion    = 0;
    webrtcDetectedType      = null;
    webrtcDetectedDCSupport = null;

  // Detect Firefox on iOS (does not support WebRTC yet)
  } else if (navigator.userAgent.indexOf('FxiOS') > 0) {
    hasMatch = navigator.userAgent.match(/FxiOS\/([0-9]+)\./) || [];

    // Browser which do not support webrtc yet
    webrtcDetectedBrowser   = 'firefox';
    webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    webrtcMinimumVersion    = 0;
    webrtcDetectedType      = null;
    webrtcDetectedDCSupport = null;

  // Detect IE (6-11)
  } else if (/*@cc_on!@*/false || !!document.documentMode) {
    hasMatch = /\brv[ :]+(\d+)/g.exec(navigator.userAgent) || [];

    webrtcDetectedBrowser   = 'IE';
    webrtcDetectedVersion   = parseInt(hasMatch[1], 10);
    webrtcMinimumVersion    = 9;
    webrtcDetectedType      = 'plugin';
    webrtcDetectedDCSupport = 'SCTP';

    if (!webrtcDetectedVersion) {
      hasMatch = /\bMSIE[ :]+(\d+)/g.exec(navigator.userAgent) || [];

      webrtcDetectedVersion = parseInt(hasMatch[1] || '0', 10);
    }

  // Detect Edge (20+)
  } else if (!!window.StyleMedia || navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    hasMatch = navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) || [];

    // Previous webrtc/adapter uses minimum version as 10547 but checking in the Edge release history,
    // It's close to 13.10547 and ObjectRTC API is fully supported in that version

    webrtcDetectedBrowser   = 'edge';
    webrtcDetectedVersion   = parseFloat((hasMatch[0] || '0/0').split('/')[1], 10);
    webrtcMinimumVersion    = 13.10547;
    webrtcDetectedType      = 'ms';
    webrtcDetectedDCSupport = null;

  // Detect Firefox (1.0+)
  // Placed before Safari check to ensure Firefox on Android is detected
  } else if (typeof InstallTrigger !== 'undefined' || navigator.userAgent.indexOf('irefox') > 0) {
    hasMatch = navigator.userAgent.match(/Firefox\/([0-9]+)\./) || [];

    webrtcDetectedBrowser   = 'firefox';
    webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    webrtcMinimumVersion    = 31;
    webrtcDetectedType      = 'moz';
    webrtcDetectedDCSupport = 'SCTP';

  // Detect Chrome (1+ and mobile)
  // Placed before Safari check to ensure Chrome on Android is detected
  } else if ((!!window.chrome && !!window.chrome.webstore) || navigator.userAgent.indexOf('Chrom') > 0) {
    hasMatch = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./i) || [];

    webrtcDetectedBrowser   = 'chrome';
    webrtcDetectedVersion   = parseInt(hasMatch[2] || '0', 10);
    webrtcMinimumVersion    = 38;
    webrtcDetectedType      = 'webkit';
    webrtcDetectedDCSupport = webrtcDetectedVersion > 30 ? 'SCTP' : 'RTP'; // Chrome 31+ supports SCTP without flags

  // Detect Safari
  } else if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    hasMatch = navigator.userAgent.match(/version\/(\d+)/i) || [];

    var isMobile = navigator.userAgent.match(/(iPhone|iPad)/gi) || [];

    webrtcDetectedBrowser   = 'safari';
    webrtcDetectedVersion   = parseInt(hasMatch[1] || '0', 10);
    webrtcMinimumVersion    = 7;
    webrtcDetectedType      = isMobile.length === 0 ? 'plugin' : null;
    webrtcDetectedDCSupport = isMobile.length === 0 ? 'SCTP' : null;

  }

  window.webrtcDetectedBrowser   = webrtcDetectedBrowser;
  window.webrtcDetectedVersion   = webrtcDetectedVersion;
  window.webrtcMinimumVersion    = webrtcMinimumVersion;
  window.webrtcDetectedType      = webrtcDetectedType; // Scope it to window for better consistency
  window.webrtcDetectedDCSupport = webrtcDetectedDCSupport; // Scope it to window for better consistency
};

AdapterJS.addEvent = function(elem, evnt, func) {
  if (elem.addEventListener) { // W3C DOM
    elem.addEventListener(evnt, func, false);
  } else if (elem.attachEvent) {// OLD IE DOM
    elem.attachEvent('on'+evnt, func);
  } else { // No much to do
    elem[evnt] = func;
  }
};

AdapterJS.renderNotificationBar = function (text, buttonText, buttonLink, openNewTab, displayRefreshBar) {
  // only inject once the page is ready
  if (document.readyState !== 'complete') {
    return;
  }

  var w = window;
  var i = document.createElement('iframe');
  i.name = 'adapterjs-alert';
  i.style.position = 'fixed';
  i.style.top = '-41px';
  i.style.left = 0;
  i.style.right = 0;
  i.style.width = '100%';
  i.style.height = '40px';
  i.style.backgroundColor = '#ffffe1';
  i.style.border = 'none';
  i.style.borderBottom = '1px solid #888888';
  i.style.zIndex = '9999999';
  if(typeof i.style.webkitTransition === 'string') {
    i.style.webkitTransition = 'all .5s ease-out';
  } else if(typeof i.style.transition === 'string') {
    i.style.transition = 'all .5s ease-out';
  }
  document.body.appendChild(i);
  var c = (i.contentWindow) ? i.contentWindow :
    (i.contentDocument.document) ? i.contentDocument.document : i.contentDocument;
  c.document.open();
  c.document.write('<span style="display: inline-block; font-family: Helvetica, Arial,' +
    'sans-serif; font-size: .9rem; padding: 4px; vertical-align: ' +
    'middle; cursor: default;">' + text + '</span>');
  if(buttonText && buttonLink) {
    c.document.write('<button id="okay">' + buttonText + '</button><button id="cancel">Cancel</button>');
    c.document.close();

    // On click on okay
    AdapterJS.addEvent(c.document.getElementById('okay'), 'click', function(e) {
      if (!!displayRefreshBar) {
        AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION ?
          AdapterJS.TEXT.EXTENSION.REQUIRE_REFRESH : AdapterJS.TEXT.REFRESH.REQUIRE_REFRESH,
          AdapterJS.TEXT.REFRESH.BUTTON, 'javascript:location.reload()'); // jshint ignore:line
      }
      window.open(buttonLink, !!openNewTab ? '_blank' : '_top');

      e.preventDefault();
      try {
        e.cancelBubble = true;
      } catch(error) { }

      var pluginInstallInterval = setInterval(function(){
        if(! isIE) {
          navigator.plugins.refresh(false);
        }
        AdapterJS.WebRTCPlugin.isPluginInstalled(
          AdapterJS.WebRTCPlugin.pluginInfo.prefix,
          AdapterJS.WebRTCPlugin.pluginInfo.plugName,
          AdapterJS.WebRTCPlugin.pluginInfo.type,
          function() { // plugin now installed
            clearInterval(pluginInstallInterval);
            AdapterJS.WebRTCPlugin.defineWebRTCInterface();
          },
          function() {
            // still no plugin detected, nothing to do
          });
      } , 500);
    });

    // On click on Cancel
    AdapterJS.addEvent(c.document.getElementById('cancel'), 'click', function(e) {
      w.document.body.removeChild(i);
    });
  } else {
    c.document.close();
  }
  setTimeout(function() {
    if(typeof i.style.webkitTransform === 'string') {
      i.style.webkitTransform = 'translateY(40px)';
    } else if(typeof i.style.transform === 'string') {
      i.style.transform = 'translateY(40px)';
    } else {
      i.style.top = '0px';
    }
  }, 300);
};

// -----------------------------------------------------------
// Detected webrtc implementation. Types are:
// - 'moz': Mozilla implementation of webRTC.
// - 'webkit': WebKit implementation of webRTC.
// - 'plugin': Using the plugin implementation.
webrtcDetectedType = null;

// Set the settings for creating DataChannels, MediaStream for
// Cross-browser compability.
// - This is only for SCTP based support browsers.
// the 'urls' attribute.
checkMediaDataChannelSettings =
  function (peerBrowserAgent, peerBrowserVersion, callback, constraints) {
  if (typeof callback !== 'function') {
    return;
  }
  var beOfferer = true;
  var isLocalFirefox = webrtcDetectedBrowser === 'firefox';
  // Nightly version does not require MozDontOfferDataChannel for interop
  var isLocalFirefoxInterop = webrtcDetectedType === 'moz' && webrtcDetectedVersion > 30;
  var isPeerFirefox = peerBrowserAgent === 'firefox';
  var isPeerFirefoxInterop = peerBrowserAgent === 'firefox' &&
    ((peerBrowserVersion) ? (peerBrowserVersion > 30) : false);

  // Resends an updated version of constraints for MozDataChannel to work
  // If other userAgent is firefox and user is firefox, remove MozDataChannel
  if ((isLocalFirefox && isPeerFirefox) || (isLocalFirefoxInterop)) {
    try {
      delete constraints.mandatory.MozDontOfferDataChannel;
    } catch (error) {
      console.error('Failed deleting MozDontOfferDataChannel');
      console.error(error);
    }
  } else if ((isLocalFirefox && !isPeerFirefox)) {
    constraints.mandatory.MozDontOfferDataChannel = true;
  }
  if (!isLocalFirefox) {
    // temporary measure to remove Moz* constraints in non Firefox browsers
    for (var prop in constraints.mandatory) {
      if (constraints.mandatory.hasOwnProperty(prop)) {
        if (prop.indexOf('Moz') !== -1) {
          delete constraints.mandatory[prop];
        }
      }
    }
  }
  // Firefox (not interopable) cannot offer DataChannel as it will cause problems to the
  // interopability of the media stream
  if (isLocalFirefox && !isPeerFirefox && !isLocalFirefoxInterop) {
    beOfferer = false;
  }
  callback(beOfferer, constraints);
};

// Handles the differences for all browsers ice connection state output.
// - Tested outcomes are:
//   - Chrome (offerer)  : 'checking' > 'completed' > 'completed'
//   - Chrome (answerer) : 'checking' > 'connected'
//   - Firefox (offerer) : 'checking' > 'connected'
//   - Firefox (answerer): 'checking' > 'connected'
checkIceConnectionState = function (peerId, iceConnectionState, callback) {
  if (typeof callback !== 'function') {
    console.warn('No callback specified in checkIceConnectionState. Aborted.');
    return;
  }
  peerId = (peerId) ? peerId : 'peer';

  if (!AdapterJS._iceConnectionFiredStates[peerId] ||
    iceConnectionState === AdapterJS._iceConnectionStates.disconnected ||
    iceConnectionState === AdapterJS._iceConnectionStates.failed ||
    iceConnectionState === AdapterJS._iceConnectionStates.closed) {
    AdapterJS._iceConnectionFiredStates[peerId] = [];
  }
  iceConnectionState = AdapterJS._iceConnectionStates[iceConnectionState];
  if (AdapterJS._iceConnectionFiredStates[peerId].indexOf(iceConnectionState) < 0) {
    AdapterJS._iceConnectionFiredStates[peerId].push(iceConnectionState);
    if (iceConnectionState === AdapterJS._iceConnectionStates.connected) {
      setTimeout(function () {
        AdapterJS._iceConnectionFiredStates[peerId]
          .push(AdapterJS._iceConnectionStates.done);
        callback(AdapterJS._iceConnectionStates.done);
      }, 1000);
    }
    callback(iceConnectionState);
  }
  return;
};

// Firefox:
// - Creates iceServer from the url for Firefox.
// - Create iceServer with stun url.
// - Create iceServer with turn url.
//   - Ignore the transport parameter from TURN url for FF version <=27.
//   - Return null for createIceServer if transport=tcp.
// - FF 27 and above supports transport parameters in TURN url,
// - So passing in the full url to create iceServer.
// Chrome:
// - Creates iceServer from the url for Chrome M33 and earlier.
//   - Create iceServer with stun url.
//   - Chrome M28 & above uses below TURN format.
// Plugin:
// - Creates Ice Server for Plugin Browsers
//   - If Stun - Create iceServer with stun url.
//   - Else - Create iceServer with turn url
//   - This is a WebRTC Function
createIceServer = null;

// Firefox:
// - Creates IceServers for Firefox
//   - Use .url for FireFox.
//   - Multiple Urls support
// Chrome:
// - Creates iceServers from the urls for Chrome M34 and above.
//   - .urls is supported since Chrome M34.
//   - Multiple Urls support
// Plugin:
// - Creates Ice Servers for Plugin Browsers
//   - Multiple Urls support
//   - This is a WebRTC Function
createIceServers = null;
//------------------------------------------------------------

//The RTCPeerConnection object.
RTCPeerConnection = null;

// Creates RTCSessionDescription object for Plugin Browsers
RTCSessionDescription = (typeof RTCSessionDescription === 'function') ?
  RTCSessionDescription : null;

// Creates RTCIceCandidate object for Plugin Browsers
RTCIceCandidate = (typeof RTCIceCandidate === 'function') ?
  RTCIceCandidate : null;

// Get UserMedia (only difference is the prefix).
// Code from Adam Barth.
getUserMedia = null;

// Attach a media stream to an element.
attachMediaStream = null;

// Re-attach a media stream to an element.
reattachMediaStream = null;


// Detected browser agent name. Types are:
// - 'firefox': Firefox browser.
// - 'chrome': Chrome browser.
// - 'opera': Opera browser.
// - 'safari': Safari browser.
// - 'IE' - Internet Explorer browser.
webrtcDetectedBrowser = null;

// Detected browser version.
webrtcDetectedVersion = null;

// The minimum browser version still supported by AJS.
webrtcMinimumVersion  = null;

// Check for browser types and react accordingly
if ( (navigator.mozGetUserMedia ||
      navigator.webkitGetUserMedia ||
      (navigator.mediaDevices &&
       navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)))
    && !((navigator.userAgent.match(/android/ig) || []).length === 0 &&
          (navigator.userAgent.match(/chrome/ig) || []).length === 0 && navigator.userAgent.indexOf('Safari/') > 0)) {

  ///////////////////////////////////////////////////////////////////
  // INJECTION OF GOOGLE'S ADAPTER.JS CONTENT

/* jshint ignore:start */
  (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
   /* eslint-env node */
  'use strict';
  
  // SDP helpers.
  var SDPUtils = {};
  
  // Generate an alphanumeric identifier for cname or mids.
  // TODO: use UUIDs instead? https://gist.github.com/jed/982883
  SDPUtils.generateIdentifier = function() {
    return Math.random().toString(36).substr(2, 10);
  };
  
  // The RTCP CNAME used by all peerconnections from the same JS.
  SDPUtils.localCName = SDPUtils.generateIdentifier();
  
  // Splits SDP into lines, dealing with both CRLF and LF.
  SDPUtils.splitLines = function(blob) {
    return blob.trim().split('\n').map(function(line) {
      return line.trim();
    });
  };
  // Splits SDP into sessionpart and mediasections. Ensures CRLF.
  SDPUtils.splitSections = function(blob) {
    var parts = blob.split('\nm=');
    return parts.map(function(part, index) {
      return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
    });
  };
  
  // Returns lines that start with a certain prefix.
  SDPUtils.matchPrefix = function(blob, prefix) {
    return SDPUtils.splitLines(blob).filter(function(line) {
      return line.indexOf(prefix) === 0;
    });
  };
  
  // Parses an ICE candidate line. Sample input:
  // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
  // rport 55996"
  SDPUtils.parseCandidate = function(line) {
    var parts;
    // Parse both variants.
    if (line.indexOf('a=candidate:') === 0) {
      parts = line.substring(12).split(' ');
    } else {
      parts = line.substring(10).split(' ');
    }
  
    var candidate = {
      foundation: parts[0],
      component: parts[1],
      protocol: parts[2].toLowerCase(),
      priority: parseInt(parts[3], 10),
      ip: parts[4],
      port: parseInt(parts[5], 10),
      // skip parts[6] == 'typ'
      type: parts[7]
    };
  
    for (var i = 8; i < parts.length; i += 2) {
      switch (parts[i]) {
        case 'raddr':
          candidate.relatedAddress = parts[i + 1];
          break;
        case 'rport':
          candidate.relatedPort = parseInt(parts[i + 1], 10);
          break;
        case 'tcptype':
          candidate.tcpType = parts[i + 1];
          break;
        default: // Unknown extensions are silently ignored.
          break;
      }
    }
    return candidate;
  };
  
  // Translates a candidate object into SDP candidate attribute.
  SDPUtils.writeCandidate = function(candidate) {
    var sdp = [];
    sdp.push(candidate.foundation);
    sdp.push(candidate.component);
    sdp.push(candidate.protocol.toUpperCase());
    sdp.push(candidate.priority);
    sdp.push(candidate.ip);
    sdp.push(candidate.port);
  
    var type = candidate.type;
    sdp.push('typ');
    sdp.push(type);
    if (type !== 'host' && candidate.relatedAddress &&
        candidate.relatedPort) {
      sdp.push('raddr');
      sdp.push(candidate.relatedAddress); // was: relAddr
      sdp.push('rport');
      sdp.push(candidate.relatedPort); // was: relPort
    }
    if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
      sdp.push('tcptype');
      sdp.push(candidate.tcpType);
    }
    return 'candidate:' + sdp.join(' ');
  };
  
  // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
  // a=rtpmap:111 opus/48000/2
  SDPUtils.parseRtpMap = function(line) {
    var parts = line.substr(9).split(' ');
    var parsed = {
      payloadType: parseInt(parts.shift(), 10) // was: id
    };
  
    parts = parts[0].split('/');
  
    parsed.name = parts[0];
    parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
    // was: channels
    parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
    return parsed;
  };
  
  // Generate an a=rtpmap line from RTCRtpCodecCapability or
  // RTCRtpCodecParameters.
  SDPUtils.writeRtpMap = function(codec) {
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
        (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
  };
  
  // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
  // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
  SDPUtils.parseExtmap = function(line) {
    var parts = line.substr(9).split(' ');
    return {
      id: parseInt(parts[0], 10),
      uri: parts[1]
    };
  };
  
  // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
  // RTCRtpHeaderExtension.
  SDPUtils.writeExtmap = function(headerExtension) {
    return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
         ' ' + headerExtension.uri + '\r\n';
  };
  
  // Parses an ftmp line, returns dictionary. Sample input:
  // a=fmtp:96 vbr=on;cng=on
  // Also deals with vbr=on; cng=on
  SDPUtils.parseFmtp = function(line) {
    var parsed = {};
    var kv;
    var parts = line.substr(line.indexOf(' ') + 1).split(';');
    for (var j = 0; j < parts.length; j++) {
      kv = parts[j].trim().split('=');
      parsed[kv[0].trim()] = kv[1];
    }
    return parsed;
  };
  
  // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
  SDPUtils.writeFmtp = function(codec) {
    var line = '';
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.parameters && Object.keys(codec.parameters).length) {
      var params = [];
      Object.keys(codec.parameters).forEach(function(param) {
        params.push(param + '=' + codec.parameters[param]);
      });
      line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
    }
    return line;
  };
  
  // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
  // a=rtcp-fb:98 nack rpsi
  SDPUtils.parseRtcpFb = function(line) {
    var parts = line.substr(line.indexOf(' ') + 1).split(' ');
    return {
      type: parts.shift(),
      parameter: parts.join(' ')
    };
  };
  // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
  SDPUtils.writeRtcpFb = function(codec) {
    var lines = '';
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
      // FIXME: special handling for trr-int?
      codec.rtcpFeedback.forEach(function(fb) {
        lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
        (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
            '\r\n';
      });
    }
    return lines;
  };
  
  // Parses an RFC 5576 ssrc media attribute. Sample input:
  // a=ssrc:3735928559 cname:something
  SDPUtils.parseSsrcMedia = function(line) {
    var sp = line.indexOf(' ');
    var parts = {
      ssrc: parseInt(line.substr(7, sp - 7), 10)
    };
    var colon = line.indexOf(':', sp);
    if (colon > -1) {
      parts.attribute = line.substr(sp + 1, colon - sp - 1);
      parts.value = line.substr(colon + 1);
    } else {
      parts.attribute = line.substr(sp + 1);
    }
    return parts;
  };
  
  // Extracts DTLS parameters from SDP media section or sessionpart.
  // FIXME: for consistency with other functions this should only
  //   get the fingerprint line as input. See also getIceParameters.
  SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
    var lines = SDPUtils.splitLines(mediaSection);
    // Search in session part, too.
    lines = lines.concat(SDPUtils.splitLines(sessionpart));
    var fpLine = lines.filter(function(line) {
      return line.indexOf('a=fingerprint:') === 0;
    })[0].substr(14);
    // Note: a=setup line is ignored since we use the 'auto' role.
    var dtlsParameters = {
      role: 'auto',
      fingerprints: [{
        algorithm: fpLine.split(' ')[0],
        value: fpLine.split(' ')[1]
      }]
    };
    return dtlsParameters;
  };
  
  // Serializes DTLS parameters to SDP.
  SDPUtils.writeDtlsParameters = function(params, setupType) {
    var sdp = 'a=setup:' + setupType + '\r\n';
    params.fingerprints.forEach(function(fp) {
      sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
    });
    return sdp;
  };
  // Parses ICE information from SDP media section or sessionpart.
  // FIXME: for consistency with other functions this should only
  //   get the ice-ufrag and ice-pwd lines as input.
  SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
    var lines = SDPUtils.splitLines(mediaSection);
    // Search in session part, too.
    lines = lines.concat(SDPUtils.splitLines(sessionpart));
    var iceParameters = {
      usernameFragment: lines.filter(function(line) {
        return line.indexOf('a=ice-ufrag:') === 0;
      })[0].substr(12),
      password: lines.filter(function(line) {
        return line.indexOf('a=ice-pwd:') === 0;
      })[0].substr(10)
    };
    return iceParameters;
  };
  
  // Serializes ICE parameters to SDP.
  SDPUtils.writeIceParameters = function(params) {
    return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
        'a=ice-pwd:' + params.password + '\r\n';
  };
  
  // Parses the SDP media section and returns RTCRtpParameters.
  SDPUtils.parseRtpParameters = function(mediaSection) {
    var description = {
      codecs: [],
      headerExtensions: [],
      fecMechanisms: [],
      rtcp: []
    };
    var lines = SDPUtils.splitLines(mediaSection);
    var mline = lines[0].split(' ');
    for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
      var pt = mline[i];
      var rtpmapline = SDPUtils.matchPrefix(
          mediaSection, 'a=rtpmap:' + pt + ' ')[0];
      if (rtpmapline) {
        var codec = SDPUtils.parseRtpMap(rtpmapline);
        var fmtps = SDPUtils.matchPrefix(
            mediaSection, 'a=fmtp:' + pt + ' ');
        // Only the first a=fmtp:<pt> is considered.
        codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
        codec.rtcpFeedback = SDPUtils.matchPrefix(
            mediaSection, 'a=rtcp-fb:' + pt + ' ')
          .map(SDPUtils.parseRtcpFb);
        description.codecs.push(codec);
        // parse FEC mechanisms from rtpmap lines.
        switch (codec.name.toUpperCase()) {
          case 'RED':
          case 'ULPFEC':
            description.fecMechanisms.push(codec.name.toUpperCase());
            break;
          default: // only RED and ULPFEC are recognized as FEC mechanisms.
            break;
        }
      }
    }
    SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
      description.headerExtensions.push(SDPUtils.parseExtmap(line));
    });
    // FIXME: parse rtcp.
    return description;
  };
  
  // Generates parts of the SDP media section describing the capabilities /
  // parameters.
  SDPUtils.writeRtpDescription = function(kind, caps) {
    var sdp = '';
  
    // Build the mline.
    sdp += 'm=' + kind + ' ';
    sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
    sdp += ' UDP/TLS/RTP/SAVPF ';
    sdp += caps.codecs.map(function(codec) {
      if (codec.preferredPayloadType !== undefined) {
        return codec.preferredPayloadType;
      }
      return codec.payloadType;
    }).join(' ') + '\r\n';
  
    sdp += 'c=IN IP4 0.0.0.0\r\n';
    sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';
  
    // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
    caps.codecs.forEach(function(codec) {
      sdp += SDPUtils.writeRtpMap(codec);
      sdp += SDPUtils.writeFmtp(codec);
      sdp += SDPUtils.writeRtcpFb(codec);
    });
    // FIXME: add headerExtensions, fecMechanismş and rtcp.
    sdp += 'a=rtcp-mux\r\n';
    return sdp;
  };
  
  // Parses the SDP media section and returns an array of
  // RTCRtpEncodingParameters.
  SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
    var encodingParameters = [];
    var description = SDPUtils.parseRtpParameters(mediaSection);
    var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
    var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;
  
    // filter a=ssrc:... cname:, ignore PlanB-msid
    var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
    .map(function(line) {
      return SDPUtils.parseSsrcMedia(line);
    })
    .filter(function(parts) {
      return parts.attribute === 'cname';
    });
    var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
    var secondarySsrc;
  
    var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
    .map(function(line) {
      var parts = line.split(' ');
      parts.shift();
      return parts.map(function(part) {
        return parseInt(part, 10);
      });
    });
    if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
      secondarySsrc = flows[0][1];
    }
  
    description.codecs.forEach(function(codec) {
      if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
        var encParam = {
          ssrc: primarySsrc,
          codecPayloadType: parseInt(codec.parameters.apt, 10),
          rtx: {
            payloadType: codec.payloadType,
            ssrc: secondarySsrc
          }
        };
        encodingParameters.push(encParam);
        if (hasRed) {
          encParam = JSON.parse(JSON.stringify(encParam));
          encParam.fec = {
            ssrc: secondarySsrc,
            mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
          };
          encodingParameters.push(encParam);
        }
      }
    });
    if (encodingParameters.length === 0 && primarySsrc) {
      encodingParameters.push({
        ssrc: primarySsrc
      });
    }
  
    // we support both b=AS and b=TIAS but interpret AS as TIAS.
    var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
    if (bandwidth.length) {
      if (bandwidth[0].indexOf('b=TIAS:') === 0) {
        bandwidth = parseInt(bandwidth[0].substr(7), 10);
      } else if (bandwidth[0].indexOf('b=AS:') === 0) {
        bandwidth = parseInt(bandwidth[0].substr(5), 10);
      }
      encodingParameters.forEach(function(params) {
        params.maxBitrate = bandwidth;
      });
    }
    return encodingParameters;
  };
  
  SDPUtils.writeSessionBoilerplate = function() {
    // FIXME: sess-id should be an NTP timestamp.
    return 'v=0\r\n' +
        'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
        's=-\r\n' +
        't=0 0\r\n';
  };
  
  SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
    var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);
  
    // Map ICE parameters (ufrag, pwd) to SDP.
    sdp += SDPUtils.writeIceParameters(
        transceiver.iceGatherer.getLocalParameters());
  
    // Map DTLS parameters to SDP.
    sdp += SDPUtils.writeDtlsParameters(
        transceiver.dtlsTransport.getLocalParameters(),
        type === 'offer' ? 'actpass' : 'active');
  
    sdp += 'a=mid:' + transceiver.mid + '\r\n';
  
    if (transceiver.rtpSender && transceiver.rtpReceiver) {
      sdp += 'a=sendrecv\r\n';
    } else if (transceiver.rtpSender) {
      sdp += 'a=sendonly\r\n';
    } else if (transceiver.rtpReceiver) {
      sdp += 'a=recvonly\r\n';
    } else {
      sdp += 'a=inactive\r\n';
    }
  
    // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
    if (transceiver.rtpSender) {
      var msid = 'msid:' + stream.id + ' ' +
          transceiver.rtpSender.track.id + '\r\n';
      sdp += 'a=' + msid;
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
          ' ' + msid;
    }
    // FIXME: this should be written by writeRtpDescription.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
    return sdp;
  };
  
  // Gets the direction from the mediaSection or the sessionpart.
  SDPUtils.getDirection = function(mediaSection, sessionpart) {
    // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
    var lines = SDPUtils.splitLines(mediaSection);
    for (var i = 0; i < lines.length; i++) {
      switch (lines[i]) {
        case 'a=sendrecv':
        case 'a=sendonly':
        case 'a=recvonly':
        case 'a=inactive':
          return lines[i].substr(2);
        default:
          // FIXME: What should happen here?
      }
    }
    if (sessionpart) {
      return SDPUtils.getDirection(sessionpart);
    }
    return 'sendrecv';
  };
  
  // Expose public methods.
  module.exports = SDPUtils;
  
  },{}],2:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  
  'use strict';
  
  // Shimming starts here.
  (function() {
    // Utils.
    var logging = require('./utils').log;
    var browserDetails = require('./utils').browserDetails;
    // Export to the adapter global object visible in the browser.
    module.exports.browserDetails = browserDetails;
    module.exports.extractVersion = require('./utils').extractVersion;
    module.exports.disableLog = require('./utils').disableLog;
  
    // Uncomment the line below if you want logging to occur, including logging
    // for the switch statement below. Can also be turned on in the browser via
    // adapter.disableLog(false), but then logging from the switch statement below
    // will not appear.
    // require('./utils').disableLog(false);
  
    // Browser shims.
    var chromeShim = require('./chrome/chrome_shim') || null;
    var edgeShim = require('./edge/edge_shim') || null;
    var firefoxShim = require('./firefox/firefox_shim') || null;
    var safariShim = require('./safari/safari_shim') || null;
  
    // Shim browser if found.
    switch (browserDetails.browser) {
      case 'opera': // fallthrough as it uses chrome shims
      case 'chrome':
        if (!chromeShim || !chromeShim.shimPeerConnection) {
          logging('Chrome shim is not included in this adapter release.');
          return;
        }
        logging('adapter.js shimming chrome.');
        // Export to the adapter global object visible in the browser.
        module.exports.browserShim = chromeShim;
  
        chromeShim.shimGetUserMedia();
        chromeShim.shimMediaStream();
        chromeShim.shimSourceObject();
        chromeShim.shimPeerConnection();
        chromeShim.shimOnTrack();
        break;
      case 'firefox':
        if (!firefoxShim || !firefoxShim.shimPeerConnection) {
          logging('Firefox shim is not included in this adapter release.');
          return;
        }
        logging('adapter.js shimming firefox.');
        // Export to the adapter global object visible in the browser.
        module.exports.browserShim = firefoxShim;
  
        firefoxShim.shimGetUserMedia();
        firefoxShim.shimSourceObject();
        firefoxShim.shimPeerConnection();
        firefoxShim.shimOnTrack();
        break;
      case 'edge':
        if (!edgeShim || !edgeShim.shimPeerConnection) {
          logging('MS edge shim is not included in this adapter release.');
          return;
        }
        logging('adapter.js shimming edge.');
        // Export to the adapter global object visible in the browser.
        module.exports.browserShim = edgeShim;
  
        edgeShim.shimGetUserMedia();
        edgeShim.shimPeerConnection();
        break;
      case 'safari':
        if (!safariShim) {
          logging('Safari shim is not included in this adapter release.');
          return;
        }
        logging('adapter.js shimming safari.');
        // Export to the adapter global object visible in the browser.
        module.exports.browserShim = safariShim;
  
        safariShim.shimGetUserMedia();
        break;
      default:
        logging('Unsupported browser!');
    }
  })();
  
  },{"./chrome/chrome_shim":3,"./edge/edge_shim":5,"./firefox/firefox_shim":7,"./safari/safari_shim":9,"./utils":10}],3:[function(require,module,exports){
  
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  var logging = require('../utils.js').log;
  var browserDetails = require('../utils.js').browserDetails;
  
  var chromeShim = {
    shimMediaStream: function() {
      window.MediaStream = window.MediaStream || window.webkitMediaStream;
    },
  
    shimOnTrack: function() {
      if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
          window.RTCPeerConnection.prototype)) {
        Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
          get: function() {
            return this._ontrack;
          },
          set: function(f) {
            var self = this;
            if (this._ontrack) {
              this.removeEventListener('track', this._ontrack);
              this.removeEventListener('addstream', this._ontrackpoly);
            }
            this.addEventListener('track', this._ontrack = f);
            this.addEventListener('addstream', this._ontrackpoly = function(e) {
              // onaddstream does not fire when a track is added to an existing
              // stream. But stream.onaddtrack is implemented so we use that.
              e.stream.addEventListener('addtrack', function(te) {
                var event = new Event('track');
                event.track = te.track;
                event.receiver = {track: te.track};
                event.streams = [e.stream];
                self.dispatchEvent(event);
              });
              e.stream.getTracks().forEach(function(track) {
                var event = new Event('track');
                event.track = track;
                event.receiver = {track: track};
                event.streams = [e.stream];
                this.dispatchEvent(event);
              }.bind(this));
            }.bind(this));
          }
        });
      }
    },
  
    shimSourceObject: function() {
      if (typeof window === 'object') {
        if (window.HTMLMediaElement &&
          !('srcObject' in window.HTMLMediaElement.prototype)) {
          // Shim the srcObject property, once, when HTMLMediaElement is found.
          Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
            get: function() {
              return this._srcObject;
            },
            set: function(stream) {
              var self = this;
              // Use _srcObject as a private property for this shim
              this._srcObject = stream;
              if (this.src) {
                URL.revokeObjectURL(this.src);
              }
  
              if (!stream) {
                this.src = '';
                return;
              }
              this.src = URL.createObjectURL(stream);
              // We need to recreate the blob url when a track is added or
              // removed. Doing it manually since we want to avoid a recursion.
              stream.addEventListener('addtrack', function() {
                if (self.src) {
                  URL.revokeObjectURL(self.src);
                }
                self.src = URL.createObjectURL(stream);
              });
              stream.addEventListener('removetrack', function() {
                if (self.src) {
                  URL.revokeObjectURL(self.src);
                }
                self.src = URL.createObjectURL(stream);
              });
            }
          });
        }
      }
    },
  
    shimPeerConnection: function() {
      // The RTCPeerConnection object.
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }
  
        var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
        var origGetStats = pc.getStats.bind(pc);
        pc.getStats = function(selector, successCallback, errorCallback) {
          var self = this;
          var args = arguments;
  
          // If selector is a function then we are in the old style stats so just
          // pass back the original getStats format to avoid breaking old users.
          if (arguments.length > 0 && typeof selector === 'function') {
            return origGetStats(selector, successCallback);
          }
  
          var fixChromeStats_ = function(response) {
            var standardReport = {};
            var reports = response.result();
            reports.forEach(function(report) {
              var standardStats = {
                id: report.id,
                timestamp: report.timestamp,
                type: report.type
              };
              report.names().forEach(function(name) {
                standardStats[name] = report.stat(name);
              });
              standardReport[standardStats.id] = standardStats;
            });
  
            return standardReport;
          };
  
          // shim getStats with maplike support
          var makeMapStats = function(stats, legacyStats) {
            var map = new Map(Object.keys(stats).map(function(key) {
              return[key, stats[key]];
            }));
            legacyStats = legacyStats || stats;
            Object.keys(legacyStats).forEach(function(key) {
              map[key] = legacyStats[key];
            });
            return map;
          };
  
          if (arguments.length >= 2) {
            var successCallbackWrapper_ = function(response) {
              args[1](makeMapStats(fixChromeStats_(response)));
            };
  
            return origGetStats.apply(this, [successCallbackWrapper_,
                arguments[0]]);
          }
  
          // promise-support
          return new Promise(function(resolve, reject) {
            if (args.length === 1 && typeof selector === 'object') {
              origGetStats.apply(self, [
                function(response) {
                  resolve(makeMapStats(fixChromeStats_(response)));
                }, reject]);
            } else {
              // Preserve legacy chrome stats only on legacy access of stats obj
              origGetStats.apply(self, [
                function(response) {
                  resolve(makeMapStats(fixChromeStats_(response),
                      response.result()));
                }, reject]);
            }
          }).then(successCallback, errorCallback);
        };
  
        return pc;
      };
      window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;
  
      // wrap static methods. Currently just generateCertificate.
      if (webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
  
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = webkitRTCPeerConnection.prototype[method];
        webkitRTCPeerConnection.prototype[method] = function() {
          var self = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(self, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
  
      // add promise support -- natively available in Chrome 51
      if (browserDetails.version < 51) {
        ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
            .forEach(function(method) {
              var nativeMethod = webkitRTCPeerConnection.prototype[method];
              webkitRTCPeerConnection.prototype[method] = function() {
                var args = arguments;
                var self = this;
                var promise = new Promise(function(resolve, reject) {
                  nativeMethod.apply(self, [args[0], resolve, reject]);
                });
                if (args.length < 2) {
                  return promise;
                }
                return promise.then(function() {
                  args[1].apply(null, []);
                },
                function(err) {
                  if (args.length >= 3) {
                    args[2].apply(null, [err]);
                  }
                });
              };
            });
      }
  
      // shim implicit creation of RTCSessionDescription/RTCIceCandidate
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = webkitRTCPeerConnection.prototype[method];
            webkitRTCPeerConnection.prototype[method] = function() {
              arguments[0] = new ((method === 'addIceCandidate') ?
                  RTCIceCandidate : RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });
  
      // support for addIceCandidate(null)
      var nativeAddIceCandidate =
          RTCPeerConnection.prototype.addIceCandidate;
      RTCPeerConnection.prototype.addIceCandidate = function() {
        return arguments[0] === null ? Promise.resolve()
            : nativeAddIceCandidate.apply(this, arguments);
      };
    }
  };
  
  
  // Expose public methods.
  module.exports = {
    shimMediaStream: chromeShim.shimMediaStream,
    shimOnTrack: chromeShim.shimOnTrack,
    shimSourceObject: chromeShim.shimSourceObject,
    shimPeerConnection: chromeShim.shimPeerConnection,
    shimGetUserMedia: require('./getusermedia')
  };
  
  },{"../utils.js":10,"./getusermedia":4}],4:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  var logging = require('../utils.js').log;
  
  // Expose public methods.
  module.exports = function() {
    var constraintsToChrome_ = function(c) {
      if (typeof c !== 'object' || c.mandatory || c.optional) {
        return c;
      }
      var cc = {};
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
        if (r.exact !== undefined && typeof r.exact === 'number') {
          r.min = r.max = r.exact;
        }
        var oldname_ = function(prefix, name) {
          if (prefix) {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
          }
          return (name === 'deviceId') ? 'sourceId' : name;
        };
        if (r.ideal !== undefined) {
          cc.optional = cc.optional || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[oldname_('min', key)] = r.ideal;
            cc.optional.push(oc);
            oc = {};
            oc[oldname_('max', key)] = r.ideal;
            cc.optional.push(oc);
          } else {
            oc[oldname_('', key)] = r.ideal;
            cc.optional.push(oc);
          }
        }
        if (r.exact !== undefined && typeof r.exact !== 'number') {
          cc.mandatory = cc.mandatory || {};
          cc.mandatory[oldname_('', key)] = r.exact;
        } else {
          ['min', 'max'].forEach(function(mix) {
            if (r[mix] !== undefined) {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname_(mix, key)] = r[mix];
            }
          });
        }
      });
      if (c.advanced) {
        cc.optional = (cc.optional || []).concat(c.advanced);
      }
      return cc;
    };
  
    var shimConstraints_ = function(constraints, func) {
      constraints = JSON.parse(JSON.stringify(constraints));
      if (constraints && constraints.audio) {
        constraints.audio = constraintsToChrome_(constraints.audio);
      }
      if (constraints && typeof constraints.video === 'object') {
        // Shim facingMode for mobile, where it defaults to "user".
        var face = constraints.video.facingMode;
        face = face && ((typeof face === 'object') ? face : {ideal: face});
  
        if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                      face.ideal === 'user' || face.ideal === 'environment')) &&
            !(navigator.mediaDevices.getSupportedConstraints &&
              navigator.mediaDevices.getSupportedConstraints().facingMode)) {
          delete constraints.video.facingMode;
          if (face.exact === 'environment' || face.ideal === 'environment') {
            // Look for "back" in label, or use last cam (typically back cam).
            return navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
              devices = devices.filter(function(d) {
                return d.kind === 'videoinput';
              });
              var back = devices.find(function(d) {
                return d.label.toLowerCase().indexOf('back') !== -1;
              }) || (devices.length && devices[devices.length - 1]);
              if (back) {
                constraints.video.deviceId = face.exact ? {exact: back.deviceId} :
                                                          {ideal: back.deviceId};
              }
              constraints.video = constraintsToChrome_(constraints.video);
              logging('chrome: ' + JSON.stringify(constraints));
              return func(constraints);
            });
          }
        }
        constraints.video = constraintsToChrome_(constraints.video);
      }
      logging('chrome: ' + JSON.stringify(constraints));
      return func(constraints);
    };
  
    var shimError_ = function(e) {
      return {
        name: {
          PermissionDeniedError: 'NotAllowedError',
          ConstraintNotSatisfiedError: 'OverconstrainedError'
        }[e.name] || e.name,
        message: e.message,
        constraint: e.constraintName,
        toString: function() {
          return this.name + (this.message && ': ') + this.message;
        }
      };
    };
  
    var getUserMedia_ = function(constraints, onSuccess, onError) {
      shimConstraints_(constraints, function(c) {
        navigator.webkitGetUserMedia(c, onSuccess, function(e) {
          onError(shimError_(e));
        });
      });
    };
  
    navigator.getUserMedia = getUserMedia_;
  
    // Returns the result of getUserMedia as a Promise.
    var getUserMediaPromise_ = function(constraints) {
      return new Promise(function(resolve, reject) {
        navigator.getUserMedia(constraints, resolve, reject);
      });
    };
  
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {
        getUserMedia: getUserMediaPromise_,
        enumerateDevices: function() {
          return new Promise(function(resolve) {
            var kinds = {audio: 'audioinput', video: 'videoinput'};
            return MediaStreamTrack.getSources(function(devices) {
              resolve(devices.map(function(device) {
                return {label: device.label,
                        kind: kinds[device.kind],
                        deviceId: device.id,
                        groupId: ''};
              }));
            });
          });
        }
      };
    }
  
    // A shim for getUserMedia method on the mediaDevices object.
    // TODO(KaptenJansson) remove once implemented in Chrome stable.
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        return getUserMediaPromise_(constraints);
      };
    } else {
      // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
      // function which returns a Promise, it does not accept spec-style
      // constraints.
      var origGetUserMedia = navigator.mediaDevices.getUserMedia.
          bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = function(cs) {
        return shimConstraints_(cs, function(c) {
          return origGetUserMedia(c).catch(function(e) {
            return Promise.reject(shimError_(e));
          });
        });
      };
    }
  
    // Dummy devicechange event methods.
    // TODO(KaptenJansson) remove once implemented in Chrome stable.
    if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
      navigator.mediaDevices.addEventListener = function() {
        logging('Dummy mediaDevices.addEventListener called.');
      };
    }
    if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
      navigator.mediaDevices.removeEventListener = function() {
        logging('Dummy mediaDevices.removeEventListener called.');
      };
    }
  };
  
  },{"../utils.js":10}],5:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  
  var SDPUtils = require('sdp');
  var browserDetails = require('../utils').browserDetails;
  
  var edgeShim = {
    shimPeerConnection: function() {
      if (window.RTCIceGatherer) {
        // ORTC defines an RTCIceCandidate object but no constructor.
        // Not implemented in Edge.
        if (!window.RTCIceCandidate) {
          window.RTCIceCandidate = function(args) {
            return args;
          };
        }
        // ORTC does not have a session description object but
        // other browsers (i.e. Chrome) that will support both PC and ORTC
        // in the future might have this defined already.
        if (!window.RTCSessionDescription) {
          window.RTCSessionDescription = function(args) {
            return args;
          };
        }
      }
  
      window.RTCPeerConnection = function(config) {
        var self = this;
  
        var _eventTarget = document.createDocumentFragment();
        ['addEventListener', 'removeEventListener', 'dispatchEvent']
            .forEach(function(method) {
              self[method] = _eventTarget[method].bind(_eventTarget);
            });
  
        this.onicecandidate = null;
        this.onaddstream = null;
        this.ontrack = null;
        this.onremovestream = null;
        this.onsignalingstatechange = null;
        this.oniceconnectionstatechange = null;
        this.onnegotiationneeded = null;
        this.ondatachannel = null;
  
        this.localStreams = [];
        this.remoteStreams = [];
        this.getLocalStreams = function() {
          return self.localStreams;
        };
        this.getRemoteStreams = function() {
          return self.remoteStreams;
        };
  
        this.localDescription = new RTCSessionDescription({
          type: '',
          sdp: ''
        });
        this.remoteDescription = new RTCSessionDescription({
          type: '',
          sdp: ''
        });
        this.signalingState = 'stable';
        this.iceConnectionState = 'new';
        this.iceGatheringState = 'new';
  
        this.iceOptions = {
          gatherPolicy: 'all',
          iceServers: []
        };
        if (config && config.iceTransportPolicy) {
          switch (config.iceTransportPolicy) {
            case 'all':
            case 'relay':
              this.iceOptions.gatherPolicy = config.iceTransportPolicy;
              break;
            case 'none':
              // FIXME: remove once implementation and spec have added this.
              throw new TypeError('iceTransportPolicy "none" not supported');
            default:
              // don't set iceTransportPolicy.
              break;
          }
        }
        this.usingBundle = config && config.bundlePolicy === 'max-bundle';
  
        if (config && config.iceServers) {
          // Edge does not like
          // 1) stun:
          // 2) turn: that does not have all of turn:host:port?transport=udp
          // 3) turn: with ipv6 addresses
          var iceServers = JSON.parse(JSON.stringify(config.iceServers));
          this.iceOptions.iceServers = iceServers.filter(function(server) {
            if (server && server.urls) {
              var urls = server.urls;
              if (typeof urls === 'string') {
                urls = [urls];
              }
              urls = urls.filter(function(url) {
                return (url.indexOf('turn:') === 0 &&
                    url.indexOf('transport=udp') !== -1 &&
                    url.indexOf('turn:[') === -1) ||
                    (url.indexOf('stun:') === 0 &&
                      browserDetails.version >= 14393);
              })[0];
              return !!urls;
            }
            return false;
          });
        }
  
        // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
        // everything that is needed to describe a SDP m-line.
        this.transceivers = [];
  
        // since the iceGatherer is currently created in createOffer but we
        // must not emit candidates until after setLocalDescription we buffer
        // them in this array.
        this._localIceCandidatesBuffer = [];
      };
  
      window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
        var self = this;
        var sections = SDPUtils.splitSections(self.localDescription.sdp);
        // FIXME: need to apply ice candidates in a way which is async but
        // in-order
        this._localIceCandidatesBuffer.forEach(function(event) {
          var end = !event.candidate || Object.keys(event.candidate).length === 0;
          if (end) {
            for (var j = 1; j < sections.length; j++) {
              if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
                sections[j] += 'a=end-of-candidates\r\n';
              }
            }
          } else if (event.candidate.candidate.indexOf('typ endOfCandidates')
              === -1) {
            sections[event.candidate.sdpMLineIndex + 1] +=
                'a=' + event.candidate.candidate + '\r\n';
          }
          self.localDescription.sdp = sections.join('');
          self.dispatchEvent(event);
          if (self.onicecandidate !== null) {
            self.onicecandidate(event);
          }
          if (!event.candidate && self.iceGatheringState !== 'complete') {
            var complete = self.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer &&
                  transceiver.iceGatherer.state === 'completed';
            });
            if (complete) {
              self.iceGatheringState = 'complete';
            }
          }
        });
        this._localIceCandidatesBuffer = [];
      };
  
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        // Clone is necessary for local demos mostly, attaching directly
        // to two different senders does not work (build 10547).
        this.localStreams.push(stream.clone());
        this._maybeFireNegotiationNeeded();
      };
  
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var idx = this.localStreams.indexOf(stream);
        if (idx > -1) {
          this.localStreams.splice(idx, 1);
          this._maybeFireNegotiationNeeded();
        }
      };
  
      window.RTCPeerConnection.prototype.getSenders = function() {
        return this.transceivers.filter(function(transceiver) {
          return !!transceiver.rtpSender;
        })
        .map(function(transceiver) {
          return transceiver.rtpSender;
        });
      };
  
      window.RTCPeerConnection.prototype.getReceivers = function() {
        return this.transceivers.filter(function(transceiver) {
          return !!transceiver.rtpReceiver;
        })
        .map(function(transceiver) {
          return transceiver.rtpReceiver;
        });
      };
  
      // Determines the intersection of local and remote capabilities.
      window.RTCPeerConnection.prototype._getCommonCapabilities =
          function(localCapabilities, remoteCapabilities) {
            var commonCapabilities = {
              codecs: [],
              headerExtensions: [],
              fecMechanisms: []
            };
            localCapabilities.codecs.forEach(function(lCodec) {
              for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
                var rCodec = remoteCapabilities.codecs[i];
                if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                    lCodec.clockRate === rCodec.clockRate &&
                    lCodec.numChannels === rCodec.numChannels) {
                  // push rCodec so we reply with offerer payload type
                  commonCapabilities.codecs.push(rCodec);
  
                  // determine common feedback mechanisms
                  rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                    for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                      if (lCodec.rtcpFeedback[j].type === fb.type &&
                          lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                        return true;
                      }
                    }
                    return false;
                  });
                  // FIXME: also need to determine .parameters
                  //  see https://github.com/openpeer/ortc/issues/569
                  break;
                }
              }
            });
  
            localCapabilities.headerExtensions
                .forEach(function(lHeaderExtension) {
                  for (var i = 0; i < remoteCapabilities.headerExtensions.length;
                       i++) {
                    var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                    if (lHeaderExtension.uri === rHeaderExtension.uri) {
                      commonCapabilities.headerExtensions.push(rHeaderExtension);
                      break;
                    }
                  }
                });
  
            // FIXME: fecMechanisms
            return commonCapabilities;
          };
  
      // Create ICE gatherer, ICE transport and DTLS transport.
      window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
          function(mid, sdpMLineIndex) {
            var self = this;
            var iceGatherer = new RTCIceGatherer(self.iceOptions);
            var iceTransport = new RTCIceTransport(iceGatherer);
            iceGatherer.onlocalcandidate = function(evt) {
              var event = new Event('icecandidate');
              event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};
  
              var cand = evt.candidate;
              var end = !cand || Object.keys(cand).length === 0;
              // Edge emits an empty object for RTCIceCandidateComplete‥
              if (end) {
                // polyfill since RTCIceGatherer.state is not implemented in
                // Edge 10547 yet.
                if (iceGatherer.state === undefined) {
                  iceGatherer.state = 'completed';
                }
  
                // Emit a candidate with type endOfCandidates to make the samples
                // work. Edge requires addIceCandidate with this empty candidate
                // to start checking. The real solution is to signal
                // end-of-candidates to the other side when getting the null
                // candidate but some apps (like the samples) don't do that.
                event.candidate.candidate =
                    'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
              } else {
                // RTCIceCandidate doesn't have a component, needs to be added
                cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
                event.candidate.candidate = SDPUtils.writeCandidate(cand);
              }
  
              // update local description.
              var sections = SDPUtils.splitSections(self.localDescription.sdp);
              if (event.candidate.candidate.indexOf('typ endOfCandidates')
                  === -1) {
                sections[event.candidate.sdpMLineIndex + 1] +=
                    'a=' + event.candidate.candidate + '\r\n';
              } else {
                sections[event.candidate.sdpMLineIndex + 1] +=
                    'a=end-of-candidates\r\n';
              }
              self.localDescription.sdp = sections.join('');
  
              var complete = self.transceivers.every(function(transceiver) {
                return transceiver.iceGatherer &&
                    transceiver.iceGatherer.state === 'completed';
              });
  
              // Emit candidate if localDescription is set.
              // Also emits null candidate when all gatherers are complete.
              switch (self.iceGatheringState) {
                case 'new':
                  self._localIceCandidatesBuffer.push(event);
                  if (end && complete) {
                    self._localIceCandidatesBuffer.push(
                        new Event('icecandidate'));
                  }
                  break;
                case 'gathering':
                  self._emitBufferedCandidates();
                  self.dispatchEvent(event);
                  if (self.onicecandidate !== null) {
                    self.onicecandidate(event);
                  }
                  if (complete) {
                    self.dispatchEvent(new Event('icecandidate'));
                    if (self.onicecandidate !== null) {
                      self.onicecandidate(new Event('icecandidate'));
                    }
                    self.iceGatheringState = 'complete';
                  }
                  break;
                case 'complete':
                  // should not happen... currently!
                  break;
                default: // no-op.
                  break;
              }
            };
            iceTransport.onicestatechange = function() {
              self._updateConnectionState();
            };
  
            var dtlsTransport = new RTCDtlsTransport(iceTransport);
            dtlsTransport.ondtlsstatechange = function() {
              self._updateConnectionState();
            };
            dtlsTransport.onerror = function() {
              // onerror does not set state to failed by itself.
              dtlsTransport.state = 'failed';
              self._updateConnectionState();
            };
  
            return {
              iceGatherer: iceGatherer,
              iceTransport: iceTransport,
              dtlsTransport: dtlsTransport
            };
          };
  
      // Start the RTP Sender and Receiver for a transceiver.
      window.RTCPeerConnection.prototype._transceive = function(transceiver,
          send, recv) {
        var params = this._getCommonCapabilities(transceiver.localCapabilities,
            transceiver.remoteCapabilities);
        if (send && transceiver.rtpSender) {
          params.encodings = transceiver.sendEncodingParameters;
          params.rtcp = {
            cname: SDPUtils.localCName
          };
          if (transceiver.recvEncodingParameters.length) {
            params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
          }
          transceiver.rtpSender.send(params);
        }
        if (recv && transceiver.rtpReceiver) {
          params.encodings = transceiver.recvEncodingParameters;
          params.rtcp = {
            cname: transceiver.cname
          };
          if (transceiver.sendEncodingParameters.length) {
            params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
          }
          transceiver.rtpReceiver.receive(params);
        }
      };
  
      window.RTCPeerConnection.prototype.setLocalDescription =
          function(description) {
            var self = this;
            var sections;
            var sessionpart;
            if (description.type === 'offer') {
              // FIXME: What was the purpose of this empty if statement?
              // if (!this._pendingOffer) {
              // } else {
              if (this._pendingOffer) {
                // VERY limited support for SDP munging. Limited to:
                // * changing the order of codecs
                sections = SDPUtils.splitSections(description.sdp);
                sessionpart = sections.shift();
                sections.forEach(function(mediaSection, sdpMLineIndex) {
                  var caps = SDPUtils.parseRtpParameters(mediaSection);
                  self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
                });
                this.transceivers = this._pendingOffer;
                delete this._pendingOffer;
              }
            } else if (description.type === 'answer') {
              sections = SDPUtils.splitSections(self.remoteDescription.sdp);
              sessionpart = sections.shift();
              var isIceLite = SDPUtils.matchPrefix(sessionpart,
                  'a=ice-lite').length > 0;
              sections.forEach(function(mediaSection, sdpMLineIndex) {
                var transceiver = self.transceivers[sdpMLineIndex];
                var iceGatherer = transceiver.iceGatherer;
                var iceTransport = transceiver.iceTransport;
                var dtlsTransport = transceiver.dtlsTransport;
                var localCapabilities = transceiver.localCapabilities;
                var remoteCapabilities = transceiver.remoteCapabilities;
  
                var rejected = mediaSection.split('\n', 1)[0]
                    .split(' ', 2)[1] === '0';
  
                if (!rejected && !transceiver.isDatachannel) {
                  var remoteIceParameters = SDPUtils.getIceParameters(
                      mediaSection, sessionpart);
                  if (isIceLite) {
                    var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                    .map(function(cand) {
                      return SDPUtils.parseCandidate(cand);
                    })
                    .filter(function(cand) {
                      return cand.component === '1';
                    });
                    // ice-lite only includes host candidates in the SDP so we can
                    // use setRemoteCandidates (which implies an
                    // RTCIceCandidateComplete)
                    if (cands.length) {
                      iceTransport.setRemoteCandidates(cands);
                    }
                  }
                  var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                      mediaSection, sessionpart);
                  if (isIceLite) {
                    remoteDtlsParameters.role = 'server';
                  }
  
                  if (!self.usingBundle || sdpMLineIndex === 0) {
                    iceTransport.start(iceGatherer, remoteIceParameters,
                        isIceLite ? 'controlling' : 'controlled');
                    dtlsTransport.start(remoteDtlsParameters);
                  }
  
                  // Calculate intersection of capabilities.
                  var params = self._getCommonCapabilities(localCapabilities,
                      remoteCapabilities);
  
                  // Start the RTCRtpSender. The RTCRtpReceiver for this
                  // transceiver has already been started in setRemoteDescription.
                  self._transceive(transceiver,
                      params.codecs.length > 0,
                      false);
                }
              });
            }
  
            this.localDescription = {
              type: description.type,
              sdp: description.sdp
            };
            switch (description.type) {
              case 'offer':
                this._updateSignalingState('have-local-offer');
                break;
              case 'answer':
                this._updateSignalingState('stable');
                break;
              default:
                throw new TypeError('unsupported type "' + description.type +
                    '"');
            }
  
            // If a success callback was provided, emit ICE candidates after it
            // has been executed. Otherwise, emit callback after the Promise is
            // resolved.
            var hasCallback = arguments.length > 1 &&
              typeof arguments[1] === 'function';
            if (hasCallback) {
              var cb = arguments[1];
              window.setTimeout(function() {
                cb();
                if (self.iceGatheringState === 'new') {
                  self.iceGatheringState = 'gathering';
                }
                self._emitBufferedCandidates();
              }, 0);
            }
            var p = Promise.resolve();
            p.then(function() {
              if (!hasCallback) {
                if (self.iceGatheringState === 'new') {
                  self.iceGatheringState = 'gathering';
                }
                // Usually candidates will be emitted earlier.
                window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
              }
            });
            return p;
          };
  
      window.RTCPeerConnection.prototype.setRemoteDescription =
          function(description) {
            var self = this;
            var stream = new MediaStream();
            var receiverList = [];
            var sections = SDPUtils.splitSections(description.sdp);
            var sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart,
                'a=ice-lite').length > 0;
            this.usingBundle = SDPUtils.matchPrefix(sessionpart,
                'a=group:BUNDLE ').length > 0;
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var lines = SDPUtils.splitLines(mediaSection);
              var mline = lines[0].substr(2).split(' ');
              var kind = mline[0];
              var rejected = mline[1] === '0';
              var direction = SDPUtils.getDirection(mediaSection, sessionpart);
  
              var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
              if (mid.length) {
                mid = mid[0].substr(6);
              } else {
                mid = SDPUtils.generateIdentifier();
              }
  
              // Reject datachannels which are not implemented yet.
              if (kind === 'application' && mline[2] === 'DTLS/SCTP') {
                self.transceivers[sdpMLineIndex] = {
                  mid: mid,
                  isDatachannel: true
                };
                return;
              }
  
              var transceiver;
              var iceGatherer;
              var iceTransport;
              var dtlsTransport;
              var rtpSender;
              var rtpReceiver;
              var sendEncodingParameters;
              var recvEncodingParameters;
              var localCapabilities;
  
              var track;
              // FIXME: ensure the mediaSection has rtcp-mux set.
              var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
              var remoteIceParameters;
              var remoteDtlsParameters;
              if (!rejected) {
                remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                    sessionpart);
                remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                    sessionpart);
                remoteDtlsParameters.role = 'client';
              }
              recvEncodingParameters =
                  SDPUtils.parseRtpEncodingParameters(mediaSection);
  
              var cname;
              // Gets the first SSRC. Note that with RTX there might be multiple
              // SSRCs.
              var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                  .map(function(line) {
                    return SDPUtils.parseSsrcMedia(line);
                  })
                  .filter(function(obj) {
                    return obj.attribute === 'cname';
                  })[0];
              if (remoteSsrc) {
                cname = remoteSsrc.value;
              }
  
              var isComplete = SDPUtils.matchPrefix(mediaSection,
                  'a=end-of-candidates', sessionpart).length > 0;
              var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                  .map(function(cand) {
                    return SDPUtils.parseCandidate(cand);
                  })
                  .filter(function(cand) {
                    return cand.component === '1';
                  });
              if (description.type === 'offer' && !rejected) {
                var transports = self.usingBundle && sdpMLineIndex > 0 ? {
                  iceGatherer: self.transceivers[0].iceGatherer,
                  iceTransport: self.transceivers[0].iceTransport,
                  dtlsTransport: self.transceivers[0].dtlsTransport
                } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);
  
                if (isComplete) {
                  transports.iceTransport.setRemoteCandidates(cands);
                }
  
                localCapabilities = RTCRtpReceiver.getCapabilities(kind);
                sendEncodingParameters = [{
                  ssrc: (2 * sdpMLineIndex + 2) * 1001
                }];
  
                rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
  
                track = rtpReceiver.track;
                receiverList.push([track, rtpReceiver]);
                // FIXME: not correct when there are multiple streams but that is
                // not currently supported in this shim.
                stream.addTrack(track);
  
                // FIXME: look at direction.
                if (self.localStreams.length > 0 &&
                    self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                  var localTrack;
                  if (kind === 'audio') {
                    localTrack = self.localStreams[0].getAudioTracks()[0];
                  } else if (kind === 'video') {
                    localTrack = self.localStreams[0].getVideoTracks()[0];
                  }
                  if (localTrack) {
                    rtpSender = new RTCRtpSender(localTrack,
                        transports.dtlsTransport);
                  }
                }
  
                self.transceivers[sdpMLineIndex] = {
                  iceGatherer: transports.iceGatherer,
                  iceTransport: transports.iceTransport,
                  dtlsTransport: transports.dtlsTransport,
                  localCapabilities: localCapabilities,
                  remoteCapabilities: remoteCapabilities,
                  rtpSender: rtpSender,
                  rtpReceiver: rtpReceiver,
                  kind: kind,
                  mid: mid,
                  cname: cname,
                  sendEncodingParameters: sendEncodingParameters,
                  recvEncodingParameters: recvEncodingParameters
                };
                // Start the RTCRtpReceiver now. The RTPSender is started in
                // setLocalDescription.
                self._transceive(self.transceivers[sdpMLineIndex],
                    false,
                    direction === 'sendrecv' || direction === 'sendonly');
              } else if (description.type === 'answer' && !rejected) {
                transceiver = self.transceivers[sdpMLineIndex];
                iceGatherer = transceiver.iceGatherer;
                iceTransport = transceiver.iceTransport;
                dtlsTransport = transceiver.dtlsTransport;
                rtpSender = transceiver.rtpSender;
                rtpReceiver = transceiver.rtpReceiver;
                sendEncodingParameters = transceiver.sendEncodingParameters;
                localCapabilities = transceiver.localCapabilities;
  
                self.transceivers[sdpMLineIndex].recvEncodingParameters =
                    recvEncodingParameters;
                self.transceivers[sdpMLineIndex].remoteCapabilities =
                    remoteCapabilities;
                self.transceivers[sdpMLineIndex].cname = cname;
  
                if ((isIceLite || isComplete) && cands.length) {
                  iceTransport.setRemoteCandidates(cands);
                }
                if (!self.usingBundle || sdpMLineIndex === 0) {
                  iceTransport.start(iceGatherer, remoteIceParameters,
                      'controlling');
                  dtlsTransport.start(remoteDtlsParameters);
                }
  
                self._transceive(transceiver,
                    direction === 'sendrecv' || direction === 'recvonly',
                    direction === 'sendrecv' || direction === 'sendonly');
  
                if (rtpReceiver &&
                    (direction === 'sendrecv' || direction === 'sendonly')) {
                  track = rtpReceiver.track;
                  receiverList.push([track, rtpReceiver]);
                  stream.addTrack(track);
                } else {
                  // FIXME: actually the receiver should be created later.
                  delete transceiver.rtpReceiver;
                }
              }
            });
  
            this.remoteDescription = {
              type: description.type,
              sdp: description.sdp
            };
            switch (description.type) {
              case 'offer':
                this._updateSignalingState('have-remote-offer');
                break;
              case 'answer':
                this._updateSignalingState('stable');
                break;
              default:
                throw new TypeError('unsupported type "' + description.type +
                    '"');
            }
            if (stream.getTracks().length) {
              self.remoteStreams.push(stream);
              window.setTimeout(function() {
                var event = new Event('addstream');
                event.stream = stream;
                self.dispatchEvent(event);
                if (self.onaddstream !== null) {
                  window.setTimeout(function() {
                    self.onaddstream(event);
                  }, 0);
                }
  
                receiverList.forEach(function(item) {
                  var track = item[0];
                  var receiver = item[1];
                  var trackEvent = new Event('track');
                  trackEvent.track = track;
                  trackEvent.receiver = receiver;
                  trackEvent.streams = [stream];
                  self.dispatchEvent(event);
                  if (self.ontrack !== null) {
                    window.setTimeout(function() {
                      self.ontrack(trackEvent);
                    }, 0);
                  }
                });
              }, 0);
            }
            if (arguments.length > 1 && typeof arguments[1] === 'function') {
              window.setTimeout(arguments[1], 0);
            }
            return Promise.resolve();
          };
  
      window.RTCPeerConnection.prototype.close = function() {
        this.transceivers.forEach(function(transceiver) {
          /* not yet
          if (transceiver.iceGatherer) {
            transceiver.iceGatherer.close();
          }
          */
          if (transceiver.iceTransport) {
            transceiver.iceTransport.stop();
          }
          if (transceiver.dtlsTransport) {
            transceiver.dtlsTransport.stop();
          }
          if (transceiver.rtpSender) {
            transceiver.rtpSender.stop();
          }
          if (transceiver.rtpReceiver) {
            transceiver.rtpReceiver.stop();
          }
        });
        // FIXME: clean up tracks, local streams, remote streams, etc
        this._updateSignalingState('closed');
      };
  
      // Update the signaling state.
      window.RTCPeerConnection.prototype._updateSignalingState =
          function(newState) {
            this.signalingState = newState;
            var event = new Event('signalingstatechange');
            this.dispatchEvent(event);
            if (this.onsignalingstatechange !== null) {
              this.onsignalingstatechange(event);
            }
          };
  
      // Determine whether to fire the negotiationneeded event.
      window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
          function() {
            // Fire away (for now).
            var event = new Event('negotiationneeded');
            this.dispatchEvent(event);
            if (this.onnegotiationneeded !== null) {
              this.onnegotiationneeded(event);
            }
          };
  
      // Update the connection state.
      window.RTCPeerConnection.prototype._updateConnectionState = function() {
        var self = this;
        var newState;
        var states = {
          'new': 0,
          closed: 0,
          connecting: 0,
          checking: 0,
          connected: 0,
          completed: 0,
          failed: 0
        };
        this.transceivers.forEach(function(transceiver) {
          states[transceiver.iceTransport.state]++;
          states[transceiver.dtlsTransport.state]++;
        });
        // ICETransport.completed and connected are the same for this purpose.
        states.connected += states.completed;
  
        newState = 'new';
        if (states.failed > 0) {
          newState = 'failed';
        } else if (states.connecting > 0 || states.checking > 0) {
          newState = 'connecting';
        } else if (states.disconnected > 0) {
          newState = 'disconnected';
        } else if (states.new > 0) {
          newState = 'new';
        } else if (states.connected > 0 || states.completed > 0) {
          newState = 'connected';
        }
  
        if (newState !== self.iceConnectionState) {
          self.iceConnectionState = newState;
          var event = new Event('iceconnectionstatechange');
          this.dispatchEvent(event);
          if (this.oniceconnectionstatechange !== null) {
            this.oniceconnectionstatechange(event);
          }
        }
      };
  
      window.RTCPeerConnection.prototype.createOffer = function() {
        var self = this;
        if (this._pendingOffer) {
          throw new Error('createOffer called while there is a pending offer.');
        }
        var offerOptions;
        if (arguments.length === 1 && typeof arguments[0] !== 'function') {
          offerOptions = arguments[0];
        } else if (arguments.length === 3) {
          offerOptions = arguments[2];
        }
  
        var tracks = [];
        var numAudioTracks = 0;
        var numVideoTracks = 0;
        // Default to sendrecv.
        if (this.localStreams.length) {
          numAudioTracks = this.localStreams[0].getAudioTracks().length;
          numVideoTracks = this.localStreams[0].getVideoTracks().length;
        }
        // Determine number of audio and video tracks we need to send/recv.
        if (offerOptions) {
          // Reject Chrome legacy constraints.
          if (offerOptions.mandatory || offerOptions.optional) {
            throw new TypeError(
                'Legacy mandatory/optional constraints not supported.');
          }
          if (offerOptions.offerToReceiveAudio !== undefined) {
            numAudioTracks = offerOptions.offerToReceiveAudio;
          }
          if (offerOptions.offerToReceiveVideo !== undefined) {
            numVideoTracks = offerOptions.offerToReceiveVideo;
          }
        }
        if (this.localStreams.length) {
          // Push local streams.
          this.localStreams[0].getTracks().forEach(function(track) {
            tracks.push({
              kind: track.kind,
              track: track,
              wantReceive: track.kind === 'audio' ?
                  numAudioTracks > 0 : numVideoTracks > 0
            });
            if (track.kind === 'audio') {
              numAudioTracks--;
            } else if (track.kind === 'video') {
              numVideoTracks--;
            }
          });
        }
        // Create M-lines for recvonly streams.
        while (numAudioTracks > 0 || numVideoTracks > 0) {
          if (numAudioTracks > 0) {
            tracks.push({
              kind: 'audio',
              wantReceive: true
            });
            numAudioTracks--;
          }
          if (numVideoTracks > 0) {
            tracks.push({
              kind: 'video',
              wantReceive: true
            });
            numVideoTracks--;
          }
        }
  
        var sdp = SDPUtils.writeSessionBoilerplate();
        var transceivers = [];
        tracks.forEach(function(mline, sdpMLineIndex) {
          // For each track, create an ice gatherer, ice transport,
          // dtls transport, potentially rtpsender and rtpreceiver.
          var track = mline.track;
          var kind = mline.kind;
          var mid = SDPUtils.generateIdentifier();
  
          var transports = self.usingBundle && sdpMLineIndex > 0 ? {
            iceGatherer: transceivers[0].iceGatherer,
            iceTransport: transceivers[0].iceTransport,
            dtlsTransport: transceivers[0].dtlsTransport
          } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);
  
          var localCapabilities = RTCRtpSender.getCapabilities(kind);
          var rtpSender;
          var rtpReceiver;
  
          // generate an ssrc now, to be used later in rtpSender.send
          var sendEncodingParameters = [{
            ssrc: (2 * sdpMLineIndex + 1) * 1001
          }];
          if (track) {
            rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
          }
  
          if (mline.wantReceive) {
            rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
          }
  
          transceivers[sdpMLineIndex] = {
            iceGatherer: transports.iceGatherer,
            iceTransport: transports.iceTransport,
            dtlsTransport: transports.dtlsTransport,
            localCapabilities: localCapabilities,
            remoteCapabilities: null,
            rtpSender: rtpSender,
            rtpReceiver: rtpReceiver,
            kind: kind,
            mid: mid,
            sendEncodingParameters: sendEncodingParameters,
            recvEncodingParameters: null
          };
        });
        if (this.usingBundle) {
          sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
            return t.mid;
          }).join(' ') + '\r\n';
        }
        tracks.forEach(function(mline, sdpMLineIndex) {
          var transceiver = transceivers[sdpMLineIndex];
          sdp += SDPUtils.writeMediaSection(transceiver,
              transceiver.localCapabilities, 'offer', self.localStreams[0]);
        });
  
        this._pendingOffer = transceivers;
        var desc = new RTCSessionDescription({
          type: 'offer',
          sdp: sdp
        });
        if (arguments.length && typeof arguments[0] === 'function') {
          window.setTimeout(arguments[0], 0, desc);
        }
        return Promise.resolve(desc);
      };
  
      window.RTCPeerConnection.prototype.createAnswer = function() {
        var self = this;
  
        var sdp = SDPUtils.writeSessionBoilerplate();
        if (this.usingBundle) {
          sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
            return t.mid;
          }).join(' ') + '\r\n';
        }
        this.transceivers.forEach(function(transceiver) {
          if (transceiver.isDatachannel) {
            sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
                'c=IN IP4 0.0.0.0\r\n' +
                'a=mid:' + transceiver.mid + '\r\n';
            return;
          }
          // Calculate intersection of capabilities.
          var commonCapabilities = self._getCommonCapabilities(
              transceiver.localCapabilities,
              transceiver.remoteCapabilities);
  
          sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
              'answer', self.localStreams[0]);
        });
  
        var desc = new RTCSessionDescription({
          type: 'answer',
          sdp: sdp
        });
        if (arguments.length && typeof arguments[0] === 'function') {
          window.setTimeout(arguments[0], 0, desc);
        }
        return Promise.resolve(desc);
      };
  
      window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
        if (candidate === null) {
          this.transceivers.forEach(function(transceiver) {
            transceiver.iceTransport.addRemoteCandidate({});
          });
        } else {
          var mLineIndex = candidate.sdpMLineIndex;
          if (candidate.sdpMid) {
            for (var i = 0; i < this.transceivers.length; i++) {
              if (this.transceivers[i].mid === candidate.sdpMid) {
                mLineIndex = i;
                break;
              }
            }
          }
          var transceiver = this.transceivers[mLineIndex];
          if (transceiver) {
            var cand = Object.keys(candidate.candidate).length > 0 ?
                SDPUtils.parseCandidate(candidate.candidate) : {};
            // Ignore Chrome's invalid candidates since Edge does not like them.
            if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
              return;
            }
            // Ignore RTCP candidates, we assume RTCP-MUX.
            if (cand.component !== '1') {
              return;
            }
            // A dirty hack to make samples work.
            if (cand.type === 'endOfCandidates') {
              cand = {};
            }
            transceiver.iceTransport.addRemoteCandidate(cand);
  
            // update the remoteDescription.
            var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
            sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
                : 'a=end-of-candidates') + '\r\n';
            this.remoteDescription.sdp = sections.join('');
          }
        }
        if (arguments.length > 1 && typeof arguments[1] === 'function') {
          window.setTimeout(arguments[1], 0);
        }
        return Promise.resolve();
      };
  
      window.RTCPeerConnection.prototype.getStats = function() {
        var promises = [];
        this.transceivers.forEach(function(transceiver) {
          ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
              'dtlsTransport'].forEach(function(method) {
                if (transceiver[method]) {
                  promises.push(transceiver[method].getStats());
                }
              });
        });
        var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
            arguments[1];
        return new Promise(function(resolve) {
          // shim getStats with maplike support
          var results = new Map();
          Promise.all(promises).then(function(res) {
            res.forEach(function(result) {
              Object.keys(result).forEach(function(id) {
                results.set(id, result[id]);
                results[id] = result[id];
              });
            });
            if (cb) {
              window.setTimeout(cb, 0, results);
            }
            resolve(results);
          });
        });
      };
    }
  };
  
  // Expose public methods.
  module.exports = {
    shimPeerConnection: edgeShim.shimPeerConnection,
    shimGetUserMedia: require('./getusermedia')
  };
  
  },{"../utils":10,"./getusermedia":6,"sdp":1}],6:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  
  // Expose public methods.
  module.exports = function() {
    var shimError_ = function(e) {
      return {
        name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
        message: e.message,
        constraint: e.constraint,
        toString: function() {
          return this.name;
        }
      };
    };
  
    // getUserMedia error shim.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).catch(function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  };
  
  },{}],7:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  
  var browserDetails = require('../utils').browserDetails;
  
  var firefoxShim = {
    shimOnTrack: function() {
      if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
          window.RTCPeerConnection.prototype)) {
        Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
          get: function() {
            return this._ontrack;
          },
          set: function(f) {
            if (this._ontrack) {
              this.removeEventListener('track', this._ontrack);
              this.removeEventListener('addstream', this._ontrackpoly);
            }
            this.addEventListener('track', this._ontrack = f);
            this.addEventListener('addstream', this._ontrackpoly = function(e) {
              e.stream.getTracks().forEach(function(track) {
                var event = new Event('track');
                event.track = track;
                event.receiver = {track: track};
                event.streams = [e.stream];
                this.dispatchEvent(event);
              }.bind(this));
            }.bind(this));
          }
        });
      }
    },
  
    shimSourceObject: function() {
      // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
      if (typeof window === 'object') {
        if (window.HTMLMediaElement &&
          !('srcObject' in window.HTMLMediaElement.prototype)) {
          // Shim the srcObject property, once, when HTMLMediaElement is found.
          Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
            get: function() {
              return this.mozSrcObject;
            },
            set: function(stream) {
              this.mozSrcObject = stream;
            }
          });
        }
      }
    },
  
    shimPeerConnection: function() {
      if (typeof window !== 'object' || !(window.RTCPeerConnection ||
          window.mozRTCPeerConnection)) {
        return; // probably media.peerconnection.enabled=false in about:config
      }
      // The RTCPeerConnection object.
      if (!window.RTCPeerConnection) {
        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
          if (browserDetails.version < 38) {
            // .urls is not supported in FF < 38.
            // create RTCIceServers with a single url.
            if (pcConfig && pcConfig.iceServers) {
              var newIceServers = [];
              for (var i = 0; i < pcConfig.iceServers.length; i++) {
                var server = pcConfig.iceServers[i];
                if (server.hasOwnProperty('urls')) {
                  for (var j = 0; j < server.urls.length; j++) {
                    var newServer = {
                      url: server.urls[j]
                    };
                    if (server.urls[j].indexOf('turn') === 0) {
                      newServer.username = server.username;
                      newServer.credential = server.credential;
                    }
                    newIceServers.push(newServer);
                  }
                } else {
                  newIceServers.push(pcConfig.iceServers[i]);
                }
              }
              pcConfig.iceServers = newIceServers;
            }
          }
          return new mozRTCPeerConnection(pcConfig, pcConstraints);
        };
        window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;
  
        // wrap static methods. Currently just generateCertificate.
        if (mozRTCPeerConnection.generateCertificate) {
          Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
            get: function() {
              return mozRTCPeerConnection.generateCertificate;
            }
          });
        }
  
        window.RTCSessionDescription = mozRTCSessionDescription;
        window.RTCIceCandidate = mozRTCIceCandidate;
      }
  
      // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = RTCPeerConnection.prototype[method];
            RTCPeerConnection.prototype[method] = function() {
              arguments[0] = new ((method === 'addIceCandidate') ?
                  RTCIceCandidate : RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });
  
      // support for addIceCandidate(null)
      var nativeAddIceCandidate =
          RTCPeerConnection.prototype.addIceCandidate;
      RTCPeerConnection.prototype.addIceCandidate = function() {
        return arguments[0] === null ? Promise.resolve()
            : nativeAddIceCandidate.apply(this, arguments);
      };
  
      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        var map = new Map();
        Object.keys(stats).forEach(function(key) {
          map.set(key, stats[key]);
          map[key] = stats[key];
        });
        return map;
      };
  
      var nativeGetStats = RTCPeerConnection.prototype.getStats;
      RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
        return nativeGetStats.apply(this, [selector || null])
          .then(function(stats) {
            return makeMapStats(stats);
          })
          .then(onSucc, onErr);
      };
    }
  };
  
  // Expose public methods.
  module.exports = {
    shimOnTrack: firefoxShim.shimOnTrack,
    shimSourceObject: firefoxShim.shimSourceObject,
    shimPeerConnection: firefoxShim.shimPeerConnection,
    shimGetUserMedia: require('./getusermedia')
  };
  
  },{"../utils":10,"./getusermedia":8}],8:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  
  var logging = require('../utils').log;
  var browserDetails = require('../utils').browserDetails;
  
  // Expose public methods.
  module.exports = function() {
    var shimError_ = function(e) {
      return {
        name: {
          SecurityError: 'NotAllowedError',
          PermissionDeniedError: 'NotAllowedError'
        }[e.name] || e.name,
        message: {
          'The operation is insecure.': 'The request is not allowed by the ' +
          'user agent or the platform in the current context.'
        }[e.message] || e.message,
        constraint: e.constraint,
        toString: function() {
          return this.name + (this.message && ': ') + this.message;
        }
      };
    };
  
    // getUserMedia constraints shim.
    var getUserMedia_ = function(constraints, onSuccess, onError) {
      var constraintsToFF37_ = function(c) {
        if (typeof c !== 'object' || c.require) {
          return c;
        }
        var require = [];
        Object.keys(c).forEach(function(key) {
          if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
            return;
          }
          var r = c[key] = (typeof c[key] === 'object') ?
              c[key] : {ideal: c[key]};
          if (r.min !== undefined ||
              r.max !== undefined || r.exact !== undefined) {
            require.push(key);
          }
          if (r.exact !== undefined) {
            if (typeof r.exact === 'number') {
              r. min = r.max = r.exact;
            } else {
              c[key] = r.exact;
            }
            delete r.exact;
          }
          if (r.ideal !== undefined) {
            c.advanced = c.advanced || [];
            var oc = {};
            if (typeof r.ideal === 'number') {
              oc[key] = {min: r.ideal, max: r.ideal};
            } else {
              oc[key] = r.ideal;
            }
            c.advanced.push(oc);
            delete r.ideal;
            if (!Object.keys(r).length) {
              delete c[key];
            }
          }
        });
        if (require.length) {
          c.require = require;
        }
        return c;
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      if (browserDetails.version < 38) {
        logging('spec: ' + JSON.stringify(constraints));
        if (constraints.audio) {
          constraints.audio = constraintsToFF37_(constraints.audio);
        }
        if (constraints.video) {
          constraints.video = constraintsToFF37_(constraints.video);
        }
        logging('ff37: ' + JSON.stringify(constraints));
      }
      return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
        onError(shimError_(e));
      });
    };
  
    // Returns the result of getUserMedia as a Promise.
    var getUserMediaPromise_ = function(constraints) {
      return new Promise(function(resolve, reject) {
        getUserMedia_(constraints, resolve, reject);
      });
    };
  
    // Shim for mediaDevices on older versions.
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
        addEventListener: function() { },
        removeEventListener: function() { }
      };
    }
    navigator.mediaDevices.enumerateDevices =
        navigator.mediaDevices.enumerateDevices || function() {
          return new Promise(function(resolve) {
            var infos = [
              {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
              {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
            ];
            resolve(infos);
          });
        };
  
    if (browserDetails.version < 41) {
      // Work around http://bugzil.la/1169665
      var orgEnumerateDevices =
          navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
      navigator.mediaDevices.enumerateDevices = function() {
        return orgEnumerateDevices().then(undefined, function(e) {
          if (e.name === 'NotFoundError') {
            return [];
          }
          throw e;
        });
      };
    }
    if (browserDetails.version < 49) {
      var origGetUserMedia = navigator.mediaDevices.getUserMedia.
          bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = function(c) {
        return origGetUserMedia(c).catch(function(e) {
          return Promise.reject(shimError_(e));
        });
      };
    }
    navigator.getUserMedia = function(constraints, onSuccess, onError) {
      if (browserDetails.version < 44) {
        return getUserMedia_(constraints, onSuccess, onError);
      }
      // Replace Firefox 44+'s deprecation warning with unprefixed version.
      console.warn('navigator.getUserMedia has been replaced by ' +
                   'navigator.mediaDevices.getUserMedia');
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    };
  };
  
  },{"../utils":10}],9:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  'use strict';
  var safariShim = {
    // TODO: DrAlex, should be here, double check against LayoutTests
    // shimOnTrack: function() { },
  
    // TODO: once the back-end for the mac port is done, add.
    // TODO: check for webkitGTK+
    // shimPeerConnection: function() { },
  
    shimGetUserMedia: function() {
      navigator.getUserMedia = navigator.webkitGetUserMedia;
    }
  };
  
  // Expose public methods.
  module.exports = {
    shimGetUserMedia: safariShim.shimGetUserMedia
    // TODO
    // shimOnTrack: safariShim.shimOnTrack,
    // shimPeerConnection: safariShim.shimPeerConnection
  };
  
  },{}],10:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
   /* eslint-env node */
  'use strict';
  
  var logDisabled_ = true;
  
  // Utility methods.
  var utils = {
    disableLog: function(bool) {
      if (typeof bool !== 'boolean') {
        return new Error('Argument type: ' + typeof bool +
            '. Please use a boolean.');
      }
      logDisabled_ = bool;
      return (bool) ? 'adapter.js logging disabled' :
          'adapter.js logging enabled';
    },
  
    log: function() {
      if (typeof window === 'object') {
        if (logDisabled_) {
          return;
        }
        if (typeof console !== 'undefined' && typeof console.log === 'function') {
          console.log.apply(console, arguments);
        }
      }
    },
  
    /**
     * Extract browser version out of the provided user agent string.
     *
     * @param {!string} uastring userAgent string.
     * @param {!string} expr Regular expression used as match criteria.
     * @param {!number} pos position in the version string to be returned.
     * @return {!number} browser version.
     */
    extractVersion: function(uastring, expr, pos) {
      var match = uastring.match(expr);
      return match && match.length >= pos && parseInt(match[pos], 10);
    },
  
    /**
     * Browser detector.
     *
     * @return {object} result containing browser and version
     *     properties.
     */
    detectBrowser: function() {
      // Returned result object.
      var result = {};
      result.browser = null;
      result.version = null;
  
      // Fail early if it's not a browser
      if (typeof window === 'undefined' || !window.navigator) {
        result.browser = 'Not a browser.';
        return result;
      }
  
      // Firefox.
      if (navigator.mozGetUserMedia) {
        result.browser = 'firefox';
        result.version = this.extractVersion(navigator.userAgent,
            /Firefox\/([0-9]+)\./, 1);
  
      // all webkit-based browsers
      } else if (navigator.webkitGetUserMedia) {
        // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
        if (window.webkitRTCPeerConnection) {
          result.browser = 'chrome';
          result.version = this.extractVersion(navigator.userAgent,
            /Chrom(e|ium)\/([0-9]+)\./, 2);
  
        // Safari or unknown webkit-based
        // for the time being Safari has support for MediaStreams but not webRTC
        } else {
          // Safari UA substrings of interest for reference:
          // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
          // - safari UI version:        Version/9.0.3 (unique to Safari)
          // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
          //
          // if the webkit version and safari UI webkit versions are equals,
          // ... this is a stable version.
          //
          // only the internal webkit version is important today to know if
          // media streams are supported
          //
          if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
            result.browser = 'safari';
            result.version = this.extractVersion(navigator.userAgent,
              /AppleWebKit\/([0-9]+)\./, 1);
  
          // unknown webkit-based browser
          } else {
            result.browser = 'Unsupported webkit-based browser ' +
                'with GUM support but no WebRTC support.';
            return result;
          }
        }
  
      // Edge.
      } else if (navigator.mediaDevices &&
          navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
        result.browser = 'edge';
        result.version = this.extractVersion(navigator.userAgent,
            /Edge\/(\d+).(\d+)$/, 2);
  
      // Default fallthrough: not supported.
      } else {
        result.browser = 'Not a supported browser.';
        return result;
      }
  
      return result;
    }
  };
  
  // Export.
  module.exports = {
    log: utils.log,
    disableLog: utils.disableLog,
    browserDetails: utils.detectBrowser(),
    extractVersion: utils.extractVersion
  };
  
  },{}]},{},[2])(2)
});
/* jshint ignore:end */

  // END OF INJECTION OF GOOGLE'S ADAPTER.JS CONTENT
  ///////////////////////////////////////////////////////////////////

  AdapterJS.parseWebrtcDetectedBrowser();

  ///////////////////////////////////////////////////////////////////
  // EXTENSION FOR CHROME, FIREFOX AND EDGE
  // Includes legacy functions
  // -- createIceServer
  // -- createIceServers
  // -- MediaStreamTrack.getSources
  //
  // and additional shims
  // -- attachMediaStream
  // -- reattachMediaStream
  // -- requestUserMedia
  // -- a call to AdapterJS.maybeThroughWebRTCReady (notifies WebRTC is ready)

  // Add support for legacy functions createIceServer and createIceServers
  if ( navigator.mozGetUserMedia ) {
    // Shim for MediaStreamTrack.getSources.
    MediaStreamTrack.getSources = function(successCb) {
      setTimeout(function() {
        var infos = [
          { kind: 'audio', id: 'default', label:'', facing:'' },
          { kind: 'video', id: 'default', label:'', facing:'' }
        ];
        successCb(infos);
      }, 0);
    };

    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      element.srcObject = stream;
      return element;
    };

    reattachMediaStream = function(to, from) {
      to.srcObject = from.srcObject;
      return to;
    };

    createIceServer = function (url, username, password) {
      console.warn('createIceServer is deprecated. It should be replaced with an application level implementation.');
      // Note: Google's import of AJS will auto-reverse to 'url': '...' for FF < 38

      var iceServer = null;
      var urlParts = url.split(':');
      if (urlParts[0].indexOf('stun') === 0) {
        iceServer = { urls : [url] };
      } else if (urlParts[0].indexOf('turn') === 0) {
        if (webrtcDetectedVersion < 27) {
          var turnUrlParts = url.split('?');
          if (turnUrlParts.length === 1 ||
            turnUrlParts[1].indexOf('transport=udp') === 0) {
            iceServer = {
              urls : [turnUrlParts[0]],
              credential : password,
              username : username
            };
          }
        } else {
          iceServer = {
            urls : [url],
            credential : password,
            username : username
          };
        }
      }
      return iceServer;
    };

    createIceServers = function (urls, username, password) {
      console.warn('createIceServers is deprecated. It should be replaced with an application level implementation.');

      var iceServers = [];
      for (i = 0; i < urls.length; i++) {
        var iceServer = createIceServer(urls[i], username, password);
        if (iceServer !== null) {
          iceServers.push(iceServer);
        }
      }
      return iceServers;
    };
  } else if ( navigator.webkitGetUserMedia ) {
    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      if (webrtcDetectedVersion >= 43) {
        element.srcObject = stream;
      } else if (typeof element.src !== 'undefined') {
        element.src = URL.createObjectURL(stream);
      } else {
        console.error('Error attaching stream to element.');
        // logging('Error attaching stream to element.');
      }
      return element;
    };

    reattachMediaStream = function(to, from) {
      if (webrtcDetectedVersion >= 43) {
        to.srcObject = from.srcObject;
      } else {
        to.src = from.src;
      }
      return to;
    };

    createIceServer = function (url, username, password) {
      console.warn('createIceServer is deprecated. It should be replaced with an application level implementation.');

      var iceServer = null;
      var urlParts = url.split(':');
      if (urlParts[0].indexOf('stun') === 0) {
        iceServer = { 'url' : url };
      } else if (urlParts[0].indexOf('turn') === 0) {
        iceServer = {
          'url' : url,
          'credential' : password,
          'username' : username
        };
      }
      return iceServer;
    };

    createIceServers = function (urls, username, password) {
      console.warn('createIceServers is deprecated. It should be replaced with an application level implementation.');

      var iceServers = [];
      if (webrtcDetectedVersion >= 34) {
        iceServers = {
          'urls' : urls,
          'credential' : password,
          'username' : username
        };
      } else {
        for (i = 0; i < urls.length; i++) {
          var iceServer = createIceServer(urls[i], username, password);
          if (iceServer !== null) {
            iceServers.push(iceServer);
          }
        }
      }
      return iceServers;
    };
  } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    // Attach a media stream to an element.
    attachMediaStream = function(element, stream) {
      element.srcObject = stream;
      return element;
    };

    reattachMediaStream = function(to, from) {
      to.srcObject = from.srcObject;
      return to;
    };
  }

  // Need to override attachMediaStream and reattachMediaStream
  // to support the plugin's logic
  attachMediaStream_base = attachMediaStream;

  if (webrtcDetectedBrowser === 'opera') {
    attachMediaStream_base = function (element, stream) {
      if (webrtcDetectedVersion > 38) {
        element.srcObject = stream;
      } else if (typeof element.src !== 'undefined') {
        element.src = URL.createObjectURL(stream);
      }
      // Else it doesn't work
    };
  }

  attachMediaStream = function (element, stream) {
    if ((webrtcDetectedBrowser === 'chrome' ||
         webrtcDetectedBrowser === 'opera') &&
        !stream) {
      // Chrome does not support "src = null"
      element.src = '';
    } else {
      attachMediaStream_base(element, stream);
    }
    return element;
  };
  reattachMediaStream_base = reattachMediaStream;
  reattachMediaStream = function (to, from) {
    reattachMediaStream_base(to, from);
    return to;
  };

  // Propagate attachMediaStream and gUM in window and AdapterJS
  window.attachMediaStream      = attachMediaStream;
  window.reattachMediaStream    = reattachMediaStream;
  window.getUserMedia           = function(constraints, onSuccess, onFailure) {
    navigator.getUserMedia(constraints, onSuccess, onFailure);
  };
  AdapterJS.attachMediaStream   = attachMediaStream;
  AdapterJS.reattachMediaStream = reattachMediaStream;
  AdapterJS.getUserMedia        = getUserMedia;

  // Removed Google defined promises when promise is not defined
  if (typeof Promise === 'undefined') {
    requestUserMedia = null;
  }

  AdapterJS.maybeThroughWebRTCReady();

  // END OF EXTENSION OF CHROME, FIREFOX AND EDGE
  ///////////////////////////////////////////////////////////////////

} else { // TRY TO USE PLUGIN

  ///////////////////////////////////////////////////////////////////
  // WEBRTC PLUGIN SHIM
  // Will automatically check if the plugin is available and inject it
  // into the DOM if it is.
  // When the plugin is not available, will prompt a banner to suggest installing it
  // Use AdapterJS.options.hidePluginInstallPrompt to prevent this banner from popping
  //
  // Shims the follwing:
  // -- getUserMedia
  // -- MediaStreamTrack
  // -- MediaStreamTrack.getSources
  // -- RTCPeerConnection
  // -- RTCSessionDescription
  // -- RTCIceCandidate
  // -- createIceServer
  // -- createIceServers
  // -- attachMediaStream
  // -- reattachMediaStream
  // -- webrtcDetectedBrowser
  // -- webrtcDetectedVersion

  // IE 9 is not offering an implementation of console.log until you open a console
  if (typeof console !== 'object' || typeof console.log !== 'function') {
    /* jshint -W020 */
    console = {} || console;
    // Implemented based on console specs from MDN
    // You may override these functions
    console.log = function (arg) {};
    console.info = function (arg) {};
    console.error = function (arg) {};
    console.dir = function (arg) {};
    console.exception = function (arg) {};
    console.trace = function (arg) {};
    console.warn = function (arg) {};
    console.count = function (arg) {};
    console.debug = function (arg) {};
    console.count = function (arg) {};
    console.time = function (arg) {};
    console.timeEnd = function (arg) {};
    console.group = function (arg) {};
    console.groupCollapsed = function (arg) {};
    console.groupEnd = function (arg) {};
    /* jshint +W020 */
  }
  AdapterJS.parseWebrtcDetectedBrowser();
  isIE = webrtcDetectedBrowser === 'IE';

  /* jshint -W035 */
  AdapterJS.WebRTCPlugin.WaitForPluginReady = function() {
    while (AdapterJS.WebRTCPlugin.pluginState !== AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
      /* empty because it needs to prevent the function from running. */
    }
  };
  /* jshint +W035 */

  AdapterJS.WebRTCPlugin.callWhenPluginReady = function (callback) {
    if (AdapterJS.WebRTCPlugin.pluginState === AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
      // Call immediately if possible
      // Once the plugin is set, the code will always take this path
      callback();
    } else {
      // otherwise start a 100ms interval
      var checkPluginReadyState = setInterval(function () {
        if (AdapterJS.WebRTCPlugin.pluginState === AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
          clearInterval(checkPluginReadyState);
          callback();
        }
      }, 100);
    }
  };

  AdapterJS.WebRTCPlugin.setLogLevel = function(logLevel) {
    AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
      AdapterJS.WebRTCPlugin.plugin.setLogLevel(logLevel);
    });
  };

  AdapterJS.WebRTCPlugin.injectPlugin = function () {
    // only inject once the page is ready
    if (document.readyState !== 'complete') {
      return;
    }

    // Prevent multiple injections
    if (AdapterJS.WebRTCPlugin.pluginState !== AdapterJS.WebRTCPlugin.PLUGIN_STATES.INITIALIZING) {
      return;
    }

    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INJECTING;

    if (webrtcDetectedBrowser === 'IE' && webrtcDetectedVersion <= 10) {
      var frag = document.createDocumentFragment();
      AdapterJS.WebRTCPlugin.plugin = document.createElement('div');
      AdapterJS.WebRTCPlugin.plugin.innerHTML = '<object id="' +
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId + '" type="' +
        AdapterJS.WebRTCPlugin.pluginInfo.type + '" ' + 'width="1" height="1">' +
        '<param name="pluginId" value="' +
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId + '" /> ' +
        '<param name="windowless" value="false" /> ' +
        '<param name="pageId" value="' + AdapterJS.WebRTCPlugin.pageId + '" /> ' +
        '<param name="onload" value="' + AdapterJS.WebRTCPlugin.pluginInfo.onload + '" />' +
        '<param name="tag" value="' + AdapterJS.WebRTCPlugin.TAGS.NONE + '" />' +
        // uncomment to be able to use virtual cams
        (AdapterJS.options.getAllCams ? '<param name="forceGetAllCams" value="True" />':'') +

        '</object>';
      while (AdapterJS.WebRTCPlugin.plugin.firstChild) {
        frag.appendChild(AdapterJS.WebRTCPlugin.plugin.firstChild);
      }
      document.body.appendChild(frag);

      // Need to re-fetch the plugin
      AdapterJS.WebRTCPlugin.plugin =
        document.getElementById(AdapterJS.WebRTCPlugin.pluginInfo.pluginId);
    } else {
      // Load Plugin
      AdapterJS.WebRTCPlugin.plugin = document.createElement('object');
      AdapterJS.WebRTCPlugin.plugin.id =
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId;
      // IE will only start the plugin if it's ACTUALLY visible
      if (isIE) {
        AdapterJS.WebRTCPlugin.plugin.width = '1px';
        AdapterJS.WebRTCPlugin.plugin.height = '1px';
      } else { // The size of the plugin on Safari should be 0x0px
              // so that the autorisation prompt is at the top
        AdapterJS.WebRTCPlugin.plugin.width = '0px';
        AdapterJS.WebRTCPlugin.plugin.height = '0px';
      }
      AdapterJS.WebRTCPlugin.plugin.type = AdapterJS.WebRTCPlugin.pluginInfo.type;
      AdapterJS.WebRTCPlugin.plugin.innerHTML = '<param name="onload" value="' +
        AdapterJS.WebRTCPlugin.pluginInfo.onload + '">' +
        '<param name="pluginId" value="' +
        AdapterJS.WebRTCPlugin.pluginInfo.pluginId + '">' +
        '<param name="windowless" value="false" /> ' +
        (AdapterJS.options.getAllCams ? '<param name="forceGetAllCams" value="True" />':'') +
        '<param name="pageId" value="' + AdapterJS.WebRTCPlugin.pageId + '">' +
        '<param name="tag" value="' + AdapterJS.WebRTCPlugin.TAGS.NONE + '" />';
      document.body.appendChild(AdapterJS.WebRTCPlugin.plugin);
    }


    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INJECTED;
  };

  AdapterJS.WebRTCPlugin.isPluginInstalled =
    function (comName, plugName, plugType, installedCb, notInstalledCb) {
    if (!isIE) {
      var pluginArray = navigator.mimeTypes;
      for (var i = 0; i < pluginArray.length; i++) {
        if (pluginArray[i].type.indexOf(plugType) >= 0) {
          installedCb();
          return;
        }
      }
      notInstalledCb();
    } else {
      try {
        var axo = new ActiveXObject(comName + '.' + plugName);
      } catch (e) {
        notInstalledCb();
        return;
      }
      installedCb();
    }
  };

  AdapterJS.WebRTCPlugin.defineWebRTCInterface = function () {
    if (AdapterJS.WebRTCPlugin.pluginState ===
        AdapterJS.WebRTCPlugin.PLUGIN_STATES.READY) {
      console.error('AdapterJS - WebRTC interface has already been defined');
      return;
    }

    AdapterJS.WebRTCPlugin.pluginState = AdapterJS.WebRTCPlugin.PLUGIN_STATES.INITIALIZING;

    AdapterJS.isDefined = function (variable) {
      return variable !== null && variable !== undefined;
    };

    createIceServer = function (url, username, password) {
      var iceServer = null;
      var urlParts = url.split(':');
      if (urlParts[0].indexOf('stun') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : false
        };
      } else if (urlParts[0].indexOf('turn') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : true,
          'credential' : password,
          'username' : username
        };
      }
      return iceServer;
    };

    createIceServers = function (urls, username, password) {
      var iceServers = [];
      for (var i = 0; i < urls.length; ++i) {
        iceServers.push(createIceServer(urls[i], username, password));
      }
      return iceServers;
    };

    RTCSessionDescription = function (info) {
      AdapterJS.WebRTCPlugin.WaitForPluginReady();
      return AdapterJS.WebRTCPlugin.plugin.
        ConstructSessionDescription(info.type, info.sdp);
    };

    RTCPeerConnection = function (servers, constraints) {
      // Validate server argumenr
      if (!(servers === undefined ||
            servers === null ||
            Array.isArray(servers.iceServers))) {
        throw new Error('Failed to construct \'RTCPeerConnection\': Malformed RTCConfiguration');
      }

      // Validate constraints argument
      if (typeof constraints !== 'undefined' && constraints !== null) {
        var invalidConstraits = false;
        invalidConstraits |= typeof constraints !== 'object';
        invalidConstraits |= constraints.hasOwnProperty('mandatory') &&
                              constraints.mandatory !== undefined &&
                              constraints.mandatory !== null &&
                              constraints.mandatory.constructor !== Object;
        invalidConstraits |= constraints.hasOwnProperty('optional') &&
                              constraints.optional !== undefined &&
                              constraints.optional !== null &&
                              !Array.isArray(constraints.optional);
        if (invalidConstraits) {
          throw new Error('Failed to construct \'RTCPeerConnection\': Malformed constraints object');
        }
      }

      // Call relevant PeerConnection constructor according to plugin version
      AdapterJS.WebRTCPlugin.WaitForPluginReady();

      // RTCPeerConnection prototype from the old spec
      var iceServers = null;
      if (servers && Array.isArray(servers.iceServers)) {
        iceServers = servers.iceServers;
        for (var i = 0; i < iceServers.length; i++) {
          // Legacy plugin versions compatibility
          if (iceServers[i].urls && !iceServers[i].url) {
            iceServers[i].url = iceServers[i].urls;
          }
          iceServers[i].hasCredentials = AdapterJS.
            isDefined(iceServers[i].username) &&
            AdapterJS.isDefined(iceServers[i].credential);
        }
      }

      if (AdapterJS.WebRTCPlugin.plugin.PEER_CONNECTION_VERSION &&
          AdapterJS.WebRTCPlugin.plugin.PEER_CONNECTION_VERSION > 1) {
        // RTCPeerConnection prototype from the new spec
        if (iceServers) {
          servers.iceServers = iceServers;
        }
        return AdapterJS.WebRTCPlugin.plugin.PeerConnection(servers);
      } else {
        var mandatory = (constraints && constraints.mandatory) ?
          constraints.mandatory : null;
        var optional = (constraints && constraints.optional) ?
          constraints.optional : null;
        return AdapterJS.WebRTCPlugin.plugin.
          PeerConnection(AdapterJS.WebRTCPlugin.pageId,
          iceServers, mandatory, optional);
      }
    };

    MediaStreamTrack = function(){};
    MediaStreamTrack.getSources = function (callback) {
      AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
        AdapterJS.WebRTCPlugin.plugin.GetSources(callback);
      });
    };

    // getUserMedia constraints shim.
    // Copied from Chrome
    var constraintsToPlugin = function(c) {
      if (typeof c !== 'object' || c.mandatory || c.optional) {
        return c;
      }
      var cc = {};
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
        if (r.exact !== undefined && typeof r.exact === 'number') {
          r.min = r.max = r.exact;
        }
        var oldname = function(prefix, name) {
          if (prefix) {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
          }
          return (name === 'deviceId') ? 'sourceId' : name;
        };
        if (r.ideal !== undefined) {
          cc.optional = cc.optional || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[oldname('min', key)] = r.ideal;
            cc.optional.push(oc);
            oc = {};
            oc[oldname('max', key)] = r.ideal;
            cc.optional.push(oc);
          } else {
            oc[oldname('', key)] = r.ideal;
            cc.optional.push(oc);
          }
        }
        if (r.exact !== undefined && typeof r.exact !== 'number') {
          cc.mandatory = cc.mandatory || {};
          cc.mandatory[oldname('', key)] = r.exact;
        } else {
          ['min', 'max'].forEach(function(mix) {
            if (r[mix] !== undefined) {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname(mix, key)] = r[mix];
            }
          });
        }
      });
      if (c.advanced) {
        cc.optional = (cc.optional || []).concat(c.advanced);
      }
      return cc;
    };

    getUserMedia = function (constraints, successCallback, failureCallback) {
      var cc = {};
      cc.audio = constraints.audio ?
        constraintsToPlugin(constraints.audio) : false;
      cc.video = constraints.video ?
        constraintsToPlugin(constraints.video) : false;

      AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
        AdapterJS.WebRTCPlugin.plugin.
          getUserMedia(cc, successCallback, failureCallback);
      });
    };
    window.navigator.getUserMedia = getUserMedia;

    // Defined mediaDevices when promises are available
    if ( !navigator.mediaDevices &&
      typeof Promise !== 'undefined') {
      requestUserMedia = function(constraints) {
        return new Promise(function(resolve, reject) {
          getUserMedia(constraints, resolve, reject);
        });
      };
      navigator.mediaDevices = {getUserMedia: requestUserMedia,
                                enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      id: device.id,
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      }};
    }

    attachMediaStream = function (element, stream) {
      if (!element || !element.parentNode) {
        return;
      }

      var streamId;
      if (stream === null) {
        streamId = '';
      } else {
        if (typeof stream.enableSoundTracks !== 'undefined') {
          stream.enableSoundTracks(true);
        }
        streamId = stream.id;
      }

      var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
      var nodeName = element.nodeName.toLowerCase();
      if (nodeName !== 'object') { // not a plugin <object> tag yet
        var tag;
        switch(nodeName) {
          case 'audio':
            tag = AdapterJS.WebRTCPlugin.TAGS.AUDIO;
            break;
          case 'video':
            tag = AdapterJS.WebRTCPlugin.TAGS.VIDEO;
            break;
          default:
            tag = AdapterJS.WebRTCPlugin.TAGS.NONE;
          }

        var frag = document.createDocumentFragment();
        var temp = document.createElement('div');
        var classHTML = '';
        if (element.className) {
          classHTML = 'class="' + element.className + '" ';
        } else if (element.attributes && element.attributes['class']) {
          classHTML = 'class="' + element.attributes['class'].value + '" ';
        }

        temp.innerHTML = '<object id="' + elementId + '" ' + classHTML +
          'type="' + AdapterJS.WebRTCPlugin.pluginInfo.type + '">' +
          '<param name="pluginId" value="' + elementId + '" /> ' +
          '<param name="pageId" value="' + AdapterJS.WebRTCPlugin.pageId + '" /> ' +
          '<param name="windowless" value="true" /> ' +
          '<param name="streamId" value="' + streamId + '" /> ' +
          '<param name="tag" value="' + tag + '" /> ' +
          '</object>';
        while (temp.firstChild) {
          frag.appendChild(temp.firstChild);
        }

        var height = '';
        var width = '';
        if (element.clientWidth || element.clientHeight) {
          width = element.clientWidth;
          height = element.clientHeight;
        }
        else if (element.width || element.height) {
          width = element.width;
          height = element.height;
        }

        element.parentNode.insertBefore(frag, element);
        frag = document.getElementById(elementId);
        frag.width = width;
        frag.height = height;
        element.parentNode.removeChild(element);
      } else { // already an <object> tag, just change the stream id
        var children = element.children;
        for (var i = 0; i !== children.length; ++i) {
          if (children[i].name === 'streamId') {
            children[i].value = streamId;
            break;
          }
        }
        element.setStreamId(streamId);
      }
      var newElement = document.getElementById(elementId);
      AdapterJS.forwardEventHandlers(newElement, element, Object.getPrototypeOf(element));

      return newElement;
    };

    reattachMediaStream = function (to, from) {
      var stream = null;
      var children = from.children;
      for (var i = 0; i !== children.length; ++i) {
        if (children[i].name === 'streamId') {
          AdapterJS.WebRTCPlugin.WaitForPluginReady();
          stream = AdapterJS.WebRTCPlugin.plugin
            .getStreamWithId(AdapterJS.WebRTCPlugin.pageId, children[i].value);
          break;
        }
      }
      if (stream !== null) {
        return attachMediaStream(to, stream);
      } else {
        console.log('Could not find the stream associated with this element');
      }
    };

    // Propagate attachMediaStream and gUM in window and AdapterJS
    window.attachMediaStream      = attachMediaStream;
    window.reattachMediaStream    = reattachMediaStream;
    window.getUserMedia           = getUserMedia;
    AdapterJS.attachMediaStream   = attachMediaStream;
    AdapterJS.reattachMediaStream = reattachMediaStream;
    AdapterJS.getUserMedia        = getUserMedia;

    AdapterJS.forwardEventHandlers = function (destElem, srcElem, prototype) {
      properties = Object.getOwnPropertyNames( prototype );
      for(var prop in properties) {
        if (prop) {
          propName = properties[prop];

          if (typeof propName.slice === 'function' &&
              propName.slice(0,2) === 'on' &&
              typeof srcElem[propName] === 'function') {
              AdapterJS.addEvent(destElem, propName.slice(2), srcElem[propName]);
          }
        }
      }
      var subPrototype = Object.getPrototypeOf(prototype);
      if(!!subPrototype) {
        AdapterJS.forwardEventHandlers(destElem, srcElem, subPrototype);
      }
    };

    RTCIceCandidate = function (candidate) {
      if (!candidate.sdpMid) {
        candidate.sdpMid = '';
      }

      AdapterJS.WebRTCPlugin.WaitForPluginReady();
      return AdapterJS.WebRTCPlugin.plugin.ConstructIceCandidate(
        candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate
      );
    };

    // inject plugin
    AdapterJS.addEvent(document, 'readystatechange', AdapterJS.WebRTCPlugin.injectPlugin);
    AdapterJS.WebRTCPlugin.injectPlugin();
  };

  // This function will be called if the plugin is needed (browser different
  // from Chrome or Firefox), but the plugin is not installed.
  AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCb = AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCb ||
    function() {
      AdapterJS.addEvent(document,
                        'readystatechange',
                         AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCbPriv);
      AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCbPriv();
    };

  AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCbPriv = function () {
    if (AdapterJS.options.hidePluginInstallPrompt) {
      return;
    }

    var downloadLink = AdapterJS.WebRTCPlugin.pluginInfo.downloadLink;
    if(downloadLink) { // if download link
      var popupString;
      if (AdapterJS.WebRTCPlugin.pluginInfo.portalLink) { // is portal link
       popupString = 'This website requires you to install the ' +
        ' <a href="' + AdapterJS.WebRTCPlugin.pluginInfo.portalLink +
        '" target="_blank">' + AdapterJS.WebRTCPlugin.pluginInfo.companyName +
        ' WebRTC Plugin</a>' +
        ' to work on this browser.';
      } else { // no portal link, just print a generic explanation
       popupString = AdapterJS.TEXT.PLUGIN.REQUIRE_INSTALLATION;
      }

      AdapterJS.renderNotificationBar(popupString, AdapterJS.TEXT.PLUGIN.BUTTON, downloadLink);
    } else { // no download link, just print a generic explanation
      AdapterJS.renderNotificationBar(AdapterJS.TEXT.PLUGIN.NOT_SUPPORTED);
    }
  };


  // Try to detect the plugin and act accordingly
  AdapterJS.WebRTCPlugin.isPluginInstalled(
    AdapterJS.WebRTCPlugin.pluginInfo.prefix,
    AdapterJS.WebRTCPlugin.pluginInfo.plugName,
    AdapterJS.WebRTCPlugin.pluginInfo.type,
    AdapterJS.WebRTCPlugin.defineWebRTCInterface,
    AdapterJS.WebRTCPlugin.pluginNeededButNotInstalledCb);

  // END OF WEBRTC PLUGIN SHIM
  ///////////////////////////////////////////////////////////////////
}

(function () {

  'use strict';

  var baseGetUserMedia = null;

  AdapterJS.TEXT.EXTENSION = {
    REQUIRE_INSTALLATION_FF: 'To enable screensharing you need to install the Skylink WebRTC tools Firefox Add-on.',
    REQUIRE_INSTALLATION_CHROME: 'To enable screensharing you need to install the Skylink WebRTC tools Chrome Extension.',
    REQUIRE_REFRESH: 'Please refresh this page after the Skylink WebRTC tools extension has been installed.',
    BUTTON_FF: 'Install Now',
    BUTTON_CHROME: 'Go to Chrome Web Store'
  };

  var clone = function(obj) {
    if (null === obj || 'object' !== typeof obj) {
      return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = obj[attr];
      }
    }
    return copy;
  };

  if (window.navigator.mozGetUserMedia) {
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {

      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        // intercepting screensharing requests

        // Invalid mediaSource for firefox, only "screen" and "window" are supported
        if (constraints.video.mediaSource !== 'screen' && constraints.video.mediaSource !== 'window') {
          failureCb(new Error('GetUserMedia: Only "screen" and "window" are supported as mediaSource constraints'));
          return;
        }

        var updatedConstraints = clone(constraints);

        //constraints.video.mediaSource = constraints.video.mediaSource;
        updatedConstraints.video.mozMediaSource = updatedConstraints.video.mediaSource;

        // so generally, it requires for document.readyState to be completed before the getUserMedia could be invoked.
        // strange but this works anyway
        var checkIfReady = setInterval(function () {
          if (document.readyState === 'complete') {
            clearInterval(checkIfReady);

            baseGetUserMedia(updatedConstraints, successCb, function (error) {
              if (['PermissionDeniedError', 'SecurityError'].indexOf(error.name) > -1 && window.parent.location.protocol === 'https:') {
                AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION.REQUIRE_INSTALLATION_FF,
                  AdapterJS.TEXT.EXTENSION.BUTTON_FF,
                  'https://addons.mozilla.org/en-US/firefox/addon/skylink-webrtc-tools/', true, true);
              } else {
                failureCb(error);
              }
            });
          }
        }, 1);

      } else { // regular GetUserMediaRequest
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = window.getUserMedia = navigator.getUserMedia;
    /* Comment out to prevent recursive errors
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return new Promise(function(resolve, reject) {
        window.getUserMedia(constraints, resolve, reject);
      });
    };*/

  } else if (window.navigator.webkitGetUserMedia && window.webrtcDetectedBrowser !== 'safari') {
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        if (window.webrtcDetectedBrowser !== 'chrome') {
          // This is Opera, which does not support screensharing
          failureCb(new Error('Current browser does not support screensharing'));
          return;
        }

        // would be fine since no methods
        var updatedConstraints = clone(constraints);

        var chromeCallback = function(error, sourceId) {
          if(!error) {
            updatedConstraints.video.mandatory = updatedConstraints.video.mandatory || {};
            updatedConstraints.video.mandatory.chromeMediaSource = 'desktop';
            updatedConstraints.video.mandatory.maxWidth = window.screen.width > 1920 ? window.screen.width : 1920;
            updatedConstraints.video.mandatory.maxHeight = window.screen.height > 1080 ? window.screen.height : 1080;

            if (sourceId) {
              updatedConstraints.video.mandatory.chromeMediaSourceId = sourceId;
            }

            delete updatedConstraints.video.mediaSource;

            baseGetUserMedia(updatedConstraints, successCb, failureCb);

          } else { // GUM failed
            if (error === 'permission-denied') {
              failureCb(new Error('Permission denied for screen retrieval'));
            } else {
              // NOTE(J-O): I don't think we ever pass in here. 
              // A failure to capture the screen does not lead here.
              failureCb(new Error('Failed retrieving selected screen'));
            }
          }
        };

        var onIFrameCallback = function (event) {
          if (!event.data) {
            return;
          }

          if (event.data.chromeMediaSourceId) {
            if (event.data.chromeMediaSourceId === 'PermissionDeniedError') {
                chromeCallback('permission-denied');
            } else {
              chromeCallback(null, event.data.chromeMediaSourceId);
            }
          }

          if (event.data.chromeExtensionStatus) {
            if (event.data.chromeExtensionStatus === 'not-installed') {
              AdapterJS.renderNotificationBar(AdapterJS.TEXT.EXTENSION.REQUIRE_INSTALLATION_CHROME,
                AdapterJS.TEXT.EXTENSION.BUTTON_CHROME,
                event.data.data, true, true);
            } else {
              chromeCallback(event.data.chromeExtensionStatus, null);
            }
          }

          // this event listener is no more needed
          window.removeEventListener('message', onIFrameCallback);
        };

        window.addEventListener('message', onIFrameCallback);

        postFrameMessage({
          captureSourceId: true
        });

      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = window.getUserMedia = navigator.getUserMedia;
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return new Promise(function(resolve, reject) {
        window.getUserMedia(constraints, resolve, reject);
      });
    };

  } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    // nothing here because edge does not support screensharing
    console.warn('Edge does not support screensharing feature in getUserMedia');

  } else {
    baseGetUserMedia = window.navigator.getUserMedia;

    navigator.getUserMedia = function (constraints, successCb, failureCb) {
      if (constraints && constraints.video && !!constraints.video.mediaSource) {
        // would be fine since no methods
        var updatedConstraints = clone(constraints);

        // wait for plugin to be ready
        AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
          // check if screensharing feature is available
          if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature &&
            !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
            // set the constraints
            updatedConstraints.video.optional = updatedConstraints.video.optional || [];
            updatedConstraints.video.optional.push({
              sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey || 'Screensharing'
            });

            delete updatedConstraints.video.mediaSource;
          } else {
            failureCb(new Error('Your version of the WebRTC plugin does not support screensharing'));
            return;
          }
          baseGetUserMedia(updatedConstraints, successCb, failureCb);
        });
      } else {
        baseGetUserMedia(constraints, successCb, failureCb);
      }
    };

    AdapterJS.getUserMedia = getUserMedia = 
       window.getUserMedia = navigator.getUserMedia;
    if ( navigator.mediaDevices &&
      typeof Promise !== 'undefined') {
      navigator.mediaDevices.getUserMedia = requestUserMedia;
    }
  }

  // For chrome, use an iframe to load the screensharing extension
  // in the correct domain.
  // Modify here for custom screensharing extension in chrome
  if (window.webrtcDetectedBrowser === 'chrome') {
    var iframe = document.createElement('iframe');

    iframe.onload = function() {
      iframe.isLoaded = true;
    };

    iframe.src = 'https://cdn.temasys.com.sg/skylink/extensions/detectRTC.html';
    iframe.style.display = 'none';

    (document.body || document.documentElement).appendChild(iframe);

    var postFrameMessage = function (object) { // jshint ignore:line
      object = object || {};

      if (!iframe.isLoaded) {
        setTimeout(function () {
          iframe.contentWindow.postMessage(object, '*');
        }, 100);
        return;
      }

      iframe.contentWindow.postMessage(object, '*');
    };
  } else if (window.webrtcDetectedBrowser === 'opera') {
    console.warn('Opera does not support screensharing feature in getUserMedia');
  }
})();

/*! skylinkjs - v0.6.16 - Wed Dec 28 2016 17:41:50 GMT+0800 (SGT) */

(function(refThis) {

'use strict';

/**
 * Polyfill for Object.keys() from Mozilla
 * From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 */
if (!Object.keys) {
  Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({
        toString: null
      }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
}

/**
 * Polyfill for Date.getISOString() from Mozilla
 * From https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 */
(function() {
  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  Date.prototype.toISOString = function() {
    return this.getUTCFullYear() +
      '-' + pad(this.getUTCMonth() + 1) +
      '-' + pad(this.getUTCDate()) +
      'T' + pad(this.getUTCHours()) +
      ':' + pad(this.getUTCMinutes()) +
      ':' + pad(this.getUTCSeconds()) +
      '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z';
  };
})();

/**
 * Polyfill for addEventListener() from Eirik Backer @eirikbacker (github.com).
 * From https://gist.github.com/eirikbacker/2864711
 * MIT Licensed
 */
(function(win, doc){
  if(win.addEventListener) return; //No need to polyfill

  function docHijack(p){var old = doc[p];doc[p] = function(v){ return addListen(old(v)) }}
  function addEvent(on, fn, self){
    return (self = this).attachEvent('on' + on, function(e){
      var e = e || win.event;
      e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
      e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
      fn.call(self, e);
    });
  }
  function addListen(obj, i){
    if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
    else obj.addEventListener = addEvent;
    return obj;
  }

  addListen([doc, win]);
  if('Element' in win)win.Element.prototype.addEventListener = addEvent; //IE8
  else{                                     //IE < 8
    doc.attachEvent('onreadystatechange', function(){addListen(doc.all)}); //Make sure we also init at domReady
    docHijack('getElementsByTagName');
    docHijack('getElementById');
    docHijack('createElement');
    addListen(doc.all);
  }
})(window, document);

/**
 * Global function that clones an object.
 */
var clone = function (obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  var copy = function (data) {
    var copy = data.constructor();
    for (var attr in data) {
      if (data.hasOwnProperty(attr)) {
        copy[attr] = data[attr];
      }
    }
    return copy;
  };

  if (typeof obj === 'object' && !Array.isArray(obj)) {
    try {
      return JSON.parse( JSON.stringify(obj) );
    } catch (err) {
      return copy(obj);
    }
  }

  return copy(obj);
};

/**
 * <h2>Prerequisites on using Skylink</h2>
 * Before using any Skylink functionalities, you will need to authenticate your App Key using
 *   the <a href="#method_init">`init()` method</a>.
 *
 * To manage or create App Keys, you may access the [Skylink Developer Portal here](https://console.temasys.io).
 *
 * To view the list of supported browsers, visit [the list here](
 * https://github.com/Temasys/SkylinkJS#supported-browsers).
 *
 * Here are some articles to help you get started:
 * - [How to setup a simple video call](https://temasys.com.sg/getting-started-with-webrtc-and-skylinkjs/)
 * - [How to setup screensharing](https://temasys.com.sg/screensharing-with-skylinkjs/)
 * - [How to create a chatroom like feature](https://temasys.com.sg/building-a-simple-peer-to-peer-webrtc-chat/)
 *
 * Here are some demos you may use to aid your development:
 * - Getaroom.io [[Demo](https://getaroom.io) / [Source code](https://github.com/Temasys/getaroom)]
 * - Creating a component [[Link](https://github.com/Temasys/skylink-call-button)]
 *
 * You may see the example below in the <a href="#">Constructor tab</a> to have a general idea how event subscription
 *   and the ordering of <a href="#method_init"><code>init()</code></a> and
 *   <a href="#method_joinRoom"><code>joinRoom()</code></a> methods should be called.
 *
 * If you have any issues, you may find answers to your questions in the FAQ section on [our support portal](
 * http://support.temasys.com.sg), asks questions, request features or raise bug tickets as well.
 *
 * If you would like to contribute to our SkylinkJS codebase, see [the contributing README](
 * https://github.com/Temasys/SkylinkJS/blob/master/CONTRIBUTING.md).
 *
 * [See License (Apache 2.0)](https://github.com/Temasys/SkylinkJS/blob/master/LICENSE)
 *
 * @class Skylink
 * @constructor
 * @example
 *   // Here's a simple example on how you can start using Skylink.
 *   var skylinkDemo = new Skylink();
 *
 *   // Subscribe all events first as a general guideline
 *   skylinkDemo.on("incomingStream", function (peerId, stream, peerInfo, isSelf) {
 *     if (isSelf) {
 *       attachMediaStream(document.getElementById("selfVideo"), stream);
 *     } else {
 *       var peerVideo = document.createElement("video");
 *       peerVideo.id = peerId;
 *       peerVideo.autoplay = "autoplay";
 *       document.getElementById("peersVideo").appendChild(peerVideo);
 *       attachMediaStream(peerVideo, stream);
 *     }
 *   });
 *
 *   skylinkDemo.on("peerLeft", function (peerId, peerInfo, isSelf) {
 *     if (!isSelf) {
 *       var peerVideo = document.getElementById(peerId);
 *       // do a check if peerVideo exists first
 *       if (peerVideo) {
 *         document.getElementById("peersVideo").removeChild(peerVideo);
 *       } else {
 *         console.error("Peer video for " + peerId + " is not found.");
 *       }
 *     }
 *   });
 *
 *  // init() should always be called first before other methods other than event methods like on() or off().
 *  skylinkDemo.init("YOUR_APP_KEY_HERE", function (error, success) {
 *    if (success) {
 *      skylinkDemo.joinRoom("my_room", {
 *        userData: "My Username",
 *        audio: true,
 *        video: true
 *      });
 *    }
 *  });
 * @for Skylink
 * @since 0.5.0
 */
function Skylink() {
  /**
   * Stores the flag if Peers should have any Datachannel connections.
   * @attribute _enableDataChannel
   * @default true
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._enableDataChannel = true;

  /**
   * Stores the list of Peer Datachannel connections.
   * @attribute _dataChannels
   * @param {JSON} #peerId The list of Datachannels associated with Peer ID.
   * @param {RTCDataChannel} #peerId.#channelLabel The Datachannel connection.
   *   The property name <code>"main"</code> is reserved for messaging Datachannel type.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.2.0
   */
  this._dataChannels = {};

  /**
   * Stores the list of data transfers from / to Peers.
   * @attribute _dataTransfers
   * @param {JSON} #transferId The data transfer session.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._dataTransfers = {};

  /**
   * Stores the list of buffered ICE candidates that is received before
   *   remote session description is received and set.
   * @attribute _peerCandidatesQueue
   * @param {Array} <#peerId> The list of the Peer connection buffered ICE candidates received.
   * @param {Object} <#peerId>.<#index> The Peer connection buffered ICE candidate received.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.1
   */
  this._peerCandidatesQueue = {};

  /**
   * Stores the list of ICE candidates received before signaling end.
   * @attribute _peerEndOfCandidatesCounter
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerEndOfCandidatesCounter = {};

  /**
   * Stores the list of Peer connection ICE candidates.
   * @attribute _gatheredCandidates
   * @param {JSON} <#peerId> The list of the Peer connection ICE candidates.
   * @param {JSON} <#peerId>.sending The list of the Peer connection ICE candidates sent.
   * @param {JSON} <#peerId>.receiving The list of the Peer connection ICE candidates received.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.14
   */
  this._gatheredCandidates = {};

  /**
   * Stores the flags for ICE candidate filtering.
   * @attribute _filterCandidatesType
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._filterCandidatesType = {
    host: false,
    srflx: false,
    relay: false
  };

  /**
   * Stores the flag that indicates if Peer connections should trickle ICE.
   * @attribute _enableIceTrickle
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._enableIceTrickle = true;

  /**
   * Stores the flag that indicates if STUN ICE servers should be used when constructing Peer connection.
   * @attribute _enableSTUN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._enableSTUN = true;

  /**
   * Stores the flag that indicates if TURN ICE servers should be used when constructing Peer connection.
   * @attribute _enableTURN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._enableTURN = true;

  /**
   * Stores the flag that indicates if public STUN ICE servers should be used when constructing Peer connection.
   * @attribute _usePublicSTUN
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._usePublicSTUN = true;

  /**
   * Stores the global number of Peer connection retries that would increase the wait-for-response timeout
   *   for the Peer connection health timer.
   * @attribute _retryCounters
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._retryCounters = {};

  /**
   * Stores the list of the Peer connections.
   * @attribute _peerConnections
   * @param {Object} <#peerId> The Peer connection.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._peerConnections = {};

  /**
   * Stores the list of the Peer connections stats.
   * @attribute _peerStats
   * @param {Object} <#peerId> The Peer connection stats.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._peerStats = {};

  /**
   * The flag if User is using plugin.
   * @attribute _isUsingPlugin
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._isUsingPlugin = false;

  /**
   * Stores the option for the TURN protocols to use.
   * This should configure the TURN ICE servers urls <code>?transport=protocol</code> flag.
   * @attribute _TURNTransport
   * @type String
   * @default "any"
   * @private
   * @required
   * @for Skylink
   * @since 0.5.4
   */
  this._TURNTransport = 'any';

  /**
   * Stores the list of Peers session information.
   * @attribute _peerInformations
   * @param {JSON} <#peerId> The Peer session information.
   * @param {JSON|String} <#peerId>.userData The Peer custom data.
   * @param {JSON} <#peerId>.settings The Peer streaming information.
   * @param {JSON} <#peerId>.mediaStatus The Peer streaming muted status.
   * @param {JSON} <#peerId>.agent The Peer agent information.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._peerInformations = {};

  /**
   * Stores the Signaling user credentials from the API response required for connecting to the Signaling server.
   * @attribute _user
   * @param {String} uid The API result "username".
   * @param {String} token The API result "userCred".
   * @param {String} timeStamp The API result "timeStamp".
   * @param {String} sid The Signaling server receive user Peer ID.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.6
   */
  this._user = null;

  /**
   * Stores the User custom data.
   * By default, if no custom user data is set, it is an empty string <code>""</code>.
   * @attribute _userData
   * @type JSON|String
   * @default ""
   * @private
   * @for Skylink
   * @since 0.5.6
   */
  this._userData = '';

  /**
   * Stores the User connection priority weight.
   * If Peer has a higher connection weight, it will do the offer from its Peer connection first.
   * @attribute _peerPriorityWeight
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.0
   */
  this._peerPriorityWeight = 0;

  /**
   * Stores the flag that indicates if "autoIntroduce" is enabled.
   * If enabled, the Peers connecting the same Room will receive each others "enter" message ping.
   * @attribute _autoIntroduce
   * @type Boolean
   * @default true
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._autoIntroduce = true;

  /**
   * Stores the flag that indicates if "isPrivileged" is enabled.
   * If enabled, the User has Privileged features which has the ability to retrieve the list of
   *   Peers in the same App space with <code>getPeers()</code> method
   *   and introduce Peers to each other with <code>introducePeer</code> method.
   * @attribute isPrivileged
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._isPrivileged = false;

  /**
   * Stores the list of Peers retrieved from the Signaling from <code>getPeers()</code> method.
   * @attribute _peerList
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._peerList = null;

  /**
   * Stores the current Room name that User is connected to.
   * @attribute _selectedRoom
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._selectedRoom = null;

  /**
   * Stores the flag that indicates if Room is locked.
   * @attribute _roomLocked
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._roomLocked = false;

  /**
   * Stores the flag that indicates if User is connected to the Room.
   * @attribute _inRoom
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.4.0
   */
  this._inRoom = false;

  /**
   * Stores the list of <code>on()</code> event handlers.
   * @attribute _EVENTS
   * @param {Array} <#event> The list of event handlers associated with the event.
   * @param {Function} <#event>.<#index> The event handler function.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._EVENTS = {};

  /**
   * Stores the list of <code>once()</code> event handlers.
   * These events are only triggered once.
   * @attribute _onceEvents
   * @param {Array} <#event> The list of event handlers associated with the event.
   * @param {Array} <#event>.<#index> The array of event handler function and its condition function.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._onceEvents = {};

  /**
   * Stores the timestamps data used for throttling.
   * @attribute _timestamp
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._timestamp = {
    socketMessage: null,
    shareScreen: null,
    refreshConnection: null,
    getUserMedia: null,
    lastRestart: null
  };

  /**
   * Stores the throttling interval timeout.
   * @attribute _throttlingTimeouts
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._throttlingTimeouts = {
    shareScreen: 10000,
    refreshConnection: 5000,
    getUserMedia: 0
  };

  /**
   * Stores the flag if throttling should throw when called less than the interval timeout.
   * @attribute _throttlingShouldThrowError
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._throttlingShouldThrowError = false;

  /**
   * Stores the current socket connection information.
   * @attribute _socketSession
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.13
   */
  this._socketSession = {};

  /**
   * Stores the queued socket messages.
   * This is to prevent too many sent over less than a second interval that might cause dropped messages
   *   or jams to the Signaling connection.
   * @attribute _socketMessageQueue
   * @type Array
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketMessageQueue = [];

  /**
   * Stores the <code>setTimeout</code> to sent queued socket messages.
   * @attribute _socketMessageTimeout
   * @type Object
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketMessageTimeout = null;

  /**
   * Stores the list of socket ports to use to connect to the Signaling.
   * These ports are defined by default which is commonly used currently by the Signaling.
   * Should re-evaluate this sometime.
   * @attribute _socketPorts
   * @param {Array} http: The list of HTTP socket ports.
   * @param {Array} https: The list of HTTPS socket ports.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.8
   */
  this._socketPorts = {
    'http:': [80, 3000],
    'https:': [443, 3443]
  };

  /**
   * Stores the flag that indicates if socket connection to the Signaling has opened.
   * @attribute _channelOpen
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._channelOpen = false;

  /**
   * Stores the Signaling server url.
   * @attribute _signalingServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._signalingServer = null;

  /**
   * Stores the Signaling server protocol.
   * @attribute _signalingServerProtocol
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._signalingServerProtocol = window.location.protocol;

  /**
   * Stores the Signaling server port.
   * @attribute _signalingServerPort
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._signalingServerPort = null;

  /**
   * Stores the Signaling socket connection object.
   * @attribute _socket
   * @type io
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._socket = null;

  /**
   * Stores the socket connection timeout when establishing connection to the Signaling.
   * @attribute _socketTimeout
   * @type Number
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._socketTimeout = 20000;

  /**
   * Stores the flag that indicates if XDomainRequest is used for IE 8/9.
   * @attribute _socketUseXDR
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._socketUseXDR = false;

  /**
   * Stores the value if ICE restart is supported.
   * @attribute _enableIceRestart
   * @type String
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._enableIceRestart = window.webrtcDetectedBrowser === 'firefox' ?
    window.webrtcDetectedVersion >= 48 : true;

  /**
   * Stores the flag if MCU environment is enabled.
   * @attribute _hasMCU
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._hasMCU = false;

  /**
   * Stores the flag if HTTPS connections should be enforced when connecting to
   *   the API or Signaling server if App is accessing from HTTP domain.
   * HTTPS connections are enforced if App is accessing from HTTPS domains.
   * @attribute _forceSSL
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._forceSSL = false;

  /**
   * Stores the flag if TURNS connections should be enforced when connecting to
   *   the TURN server if App is accessing from HTTP domain.
   * TURNS connections are enforced if App is accessing from HTTPS domains.
   * @attribute _forceTURNSSL
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._forceTURNSSL = false;

  /**
   * Stores the flag if TURN connections should be enforced when connecting to Peers.
   * This filters all non "relay" ICE candidates to enforce connections via the TURN server.
   * @attribute _forceTURN
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.1
   */
  this._forceTURN = false;

  /**
   * Stores the construct API REST path to obtain Room credentials.
   * @attribute _path
   * @type String
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._path = null;

  /**
   * Stores the API server url.
   * @attribute _roomServer
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._roomServer = '//api.temasys.com.sg';

  /**
   * Stores the App Key configured in <code>init()</code>.
   * @attribute _appKey
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._appKey = null;

  /**
   * Stores the default Room name to connect to when <code>joinRoom()</code> does not provide a Room name.
   * @attribute _defaultRoom
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._defaultRoom = null;

  /**
   * Stores the <code>init()</code> credentials starting DateTime stamp in ISO 8601.
   * @attribute _roomStart
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomStart = null;

  /**
   * Stores the <code>init()</code> credentials duration counted in hours.
   * @attribute _roomDuration
   * @type Number
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomDuration = null;

  /**
   * Stores the <code>init()</code> generated credentials string.
   * @attribute _roomCredentials
   * @type String
   * @private
   * @for Skylink
   * @since 0.3.0
   */
  this._roomCredentials = null;

  /**
   * Stores the current <code>init()</code> readyState.
   * @attribute _readyState
   * @type Number
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._readyState = 0;

  /**
   * Stores the "cid" used for <code>joinRoom()</code>.
   * @attribute _key
   * @type String
   * @private
   * @for Skylink
   * @since 0.1.0
   */
  this._key = null;

  /**
   * Stores the "apiOwner" used for <code>joinRoom()</code>.
   * @attribute _appKeyOwner
   * @type String
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._appKeyOwner = null;

  /**
   * Stores the Room credentials information for <code>joinRoom()</code>.
   * @attribute _room
   * @param {String} id The "rid" for <code>joinRoom()</code>.
   * @param {String} token The "roomCred" for <code>joinRoom()</code>.
   * @param {String} startDateTime The "start" for <code>joinRoom()</code>.
   * @param {String} duration The "len" for <code>joinRoom()</code>.
   * @param {String} connection The RTCPeerConnection constraints and configuration. This is not used in the SDK
   *   except for the "mediaConstraints" property that sets the default <code>getUserMedia()</code> settings.
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.5.2
   */
  this._room = null;

  /**
   * Stores the list of Peer messages timestamp.
   * @attribute _peerMessagesStamps
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._peerMessagesStamps = {};

  /**
   * Stores the flag that indicates if <code>getUserMedia()</code> should fallback to retrieve
   *   audio only Stream after retrieval of audio and video Stream had failed.
   * @attribute _audioFallback
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.5.4
   */
  this._audioFallback = false;

  /**
   * Stores the Streams.
   * @attribute _streams
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streams = {
    userMedia: null,
    screenshare: null
  };

  /**
   * Stores the default camera Stream settings.
   * @attribute _streamsDefaultSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsDefaultSettings = {
    userMedia: {
      audio: {
        stereo: false
      },
      video: {
        resolution: {
          width: 640,
          height: 480
        },
        frameRate: 50
      }
    },
    screenshare: {
      video: true
    }
  };

  /**
   * Stores all the Stream required muted settings.
   * @attribute _streamsMutedSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsMutedSettings = {
    audioMuted: false,
    videoMuted: false
  };

  /**
   * Stores all the Stream sending maximum bandwidth settings.
   * @attribute _streamsBandwidthSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsBandwidthSettings = {
    googleX: {},
    bAS: {}
  };

  /**
   * Stores all the Stream stopped callbacks.
   * @attribute _streamsStoppedCbs
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsStoppedCbs = {};

  /**
   * Stores all the Stream sessions.
   * Defined as <code>false</code> when Stream has already ended.
   * @attribute _streamsSession
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.15
   */
  this._streamsSession = {};

  /**
   * Stores the preferred sending Peer connection streaming audio codec.
   * @attribute _selectedAudioCodec
   * @type String
   * @default "auto"
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._selectedAudioCodec = 'auto';

  /**
   * Stores the preferred sending Peer connection streaming video codec.
   * @attribute _selectedVideoCodec
   * @type String
   * @default "auto"
   * @private
   * @for Skylink
   * @since 0.5.10
   */
  this._selectedVideoCodec = 'auto';

  /**
   * Stores the flag if ulpfec and red codecs should be removed.
   * @attribute _disableVideoFecCodecs
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableVideoFecCodecs = false;

  /**
   * Stores the flag if CN (Comfort Noise) codec should be removed.
   * @attribute _disableComfortNoiseCodec
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableComfortNoiseCodec = false;

  /**
   * Stores the flag if REMB feedback packets should be removed.
   * @attribute _disableREMB
   * @type Boolean
   * @default false
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._disableREMB = false;

  /**
   * Stores the session description settings.
   * @attribute _sdpSettings
   * @type JSON
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._sdpSettings = {
    connection: {
      audio: true,
      video: true,
      data: true
    },
    direction: {
      audio: { send: true, receive: true },
      video: { send: true, receive: true }
    }
  };

  /**
   * Stores the publish only settings.
   * @attribute _publishOnly
   * @type JSON|Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._publishOnly = false;

  /**
   * Stores the list of recordings.
   * @attribute _recordings
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._recordings = {};

  /**
   * Stores the current active recording session ID.
   * There can only be 1 recording session at a time in a Room
   * @attribute _currentRecordingId
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._currentRecordingId = false;

  /**
   * Stores the recording session timeout to ensure 4 seconds has been recorded.
   * @attribute _recordingStartInterval
   * @type JSON
   * @private
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  this._recordingStartInterval = null;

  /**
   * Stores the flag if MCU should use renegotiation.
   * @attribute _mcuUseRenegoRestart
   * @type Boolean
   * @private
   * @for Skylink
   * @since 0.6.16
   */
  this._mcuUseRenegoRestart = false;
}
Skylink.prototype.DATA_CHANNEL_STATE = {
  CONNECTING: 'connecting',
  OPEN: 'open',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ERROR: 'error',
  CREATE_ERROR: 'createError',
  BUFFERED_AMOUNT_LOW: 'bufferedAmountLow',
  SEND_MESSAGE_ERROR: 'sendMessageError'
};

/**
 * The list of Datachannel types.
 * @attribute DATA_CHANNEL_TYPE
 * @param {String} MESSAGING <small>Value <code>"messaging"</code></small>
 *   The value of the Datachannel type that is used only for messaging in
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 *   <small>However for Peers that do not support simultaneous data transfers, this Datachannel
 *   type will be used to do data transfers (1 at a time).</small>
 *   <small>Each Peer connections will only have one of this Datachannel type and the
 *   connection will only close when the Peer connection is closed (happens when <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggers parameter payload <code>state</code> as
 *   <code>CLOSED</code> for Peer).</small>
 * @param {String} DATA <small>Value <code>"data"</code></small>
 *   The value of the Datachannel type that is used only for a data transfer in
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
 *   <small>The connection will close after the data transfer has been completed or terminated (happens when
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>DOWNLOAD_COMPLETED</code>, <code>UPLOAD_COMPLETED</code>,
 *   <code>REJECTED</code>, <code>CANCEL</code> or <code>ERROR</code> for Peer).</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.DATA_CHANNEL_TYPE = {
  MESSAGING: 'messaging',
  DATA: 'data'
};

/**
 * The list of Datachannel sending message error types.
 * @attribute DATA_CHANNEL_MESSAGE_ERROR
 * @param {String} MESSAGE <small>Value <code>"message"</code></small>
 *   The value of the Datachannel sending message error type when encountered during
 *   sending P2P message from <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
 * @param {String} TRANSFER <small>Value <code>"transfer"</code></small>
 *   The value of the Datachannel sending message error type when encountered during
 *   data transfers from <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
 *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.DATA_CHANNEL_MESSAGE_ERROR = {
  MESSAGE: 'message',
  TRANSFER: 'transfer'
};

/**
 * Function that starts a Datachannel connection with Peer.
 * @method _createDataChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._createDataChannel = function(peerId, dataChannel, createAsMessagingChannel) {
  var self = this;

  if (!self._user) {
    log.error([peerId, 'RTCDataChannel', null,
      'Aborting of creating or initializing Datachannel as User does not have Room session']);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.error([peerId, 'RTCDataChannel', null,
      'Aborting of creating or initializing Datachannel as Peer connection does not exists']);
    return;
  }

  var channelName = self._user.sid + '_' + peerId;
  var channelType = createAsMessagingChannel ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA;

  if (dataChannel && typeof dataChannel === 'object') {
    channelName = dataChannel.label;

  } else if (typeof dataChannel === 'string') {
    channelName = dataChannel;
    dataChannel = null;
  }

  if (!dataChannel) {
    try {
      dataChannel = self._peerConnections[peerId].createDataChannel(channelName);

    } catch (error) {
      log.error([peerId, 'RTCDataChannel', channelName, 'Failed creating Datachannel ->'], error);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CREATE_ERROR, peerId, error, channelName, channelType, null);
      return;
    }
  }

  if (!self._dataChannels[peerId]) {
    log.debug([peerId, 'RTCDataChannel', channelName, 'initializing main DataChannel']);

    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;

    self._dataChannels[peerId] = {};

  } else if (self._dataChannels[peerId].main && self._dataChannels[peerId].main.channel.label === channelName) {
    channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
  }

  /**
   * Subscribe to events
   */
  dataChannel.onerror = function (evt) {
    var channelError = evt.error || evt;

    log.error([peerId, 'RTCDataChannel', channelName, 'Datachannel has an exception ->'], channelError);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, channelError, channelName, channelType, null);
  };

  dataChannel.onbufferedamountlow = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel buffering data transfer low']);

    // TODO: Should we add an event here
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.BUFFERED_AMOUNT_LOW, peerId, null, channelName, channelType, null);
  };

  dataChannel.onmessage = function(event) {
    self._processDataChannelData(event.data, peerId, channelName, channelType);
  };

  var onOpenHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has opened']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerId, null, channelName, channelType, null);
  };

  if (dataChannel.readyState === self.DATA_CHANNEL_STATE.OPEN) {
    setTimeout(onOpenHandlerFn, 500);

  } else {
    self._trigger('dataChannelState', dataChannel.readyState, peerId, null, channelName, channelType, null);

    dataChannel.onopen = onOpenHandlerFn;
  }

  var onCloseHandlerFn = function () {
    log.debug([peerId, 'RTCDataChannel', channelName, 'Datachannel has closed']);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerId, null, channelName, channelType, null);

    if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
      setTimeout(function () {
        if (self._peerConnections[peerId] &&
          self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED &&
          (self._peerConnections[peerId].localDescription &&
            self._peerConnections[peerId].localDescription.type === self.HANDSHAKE_PROGRESS.OFFER)) {
          log.debug([peerId, 'RTCDataChannel', channelName, 'Reviving Datachannel connection']);
          self._createDataChannel(peerId, channelName, true);
        }
      }, 100);
    }
  };

  // Fixes for Firefox bug (49 is working) -> https://bugzilla.mozilla.org/show_bug.cgi?id=1118398
  if (window.webrtcDetectedBrowser === 'firefox') {
    var hasTriggeredClose = false;
    var timeBlockAfterClosing = 0;

    dataChannel.onclose = function () {
      if (!hasTriggeredClose) {
        hasTriggeredClose = true;
        onCloseHandlerFn();
      }
    };

    var onFFClosed = setInterval(function () {
      if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSED ||
        hasTriggeredClose || timeBlockAfterClosing === 5) {
        clearInterval(onFFClosed);

        if (!hasTriggeredClose) {
          hasTriggeredClose = true;
          onCloseHandlerFn();
        }
      // After 5 seconds from CLOSING state and Firefox is not rendering to close, we have to assume to close it.
      // It is dead! This fixes the case where if it's Firefox who closes the Datachannel, the connection will
      // still assume as CLOSING..
      } else if (dataChannel.readyState === self.DATA_CHANNEL_STATE.CLOSING) {
        timeBlockAfterClosing++;
      }
    }, 1000);

  } else {
    dataChannel.onclose = onCloseHandlerFn;
  }

  if (channelType === self.DATA_CHANNEL_TYPE.MESSAGING) {
    self._dataChannels[peerId].main = {
      channelName: channelName,
      channelType: channelType,
      transferId: null,
      channel: dataChannel
    };
  } else {
    self._dataChannels[peerId][channelName] = {
      channelName: channelName,
      channelType: channelType,
      transferId: channelName,
      channel: dataChannel
    };
  }
};

/**
 * Function that sends data over the Datachannel connection.
 * @method _sendMessageToDataChannel
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._sendMessageToDataChannel = function(peerId, data, channelProp, doNotConvert) {
  var self = this;

  // Set it as "main" (MESSAGING) Datachannel
  if (!channelProp || channelProp === peerId) {
    channelProp = 'main';
  }

  // TODO: What happens when we want to send binary data over or ArrayBuffers?
  if (!(typeof data === 'object' && data) && !(data && typeof data === 'string')) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Dropping invalid data ->'], data);
    return;
  }

  if (!(self._peerConnections[peerId] &&
    self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping for sending message as Peer connection does not exists or is closed ->'], data);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', 'prop:' + channelProp,
      'Dropping for sending message as Datachannel connection does not exists ->'], data);
    return;
  }

  var channelName = self._dataChannels[peerId][channelProp].channelName;
  var channelType = self._dataChannels[peerId][channelProp].channelType;
  var readyState  = self._dataChannels[peerId][channelProp].channel.readyState;
  var messageType = typeof data === 'object' && data.type === self._DC_PROTOCOL_TYPE.MESSAGE ?
    self.DATA_CHANNEL_MESSAGE_ERROR.MESSAGE : self.DATA_CHANNEL_MESSAGE_ERROR.TRANSFER;

  if (readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    var notOpenError = 'Failed sending message as Datachannel connection state is not opened. Current ' +
      'readyState is "' + readyState + '"';

    log.error([peerId, 'RTCDataChannel', 'prop:' + channelProp, notOpenError + ' ->'], data);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      new Error(notOpenError), channelName, channelType, messageType);
    
    throw new Error(notOpenError);
  }

  try {
    if (!doNotConvert && typeof data === 'object') {
      log.debug([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Sending message ->'], data);

      self._dataChannels[peerId][channelProp].channel.send(JSON.stringify(data));

    } else {
      log.debug([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Sending data with size ->'], data.size || data.length);

      self._dataChannels[peerId][channelProp].channel.send(data);
    }
  } catch (error) {
    log.error([peerId, 'RTCDataChannel', 'prop:' + channelProp, 'Failed sending message ->'], error);

    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.SEND_MESSAGE_ERROR, peerId,
      error, channelName, channelType, messageType);

    throw error;
  }
};

/**
 * Function that stops the Datachannel connection and removes object references.
 * @method _closeDataChannel
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._closeDataChannel = function(peerId, channelProp) {
  var self = this;

  if (!self._dataChannels[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelProp || null,
      'Aborting closing Datachannels as Peer connection does not have Datachannel sessions']);
    return;
  }

  var closeFn = function (rChannelProp) {
    var channelName = self._dataChannels[peerId][rChannelProp].channelName;
    var channelType = self._dataChannels[peerId][rChannelProp].channelType;

    if (self._dataChannels[peerId][rChannelProp].readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
      log.debug([peerId, 'RTCDataChannel', channelName, 'Closing Datachannel']);

      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSING, peerId, null, channelName, channelType, null);

      self._dataChannels[peerId][rChannelProp].channel.close();

      delete self._dataChannels[peerId][rChannelProp];
    }
  };

  if (!channelProp) {
    for (var channelNameProp in self._dataChannels) {
      if (self._dataChannels[peerId].hasOwnProperty(channelNameProp)) {
        if (self._dataChannels[peerId][channelNameProp]) {
          closeFn(channelNameProp);
        }
      }
    }
  } else {
    if (!self._dataChannels[peerId][channelProp]) {
      log.warn([peerId, 'RTCDataChannel', channelProp, 'Aborting closing Datachannel as it does not exists']);
      return;
    }

    closeFn(channelProp);
  }
};
Skylink.prototype.DATA_TRANSFER_DATA_TYPE = {
  BINARY_STRING: 'binaryString',
  ARRAY_BUFFER: 'arrayBuffer',
  BLOB: 'blob',
  STRING: 'string'
};

/**
 * Stores the data chunk size for Blob transfers.
 * @attribute _CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_FILE_SIZE = 49152;

/**
 * Stores the data chunk size for Blob transfers transferring from/to
 *   Firefox browsers due to limitation tested in the past in some PCs (linx predominatly).
 * @attribute _MOZ_CHUNK_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MOZ_CHUNK_FILE_SIZE = 12288;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @attribute _BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._BINARY_FILE_SIZE = 65456;

/**
 * Stores the data chunk size for binary Blob transfers.
 * @attribute _MOZ_BINARY_FILE_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._MOZ_BINARY_FILE_SIZE = 16384;

/**
 * Stores the data chunk size for data URI string transfers.
 * @attribute _CHUNK_DATAURL_SIZE
 * @type Number
 * @private
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._CHUNK_DATAURL_SIZE = 1212;

/**
 * Function that converts Base64 string into Blob object.
 * This is referenced from devnull69@stackoverflow.com #6850276.
 * @method _base64ToBlob
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._base64ToBlob = function(dataURL) {
  var byteString = atob(dataURL);
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var j = 0; j < byteString.length; j++) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
};

/**
 * Function that converts a Blob object into Base64 string.
 * @method _blobToBase64
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToBase64 = function(data, callback) {
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    var base64BinaryString = fileReader.result.split(',')[1];
    callback(base64BinaryString);
  };
  fileReader.readAsDataURL(data);
};

/**
 * Function that converts a Blob object into ArrayBuffer object.
 * @method _blobToArrayBuffer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._blobToArrayBuffer = function(data, callback) {
  var self = this;
  var fileReader = new FileReader();
  fileReader.onload = function() {
    // Load Blob as dataurl base64 string
    if (self._isUsingPlugin) {
      callback(new Int8Array(fileReader.result));
    } else {
      callback(fileReader.result);
    }
  };
  fileReader.readAsArrayBuffer(data);
};

/**
 * Function that chunks Blob object based on the data chunk size provided.
 * If provided Blob object size is lesser than or equals to the chunk size, it should return an array
 *   of length of <code>1</code>.
 * @method _chunkBlobData
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._chunkBlobData = function(blob, chunkSize) {
  var chunksArray = [];
  var startCount = 0;
  var endCount = 0;
  var blobByteSize = blob.size;

  if (blobByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((blobByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      chunksArray.push(blob.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((blobByteSize - (startCount + 1)) > 0) {
      chunksArray.push(blob.slice(startCount, blobByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    chunksArray.push(blob);
  }
  return chunksArray;
};

/**
 * Function that chunks large string into string chunks based on the data chunk size provided.
 * If provided string length is lesser than or equals to the chunk size, it should return an array
 *   of length of <code>1</code>.
 * @method _chunkDataURL
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._chunkDataURL = function(dataURL, chunkSize) {
  var outputStr = dataURL; //encodeURIComponent(dataURL);
  var dataURLArray = [];
  var startCount = 0;
  var endCount = 0;
  var dataByteSize = dataURL.size || dataURL.length;

  if (dataByteSize > chunkSize) {
    // File Size greater than Chunk size
    while ((dataByteSize - 1) > endCount) {
      endCount = startCount + chunkSize;
      dataURLArray.push(outputStr.slice(startCount, endCount));
      startCount += chunkSize;
    }
    if ((dataByteSize - (startCount + 1)) > 0) {
      chunksArray.push(outputStr.slice(startCount, dataByteSize - 1));
    }
  } else {
    // File Size below Chunk size
    dataURLArray.push(outputStr);
  }

  return dataURLArray;
};
Skylink.prototype.DT_PROTOCOL_VERSION = '0.1.0';

/**
 * The list of data transfers directions.
 * @attribute DATA_TRANSFER_TYPE
 * @param {String} UPLOAD <small>Value <code>"upload"</code></small>
 *   The value of the data transfer direction when User is uploading data to Peer.
 * @param {String} DOWNLOAD <small>Value <code>"download"</code></small>
 *   The value of the data transfer direction when User is downloading data from Peer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_TYPE = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

/**
 * The list of data transfers session types.
 * @attribute DATA_TRANSFER_SESSION_TYPE
 * @param {String} BLOB     <small>Value <code>"blob"</code></small>
 *   The value of the session type for
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> data transfer.
 * @param {String} DATA_URL <small>Value <code>"dataURL"</code></small>
 *   The value of the session type for
 *   <a href="#method_sendBlobData"><code>method_sendBlobData()</code> method</a> data transfer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.DATA_TRANSFER_SESSION_TYPE = {
  BLOB: 'blob',
  DATA_URL: 'dataURL'
};

/**
 * The list of data transfer states.
 * @attribute DATA_TRANSFER_STATE
 * @param {String} UPLOAD_REQUEST     <small>Value <code>"request"</code></small>
 *   The value of the state when receiving an upload data transfer request from Peer to User.
 *   <small>At this stage, the upload data transfer request from Peer may be accepted or rejected with the
 *   <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a> invoked by User.</small>
 * @parma {String} USER_UPLOAD_REQUEST <small>Value <code>"userRequest"</code></small>
 *   The value of the state when User sent an upload data transfer request to Peer.
 *   <small>At this stage, the upload data transfer request to Peer may be accepted or rejected with the
 *   <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a> invoked by Peer.</small>
 * @param {String} UPLOAD_STARTED     <small>Value <code>"uploadStarted"</code></small>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start uploading data to Peer.
 *   <small>At this stage, the data transfer may be terminated with the
 *   <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>.</small>
 * @param {String} DOWNLOAD_STARTED   <small>Value <code>"downloadStarted"</code></small>
 *   The value of the state when the data transfer request has been accepted
 *   and data transfer will start downloading data from Peer.
 *   <small>At this stage, the data transfer may be terminated with the
 *   <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>.</small>
 * @param {String} REJECTED           <small>Value <code>"rejected"</code></small>
 *   The value of the state when upload data transfer request to Peer has been rejected and terminated.
 * @param {String} USER_REJECTED      <small>Value <code>"userRejected"</code></small>
 *   The value of the state when User rejected and terminated upload data transfer request from Peer.
 * @param {String} UPLOADING          <small>Value <code>"uploading"</code></small>
 *   The value of the state when data transfer is uploading data to Peer.
 * @param {String} DOWNLOADING        <small>Value <code>"downloading"</code></small>
 *   The value of the state when data transfer is downloading data from Peer.
 * @param {String} UPLOAD_COMPLETED   <small>Value <code>"uploadCompleted"</code></small>
 *   The value of the state when data transfer has uploaded successfully to Peer.
 * @param {String} DOWNLOAD_COMPLETED <small>Value <code>"downloadCompleted"</code></small>
 *   The value of the state when data transfer has downloaded successfully from Peer.
 * @param {String} CANCEL             <small>Value <code>"cancel"</code></small>
 *   The value of the state when data transfer has been terminated from / to Peer.
 * @param {String} ERROR              <small>Value <code>"error"</code></small>
 *   The value of the state when data transfer has errors and has been terminated from / to Peer.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.DATA_TRANSFER_STATE = {
  UPLOAD_REQUEST: 'request',
  UPLOAD_STARTED: 'uploadStarted',
  DOWNLOAD_STARTED: 'downloadStarted',
  REJECTED: 'rejected',
  CANCEL: 'cancel',
  ERROR: 'error',
  UPLOADING: 'uploading',
  DOWNLOADING: 'downloading',
  UPLOAD_COMPLETED: 'uploadCompleted',
  DOWNLOAD_COMPLETED: 'downloadCompleted',
  USER_REJECTED: 'userRejected',
  USER_UPLOAD_REQUEST: 'userRequest'
};

/**
 * Stores the list of data transfer protocols.
 * @attribute _DC_PROTOCOL_TYPE
 * @param {String} WRQ The protocol to initiate data transfer.
 * @param {String} ACK The protocol to request for data transfer chunk.
 *   Give <code>-1</code> to reject the request at the beginning and <code>0</code> to accept
 *   the data transfer request.
 * @param {String} CANCEL The protocol to terminate data transfer.
 * @param {String} ERROR The protocol when data transfer has errors and has to be terminated.
 * @param {String} MESSAGE The protocol that is used to send P2P messages.
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._DC_PROTOCOL_TYPE = {
  WRQ: 'WRQ',
  ACK: 'ACK',
  ERROR: 'ERROR',
  CANCEL: 'CANCEL',
  MESSAGE: 'MESSAGE'
};

/**
 * Stores the list of agent names supported by the Web for Web only functionalities.
 * @attribute _SUPPORTED_WEB_AGENTS
 * @type Array
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._SUPPORTED_WEB_AGENTS = ['chrome', 'firefox', 'safari', 'IE', 'edge' ,'opera', 'bowser', 'blink'];

/**
 * <blockquote class="info">
 *   Note that Android, iOS and C++ SDKs do not support simultaneous data transfers.
 * </blockquote>
 * Function that starts an uploading data transfer from User to Peers.
 * @method sendBlobData
 * @param {Blob} data The Blob object.
 * @param {Number} [timeout=60] The timeout to wait for response from Peer.
 * @param {String|Array} [targetPeerId] The target Peer ID to start data transfer with.
 * - When provided as an Array, it will start uploading data transfers with all connections
 *   with all the Peer IDs provided.
 * - When not provided, it will start uploading data transfers with all the currently connected Peers in the Room.
 * @param {Boolean} [sendChunksAsBinary=false] <blockquote class="info">
 *   Note that this is currently not supported for MCU enabled Peer connections or Peer connections connecting from
 *   Android, iOS and Linux SDKs. This would fallback to <code>transferInfo.chunkType</code> to
 *   <code>BINARY_STRING</code> when MCU is connected. </blockquote> The flag if data transfer
 *   binary data chunks should not be encoded as Base64 string during data transfers.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggering <code>state</code> parameter payload
 *   as <code>UPLOAD_COMPLETED</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {String} callback.error.transferId The data transfer ID.
 *   <small>Defined as <code>null</code> when <code>sendBlobData()</code> fails to start data transfer.</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.error.transferErrors The list of data transfer errors.
 * @param {Error|String} callback.error.transferErrors.#peerId The data transfer error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to start data transfer with.</small>
 * @param {JSON} callback.error.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> except without the
 *   <code>percentage</code> and <code>data</code> property.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.transferId The data transfer ID.
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.success.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> except without the
 *   <code>percentage</code> property and <code>data</code>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Checks if Peer connection and Datachannel connection are in correct states. <ol>
 *   <li>If Peer connection or session does not exists: <ol><li><a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Peer connection is not stable: <small>The stable state can be checked with <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggering parameter payload <code>state</code> as <code>STABLE</code>
 *   for Peer.</small> <ol><li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If Peer connection messaging Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code> and <code>channelType</code> as
 *   <code>MESSAGING</code> for Peer.</small> <ol><li><a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggers parameter payload <code>state</code> as <code>ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>method</a> and connected: <ol>
 *   <li>If MCU Peer connection is not stable: <small>The stable state can be checked with <a href="#event_peerConnectionState">
 *   <code>peerConnectionState</code> event</a> triggering parameter payload <code>state</code> as <code>STABLE</code>
 *   and <code>peerId</code> value as <code>"MCU"</code> for MCU Peer.</small>
 *   <ol><li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If MCU Peer connection messaging Datachannel has not been opened: <small>This can be checked with
 *   <a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggering parameter
 *   payload <code>state</code> as <code>OPEN</code>, <code>peerId</code> value as <code>"MCU"</code>
 *   and <code>channelType</code> as <code>MESSAGING</code> for MCU Peer.</small>
 *   <ol><li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>Checks if should open a new data Datachannel.<ol>
 *   <li>If Peer supports simultaneous data transfer, open new data Datachannel: <small>If MCU is connected,
 *   this opens a new data Datachannel with MCU Peer with all the Peers IDs information that supports
 *   simultaneous data transfers targeted for the data transfer session instead of opening new data Datachannel
 *   with all Peers targeted for the data transfer session.</small> <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>CONNECTING</code> and <code>channelType</code> as <code>DATA</code>.
 *   <small>Note that there is no timeout to wait for parameter payload <code>state</code> to be
 *   <code>OPEN</code>.</small></li>
 *   <li>If Datachannel has been created and opened successfully: <ol>
 *   <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>OPEN</code> and <code>channelType</code> as <code>DATA</code>.</li></ol></li>
 *   <li>Else: <ol><li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>CREATE_ERROR</code> and <code>channelType</code> as
 *   <code>DATA</code>.</li><li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li></ol></li><li>Else: <small>If MCU is connected,
 *   this uses the messaging Datachannel with MCU Peer with all the Peers IDs information that supports
 *   simultaneous data transfers targeted for the data transfer session instead of using the messaging Datachannels
 *   with all Peers targeted for the data transfer session.</small> <ol><li>If messaging Datachannel connection has a
 *   data transfer in-progress: <ol><li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and
 *   return error.</li></ol></li></li></ol></ol></li></ol></li>
 *   <li>Starts the data transfer to Peer. <ol>
 *   <li><a href="#event_incomingDataRequest"><code>incomingDataRequest</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>USER_UPLOAD_REQUEST</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_REQUEST</code>.</li>
 *   <li>Peer invokes <a href="#method_acceptDataTransfer"><code>acceptDataTransfer()</code> method</a>. <ol>
 *   <li>If parameter <code>accept</code> value is <code>true</code>: <ol>
 *   <li>User starts upload data transfer to Peer. <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_STARTED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOAD_STARTED</code>.</li></ol></li>
 *   <li>If Peer / User invokes <a href="#method_cancelDataTransfer"><code>cancelDataTransfer()</code> method</a>: <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>CANCEL</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>If data transfer has timeout errors: <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li>
 *   <li>Checks for Peer connection and Datachannel connection during data transfer: <ol>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>
 *   method</a> and connected: <ol>
 *   <li>If MCU Datachannel has closed abruptly during data transfer: <ol>
 *   <small>This can be checked with <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code>, <code>peerId</code> value as
 *   <code>"MCU"</code> and <code>channelType</code> as <code>DATA</code> for targeted Peers that supports simultaneous
 *   data transfer or <code>MESSAGING</code> for targeted Peers that do not support it.</small> <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>If MCU Peer connection has changed from not being stable: <ol>
 *   <small>This can be checked with <a href="#event_peerConnectionState"><code>peerConnection</code> event</a>
 *   triggering parameter payload <code>state</code> as not <code>STABLE</code>, <code>peerId</code> value as
 *   <code>"MCU"</code>.</small> <ol><li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li>
 *   <li>If Peer connection has changed from not being stable: <ol>
 *   <small>This can be checked with <a href="#event_peerConnectionState"><code>peerConnection</code> event</a>
 *   triggering parameter payload <code>state</code> as not <code>STABLE</code>.</small> <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If Datachannel has closed abruptly during data transfer:
 *   <small>This can be checked with <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code> and <code>channelType</code>
 *   as <code>DATA</code> for Peer that supports simultaneous data transfer or <code>MESSAGING</code>
 *   for Peer that do not support it.</small> <ol>
 *   <li><a href="#event_dataTransferState"><code>dataTransferState</code> event</a> triggers parameter
 *   <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> step and return error.</li></ol></li></ol></li></ol></li>
 *   <li>If data transfer is still progressing: <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOADING</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOADING</code>.</li></ol></li>
 *   <li>If data transfer has completed <ol>
 *   <li><a href="#event_incomingData"><code>incomingData</code> event</a> triggers.</li>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>UPLOAD_COMPLETED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>DOWNLOAD_COMPLETED</code>.</li></ol></li></ol></li>
 *   <li>If parameter <code>accept</code> value is <code>false</code>: <ol>
 *   <li><em>For User only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>REJECTED</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>USER_REJECTED</code>.</li>
 *   <li><b>ABORT</b> step and return error.</li></ol></li></ol>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="uploadFile(this.files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="uploadFileGroup(this.files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="uploadFileAll(this.files[0])" data=""&gt;
 *  &lt;script&gt;
 *    var transferTimeout = 0;
 *
 *    function setTransferTimeout (timeout) {
 *      transferTimeout = timeout;
 *    }
 *
 *    // Example 1: Upload data to a Peer
 *    function uploadFile (file, peerId) {
 *      var cb = function (error, success) {
 *        if (error) return;
 *        console.info("File has been transferred to '" + peerId + "' successfully");
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, peerId, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, peerId, cb);
 *      }
 *    }
 *
 *    // Example 2: Upload data to a list of Peers
 *    function uploadFileGroup (file, peerIds) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed file transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("File has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, peerIds, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, peerIds, cb);
 *      }
 *    }
 *
 *    // Example 2: Upload data to a list of Peers
 *    function uploadFileAll (file) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed file transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("File has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      if (transferTimeout > 0) {
 *        skylinkDemo.sendBlobData(file, transferTimeout, cb);
 *      } else {
 *        skylinkDemo.sendBlobData(file, cb);
 *      }
 *    }
 * &lt;/script&gt;
 * &lt;/body&gt;
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.sendBlobData = function(data, timeout, targetPeerId, sendChunksAsBinary, callback) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var transferInfo = {
    name: null,
    size: null,
    chunkSize: self._CHUNK_FILE_SIZE,
    chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
    dataType: self.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: null,
    direction: self.DATA_TRANSFER_TYPE.UPLOAD,
    timeout: 60,
    isPrivate: false,
    percentage: 0
  };

  // Function that returns the error emitted before data transfer has started
  var emitErrorBeforeDataTransferFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var transferErrors = {};

      if (listOfPeers.length === 0) {
        transferErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          transferErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        transferId: null,
        transferInfo: transferInfo,
        listOfPeers: listOfPeers,
        transferErrors: transferErrors
      }, null);
    }
  };

  // Remove MCU Peer as list of Peers
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  // sendBlobData(.., timeout)
  if (typeof timeout === 'number') {
    transferInfo.timeout = timeout;
  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
  } else if (timeout && typeof timeout === 'string') {
    listOfPeers = [timeout];
  } else if (timeout && typeof timeout === 'boolean') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    transferInfo.chunkSize = self._BINARY_FILE_SIZE;
  } else if (typeof timeout === 'function') {
    callback = timeout;
  }

  // sendBlobData(.., .., targetPeerId)
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (targetPeerId && typeof targetPeerId === 'boolean') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    transferInfo.chunkSize = self._BINARY_FILE_SIZE;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  // sendBlobData(.., .., .., sendChunksAsBinary)
  if (sendChunksAsBinary && typeof sendChunksAsBinary === 'boolean') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER;
    transferInfo.chunkSize = self._BINARY_FILE_SIZE;
  } else if (typeof sendChunksAsBinary === 'function') {
    callback = sendChunksAsBinary;
  }

  if (window.webrtcDetectedBrowser === 'firefox' &&
    transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.chunkSize = self._MOZ_CHUNK_FILE_SIZE;
  }

  if (self._hasMCU && transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
    log.warn('Binary data chunks transfer is not yet supported with MCU environment. ' +
      'Fallbacking to binary string data chunks transfer.');
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;
    transferInfo.chunkSize = self._CHUNK_FILE_SIZE;
  }

  // Use BLOB for Firefox
  if (transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER &&
    window.webrtcDetectedBrowser === 'firefox') {
    transferInfo.chunkType = self.DATA_TRANSFER_DATA_TYPE.BLOB;
    transferInfo.chunkSize = self._MOZ_BINARY_FILE_SIZE;
  }

  // Start checking if data transfer can start
  if (!(data && typeof data === 'object' && data instanceof Blob)) {
    emitErrorBeforeDataTransferFn('Provided data is not a Blob data');
    return;
  }

  transferInfo.name = data.name || null;
  transferInfo.mimeType = data.type || null;

  if (data.size < 1) {
    emitErrorBeforeDataTransferFn('Provided data is not a valid Blob data.');
    return;
  }

  transferInfo.size = data.size;

  if (!self._user) {
    emitErrorBeforeDataTransferFn('Unable to send any blob data. User is not in Room.');
    return;
  }

  if (listOfPeers.length === 0) {
    emitErrorBeforeDataTransferFn('Unable to send any blob data. There are no Peers to start data transfer with');
    return;
  }

  if (!self._enableDataChannel) {
    emitErrorBeforeDataTransferFn('Unable to send any blob data. Datachannel is disabled');
    return;
  }

  var chunks = self._chunkBlobData(data, transferInfo.chunkSize);

  transferInfo.originalSize = transferInfo.size;

  if (transferInfo.chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.size = 4 * Math.ceil(transferInfo.size / 3);
    transferInfo.chunkSize = 4 * Math.ceil(transferInfo.chunkSize / 3);
  }

  self._startDataTransfer(chunks, transferInfo, listOfPeers, callback);
};

/**
 * <blockquote class="info">
 *   Currently, the Android, iOS and C++ SDKs do not support this type of data transfer session.
 * </blockquote>
 * Function that starts an uploading string data transfer from User to Peers.
 * @method sendURLData
 * @param {String} data The data string to transfer to Peer.
 * @param {Number} [timeout=60] The timeout to wait for response from Peer.
 * @param {String|Array} [targetPeerId] The target Peer ID to start data transfer with.
 * - When provided as an Array, it will start uploading data transfers with all connections
 *   with all the Peer IDs provided.
 * - When not provided, it will start uploading data transfers with all the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_dataTransferState">
 *   <code>dataTransferState</code> event</a> triggering <code>state</code> parameter payload
 *   as <code>UPLOAD_COMPLETED</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {String} callback.error.transferId The data transfer ID.
 *   <small>Defined as <code>null</code> when <code>sendURLData()</code> fails to start data transfer.</small>
 * @param {Array} callback.error.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.error.transferErrors The list of data transfer errors.
 * @param {Error|String} callback.error.transferErrors.#peerId The data transfer error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to start data transfer with.</small>
 * @param {JSON} callback.error.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> except without the
 *   <code>percentage</code> property and <code>data</code>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.transferId The data transfer ID.
 * @param {Array} callback.success.listOfPeers The list Peer IDs targeted for the data transfer.
 * @param {JSON} callback.success.transferInfo The data transfer information.
 *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
 *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a> except without the
 *   <code>percentage</code> property and <code>data</code>.</small>
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a>.</small>
 * @example
 * &lt;body&gt;
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(0)"&gt; 1s timeout (Default)
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(120)"&gt; 2s timeout
 *  &lt;input type="radio" name="timeout" onchange="setTransferTimeout(300)"&gt; 5s timeout
 *  &lt;hr&gt;
 *  &lt;input type="file" onchange="showImage(this.files[0], this.getAttribute('data'))" data="peerId"&gt;
 *  &lt;input type="file" onchange="showImageGroup(this.files[0], this.getAttribute('data').split(',')))" data="peerIdA,peerIdB"&gt;
 *  &lt;input type="file" onchange="showImageAll(this.files[0])" data=""&gt;
 *  &lt;image id="target-1" src=""&gt;
 *  &lt;image id="target-2" src=""&gt;
 *  &lt;image id="target-3" src=""&gt;
 *  &lt;script&gt;
 *    var transferTimeout = 0;
 *
 *    function setTransferTimeout (timeout) {
 *      transferTimeout = timeout;
 *    }
 *
 *    function retrieveImageDataURL(file, cb) {
 *      var fr = new FileReader();
 *      fr.onload = function () {
 *        cb(fr.result);
 *      };
 *      fr.readAsDataURL(files[0]);
 *    }
 *
 *    // Example 1: Send image data URL to a Peer
 *    function showImage (file, peerId) {
 *      var cb = function (error, success) {
 *        if (error) return;
 *        console.info("Image has been transferred to '" + peerId + "' successfully");
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, peerId, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, peerId, cb);
 *        }
 *        document.getElementById("target-1").src = str;
 *      });
 *    }
 *
 *    // Example 2: Send image data URL to a list of Peers
 *    function showImageGroup (file, peerIds) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed image transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("Image has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, peerIds, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, peerIds, cb);
 *        }
 *        document.getElementById("target-2").src = str;
 *      });
 *    }
 *
 *    // Example 2: Send image data URL to a list of Peers
 *    function uploadFileAll (file) {
 *      var cb = function (error, success) {
 *        var listOfPeers = error ? error.listOfPeers : success.listOfPeers;
 *        var listOfPeersErrors = error ? error.transferErrors : {};
 *        for (var i = 0; i < listOfPeers.length; i++) {
 *          if (listOfPeersErrors[listOfPeers[i]]) {
 *            console.error("Failed image transfer to '" + listOfPeers[i] + "'");
 *          } else {
 *            console.info("Image has been transferred to '" + listOfPeers[i] + "' successfully");
 *          }
 *        }
 *      };
 *      retrieveImageDataURL(file, function (str) {
 *        if (transferTimeout > 0) {
 *          skylinkDemo.sendURLData(str, transferTimeout, cb);
 *        } else {
 *          skylinkDemo.sendURLData(str, cb);
 *        }
 *        document.getElementById("target-3").src = str;
 *      });
 *    }
 * &lt;/script&gt;
 * &lt;/body&gt;
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.sendURLData = function(data, timeout, targetPeerId, callback) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var transferInfo = {
    name: null,
    size: null,
    chunkSize: self._CHUNK_FILE_SIZE,
    chunkType: self.DATA_TRANSFER_DATA_TYPE.STRING,
    dataType: self.DATA_TRANSFER_SESSION_TYPE.DATA_URL,
    mimeType: null,
    direction: self.DATA_TRANSFER_TYPE.UPLOAD,
    timeout: 60,
    isPrivate: false,
    percentage: 0
  };

  // Function that returns the error emitted before data transfer has started
  var emitErrorBeforeDataTransferFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var transferErrors = {};

      if (listOfPeers.length === 0) {
        transferErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          transferErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        transferId: null,
        transferInfo: transferInfo,
        listOfPeers: listOfPeers,
        transferErrors: transferErrors
      }, null);
    }
  };

  // Remove MCU Peer as list of Peers
  if (listOfPeers.indexOf('MCU') > -1) {
    listOfPeers.splice(listOfPeers.indexOf('MCU'), 1);
  }

  // sendURLData(.., timeout)
  if (typeof timeout === 'number') {
    transferInfo.timeout = timeout;
  } else if (Array.isArray(timeout)) {
    listOfPeers = timeout;
  } else if (timeout && typeof timeout === 'string') {
    listOfPeers = [timeout];
  } else if (typeof timeout === 'function') {
    callback = timeout;
  }

  // sendURLData(.., .., targetPeerId)
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  // Start checking if data transfer can start
  if (!(data && typeof data === 'string')) {
    emitErrorBeforeDataTransferFn('Provided data is not a dataURL');
    return;
  }

  transferInfo.size = data.length || data.size;

  if (!self._user) {
    emitErrorBeforeDataTransferFn('Unable to send any dataURL. User is not in Room.');
    return;
  }

  if (listOfPeers.length === 0) {
    emitErrorBeforeDataTransferFn('Unable to send any dataURL. There are no Peers to start data transfer with');
    return;
  }

  if (!self._enableDataChannel) {
    emitErrorBeforeDataTransferFn('Unable to send any dataURL. Datachannel is disabled');
    return;
  }

  var chunks = self._chunkDataURL(data, transferInfo.chunkSize);

  transferInfo.originalSize = transferInfo.size;

  self._startDataTransfer(chunks, transferInfo, listOfPeers, callback);
};

/**
 * Function that accepts or rejects an upload data transfer request from Peer to User.
 * @method acceptDataTransfer
 * @param {String} peerId The Peer ID.
 * @param {String} transferId The data transfer ID.
 * @param {Boolean} [accept=false] The flag if User accepts the upload data transfer request from Peer.
 * @example
 *   // Example 1: Accept Peer upload data transfer request
 *   skylinkDemo.on("incomingDataRequest", function (transferId, peerId, transferInfo, isSelf) {
 *      if (!isSelf) {
 *        skylinkDemo.acceptDataTransfer(peerId, transferId, true);
 *      }
 *   });
 *
 *   // Example 2: Reject Peer upload data transfer request
 *   skylinkDemo.on("incomingDataRequest", function (transferId, peerId, transferInfo, isSelf) {
 *      if (!isSelf) {
 *        skylinkDemo.acceptDataTransfer(peerId, transferId, false);
 *      }
 *   });
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a> after <code>acceptDataTransfer()</code> method is invoked.</small>
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.respondBlobRequest =
Skylink.prototype.acceptDataTransfer = function (peerId, transferId, accept) {
  var self = this;

  if (typeof transferId !== 'string' && typeof peerId !== 'string') {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'data transfer ID or peer ID is not provided']);
    return;
  }

  if (!self._dataChannels[peerId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'Peer does not have any Datachannel connections']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting accept data transfer as ' +
      'invalid transfer ID is provided']);
    return;
  }

  // Check Datachannel property in _dataChannels[peerId] list
  var channelProp = 'main';

  if (self._dataChannels[peerId][transferId]) {
    channelProp = transferId;
  }

  if (accept) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Accepted data transfer and starting ...']);

    var dataChannelStateCbFn = function (state, evtPeerId, error, cN, cT) {
      console.info(evtPeerId, error, cN, cT);
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
        self._getTransferInfo(transferId, peerId, true, false, false), {
        transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
        message: new Error('Data transfer terminated as Peer Datachannel connection closed abruptly.')
      });
    };

    self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        self.off('dataChannelState', dataChannelStateCbFn);
        return;
      }
      return evtPeerId === peerId && (channelProp === 'main' ? channelType === self.DATA_CHANNEL_STATE.MESSAGING :
        channelName === transferId) && [self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED,
        self.DATA_CHANNEL_STATE.ERROR].indexOf(state) > -1;
    });

    // From here we start detecting as completion for data transfer downloads
    self.once('dataTransferState', function () {
      if (dataChannelStateCbFn) {
        self.off('dataChannelState', dataChannelStateCbFn);
      }

      delete self._dataTransfers[transferId];

      if (self._dataChannels[peerId]) {
        if (channelProp === 'main' && self._dataChannels[peerId].main) {
          self._dataChannels[peerId].main.transferId = null;
        }

        if (channelProp === transferId) {
          self._closeDataChannel(peerId, transferId);
        }
      }
    }, function (state, evtTransferId, evtPeerId) {
      return evtTransferId === transferId && evtPeerId === peerId &&
        [self.DATA_TRANSFER_STATE.ERROR, self.DATA_TRANSFER_STATE.CANCEL,
        self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED].indexOf(state) > -1;
    });

    // Send ACK protocol to start data transfer
    // MCU sends the data transfer from the "P2P" Datachannel
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: 0
    }, channelProp);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);

  } else {
    log.warn([peerId, 'RTCDataChannel', transferId, 'Rejected data transfer and data transfer request has been aborted']);

    // Send ACK protocol to terminate data transfer request
    // MCU sends the data transfer from the "P2P" Datachannel
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: -1
    }, channelProp);

    // Insanity check
    if (channelProp === 'main' && self._dataChannels[peerId].main) {
      self._dataChannels[peerId].main.transferId = null;
    }

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_REJECTED, transferId, peerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as User has rejected data transfer request.'),
      transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD
    });

    delete self._dataTransfers[transferId];
  }
};

/**
 * <blockquote class="info">
 *   For MCU enabled Peer connections, the cancel data transfer functionality may differ, as it
 *   will result in all Peers related to the data transfer ID to be terminated.
 * </blockquote>
 * Function that terminates a currently uploading / downloading data transfer from / to Peer.
 * @method cancelDataTransfer
 * @param {String} peerId The Peer ID.
 * @param {String} transferId The data transfer ID.
 * @example
 *   // Example 1: Cancel Peer data transfer
 *   var transferSessions = {};
 *
 *   skylinkDemo.on("dataTransferState", function (state, transferId, peerId) {
 *     if ([skylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_STARTED,
 *       skylinkDemo.DATA_TRANSFER_STATE.UPLOAD_STARTED].indexOf(state) > -1) {
 *       if (!Array.isArray(transferSessions[transferId])) {
 *         transferSessions[transferId] = [];
 *       }
 *       transferSessions[transferId].push(peerId);
 *     } else {
 *       transferSessions[transferId].splice(transferSessions[transferId].indexOf(peerId), 1);
 *     }
 *   });
 *
 *   function cancelTransfer (peerId, transferId) {
 *     skylinkDemo.cancelDataTransfer(peerId, transferId);
 *   }
 * @trigger <small>Event sequence follows <a href="#method_sendBlobData">
 * <code>sendBlobData()</code> method</a> after <code>cancelDataTransfer()</code> method is invoked.</small>
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.cancelBlobTransfer =
Skylink.prototype.cancelDataTransfer = function (peerId, transferId) {
  var self = this;

  if (!(transferId && typeof transferId === 'string')) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as data transfer ID is not provided']);
    return;
  }

  if (!(peerId && typeof peerId === 'string')) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as peer ID is not provided']);
    return;
  }

  if (!self._dataTransfers[transferId]) {
    log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
      'data transfer session does not exists.']);
    return;
  }

  log.debug([peerId, 'RTCDataChannel', transferId, 'Canceling data transfer ...']);

  /**
   * Emit data state event function.
   */
  var emitEventFn = function (peers, transferInfoPeerId) {
    for (var i = 0; i < peers.length; i++) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, peers[i],
        self._getTransferInfo(transferId, transferInfoPeerId, false, false, false), {
        transferType: self._dataTransfers[transferId].direction,
        message: new Error('User cancelled download transfer')
      });
    }
  };

  // For uploading from Peer to MCU case of broadcast
  if (self._hasMCU && self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD) {
    if (!self._dataChannels.MCU) {
      log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
        'Peer does not have any Datachannel connections']);
      return;
    }

    // We abort all data transfers to all Peers if uploading via MCU since it broadcasts to MCU
    log.warn([peerId, 'RTCDataChannel', transferId, 'Aborting all data transfers to Peers']);

    // If data transfer to MCU broadcast has interop Peers, send to MCU via the "main" Datachannel
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.CANCEL,
        sender: self._user.sid,
        content: 'Peer cancelled download transfer',
        name: self._dataTransfers[transferId].name,
        ackN: 0
      }, 'main');
    }

    // If data transfer to MCU broadcast has non-interop Peers, send to MCU via the new Datachanel
    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._sendMessageToDataChannel('MCU', {
        type: self._DC_PROTOCOL_TYPE.CANCEL,
        sender: self._user.sid,
        content: 'Peer cancelled download transfer',
        name: self._dataTransfers[transferId].name,
        ackN: 0
      }, transferId);
    }

    emitEventFn(Object.keys(self._dataTransfers[transferId].peers.main).concat(
      Object.keys(self._dataTransfers[transferId].peers[transferId])));
  } else {
    var channelProp = 'main';

    if (!self._dataChannels[peerId]) {
      log.error([peerId, 'RTCDataChannel', transferId, 'Aborting cancel data transfer as ' +
        'Peer does not have any Datachannel connections']);
      return;
    }

    if (self._dataChannels[peerId][transferId]) {
      channelProp = transferId;
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.CANCEL,
      sender: self._user.sid,
      content: 'Peer cancelled download transfer',
      name: self._dataTransfers[transferId].name,
      ackN: 0
    }, channelProp);

    emitEventFn([peerId], peerId);
  }
};

/**
 * Function that sends a message to Peers via the Datachannel connection.
 * <small>Consider using <a href="#method_sendURLData"><code>sendURLData()</code> method</a> if you are
 * sending large strings to Peers.</small>
 * @method sendP2PMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers with Datachannel connection in the Room.
 * @trigger <ol class="desc-seq">
 *  <li>Sends P2P message to all targeted Peers. <ol>
 *  <li>If Peer connection Datachannel has not been opened: <small>This can be checked with
 *  <a href="#event_dataChannelState"><code>dataChannelState</code> event</a>
 *  triggering parameter payload <code>state</code> as <code>OPEN</code> and
 *  <code>channelType</code> as <code>MESSAGING</code> for Peer.</small> <ol>
 *  <li><a href="#event_dataChannelState"><code>dataChannelState</code> event</a> triggers
 *  parameter payload <code>state</code> as <code>SEND_MESSAGE_ERROR</code>.</li>
 *  <li><b>ABORT</b> step and return error.</li></ol></li>
 *  <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers
 *  parameter payload <code>message.isDataChannel</code> value as <code>true</code> and
 *  <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        skylinkDemo.sendP2PMessage("Hi all!");
 *      }
 *   });
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty[peerId] = false;
 *     }
 *   });
 *
 *   skylinkDemo.on("dataChannelState", function (state, peerId, error, channelName, channelType) {
 *      if (state === skylinkDemo.DATA_CHANNEL_STATE.OPEN &&
 *        channelType === skylinkDemo.DATA_CHANNEL_TYPE.MESSAGING) {
 *        peersInExclusiveParty[peerId] = true;
 *      }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     var readyToSend = [];
 *     for (var p in peersInExclusiveParty) {
 *       if (peersInExclusiveParty.hasOwnProperty(p)) {
 *         readyToSend.push(p);
 *       }
 *     }
 *     skylinkDemo.sendP2PMessage(message, readyToSend);
 *   }
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.sendP2PMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._dataChannels);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !this._user) {
    log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  if (!this._enableDataChannel) {
    log.error('Unable to send message as User does not have Datachannel enabled. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._dataChannels[peerId]) {
      log.error([peerId, 'RTCDataChannel', null, 'Dropping of sending message to Peer as ' +
        'Datachannel connection does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (!this._hasMCU) {
      log.debug([peerId, 'RTCDataChannel', null, 'Sending ' + (isPrivate ? 'private' : '') +
        ' P2P message to Peer']);

      this._sendMessageToDataChannel(peerId, {
        type: this._DC_PROTOCOL_TYPE.MESSAGE,
        isPrivate: isPrivate,
        sender: this._user.sid,
        target: peerId,
        data: message
      }, 'main');
    }
  }

  if (listOfPeers.length === 0) {
    log.warn('Currently there are no Peers to send P2P message to (unless the message is queued ' +
      'and there are Peer connected by then).');
  }

  if (this._hasMCU) {
    log.debug(['MCU', 'RTCDataChannel', null, 'Broadcasting ' + (isPrivate ? 'private' : '') +
      ' P2P message to Peers']);

    this._sendMessageToDataChannel('MCU', {
      type: this._DC_PROTOCOL_TYPE.MESSAGE,
      isPrivate: isPrivate,
      sender: this._user.sid,
      target: listOfPeers,
      data: message
    }, 'main');
  }

  this._trigger('incomingMessage', {
    content: message,
    isPrivate: isPrivate,
    targetPeerId: targetPeerId || null,
    listOfPeers: listOfPeers,
    isDataChannel: true,
    senderPeerId: this._user.sid
  }, this._user.sid, this.getPeerInfo(), true);
};

/**
 * Function that starts the data transfer to Peers.
 * @method _startDataTransfer
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._startDataTransfer = function(chunks, transferInfo, listOfPeers, callback) {
  var self = this;
  var transferId = self._user.sid + '_' + (new Date()).getTime();
  var transferErrors = {};
  var transferCompleted = [];

  // Polyfill data name to prevent empty fields in WRQ
  // TODO: What happens if transfer requires extension?
  if (!transferInfo.name) {
    transferInfo.name = transferId;
  }

  self._dataTransfers[transferId] = clone(transferInfo);
  self._dataTransfers[transferId].peers = {};
  self._dataTransfers[transferId].peers.main = {};
  self._dataTransfers[transferId].peers[transferId] = {};
  self._dataTransfers[transferId].sessions = {};
  self._dataTransfers[transferId].chunks = chunks;
  self._dataTransfers[transferId].enforceBSPeers = [];
  self._dataTransfers[transferId].enforcedBSInfo = {};

  // Check if fallback chunks is required
  if ([self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER, self.DATA_TRANSFER_DATA_TYPE.BLOB].indexOf(
    transferInfo.chunkType) > -1) {
    for (var p = 0; p < listOfPeers.length; p++) {
      var agentName = (((self._peerInformations[listOfPeers[p]]) || {}).agent || {}).name || '';

      // C++ SDK does not support binary file transfer for now
      if (self._SUPPORTED_WEB_AGENTS.indexOf(agentName) === -1) {
        self._dataTransfers[transferId].enforceBSPeers.push(listOfPeers[p]);
      }
    }

    if (self._dataTransfers[transferId].enforceBSPeers.length > 0) {
      var bsChunkSize = window.webrtcDetectedBrowser === 'firefox' ? self._MOZ_CHUNK_FILE_SIZE : self._CHUNK_FILE_SIZE;
      var bsChunks = self._chunkBlobData(new Blob(chunks), bsChunkSize);

      self._dataTransfers[transferId].enforceBSInfo = {
        chunkSize: 4 * Math.ceil(bsChunkSize / 3),
        chunkType: self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
        size: 4 * Math.ceil(transferInfo.originalSize / 3),
        chunks: bsChunks
      };
    }
  }

  /**
   * Complete Peer function.
   */
  var completeFn = function (peerId, error) {
    // Ignore if already added.
    if (transferCompleted.indexOf(peerId) > -1) {
      return;
    }

    log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer result. Is errors present? ->'], error);

    transferCompleted.push(peerId);

    if (error) {
      transferErrors[peerId] = new Error(error);
    }

    if (listOfPeers.length === transferCompleted.length) {
      log.log([null, 'RTCDataChannel', transferId, 'Data transfer request completed']);

      if (typeof callback === 'function') {
        if (Object.keys(transferErrors).length > 0) {
          callback({
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            transferErrors: transferErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            transferId: transferId,
            transferInfo: self._getTransferInfo(transferId, peerId, false, true, false),
            listOfPeers: listOfPeers
          });
        }
      }
    }
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    var MCUInteropStatus = self._startDataTransferToPeer(transferId, listOfPeers[i], completeFn, null, null);

    if (typeof MCUInteropStatus === 'boolean') {
      if (MCUInteropStatus === true) {
        self._dataTransfers[transferId].peers.main[listOfPeers[i]] = true;
      } else {
        self._dataTransfers[transferId].peers[transferId][listOfPeers[i]] = true;
      }
    }
  }

  if (self._hasMCU) {
    if (Object.keys(self._dataTransfers[transferId].peers.main).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, 'main',
        Object.keys(self._dataTransfers[transferId].peers.main));
    }

    if (Object.keys(self._dataTransfers[transferId].peers[transferId]).length > 0) {
      self._startDataTransferToPeer(transferId, 'MCU', completeFn, transferId,
        Object.keys(self._dataTransfers[transferId].peers[transferId]));
    }
  }
};

/**
 * Function that starts or listens the data transfer status to Peer.
 * This reacts differently during MCU environment.
 * @method _startDataTransferToPeer
 * @return {Boolean} Returns a Boolean only during MCU environment which flag indicates if Peer requires interop
 *   (Use messaging Datachannel connection instead).
 * @private
 * @since 0.6.16
 */
Skylink.prototype._startDataTransferToPeer = function (transferId, peerId, callback, channelProp, targetPeers) {
  var self = this;

  var peerConnectionStateCbFn = null;
  var dataChannelStateCbFn = null;

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    var peers = targetPeers || [peerId];
    for (var i = 0; i < peers.length; i++) {
      cb(peers[i]);
    }
  };

  /**
   * Return error and trigger them if failed before or during data transfers function.
   */
  var returnErrorBeforeTransferFn = function (error) {
    // Replace if it is a MCU Peer errors for clear indication in error message
    var updatedError = peerId === 'MCU' ? error.replace(/Peer/g, 'MCU Peer') : error;

    emitEventFn(function (evtPeerId) {
      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, true, true, false), {
        message: new Error(updatedError),
        transferType: self.DATA_TRANSFER_TYPE.UPLOAD
      });
    });
  };

  /**
   * Send WRQ protocol to start data transfers.
   */
  var sendWRQFn = function () {
    var size = self._dataTransfers[transferId].size;
    var chunkSize = self._dataTransfers[transferId].chunkSize;
    var chunkType = self._dataTransfers[transferId].chunkType;

    if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1) {
      log.warn([peerId, 'RTCDataChannel', transferId,
        'Binary data chunks transfer is not yet supported with Peer connecting from ' +
        'Android, iOS and C++ SDK. Fallbacking to binary string data chunks transfer.']);

      size = self._dataTransfers[transferId].enforceBSInfo.size;
      chunkSize = self._dataTransfers[transferId].enforceBSInfo.chunkSize;
      chunkType = self._dataTransfers[transferId].enforceBSInfo.chunkType;
    }

    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.WRQ,
      transferId: transferId,
      name: self._dataTransfers[transferId].name,
      size: size,
      originalSize: self._dataTransfers[transferId].originalSize,
      dataType: self._dataTransfers[transferId].dataType,
      mimeType: self._dataTransfers[transferId].mimeType,
      chunkType: chunkType,
      chunkSize: chunkSize,
      timeout: self._dataTransfers[transferId].timeout,
      isPrivate: self._dataTransfers[transferId].isPrivate,
      sender: self._user.sid,
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion,
      target: targetPeers ? targetPeers : peerId
    }, channelProp);

    emitEventFn(function (evtPeerId) {
      self._trigger('incomingDataRequest', transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, false, false, false), true);

      self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.USER_UPLOAD_REQUEST, transferId, evtPeerId,
        self._getTransferInfo(transferId, peerId, true, false, false), null);
    });
  };

  // Listen to data transfer state
  if (peerId !== 'MCU') {
    var dataTransferStateCbFn = function (state, evtTransferId, evtPeerId, transferInfo, error) {
      if (peerConnectionStateCbFn) {
        self.off('peerConnectionState', peerConnectionStateCbFn);
      }

      if (dataChannelStateCbFn) {
        self.off('dataChannelState', dataChannelStateCbFn);
      }

      if (channelProp) {
        delete self._dataTransfers[transferId].peers[channelProp][peerId];
      }

      if (state === self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED) {
        callback(peerId, null);
      } else {
        callback(peerId, error.message.message || error.message.toString());
      }

      // Handle Peer uploading to MCU case
      if (self._hasMCU && self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD) {
        if (!(Object.keys(self._dataTransfers[transferId].peers.main).length === 0 &&
          Object.keys(self._dataTransfers[transferId].peers[transferId]).length === 0)) {
          return;
        }

        delete self._dataTransfers[transferId];

      } else {
        delete self._dataTransfers[transferId].sessions[peerId];

        if (Object.keys(self._dataTransfers[transferId].sessions).length === 0) {
          delete self._dataTransfers[transferId];
        }
      }
    };

    self.once('dataTransferState', dataTransferStateCbFn, function (state, evtTransferId, evtPeerId) {
      if (!(self._dataTransfers[transferId] && (self._hasMCU ? (self._dataTransfers[transferId].peers.main[peerId] ||
        self._dataTransfers[transferId].peers[transferId][peerId]) : self._dataTransfers[transferId].sessions[peerId]))) {
        if (dataTransferStateCbFn) {
          self.off('dataTransferState', dataTransferStateCbFn);
        }
        if (peerConnectionStateCbFn) {
          self.off('peerConnectionState', peerConnectionStateCbFn);
        }
        if (dataChannelStateCbFn) {
          self.off('dataChannelState', dataChannelStateCbFn);
        }
        return;
      }
      return evtTransferId === transferId && evtPeerId === peerId &&
        [self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, self.DATA_TRANSFER_STATE.ERROR,
        self.DATA_TRANSFER_STATE.CANCEL, self.DATA_TRANSFER_STATE.REJECTED].indexOf(state) > -1;
    });
  }

  // When Peer connection does not exists
  if (!self._peerConnections[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer session does not exists
  if (!self._peerInformations[peerId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection does not exists.');
    return;
  }

  // When Peer connection is not STABLE
  if (self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer connection is not stable.');
    return;
  }

  if (!self._dataTransfers[transferId]) {
    returnErrorBeforeTransferFn('Unable to start data transfer as data transfer session is not in order.');
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId].main)) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection does not exists.');
    return;
  }

  if (self._dataChannels[peerId].main.channel.readyState !== self.DATA_CHANNEL_STATE.OPEN) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel connection is not opened.');
    return;
  }

  var agentName = (self._peerInformations[peerId].agent || {}).name || '';
  var requireInterop = self._SUPPORTED_WEB_AGENTS.indexOf(agentName) === -1 && agentName !== 'cpp';

  // Prevent DATA_URL (or "string" dataType transfers) with Android / iOS / C++ SDKs
  if ((requireInterop || agentName === 'cpp') && self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL) {
    returnErrorBeforeTransferFn('Unable to start data transfer as Peer do not support DATA_URL type of data transfers');
    return;
  }

  // Listen to Peer connection state for MCU Peer
  if (peerId !== 'MCU' && self._hasMCU) {
    channelProp = requireInterop ? 'main' : transferId;

    peerConnectionStateCbFn = function () {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer connection is not stable.');
    };

    self.once('peerConnectionState', peerConnectionStateCbFn, function (state, evtPeerId) {
      if (!self._dataTransfers[transferId]) {
        self.off('peerConnectionState', peerConnectionStateCbFn);
        return;
      }
      return state !== self.PEER_CONNECTION_STATE.STABLE && evtPeerId === peerId;
    });
    return requireInterop;
  }

  if (requireInterop || channelProp === 'main') {
    // When MCU Datachannel connection has a transfer in-progress
    if (self._dataChannels[peerId].main.transferId) {
      returnErrorBeforeTransferFn('Unable to start data transfer as Peer Datachannel has a data transfer in-progress.');
      return;
    }
  }

  self._dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0
  };

  dataChannelStateCbFn = function (state, evtPeerId, error) {
    // Prevent from triggering in instances where the ackN === chunks.length
    if (self._dataTransfers[transferId].sessions[peerId].ackN >= (self._dataTransfers[transferId].chunks.length - 1)) {
      return;
    }

    if (error) {
      returnErrorBeforeTransferFn(error.message || error.toString());
    } else {
      returnErrorBeforeTransferFn('Data transfer terminated as Peer Datachannel connection closed abruptly.');
    }
  };

  self.once('dataChannelState', dataChannelStateCbFn, function (state, evtPeerId, error, channelName, channelType) {
    if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
      self.off('dataChannelState', dataChannelStateCbFn);
      return;
    }

    if (evtPeerId === peerId && (channelType === self.DATA_CHANNEL_TYPE.DATA ? channelName === transferId : true)) {
      if (state === self.DATA_CHANNEL_STATE.OPEN && channelType === self.DATA_CHANNEL_TYPE.DATA &&
        channelName === transferId) {
        sendWRQFn();
        return false;
      }
      return [self.DATA_CHANNEL_STATE.CREATE_ERROR, self.DATA_CHANNEL_STATE.ERROR,
        self.DATA_CHANNEL_STATE.CLOSING, self.DATA_CHANNEL_STATE.CLOSED].indexOf(state) > -1;
    }
  });

  // Create new Datachannel for Peer to start data transfer
  if (!((requireInterop && peerId !== 'MCU') || channelProp === 'main')) {
    channelProp = transferId;

    self._createDataChannel(peerId, transferId);

  } else {
    self._dataChannels[peerId].main.transferId = transferId;

    sendWRQFn();
  }
};

/**
 * Function that returns the data transfer session.
 * @method _getTransferInfo
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferInfo = function (transferId, peerId, returnDataProp, hidePercentage, returnDataAtStart) {
  if (!this._dataTransfers[transferId]) {
    return {};
  }

  var transferInfo = {
    name: this._dataTransfers[transferId].name,
    size: this._dataTransfers[transferId].size,
    dataType: this._dataTransfers[transferId].dataType || this.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: this._dataTransfers[transferId].mimeType || null,
    chunkSize: this._dataTransfers[transferId].chunkSize,
    chunkType: this._dataTransfers[transferId].chunkType,
    timeout: this._dataTransfers[transferId].timeout,
    isPrivate: this._dataTransfers[transferId].isPrivate,
    direction: this._dataTransfers[transferId].direction
  };

  if (this._dataTransfers[transferId].originalSize) {
    transferInfo.size = this._dataTransfers[transferId].originalSize;

  } else if (this._dataTransfers[transferId].chunkType === this.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
    transferInfo.size = Math.ceil(transferInfo.size * 3 / 4);
  }

  if (!hidePercentage) {
    transferInfo.percentage = 0;

    if (!this._dataTransfers[transferId].sessions[peerId]) {
      if (returnDataProp) {
        transferInfo.data = null;
      }
      return transferInfo;
    }

    if (this._dataTransfers[transferId].direction === this.DATA_TRANSFER_TYPE.DOWNLOAD) {
      if (this._dataTransfers[transferId].sessions[peerId].receivedSize === this._dataTransfers[transferId].sessions[peerId].size) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].receivedSize /
          this._dataTransfers[transferId].size) * 100).toFixed(2), 10);
      }
    } else {
      var chunksLength = (this._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1 ?
        this._dataTransfers[transferId].enforceBSInfo.chunks.length : this._dataTransfers[transferId].chunks.length);

      if (this._dataTransfers[transferId].sessions[peerId].ackN === chunksLength) {
        transferInfo.percentage = 100;

      } else {
        transferInfo.percentage = parseFloat(((this._dataTransfers[transferId].sessions[peerId].ackN /
          chunksLength) * 100).toFixed(2), 10);
      }
    }

    if (returnDataProp) {
      if (typeof returnDataAtStart !== 'number') {
        if (transferInfo.percentage === 100) {
          transferInfo.data = this._getTransferData(transferId);
        } else {
          transferInfo.data = null;
        }
      } else {
        transferInfo.percentage = returnDataAtStart;

        if (returnDataAtStart === 0) {
          transferInfo.data = this._getTransferData(transferId);
        }
      }
    }
  }

  return transferInfo;
};

/**
 * Function that returns the compiled data transfer data.
 * @method _getTransferData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getTransferData = function (transferId) {
  if (!this._dataTransfers[transferId]) {
    return null;
  }

  if (this._dataTransfers[transferId].dataType === this.DATA_TRANSFER_SESSION_TYPE.BLOB) {
    var mimeType = {
      name: this._dataTransfers[transferId].name
    };

    if (this._dataTransfers[transferId].mimeType) {
      mimeType.type = this._dataTransfers[transferId].mimeType;
    }

    return new Blob(this._dataTransfers[transferId].chunks, mimeType);
  }

  return this._dataTransfers[transferId].chunks.join('');
};

/**
 * Function that handles the data transfers sessions timeouts.
 * @method _handleDataTransferTimeoutForPeer
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleDataTransferTimeoutForPeer = function (transferId, peerId, setPeerTO) {
  var self = this;

  if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer does not exists for Peer. Ignoring timeout.']);
    return;
  }

  log.debug([peerId, 'RTCDataChannel', transferId, 'Clearing data transfer timer for Peer.']);

  if (self._dataTransfers[transferId].sessions[peerId].timer) {
    clearTimeout(self._dataTransfers[transferId].sessions[peerId].timer);
  }

  self._dataTransfers[transferId].sessions[peerId].timer = null;

  if (setPeerTO) {
    log.debug([peerId, 'RTCDataChannel', transferId, 'Setting data transfer timer for Peer.']);

    self._dataTransfers[transferId].sessions[peerId].timer = setTimeout(function () {
      if (!(self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'Data transfer already ended for Peer. Ignoring expired timeout.']);
        return;
      }

      if (!self._user) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'User is not in Room. Ignoring expired timeout.']);
        return;
      }

      if (!self._dataChannels[peerId]) {
        log.debug([peerId, 'RTCDataChannel', transferId, 'Datachannel connection does not exists. Ignoring expired timeout.']);
        return;
      }

      log.error([peerId, 'RTCDataChannel', transferId, 'Data transfer response has timed out.']);

      /**
       * Emit event for Peers function.
       */
      var emitEventFn = function (cb) {
        if (peerId === 'MCU') {
          var broadcastedPeers = [self._dataTransfers[transferId].peers.main,
            self._dataTransfers[transferId].peers[transferId]];

          for (var i = 0; i < broadcastedPeers.length; i++) {
            // Should not happen but insanity check
            if (!broadcastedPeers[i]) {
              continue;
            }

            for (var bcPeerId in broadcastedPeers[i]) {
              if (broadcastedPeers[i].hasOwnProperty(bcPeerId) && broadcastedPeers[i][bcPeerId]) {
                cb(bcPeerId);
              }
            }
          }
        } else {
          cb(peerId);
        }
      };

      var errorMsg = 'Connection Timeout. Longer than ' + self._dataTransfers[transferId].timeout +
        ' seconds. Connection is abolished.';

      self._sendMessageToDataChannel(peerId, {
        type: self._DC_PROTOCOL_TYPE.ERROR,
        content: errorMsg,
        isUploadError: self._dataTransfers[transferId].direction === self.DATA_TRANSFER_TYPE.UPLOAD,
        sender: self._user.sid,
        name: self._dataTransfers[transferId].name
      }, self._dataChannels[peerId][transferId] ? transferId : 'main');

      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, peerId,
          self._getTransferInfo(transferId, peerId, true, false, false), {
          transferType: self.DATA_TRANSFER_TYPE.DOWNLOAD,
          message: new Error(errorMsg)
        });
      });
    }, self._dataTransfers[transferId].timeout * 1000);
  }
};

/**
 * Function that handles the data received from Datachannel and
 * routes to the relevant data transfer protocol handler.
 * @method _processDataChannelData
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._processDataChannelData = function(rawData, peerId, channelName, channelType) {
  var self = this;

  var channelProp = channelType === self.DATA_CHANNEL_TYPE.MESSAGING ? 'main' : channelName;
  var transferId = channelProp === 'main' ? self._dataChannels[peerId].main.transferId : channelName;

  if (!self._peerConnections[peerId]) {
    log.warn([peerId, 'RTCDataChannel', channelName, 'Dropping data received from Peer ' +
      'as connection is not present ->'], rawData);
    return;
  }

  if (!(self._dataChannels[peerId] && self._dataChannels[peerId][channelProp])) {
    log.warn([peerId, 'RTCDataChannel', channelName, 'Dropping data received from Peer ' +
      'as Datachannel connection is not present ->'], rawData);
    return;
  }

  // Expect as string
  if (typeof rawData === 'string') {
    try {
      var protocolData = JSON.parse(rawData);

      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received protocol message ->'], protocolData);

      // Ignore ACK, ERROR and CANCEL if there is no data transfer session in-progress
      if ([self._DC_PROTOCOL_TYPE.ACK, self._DC_PROTOCOL_TYPE.ERROR, self._DC_PROTOCOL_TYPE.CANCEL].indexOf(protocolData.type) > -1 &&
        !(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
          log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded protocol message as data transfer session ' +
            'is not present ->'], protocolData);
          return;
      }

      switch (protocolData.type) {
        case self._DC_PROTOCOL_TYPE.WRQ:
          // Discard iOS bidirectional upload when Datachannel is in-progress for data transfers
          if (transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId]) {
            log.warn([peerId, 'RTCDataChannel', channelProp, 'Rejecting bidirectional data transfer request as ' +
              'it is currently not supported in the SDK']);

            self._sendMessageToDataChannel(peerId, {
              type: self._DC_PROTOCOL_TYPE.ACK,
              ackN: -1,
              sender: self._user.sid
            }, channelProp);
            return;
          }
          self._WRQProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.ACK:
          self._ACKProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.ERROR:
          self._ERRORProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.CANCEL:
          self._CANCELProtocolHandler(peerId, protocolData, channelProp);
          break;
        case self._DC_PROTOCOL_TYPE.MESSAGE:
          self._MESSAGEProtocolHandler(peerId, protocolData, channelProp);
          break;
        default:
          log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded unknown protocol message ->'], protocolData);
      }

    } catch (error) {
      if (rawData.indexOf('{') > -1 && rawData.indexOf('}') > 0) {
        log.error([peerId, 'RTCDataChannel', channelProp, 'Received error ->'], error);

        self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerId, error, channelName, channelType, null);
        throw error;
      }

      if (!(transferId && self._dataTransfers[transferId] && self._dataTransfers[transferId].sessions[peerId])) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Discarded data chunk as data transfer session ' +
          'is not present ->'], rawData);
        return;
      }

      if (self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN]) {
        log.warn([peerId, 'RTCDataChannel', transferId, 'Dropping data chunk as it has already been added ->'], rawData);
        return;
      }

      var chunkType = self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING;

      if (self._dataTransfers[transferId].dataType === self.DATA_TRANSFER_SESSION_TYPE.DATA_URL) {
        log.debug([peerId, 'RTCDataChannel', channelProp, 'Received string data chunk @' +
          self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'], rawData.length || rawData.size);

        self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.STRING,
          rawData.length || rawData.size || 0, channelProp);

      } else {
        var removeSpaceData = rawData.replace(/\s|\r|\n/g, '');

        log.debug([peerId, 'RTCDataChannel', channelProp, 'Received binary string data chunk @' +
          self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'],
          removeSpaceData.length || removeSpaceData.size);

        self._DATAProtocolHandler(peerId, self._base64ToBlob(removeSpaceData), self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
          removeSpaceData.length || removeSpaceData.size || 0, channelProp);
      }
    }
  } else {
    if (rawData instanceof Blob) {
      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received blob data chunk @' +
        self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'], rawData.size);

      self._DATAProtocolHandler(peerId, rawData, self.DATA_TRANSFER_DATA_TYPE.BLOB, rawData.size, channelProp);

    } else {
      var byteArray = rawData;

      if (rawData.constructor && rawData.constructor.name === 'Array') {
        // Need to re-parse on some browsers
        byteArray = new Int8Array(rawData);
      }

      var blob = new Blob([byteArray]);

      log.debug([peerId, 'RTCDataChannel', channelProp, 'Received arraybuffer data chunk @' +
        self._dataTransfers[transferId].sessions[peerId].ackN + ' with size ->'], blob.size);

      self._DATAProtocolHandler(peerId, blob, self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER, blob.size, channelProp);
    }
  }
};

/**
 * Function that handles the "WRQ" data transfer protocol.
 * @method _WRQProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._WRQProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp === 'main' ? data.transferId || peerId + '_' + (new Date()).getTime() : channelProp;
  var senderPeerId = data.sender || peerId;

  self._dataTransfers[transferId] = {
    name: data.name || transferId,
    size: data.size || 0,
    chunkSize: data.chunkSize,
    originalSize: data.originalSize || 0,
    timeout: data.timeout || 60,
    isPrivate: !!data.isPrivate,
    senderPeerId: data.sender || peerId,
    dataType: data.dataType || self.DATA_TRANSFER_SESSION_TYPE.BLOB,
    mimeType: data.mimeType || null,
    chunkType: data.chunkType || self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING,
    direction: self.DATA_TRANSFER_TYPE.DOWNLOAD,
    chunks: [],
    sessions: {}
  };

  self._dataChannels[peerId][channelProp].transferId = transferId;
  self._dataTransfers[transferId].sessions[peerId] = {
    timer: null,
    ackN: 0,
    receivedSize: 0
  };

  self._trigger('incomingDataRequest', transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, false, false, false), false);

  self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_REQUEST, transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, true, false, false), null);
};

/**
 * Function that handles the "ACK" data transfer protocol.
 * @method _ACKProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ACKProtocolHandler = function(peerId, data, channelProp) {
  var self = this;

  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ACK event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  if (data.ackN > -1) {
    if (data.ackN === 0) {
      emitEventFn(function (evtPeerId) {
        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_STARTED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 0), null);
      });
    } else if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1 ?
      data.ackN === self._dataTransfers[transferId].enforceBSInfo.chunks.length :
      data.ackN === self._dataTransfers[transferId].chunks.length) {
      self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

      emitEventFn(function (evtPeerId) {
        self._trigger('incomingData', self._getTransferData(transferId), transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, false, false, false), true);

        self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, transferId, evtPeerId,
          self._getTransferInfo(transferId, peerId, true, false, 100), null);
      });

      if (self._dataChannels[peerId][channelProp]) {
        self._dataChannels[peerId][channelProp].transferId = null;

        if (channelProp !== 'main') {
          self._closeDataChannel(peerId, channelProp);
        }
      }
      return;
    }

    var uploadFn = function (chunk) {
      self._sendMessageToDataChannel(peerId, chunk, channelProp, true);

      if (data.ackN < self._dataTransfers[transferId].chunks.length) {
        emitEventFn(function (evtPeerId) {
          self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.UPLOADING, transferId, evtPeerId,
            self._getTransferInfo(transferId, peerId, true, false, false), null);
        });
      }

      self._handleDataTransferTimeoutForPeer(transferId, peerId, true);
    };

    self._dataTransfers[transferId].sessions[peerId].ackN = data.ackN;

    if (self._dataTransfers[transferId].enforceBSPeers.indexOf(peerId) > -1) {
      self._blobToBase64(self._dataTransfers[transferId].enforceBSInfo.chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      self._blobToBase64(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else if (self._dataTransfers[transferId].chunkType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      self._blobToArrayBuffer(self._dataTransfers[transferId].chunks[data.ackN], uploadFn);
    } else {
      uploadFn(self._dataTransfers[transferId].chunks[data.ackN]);
    }
  } else {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.REJECTED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error('Data transfer terminated as Peer has rejected data transfer request'),
      transferType: self.DATA_TRANSFER_TYPE.UPLOAD
    });
  }
};

/**
 * Function that handles the "MESSAGE" data transfer protocol.
 * @method _MESSAGEProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._MESSAGEProtocolHandler = function(peerId, data, channelProp) {
  var senderPeerId = data.sender || peerId;

  log.log([senderPeerId, 'RTCDataChannel', channelProp, 'Received P2P message from peer:'], data);

  this._trigger('incomingMessage', {
    content: data.data,
    isPrivate: data.isPrivate,
    isDataChannel: true,
    targetPeerId: this._user.sid,
    senderPeerId: senderPeerId
  }, senderPeerId, this.getPeerInfo(senderPeerId), false);
};

/**
 * Function that handles the "ERROR" data transfer protocol.
 * @method _ERRORProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._ERRORProtocolHandler = function(peerId, data, channelProp) {
  var self = this;

  var transferId = channelProp;
  var senderPeerId = data.sender || peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of ERROR event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(senderPeerId);
    }
  };

  log.error([peerId, 'RTCDataChannel', channelProp, 'Received an error from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.ERROR, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerID, true, false, false), {
      message: new Error(data.content),
      transferType: self._dataTransfers[transferId].direction
    });
  });
};

/**
 * Function that handles the "CANCEL" data transfer protocol.
 * @method _CANCELProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype._CANCELProtocolHandler = function(peerId, data, channelProp) {
  var self = this;
  var transferId = channelProp;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  /**
   * Emit event for Peers function.
   */
  var emitEventFn = function (cb) {
    if (peerId === 'MCU') {
      if (!self._dataTransfers[transferId].peers[channelProp]) {
        log.warn([peerId, 'RTCDataChannel', channelProp, 'Dropping triggering of CANCEL event as ' +
          'Peers list does not exists']);
        return;
      }
      for (var evtPeerId in self._dataTransfers[transferId].peers[channelProp]) {
        if (self._dataTransfers[transferId].peers[channelProp].hasOwnProperty(evtPeerId) &&
          self._dataTransfers[transferId].peers[channelProp][evtPeerId]) {
          cb(evtPeerId);
        }
      }
    } else {
      cb(peerId);
    }
  };

  log.error([peerId, 'RTCDataChannel', channelProp, 'Received data transfer termination from peer ->'], data);

  emitEventFn(function (evtPeerId) {
    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.CANCEL, transferId, evtPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), {
      message: new Error(data.content || 'Peer has terminated data transfer.'),
      transferType: self._dataTransfers[transferId].direction
    });
  });
};

/**
 * Function that handles the data transfer chunk received.
 * @method _DATAProtocolHandler
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._DATAProtocolHandler = function(peerId, chunk, chunkType, chunkSize, channelProp) {
  var self = this;
  var transferId = channelProp;
  var senderPeerId = peerId;

  if (channelProp === 'main') {
    transferId = self._dataChannels[peerId].main.transferId;
  }

  if (self._dataTransfers[transferId].senderPeerId) {
    senderPeerId = self._dataTransfers[transferId].senderPeerId;
  }

  self._handleDataTransferTimeoutForPeer(transferId, peerId, false);

  self._dataTransfers[transferId].chunkType = chunkType;
  self._dataTransfers[transferId].sessions[peerId].receivedSize += chunkSize;
  self._dataTransfers[transferId].chunks[self._dataTransfers[transferId].sessions[peerId].ackN] = chunk;

  if (self._dataTransfers[transferId].sessions[peerId].receivedSize >= self._dataTransfers[transferId].size) {
    log.log([peerId, 'RTCDataChannel', channelProp, 'Data transfer has been completed. Computed size ->'], 
      self._dataTransfers[transferId].sessions[peerId].receivedSize);

    // Send last ACK to Peer to indicate completion of data transfers
    self._sendMessageToDataChannel(peerId, {
      type: self._DC_PROTOCOL_TYPE.ACK,
      sender: self._user.sid,
      ackN: self._dataTransfers[transferId].sessions[peerId].ackN + 1
    }, channelProp);

    self._trigger('incomingData', self._getTransferData(transferId), transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, false, false, false), null);

    self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, transferId, senderPeerId,
      self._getTransferInfo(transferId, peerId, true, false, false), null);
    return;
  }

  self._dataTransfers[transferId].sessions[peerId].ackN += 1;

  self._sendMessageToDataChannel(peerId, {
    type: self._DC_PROTOCOL_TYPE.ACK,
    sender: self._user.sid,
    ackN: self._dataTransfers[transferId].sessions[peerId].ackN
  }, channelProp);

  self._handleDataTransferTimeoutForPeer(transferId, peerId, true);

  self._trigger('dataTransferState', self.DATA_TRANSFER_STATE.DOWNLOADING, transferId, senderPeerId,
    self._getTransferInfo(transferId, peerId, true, false, false), null);
};

Skylink.prototype.CANDIDATE_GENERATION_STATE = {
  NEW: 'new',
  GATHERING: 'gathering',
  COMPLETED: 'completed'
};

/**
 * <blockquote class="info">
 *   Learn more about how ICE works in this
 *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
 * </blockquote>
 * The list of Peer connection remote ICE candidate processing states for trickle ICE connections.
 * @attribute CANDIDATE_PROCESSING_STATE
 * @param {String} RECEIVED <small>Value <code>"received"</code></small>
 *   The value of the state when the remote ICE candidate was received.
 * @param {String} DROPPED  <small>Value <code>"received"</code></small>
 *   The value of the state when the remote ICE candidate is dropped.
 * @param {String} BUFFERED  <small>Value <code>"buffered"</code></small>
 *   The value of the state when the remote ICE candidate is buffered.
 * @param {String} PROCESSING  <small>Value <code>"processing"</code></small>
 *   The value of the state when the remote ICE candidate is being processed.
 * @param {String} PROCESS_SUCCESS  <small>Value <code>"processSuccess"</code></small>
 *   The value of the state when the remote ICE candidate has been processed successfully.
 *   <small>The ICE candidate that is processed will be used to check against the list of
 *   locally generated ICE candidate to start matching for the suitable pair for the best ICE connection.</small>
 * @param {String} PROCESS_ERROR  <small>Value <code>"processError"</code></small>
 *   The value of the state when the remote ICE candidate has failed to be processed.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.CANDIDATE_PROCESSING_STATE = {
  RECEIVED: 'received',
  DROPPED: 'dropped',
  BUFFERED: 'buffered',
  PROCESSING: 'processing',
  PROCESS_SUCCESS: 'processSuccess',
  PROCESS_ERROR: 'processError'
};

/**
 * Function that handles the Peer connection gathered ICE candidate to be sent.
 * @method _onIceCandidate
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._onIceCandidate = function(targetMid, candidate) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.warn([targetMid, 'RTCIceCandidate', null, 'Ignoring of ICE candidate event as ' +
      'Peer connection does not exists ->'], candidate);
    return;
  }

  if (candidate.candidate) {
    if (!pc.gathering) {
      log.log([targetMid, 'RTCIceCandidate', null, 'ICE gathering has started.']);

      pc.gathering = true;
      pc.gathered = false;

      self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.GATHERING, targetMid);
    }

    var candidateType = candidate.candidate.split(' ')[7];

    log.debug([targetMid, 'RTCIceCandidate', candidateType, 'Generated ICE candidate ->'], candidate);

    if (self._filterCandidatesType[candidateType]) {
      if (!(self._hasMCU && self._forceTURN)) {
        log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate as ' +
          'it matches ICE candidate filtering flag ->'], candidate);
        return;
      }

      log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Not dropping of sending ICE candidate as ' +
        'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
        'flags are not honoured ->'], candidate);
    }

    if (!self._gatheredCandidates[targetMid]) {
      self._gatheredCandidates[targetMid] = {
        sending: { host: [], srflx: [], relay: [] },
        receiving: { host: [], srflx: [], relay: [] }
      };
    }

    self._gatheredCandidates[targetMid].sending[candidateType].push({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate
    });

    if (!self._enableIceTrickle) {
      log.warn([targetMid, 'RTCIceCandidate', candidateType, 'Dropping of sending ICE candidate as ' +
        'trickle ICE is disabled ->'], candidate);
      return;
    }

    log.debug([targetMid, 'RTCIceCandidate', candidateType, 'Sending ICE candidate ->'], candidate);

    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.CANDIDATE,
      label: candidate.sdpMLineIndex,
      id: candidate.sdpMid,
      candidate: candidate.candidate,
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id
    });

  } else {
    log.log([targetMid, 'RTCIceCandidate', null, 'ICE gathering has completed.']);

    pc.gathering = false;
    pc.gathered = true;

    self._trigger('candidateGenerationState', self.CANDIDATE_GENERATION_STATE.COMPLETED, targetMid);

    // Disable Ice trickle option
    if (!self._enableIceTrickle) {
      var sessionDescription = self._peerConnections[targetMid].localDescription;

      if (!(sessionDescription && sessionDescription.type && sessionDescription.sdp)) {
        log.warn([targetMid, 'RTCSessionDescription', null, 'Not sending any session description after ' +
          'ICE gathering completed as it is not present.']);
        return;
      }

      // a=end-of-candidates should present in non-trickle ICE connections so no need to send endOfCandidates message
      self._sendChannelMessage({
        type: sessionDescription.type,
        sdp: self._addSDPMediaStreamTrackIDs(targetMid, sessionDescription),
        mid: self._user.sid,
        userInfo: self._getUserInfo(),
        target: targetMid,
        rid: self._room.id
      });
    } else if (self._gatheredCandidates[targetMid]) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.END_OF_CANDIDATES,
        noOfExpectedCandidates: self._gatheredCandidates[targetMid].sending.srflx.length +
          self._gatheredCandidates[targetMid].sending.host.length +
          self._gatheredCandidates[targetMid].sending.relay.length,
        mid: self._user.sid,
        target: targetMid,
        rid: self._room.id
      });
    }
  }
};

/**
 * Function that buffers the Peer connection ICE candidate when received
 *   before remote session description is received and set.
 * @method _addIceCandidateToQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateToQueue = function(targetMid, canId, candidate) {
  var candidateType = candidate.candidate.split(' ')[7];

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Buffering ICE candidate.']);

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.BUFFERED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  this._peerCandidatesQueue[targetMid] = this._peerCandidatesQueue[targetMid] || [];
  this._peerCandidatesQueue[targetMid].push([canId, candidate]);
};

/**
 * Function that adds all the Peer connection buffered ICE candidates received.
 * This should be called only after the remote session description is received and set.
 * @method _addIceCandidateFromQueue
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addIceCandidateFromQueue = function(targetMid) {
  this._peerCandidatesQueue[targetMid] = this._peerCandidatesQueue[targetMid] || [];

  for (var i = 0; i < this._peerCandidatesQueue[targetMid].length; i++) {
    var canArray = this._peerCandidatesQueue[targetMid][i];

    if (canArray) {
      var candidateType = canArray[1].candidate.split(' ')[7];

      log.debug([targetMid, 'RTCIceCandidate', canArray[0] + ':' + candidateType, 'Adding buffered ICE candidate.']);

      this._addIceCandidate(targetMid, canArray[0], canArray[1]);
    } else if (this._peerConnections[targetMid] &&
      this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED) {
      log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
      this._peerConnections[targetMid].addIceCandidate(null);
    }
  }

  delete this._peerCandidatesQueue[targetMid];

  this._signalingEndOfCandidates(targetMid);
};

/**
 * Function that adds the ICE candidate to Peer connection.
 * @method _addIceCandidate
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addIceCandidate = function (targetMid, canId, candidate) {
  var self = this;
  var candidateType = candidate.candidate.split(' ')[7];

  var onSuccessCbFn = function () {
    log.log([targetMid, 'RTCIceCandidate', canId + ':' + candidateType,
      'Added ICE candidate successfully.']);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESS_SUCCESS,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, null);
  };

  var onErrorCbFn = function (error) {
    log.error([targetMid, 'RTCIceCandidate', canId + ':' + candidateType,
      'Failed adding ICE candidate ->'], error);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESS_ERROR,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, error);
  };

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Adding ICE candidate.']);

  self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.PROCESSING,
    targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, null);

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed']);
    self._trigger('candidateProcessingState', self.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    return;
  }

  self._peerConnections[targetMid].addIceCandidate(candidate, onSuccessCbFn, onErrorCbFn);
};
Skylink.prototype.ICE_CONNECTION_STATE = {
  STARTING: 'starting',
  CHECKING: 'checking',
  CONNECTED: 'connected',
  COMPLETED: 'completed',
  CLOSED: 'closed',
  FAILED: 'failed',
  TRICKLE_FAILED: 'trickleFailed',
  DISCONNECTED: 'disconnected'
};

/**
 * <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 * </blockquote>
 * The list of TURN network transport protocols options when constructing Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * <small>Example <code>.urls</code> inital input: [<code>"turn:server.com?transport=tcp"</code>,
 * <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]</small>
 * @attribute TURN_TRANSPORT
 * @param {String} TCP <small>Value  <code>"tcp"</code></small>
 *   The value of the option to configure using only TCP network transport protocol.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=tcp"</code>]</small>
 * @param {String} UDP <small>Value  <code>"udp"</code></small>
 *   The value of the option to configure using only UDP network transport protocol.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=udp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]</small>
 * @param {String} ANY <small>Value  <code>"any"</code></small>
 *   The value of the option to configure using any network transport protocols configured from the Signaling server.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478"</code>, <code>"turn:server.com?transport=udp"</code>]</small>
 * @param {String} NONE <small>Value <code>"none"</code></small>
 *   The value of the option to not configure using any network transport protocols.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com"</code>, <code>"turn:server1.com:3478"</code>]</small>
 *   <small>Configuring this does not mean that no protocols will be used, but
 *   rather removing <code>?transport=(protocol)</code> query option in
 *   the TURN ICE server <code>.urls</code> when constructing the Peer connection.</small>
 * @param {String} ALL <small>Value  <code>"all"</code></small>
 *   The value of the option to configure using both TCP and UDP network transport protocols.
 *   <small>Example <code>.urls</code> output: [<code>"turn:server.com?transport=tcp"</code>,
 *   <code>"turn:server.com?transport=udp"</code>, <code>"turn:server1.com:3478?transport=tcp"</code>,
 *   <code>"turn:server1.com:3478?transport=udp"</code>]</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.TURN_TRANSPORT = {
  UDP: 'udp',
  TCP: 'tcp',
  ANY: 'any',
  NONE: 'none',
  ALL: 'all'
};

/**
 * Function that filters and configures the ICE servers received from Signaling
 *   based on the <code>init()</code> configuration and returns the updated
 *   list of ICE servers to be used when constructing Peer connection.
 * @method _setIceServers
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._setIceServers = function(givenConfig) {
  var givenIceServers = clone(givenConfig.iceServers);
  var iceServersList = {};
  var newIceServers = [];
  // TURN SSL config
  var useTURNSSLProtocol = false;
  var useTURNSSLPort = false;



  if (this._forceTURNSSL) {
    if (window.webrtcDetectedBrowser === 'chrome' ||
      window.webrtcDetectedBrowser === 'safari' ||
      window.webrtcDetectedBrowser === 'IE') {
      useTURNSSLProtocol = true;
      useTURNSSLPort = false;
    } else {
      useTURNSSLPort = true;
    }
  }

  log.log('TURN server connections SSL configuration', {
    useTURNSSLProtocol: useTURNSSLProtocol,
    useTURNSSLPort: useTURNSSLPort
  });

  var pushIceServer = function (username, credential, url, index) {
    if (!iceServersList[username]) {
      iceServersList[username] = {};
    }

    if (!iceServersList[username][credential]) {
      iceServersList[username][credential] = [];
    }

    if (iceServersList[username][credential].indexOf(url) === -1) {
      if (typeof index === 'number') {
        iceServersList[username][credential].splice(index, 0, url);
      } else {
        iceServersList[username][credential].push(url);
      }
    }
  };

  var i, serverItem;

  for (i = 0; i < givenIceServers.length; i++) {
    var server = givenIceServers[i];

    if (typeof server.url !== 'string') {
      log.warn('Ignoring ICE server provided at index ' + i, clone(server));
      continue;
    }

    if (server.url.indexOf('stun') === 0) {
      if (!this._enableSTUN) {
        log.warn('Ignoring STUN server provided at index ' + i, clone(server));
        continue;
      }

      if (!this._usePublicSTUN && server.url.indexOf('temasys') === -1) {
        log.warn('Ignoring public STUN server provided at index ' + i, clone(server));
        continue;
      }

    } else if (server.url.indexOf('turn') === 0) {
      if (!this._enableTURN) {
        log.warn('Ignoring TURN server provided at index ' + i, clone(server));
        continue;
      }

      if (server.url.indexOf(':443') === -1 && useTURNSSLPort) {
        log.log('Ignoring TURN Server (non-SSL port) provided at index ' + i, clone(server));
        continue;
      }

      if (useTURNSSLProtocol) {
        var parts = server.url.split(':');
        parts[0] = 'turns';
        server.url = parts.join(':');
      }
    }

    // parse "@" settings
    if (server.url.indexOf('@') > 0) {
      var protocolParts = server.url.split(':');
      var urlParts = protocolParts[1].split('@');
      server.username = urlParts[0];
      server.url = protocolParts[0] + ':' + urlParts[1];

      // add the ICE server port
      if (protocolParts[2]) {
        server.url += ':' + protocolParts[2];
      }
    }

    var username = typeof server.username === 'string' ? server.username : 'none';
    var credential = typeof server.credential === 'string' ? server.credential : 'none';

    if (server.url.indexOf('turn') === 0) {
      if (this._TURNTransport === this.TURN_TRANSPORT.ANY) {
        pushIceServer(username, credential, server.url);

      } else {
        var rawUrl = server.url;

        if (rawUrl.indexOf('?transport=') > 0) {
          rawUrl = rawUrl.split('?transport=')[0];
        }

        if (this._TURNTransport === this.TURN_TRANSPORT.NONE) {
          pushIceServer(username, credential, rawUrl);
        } else if (this._TURNTransport === this.TURN_TRANSPORT.UDP) {
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else if (this._TURNTransport === this.TURN_TRANSPORT.TCP) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
        } else if (this._TURNTransport === this.TURN_TRANSPORT.ALL) {
          pushIceServer(username, credential, rawUrl + '?transport=tcp');
          pushIceServer(username, credential, rawUrl + '?transport=udp');
        } else {
          log.warn('Invalid TURN transport option "' + this._TURNTransport +
            '". Ignoring TURN server at index' + i, clone(server));
          continue;
        }
      }
    } else {
      pushIceServer(username, credential, server.url);
    }
  }

  // add mozilla STUN for firefox
  if (this._enableSTUN && this._usePublicSTUN && window.webrtcDetectedBrowser === 'firefox') {
    pushIceServer('none', 'none', 'stun:stun.services.mozilla.com', 0);
  }

  var hasUrlsSupport = false;

  if (window.webrtcDetectedBrowser === 'chrome' && window.webrtcDetectedVersion > 34) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion > 38) {
    hasUrlsSupport = true;
  }

  if (window.webrtcDetectedBrowser === 'opera' && window.webrtcDetectedVersion > 31) {
    hasUrlsSupport = true;
  }

  // plugin supports .urls
  if (window.webrtcDetectedBrowser === 'safari' || window.webrtcDetectedBrowser === 'IE') {
    hasUrlsSupport = true;
  }

  for (var serverUsername in iceServersList) {
    if (iceServersList.hasOwnProperty(serverUsername)) {
      for (var serverCred in iceServersList[serverUsername]) {
        if (iceServersList[serverUsername].hasOwnProperty(serverCred)) {
          if (hasUrlsSupport) {
            var urlsItem = {
              urls: iceServersList[serverUsername][serverCred]
            };
            if (serverUsername !== 'none') {
              urlsItem.username = serverUsername;
            }
            if (serverCred !== 'none') {
              urlsItem.credential = serverCred;
            }
            newIceServers.push(urlsItem);
          } else {
            for (var j = 0; j < iceServersList[serverUsername][serverCred].length; j++) {
              var urlItem = {
                url: iceServersList[serverUsername][serverCred][j]
              };
              if (serverUsername !== 'none') {
                urlItem.username = serverUsername;
              }
              if (serverCred !== 'none') {
                urlItem.credential = serverCred;
              }
              newIceServers.push(urlItem);
            }
          }
        }
      }
    }
  }

  log.log('Output iceServers configuration:', newIceServers);

  return {
    iceServers: newIceServers
  };
};
Skylink.prototype.PEER_CONNECTION_STATE = {
  STABLE: 'stable',
  HAVE_LOCAL_OFFER: 'have-local-offer',
  HAVE_REMOTE_OFFER: 'have-remote-offer',
  CLOSED: 'closed'
};

/**
 * The list of <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code>
 * method</a> retrieval states.
 * @attribute GET_CONNECTION_STATUS_STATE
 * @param {Number} RETRIEVING <small>Value <code>0</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> is retrieving the Peer connection stats.
 * @param {Number} RETRIEVE_SUCCESS <small>Value <code>1</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> has retrieved the Peer connection stats successfully.
 * @param {Number} RETRIEVE_ERROR <small>Value <code>-1</code></small>
 *   The value of the state when <code>getConnectionStatus()</code> has failed retrieving the Peer connection stats.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.GET_CONNECTION_STATUS_STATE = {
  RETRIEVING: 0,
  RETRIEVE_SUCCESS: 1,
  RETRIEVE_ERROR: -1
};

/**
 * <blockquote class="info">
 *  As there are more features getting implemented, there will be eventually more different types of
 *  server Peers.
 * </blockquote>
 * The list of available types of server Peer connections.
 * @attribute SERVER_PEER_TYPE
 * @param {String} MCU <small>Value <code>"mcu"</code></small>
 *   The value of the server Peer type that is used for MCU connection.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.SERVER_PEER_TYPE = {
  MCU: 'mcu'
  //SIP: 'sip'
};

/**
 * <blockquote class="info">
 *   For MCU enabled Peer connections with <code>options.mcuUseRenegoRestart</code> set to <code>false</code>
 *   in the <a href="#method_init"><code>init()</code> method</a>, the restart functionality may differ, you
 *   may learn more about how to workaround it
 *   <a href="http://support.temasys.com.sg/support/discussions/topics/12000002853">in this article here</a>.
 *   For restarts with Peers connecting from Android, iOS or C++ SDKs, restarts might not work as written in
 *   <a href="http://support.temasys.com.sg/support/discussions/topics/12000005188">in this article here</a>.
 *   Note that this functionality should be used when Peer connection stream freezes during a connection.
 *   For a better user experience for only MCU enabled Peer connections, the functionality is throttled when invoked many
 *   times in less than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Function that refreshes Peer connections to update with the current streaming.
 * @method refreshConnection
 * @param {String|Array} [targetPeerId] <blockquote class="info">
 *   Note that this is ignored if MCU is enabled for the App Key provided in
 *   <a href="#method_init"><code>init()</code> method</a>. <code>refreshConnection()</code> will "refresh"
 *   all Peer connections. See the <u>Event Sequence</u> for more information.</blockquote>
 *   The target Peer ID to refresh connection with.
 * - When provided as an Array, it will refresh all connections with all the Peer IDs provided.
 * - When not provided, it will refresh all the currently connected Peers in the Room.
 * @param {Boolean} [iceRestart=false] <blockquote class="info">
 *   Note that this flag will not be honoured for MCU enabled Peer connections where
 *   <code>options.mcuUseRenegoRestart</code> flag is set to <code>false</code> as it is not necessary since for MCU
 *   "restart" case is to invoke <a href="#method_joinRoom"><code>joinRoom()</code> method</a> again.</blockquote>
 *   The flag if ICE connections should restart when refreshing Peer connections.
 *   <small>This is used when ICE connection state is <code>FAILED</code> or <code>DISCONNECTED</code>, which state
 *   can be retrieved with the <a href="#event_iceConnectionState"><code>iceConnectionState</code> event</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerRestart">
 *   <code>peerRestart</code> event</a> triggering <code>isSelfInitiateRestart</code> parameter payload
 *   value as <code>true</code> for all Peers targeted for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.error.refreshErrors The list of Peer connection refresh errors.
 * @param {Error|String} callback.error.refreshErrors.#peerId The Peer connection refresh error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   is no Peer connections to refresh with.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @trigger <ol class="desc-seq">
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a><ol>
 *   <li>If MCU is enabled: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all connected Peer connections.</li>
 *   <li><a href="#event_serverPeerRestart"><code>serverPeerRestart</code> event</a> triggers for
 *   connected MCU server Peer connection.</li></ol></li>
 *   <li>If <code>options.mcuUseRenegoRestart</code> value is <code>false</code> set in the
 *   <a href="#method_init"><code>init()</code> method</a>: <ol><li>
 *   Invokes <a href="#method_joinRoom"><code>joinRoom()</code> method</a> <small><code>refreshConnection()</code>
 *   will retain the User session information except the Peer ID will be a different assigned ID due to restarting the
 *   Room session.</small> <ol><li>If request has errors <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li>Refresh connections for all targeted Peers. <ol>
 *   <li>If Peer connection exists: <ol>
 *   <li><a href="#event_peerRestart"><code>peerRestart</code> event</a> triggers parameter payload
 *   <code>isSelfInitiateRestart</code> value as <code>true</code> for all targeted Peer connections.</li></ol></li>
 *   <li>Else: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   </ol></li></ol></li></ol></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Refreshing a Peer connection
 *   function refreshFrozenVideoStream (peerId) {
 *     skylinkDemo.refreshConnection(peerId, function (error, success) {
 *       if (error) return;
 *       console.log("Refreshing connection for '" + peerId + "'");
 *     });
 *   }
 *
 *   // Example 2: Refreshing a list of Peer connections
 *   function refreshFrozenVideoStreamGroup (peerIdA, peerIdB) {
 *     skylinkDemo.refreshConnection([peerIdA, peerIdB], function (error, success) {
 *       if (error) {
 *         if (error.transferErrors[peerIdA]) {
 *           console.error("Failed refreshing connection for '" + peerIdA + "'");
 *         } else {
 *           console.log("Refreshing connection for '" + peerIdA + "'");
 *         }
 *         if (error.transferErrors[peerIdB]) {
 *           console.error("Failed refreshing connection for '" + peerIdB + "'");
 *         } else {
 *           console.log("Refreshing connection for '" + peerIdB + "'");
 *         }
 *       } else {
 *         console.log("Refreshing connection for '" + peerIdA + "' and '" + peerIdB + "'");
 *       }
 *     });
 *   }
 *
 *   // Example 3: Refreshing all Peer connections
 *   function refreshFrozenVideoStreamAll () {
 *     skylinkDemo.refreshConnection(function (error, success) {
 *       if (error) {
 *         for (var i = 0; i < error.listOfPeers.length; i++) {
 *           if (error.refreshErrors[error.listOfPeers[i]]) {
 *             console.error("Failed refreshing connection for '" + error.listOfPeers[i] + "'");
 *           } else {
 *             console.info("Refreshing connection for '" + error.listOfPeers[i] + "'");
 *           }
 *         }
 *       } else {
 *         console.log("Refreshing connection for all Peers", success.listOfPeers);
 *       }
 *     });
 *   }
 *
 *   // Example 4: Refresh Peer connection when ICE connection has failed or disconnected
 *   //            and do a ICE connection refresh (only for non-MCU case)
 *   skylinkDemo.on("iceConnectionState", function (state, peerId) {
 *      if (!usesMCUKey && [skylinkDemo.ICE_CONNECTION_STATE.FAILED,
 *        skylinkDemo.ICE_CONNECTION_STATE.DISCONNECTED].indexOf(state) > -1) {
 *        skylinkDemo.refreshConnection(peerId, true);
 *      }
 *   });
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.refreshConnection = function(targetPeerId, iceRestart, callback) {
  var self = this;

  var listOfPeers = Object.keys(self._peerConnections);
  var doIceRestart = false;

  if(Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
  } else if (typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
  } else if (typeof targetPeerId === 'boolean') {
    doIceRestart = targetPeerId;
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
  }

  if (typeof iceRestart === 'boolean') {
    doIceRestart = iceRestart;
  } else if (typeof iceRestart === 'function') {
    callback = iceRestart;
  }

  var emitErrorForPeersFn = function (error) {
    log.error(error);

    if (typeof callback === 'function') {
      var listOfPeerErrors = {};

      if (listOfPeers.length === 0) {
        listOfPeerErrors.self = new Error(error);
      } else {
        for (var i = 0; i < listOfPeers.length; i++) {
          listOfPeerErrors[listOfPeers[i]] = new Error(error);
        }
      }

      callback({
        refreshErrors: listOfPeerRestartErrors,
        listOfPeers: listOfPeers
      }, null);
    }
  };

  if (listOfPeers.length === 0) {
    emitErrorForPeersFn('There is currently no peer connections to restart');
    return;
  }

  self._throttle(function (runFn) {
    if (!runFn && self._hasMCU && !self._mcuUseRenegoRestart) {
      if (self._throttlingShouldThrowError) {
        emitErrorForPeersFn('Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.refreshConnection + 'ms).');
      }
      return;
    }
    self._refreshPeerConnection(listOfPeers, doIceRestart, callback);
  }, 'refreshConnection', self._throttlingTimeouts.refreshConnection);

};

/**
 * Function that refresh connections.
 * @method _refreshPeerConnection
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._refreshPeerConnection = function(listOfPeers, doIceRestart, callback) {
  var self = this;
  var listOfPeerRestarts = [];
  var error = '';
  var listOfPeerRestartErrors = {};

  // To fix jshint dont put functions within a loop
  var refreshSinglePeerCallback = function (peerId) {
    return function (error) {
      if (listOfPeerRestarts.indexOf(peerId) === -1) {
        if (error) {
          log.error([peerId, 'RTCPeerConnection', null, 'Failed restarting for peer'], error);
          listOfPeerRestartErrors[peerId] = error;
        }
        listOfPeerRestarts.push(peerId);
      }

      if (listOfPeerRestarts.length === listOfPeers.length) {
        if (typeof callback === 'function') {
          log.log([null, 'PeerConnection', null, 'Invoked all peers to restart. Firing callback']);

          if (Object.keys(listOfPeerRestartErrors).length > 0) {
            callback({
              refreshErrors: listOfPeerRestartErrors,
              listOfPeers: listOfPeers
            }, null);
          } else {
            callback(null, {
              listOfPeers: listOfPeers
            });
          }
        }
      }
    };
  };

  var refreshSinglePeer = function(peerId, peerCallback){
    if (!self._peerConnections[peerId]) {
      error = 'There is currently no existing peer connection made ' +
        'with the peer. Unable to restart connection';
      log.error([peerId, null, null, error]);
      peerCallback(error);
      return;
    }

    log.log([peerId, 'PeerConnection', null, 'Restarting peer connection']);

    // do a hard reset on variable object
    self._restartPeerConnection(peerId, doIceRestart, peerCallback);
  };

  if(!self._hasMCU) {
    var i;

    for (i = 0; i < listOfPeers.length; i++) {
      var peerId = listOfPeers[i];

      if (Object.keys(self._peerConnections).indexOf(peerId) > -1) {
        refreshSinglePeer(peerId, refreshSinglePeerCallback(peerId));
      } else {
        error = 'Peer connection with peer does not exists. Unable to restart';
        log.error([peerId, 'PeerConnection', null, error]);
        refreshSinglePeerCallback(peerId)(error);
      }
    }
  } else {
    self._restartMCUConnection(callback, doIceRestart);
  }
};

/**
 * Function that retrieves Peer connection bandwidth and ICE connection stats.
 * @method getConnectionStatus
 * @param {String|Array} [targetPeerId] The target Peer ID to retrieve connection stats from.
 * - When provided as an Array, it will retrieve all connection stats from all the Peer IDs provided.
 * - When not provided, it will retrieve all connection stats from the currently connected Peers in the Room.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_getConnectionStatusStateChange">
 *   <code>getConnectionStatusStateChange</code> event</a> triggering <code>state</code> parameter payload
 *   value as <code>RETRIEVE_SUCCESS</code> for all Peers targeted for request success.</small>
 *   [Rel: Skylink.GET_CONNECTION_STATUS_STATE]
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Array} callback.error.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.error.retrievalErrors The list of Peer connection stats retrieval errors.
 * @param {Error|String} callback.error.retrievalErrors.#peerId The Peer connection stats retrieval error associated
 *   with the Peer ID defined in <code>#peerId</code> property.
 *   <small>If <code>#peerId</code> value is <code>"self"</code>, it means that it is the error when there
 *   are no Peer connections to refresh with.</small>
 * @param {JSON} callback.error.connectionStats The list of Peer connection stats.
 *   <small>These are the Peer connection stats that has been managed to be successfully retrieved.</small>
 * @param {JSON} callback.error.connectionStats.#peerId The Peer connection stats associated with
 *   the Peer ID defined in <code>#peerId</code> property.
 *   <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {Array} callback.success.listOfPeers The list of Peer IDs targeted.
 * @param {JSON} callback.success.connectionStats The list of Peer connection stats.
 * @param {JSON} callback.success.connectionStats.#peerId The Peer connection stats associated with
 *   the Peer ID defined in <code>#peerId</code> property.
 *   <small>Object signature matches the <code>stats</code> parameter payload received in the
 *   <a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves Peer connection stats for all targeted Peers. <ol>
 *   <li>If Peer connection has closed or does not exists: <small>This can be checked with
 *   <a href="#event_peerConnectionState"><code>peerConnectionState</code> event</a>
 *   triggering parameter payload <code>state</code> as <code>CLOSED</code> for Peer.</small> <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"> <code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_ERROR</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li><a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVING</code>.</li>
 *   <li>Received response from retrieval. <ol>
 *   <li>If retrieval was successful: <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"><code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_SUCCESS</code>.</li></ol></li>
 *   <li>Else: <ol>
 *   <li><a href="#event_getConnectionStatusStateChange"> <code>getConnectionStatusStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>RETRIEVE_ERROR</code>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Retrieve a Peer connection stats
 *   function startBWStatsInterval (peerId) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus(peerId, function (error, success) {
 *         if (error) return;
 *         var sendVideoBytes  = success.connectionStats[peerId].video.sending.bytes;
 *         var sendAudioBytes  = success.connectionStats[peerId].audio.sending.bytes;
 *         var recvVideoBytes  = success.connectionStats[peerId].video.receiving.bytes;
 *         var recvAudioBytes  = success.connectionStats[peerId].audio.receiving.bytes;
 *         var localCandidate  = success.connectionStats[peerId].selectedCandidate.local;
 *         var remoteCandidate = success.connectionStats[peerId].selectedCandidate.remote;
 *         console.log("Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *         console.log("Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *         console.log("Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *           "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *         console.log("Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *           "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *       });
 *     }, 1000);
 *   }
 *
 *   // Example 2: Retrieve a list of Peer connection stats
 *   function printConnStats (peerId, data) {
 *     if (!data.connectionStats[peerId]) return;
 *     var sendVideoBytes  = data.connectionStats[peerId].video.sending.bytes;
 *     var sendAudioBytes  = data.connectionStats[peerId].audio.sending.bytes;
 *     var recvVideoBytes  = data.connectionStats[peerId].video.receiving.bytes;
 *     var recvAudioBytes  = data.connectionStats[peerId].audio.receiving.bytes;
 *     var localCandidate  = data.connectionStats[peerId].selectedCandidate.local;
 *     var remoteCandidate = data.connectionStats[peerId].selectedCandidate.remote;
 *     console.log(peerId + " - Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *     console.log(peerId + " - Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *     console.log(peerId + " - Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *       "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *     console.log(peerId + " - Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *       "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *   }
 *
 *   function startBWStatsInterval (peerIdA, peerIdB) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus([peerIdA, peerIdB], function (error, success) {
 *         if (error) {
 *           printConnStats(peerIdA, error.connectionStats);
 *           printConnStats(peerIdB, error.connectionStats);
 *         } else {
 *           printConnStats(peerIdA, success.connectionStats);
 *           printConnStats(peerIdB, success.connectionStats);
 *         }
 *       });
 *     }, 1000);
 *   }
 *
 *   // Example 3: Retrieve all Peer connection stats
 *   function printConnStats (listOfPeers, data) {
 *     listOfPeers.forEach(function (peerId) {
 *       if (!data.connectionStats[peerId]) return;
 *       var sendVideoBytes  = data.connectionStats[peerId].video.sending.bytes;
 *       var sendAudioBytes  = data.connectionStats[peerId].audio.sending.bytes;
 *       var recvVideoBytes  = data.connectionStats[peerId].video.receiving.bytes;
 *       var recvAudioBytes  = data.connectionStats[peerId].audio.receiving.bytes;
 *       var localCandidate  = data.connectionStats[peerId].selectedCandidate.local;
 *       var remoteCandidate = data.connectionStats[peerId].selectedCandidate.remote;
 *       console.log(peerId + " - Sending audio (" + sendAudioBytes + "bps) video (" + sendVideoBytes + ")");
 *       console.log(peerId + " - Receiving audio (" + recvAudioBytes + "bps) video (" + recvVideoBytes + ")");
 *       console.log(peerId + " - Local candidate: " + localCandidate.ipAddress + ":" + localCandidate.portNumber +
 *         "?transport=" + localCandidate.transport + " (type: " + localCandidate.candidateType + ")");
 *       console.log(peerId + " - Remote candidate: " + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber +
 *         "?transport=" + remoteCandidate.transport + " (type: " + remoteCandidate.candidateType + ")");
 *     });
 *   }
 *
 *   function startBWStatsInterval (peerIdA, peerIdB) {
 *     setInterval(function () {
 *       skylinkDemo.getConnectionStatus(function (error, success) {
 *         if (error) {
 *           printConnStats(error.listOfPeers, error.connectionStats);
 *         } else {
 *           printConnStats(success.listOfPeers, success.connectionStats);
 *         }
 *       });
 *     }, 1000);
 *   }
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.getConnectionStatus = function (targetPeerId, callback) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerStats = {};
  var listOfPeerErrors = {};

  // getConnectionStatus([])
  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;

  // getConnectionStatus('...')
  } else if (typeof targetPeerId === 'string' && !!targetPeerId) {
    listOfPeers = [targetPeerId];

  // getConnectionStatus(function () {})
  } else if (typeof targetPeerId === 'function') {
    callback = targetPeerId;
    targetPeerId = undefined;
  }

  // Check if Peers list is empty, in which we throw an Error if there isn't any
  if (listOfPeers.length === 0) {
    listOfPeerErrors.self = new Error('There is currently no peer connections to retrieve connection status');

    log.error([null, 'RTCStatsReport', null, 'Retrieving request failure ->'], listOfPeerErrors.self);

    if (typeof callback === 'function') {
      callback({
        listOfPeers: listOfPeers,
        retrievalErrors: listOfPeerErrors,
        connectionStats: listOfPeerStats
      }, null);
    }
    return;
  }

  var completedTaskCounter = [];

  var checkCompletedFn = function (peerId) {
    if (completedTaskCounter.indexOf(peerId) === -1) {
      completedTaskCounter.push(peerId);
    }

    if (completedTaskCounter.length === listOfPeers.length) {
      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerErrors).length > 0) {
          callback({
            listOfPeers: listOfPeers,
            retrievalErrors: listOfPeerErrors,
            connectionStats: listOfPeerStats
          }, null);

        } else {
          callback(null, {
            listOfPeers: listOfPeers,
            connectionStats: listOfPeerStats
          });
        }
      }
    }
  };

  var statsFn = function (peerId) {
    log.debug([peerId, 'RTCStatsReport', null, 'Retrieivng connection status']);

    if (!self._peerStats[peerId]) {
      self._peerStats[peerId] = {};
    }

    var pc = self._peerConnections[peerId];
    var result = {
      raw: null,
      connection: {
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        remoteDescription: {
          type: pc.remoteDescription ? pc.remoteDescription.type || null : null,
          sdp : pc.remoteDescription ? pc.remoteDescription.sdp || null : null
        },
        localDescription: {
          type: pc.localDescription ? pc.localDescription.type || null : null,
          sdp : pc.localDescription ? pc.localDescription.sdp || null : null
        },
        candidates: clone(self._gatheredCandidates[peerId] || {
          sending: { host: [], srflx: [], relay: [] },
          receiving: { host: [], srflx: [], relay: [] }
        }),
        dataChannels: {}
      },
      audio: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.localDescription, 'audio'),
          inputLevel: null,
          echoReturnLoss: null,
          echoReturnLossEnhancement: null,
          totalBytes: 0,
          totalPackets: 0,
          totalPacketsLost: 0
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'audio'),
          outputLevel: null,
          totalBytes: 0,
          totalPackets: 0,
          totalPacketsLost: 0
        }
      },
      video: {
        sending: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          rtt: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.localDescription, 'video'),
          frameWidth: null,
          frameHeight: null,
          framesInput: null,
          frames: null,
          frameRateMean: null,
          frameRateStdDev: null,
          framesDropped: null,
          nacks: null,
          plis: null,
          firs: null,
          totalBytes: 0,
          totalPackets: 0,
          totalPacketsLost: 0,
          totalNacks: 0,
          totalPlis: 0,
          totalFirs: 0
        },
        receiving: {
          ssrc: null,
          bytes: 0,
          packets: 0,
          packetsLost: 0,
          jitter: 0,
          jitterBufferMs: null,
          codec: self._getSDPSelectedCodec(peerId, pc.remoteDescription, 'video'),
          frameWidth: null,
          frameHeight: null,
          framesDecoded: null,
          framesOutput: null,
          frames: null,
          frameRateMean: null,
          frameRateStdDev: null,
          nacks: null,
          plis: null,
          firs: null,
          e2eDelay: null,
          totalBytes: 0,
          totalPackets: 0,
          totalPacketsLost: 0,
          totalNacks: 0,
          totalPlis: 0,
          totalFirs: 0
        }
      },
      selectedCandidate: {
        local: { ipAddress: null, candidateType: null, portNumber: null, transport: null },
        remote: { ipAddress: null, candidateType: null, portNumber: null, transport: null }
      }
    };

    for (var channelProp in self._dataChannels[peerId]) {
      if (self._dataChannels[peerId].hasOwnProperty(channelProp) && self._dataChannels[peerId][channelProp]) {
        result.connection.dataChannels[self._dataChannels[peerId][channelProp].channel.label] = {
          label: self._dataChannels[peerId][channelProp].channel.label,
          readyState: self._dataChannels[peerId][channelProp].channel.readyState,
          channelType: channelProp === 'main' ? self.DATA_CHANNEL_TYPE.MESSAGING : self.DATA_CHANNEL_TYPE.DATA,
          currentTransferId: self._dataChannels[peerId][channelProp].transferId || null
        };
      }
    }

    var loopFn = function (obj, fn) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop]) {
          fn(obj[prop], prop);
        }
      }
    };

    var formatCandidateFn = function (candidateDirType, candidate) {
      result.selectedCandidate[candidateDirType].ipAddress = candidate.ipAddress;
      result.selectedCandidate[candidateDirType].candidateType = candidate.candidateType;
      result.selectedCandidate[candidateDirType].portNumber = typeof candidate.portNumber !== 'number' ?
        parseInt(candidate.portNumber, 10) || null : candidate.portNumber;
      result.selectedCandidate[candidateDirType].transport = candidate.transport;
    };

    pc.getStats(null, function (stats) {
      log.debug([peerId, 'RTCStatsReport', null, 'Retrieval success ->'], stats);

      result.raw = stats;

      if (window.webrtcDetectedBrowser === 'firefox') {
        loopFn(stats, function (obj, prop) {
          var dirType = '';

          // Receiving/Sending RTP packets
          if (prop.indexOf('inbound_rtp') === 0 || prop.indexOf('outbound_rtp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            if (!self._peerStats[peerId][prop]) {
              self._peerStats[peerId][prop] = obj;
            }

            result[obj.mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
            result[obj.mediaType][dirType].totalBytes = parseInt(
              (dirType === 'receiving' ? obj.bytesReceived : obj.bytesSent) || '0', 10);
            result[obj.mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');
            result[obj.mediaType][dirType].totalPackets = parseInt(
              (dirType === 'receiving' ? obj.packetsReceived : obj.packetsSent) || '0', 10);
            result[obj.mediaType][dirType].ssrc = obj.ssrc;

            if (dirType === 'receiving') {
              result[obj.mediaType][dirType].packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
                obj, 'packetsLost');
              result[obj.mediaType][dirType].totalPacketsLost = parseInt(obj.packetsLost || '0', 10);
              result[obj.mediaType][dirType].jitter = obj.jitter || 0;
            }

            if (obj.mediaType === 'video') {
              result.video[dirType].frameRateMean = obj.framerateMean || 0;
              result.video[dirType].frameRateStdDev = obj.framerateStdDev || 0;

              if (dirType === 'sending') {
                result.video.sending.framesDropped = obj.framesDropped || 0;
              }
            }

            self._peerStats[peerId][prop] = obj;

          // Sending RTP packets lost
          } else if (prop.indexOf('inbound_rtcp') === 0 || prop.indexOf('outbound_rtcp') === 0) {
            dirType = prop.indexOf('inbound_rtp') === 0 ? 'receiving' : 'sending';

            if (!self._peerStats[peerId][prop]) {
              self._peerStats[peerId][prop] = obj;
            }

            if (dirType === 'sending') {
              result[obj.mediaType].sending.rtt = obj.mozRtt || 0;
              result[obj.mediaType].sending.packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
                obj, 'packetsLost');
              result[obj.mediaType].sending.totalPacketsLost = parseInt(obj.packetsLost || '0', 10);
              result[obj.mediaType].sending.jitter = obj.jitter || 0;
            }

            self._peerStats[peerId][prop] = obj;

          // Candidates
          } else if (obj.nominated && obj.selected) {
            formatCandidateFn('remote', stats[obj.remoteCandidateId]);
            formatCandidateFn('local', stats[obj.localCandidateId]);
          }
        });

      } else if (window.webrtcDetectedBrowser === 'edge') {
        if (pc.getRemoteStreams().length > 0) {
          var tracks = pc.getRemoteStreams()[0].getTracks();

          loopFn(tracks, function (track) {
            loopFn(stats, function (obj, prop) {
              if (obj.type === 'track' && obj.trackIdentifier === track.id) {
                loopFn(stats, function (streamObj) {
                  if (streamObj.associateStatsId === obj.id &&
                    ['outboundrtp', 'inboundrtp'].indexOf(streamObj.type) > -1) {
                    var dirType = streamObj.type === 'outboundrtp' ? 'sending' : 'receiving';

                    if (!self._peerStats[peerId][prop]) {
                      self._peerStats[peerId][prop] = streamObj;
                    }

                    result[track.kind][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop], streamObj,
                      dirType === 'sending' ? 'bytesSent' : 'bytesReceived');
                    result[track.kind][dirType].totalBytes = parseInt(
                      (dirType === 'sending' ? streamObj.bytesSent : streamObj.bytesReceived) || '0', 10);
                    result[track.kind][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop], streamObj,
                      dirType === 'sending' ? 'packetsSent' : 'packetsReceived');
                    result[track.kind][dirType].totalPackets = parseInt(
                      (dirType === 'sending' ? streamObj.packetsSent : streamObj.packetsReceived) || '0', 10);
                    result[track.kind][dirType].packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop], streamObj, 'packetsLost');
                    result[track.kind][dirType].totalPacketsLost = parseInt(streamObj.packetsLost || '0', 10);
                    result[track.kind][dirType].ssrc = parseInt(streamObj.ssrc || '0', 10);

                    if (dirType === 'sending') {
                      result[track.kind].sending.rtt = obj.roundTripTime || 0;
                    }

                    self._peerStats[peerId][prop] = streamObj;
                  }
                });
              }
            });
          });
        }

      } else {
        var reportedCandidate = false;

        loopFn(stats, function (obj, prop) {
          if (prop.indexOf('ssrc_') === 0) {
            var dirType = prop.indexOf('_recv') > 0 ? 'receiving' : 'sending';

            // Polyfill fix for plugin. Plugin should fix this though
            if (!obj.mediaType) {
              obj.mediaType = obj.hasOwnProperty('audioOutputLevel') ||
                obj.hasOwnProperty('audioInputLevel') ? 'audio' : 'video';
            }

            if (!self._peerStats[peerId][prop]) {
              self._peerStats[peerId][prop] = obj;
            }

            try {
              if (obj.mediaType === 'video' && dirType === 'receiving') {
                var captureStartNtpTimeMs = parseInt(obj.googCaptureStartNtpTimeMs || '0', 10);

                if (captureStartNtpTimeMs > 0 && pc.getRemoteStreams().length > 0 && document &&
                  typeof document.getElementsByTagName === 'function') {
                  var streamId = pc.getRemoteStreams()[0].id || pc.getRemoteStreams()[0].label;
                  var elements = [];

                  if (self._isUsingPlugin) {
                    elements = document.getElementsByTagName('object');
                  } else {
                    elements = document.getElementsByTagName('video');

                    if (elements.length === 0) {
                      elements = document.getElementsByTagName('audio');
                    }
                  }

                  for (var e = 0; e < elements.length; e++) {
                    var videoElmStreamId = null;

                    if (self._isUsingPlugin) {
                      if (!(elements[e].children && typeof elements[e].children === 'object' &&
                        typeof elements[e].children.length === 'number' && elements[e].children.length > 0)) {
                        break;
                      }

                      for (var ec = 0; ec < elements[e].children.length; ec++) {
                        if (elements[e].children[ec].name === 'streamId') {
                          videoElmStreamId = elements[e].children[ec].value || null;
                          break;
                        }
                      }

                    } else {
                      videoElmStreamId = elements[e].srcObject ? elements[e].srcObject.id ||
                        elements[e].srcObject.label : null;
                    }

                    if (videoElmStreamId && videoElmStreamId === streamId) {
                      result[obj.mediaType][dirType].e2eDelay = ((new Date()).getTime() + 2208988800000) -
                        captureStartNtpTimeMs - elements[e].currentTime * 1000;
                      break;
                    }
                  }
                }
              }
            } catch (error) {
              log.warn([peerId, 'RTCStatsReport', null, 'Failed retrieving e2e delay ->'], error);
            }

            // Receiving/Sending RTP packets
            result[obj.mediaType][dirType].ssrc = parseInt(obj.ssrc || '0', 10);
            result[obj.mediaType][dirType].bytes = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, dirType === 'receiving' ? 'bytesReceived' : 'bytesSent');
            result[obj.mediaType][dirType].totalBytes = parseInt((dirType === 'receiving' ? obj.bytesReceived :
              obj.bytesSent) || '0', 10);
            result[obj.mediaType][dirType].packets = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, dirType === 'receiving' ? 'packetsReceived' : 'packetsSent');
            result[obj.mediaType][dirType].totalPackets = parseInt((dirType === 'receiving' ? obj.packetsReceived :
              obj.packetsSent) || '0', 10);
            result[obj.mediaType][dirType].packetsLost = self._parseConnectionStats(self._peerStats[peerId][prop],
              obj, 'packetsLost');
            result[obj.mediaType][dirType].totalPacketsLost = parseInt(obj.packetsLost || '0', 10);
            result[obj.mediaType][dirType].jitter = parseFloat(obj.googJitterReceived || '0', 10);
            result[obj.mediaType][dirType].googJitterBufferMs = parseFloat(obj.googJitterBufferMs || '0', 10);

            if (result[obj.mediaType][dirType].codec) {
              if (obj.googCodecName && obj.googCodecName !== 'unknown') {
                result[obj.mediaType][dirType].codec.name = obj.googCodecName;
              }
              if (obj.codecImplementationName && obj.codecImplementationName !== 'unknown') {
                result[obj.mediaType][dirType].codec.implementation = obj.codecImplementationName;
              }
            }

            if (dirType === 'sending') {
              // NOTE: Chrome sending audio does have it but plugin has..
              result[obj.mediaType].sending.rtt = parseFloat(obj.googRtt || '0', 10);
            }

            if (obj.mediaType === 'video') {
              result.video[dirType].frameWidth = parseInt((dirType === 'receiving' ?
                obj.googFrameWidthReceived : obj.googFrameWidthSent) || '0', 10);
              result.video[dirType].frameHeight = parseInt((dirType === 'receiving' ?
                obj.googFrameHeightReceived : obj.googFrameHeightSent) || '0', 10);
              result.video[dirType].frames = parseInt((dirType === 'receiving' ?
                obj.googFrameRateReceived : obj.googFrameRateSent) || '0', 10);

              result.video[dirType].nacks = self._parseConnectionStats(self._peerStats[peerId][prop],
                obj, dirType === 'receiving' ? 'googNacksReceived' : 'googNacksSent');
              result[obj.mediaType][dirType].totalNacks = parseInt((dirType === 'receiving' ? obj.googNacksReceived :
                obj.googNacksSent) || '0', 10);
              result.video[dirType].plis = self._parseConnectionStats(self._peerStats[peerId][prop],
                obj, dirType === 'receiving' ? 'googPlisReceived' : 'googPlisSent');
              result[obj.mediaType][dirType].totalPlis = parseInt((dirType === 'receiving' ? obj.googPlisReceived :
                obj.googPlisSent) || '0', 10);
              result.video[dirType].firs = self._parseConnectionStats(self._peerStats[peerId][prop],
                obj, dirType === 'receiving' ? 'googFirsReceived' : 'googFirsSent');
              result[obj.mediaType][dirType].totalFirs = parseInt((dirType === 'receiving' ? obj.googFirsReceived :
                obj.googFirsSent) || '0', 10);

              if (dirType === 'receiving') {
                result.video[dirType].framesDecoded = parseInt(obj.googFrameRateDecoded || '0', 10);
                result.video[dirType].framesOutput = parseInt(obj.googFrameRateOutput || '0', 10);
              } else {
                result.video[dirType].framesInput = parseInt(obj.googFrameRateInput || '0', 10);
              }
            } else {
              if (dirType === 'receiving') {
                result.audio[dirType].outputLevel = parseFloat(obj.audioOutputLevel || '0', 10);

              } else {
                result.audio[dirType].inputLevel = parseFloat(obj.audioInputLevel || '0', 10);
                result.audio[dirType].echoReturnLoss = parseFloat(obj.googEchoCancellationReturnLoss || '0', 10);
                result.audio[dirType].echoReturnLossEnhancement = parseFloat(obj.googEchoCancellationReturnLossEnhancement || '0', 10);
              }
            }

            self._peerStats[peerId][prop] = obj;

            if (!reportedCandidate) {
              loopFn(stats, function (canObj, canProp) {
                if (!reportedCandidate && canProp.indexOf('Conn-') === 0) {
                  if (obj.transportId === canObj.googChannelId) {
                    formatCandidateFn('local', stats[canObj.localCandidateId]);
                    formatCandidateFn('remote', stats[canObj.remoteCandidateId]);
                    reportedCandidate = true;
                  }
                }
              });
            }
          }
        });
      }

      listOfPeerStats[peerId] = result;

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_SUCCESS,
        peerId, listOfPeerStats[peerId], null);

      checkCompletedFn(peerId);

    }, function (error) {
      log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], error);

      listOfPeerErrors[peerId] = error;

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, error);

      checkCompletedFn(peerId);
    });
  };

  // Loop through all the list of Peers selected to retrieve connection status
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVING,
      peerId, null, null);

    // Check if the Peer connection exists first
    if (self._peerConnections.hasOwnProperty(peerId) && self._peerConnections[peerId]) {
      statsFn(peerId);

    } else {
      listOfPeerErrors[peerId] = new Error('The peer connection object does not exists');

      log.error([peerId, 'RTCStatsReport', null, 'Retrieval failure ->'], listOfPeerErrors[peerId]);

      self._trigger('getConnectionStatusStateChange', self.GET_CONNECTION_STATUS_STATE.RETRIEVE_ERROR,
        peerId, null, listOfPeerErrors[peerId]);

      checkCompletedFn(peerId);
    }
  }
};

/**
 * Function that starts the Peer connection session.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _addPeer
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._addPeer = function(targetMid, peerBrowser, toOffer, restartConn, receiveOnly, isSS) {
  var self = this;
  if (self._peerConnections[targetMid] && !restartConn) {
    log.error([targetMid, null, null, 'Connection to peer has already been made']);
    return;
  }
  log.log([targetMid, null, null, 'Starting the connection to peer. Options provided:'], {
    peerBrowser: peerBrowser,
    toOffer: toOffer,
    receiveOnly: receiveOnly,
    enableDataChannel: self._enableDataChannel
  });

  log.info('Adding peer', isSS);

  if (!restartConn) {
    self._peerConnections[targetMid] = self._createPeerConnection(targetMid, !!isSS);
  }

  if (!self._peerConnections[targetMid]) {
    log.error([targetMid, null, null, 'Failed creating the connection to peer']);
    return;
  }

  self._peerConnections[targetMid].hasScreen = !!isSS;
};

/**
 * Function that re-negotiates a Peer connection.
 * Remember to remove previous method of reconnection (re-creating the Peer connection - destroy and create connection).
 * @method _restartPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._restartPeerConnection = function (peerId, doIceRestart, callback) {
  var self = this;

  if (!self._peerConnections[peerId]) {
    log.error([peerId, null, null, 'Peer does not have an existing ' +
      'connection. Unable to restart']);
    return;
  }

  var pc = self._peerConnections[peerId];
  var agent = (self.getPeerInfo(peerId) || {}).agent || {};

  // prevent restarts for other SDK clients
  if (self._isLowerThanVersion(agent.SMProtocolVersion || '', '0.1.2')) {
    var notSupportedError = new Error('Failed restarting with other agents connecting from other SDKs as ' +
      're-negotiation is not supported by other SDKs');

    log.warn([peerId, 'RTCPeerConnection', null, 'Ignoring restart request as agent\'s SDK does not support it'],
        notSupportedError);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
      callback(notSupportedError);
    }
    return;
  }

  // This is when the state is stable and re-handshaking is possible
  // This could be due to previous connection handshaking that is already done
  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE && self._peerConnections[peerId]) {
    log.log([peerId, null, null, 'Sending restart message to signaling server']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: doIceRestart === true && self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
      if (self._publishOnly.parentId) {
        restartMsg.parentId = self._publishOnly.parentId;
      }
    }

    self._peerEndOfCandidatesCounter[peerId] = self._peerEndOfCandidatesCounter[peerId] || {};
    self._peerEndOfCandidatesCounter[peerId].len = 0;
    self._sendChannelMessage(restartMsg);
    self._trigger('peerRestart', peerId, self.getPeerInfo(peerId), true, doIceRestart === true);

    if (typeof callback === 'function') {
      log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart callback']);
      callback(null);
    }

  } else {
    // Let's check if the signalingState is stable first.
    // In another galaxy or universe, where the local description gets dropped..
    // In the offerHandler or answerHandler, do the appropriate flags to ignore or drop "extra" descriptions
    if (pc.signalingState === self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
      // Checks if the local description is defined first
      var hasLocalDescription = pc.localDescription && pc.localDescription.sdp;
      // By then it should have at least the local description..
      if (hasLocalDescription) {
        self._sendChannelMessage({
          type: pc.localDescription.type,
          sdp: pc.localDescription.sdp,
          mid: self._user.sid,
          target: peerId,
          rid: self._room.id,
          restart: true
        });
      } else {
        var noLocalDescriptionError = 'Failed re-sending localDescription as there is ' +
          'no localDescription set to connection. There could be a handshaking step error';
        log.error([peerId, 'RTCPeerConnection', null, noLocalDescriptionError], {
            localDescription: pc.localDescription,
            remoteDescription: pc.remoteDescription
        });
        if (typeof callback === 'function') {
          log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
          callback(new Error(noLocalDescriptionError));
        }
      }
    // It could have connection state closed
    } else {
      var unableToRestartError = 'Failed restarting as peer connection state is ' + pc.signalingState;
      log.warn([peerId, 'RTCPeerConnection', null, unableToRestartError]);
      if (typeof callback === 'function') {
        log.debug([peerId, 'RTCPeerConnection', null, 'Firing restart failure callback']);
        callback(new Error(unableToRestartError));
      }
    }
  }
};

/**
 * Function that ends the Peer connection session.
 * @method _removePeer
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._removePeer = function(peerId) {
  if (!this._peerConnections[peerId] && !this._peerInformations[peerId]) {
    log.debug([peerId, 'RTCPeerConnection', null, 'Dropping the hangup from Peer as not connected to Peer at all.']);
    return;
  }

  var peerInfo = clone(this.getPeerInfo(peerId)) || {
    userData: '',
    settings: {},
    mediaStatus: {},
    agent: {},
    config: {},
    room: clone(this._selectedRoom)
  };

  if (peerId !== 'MCU') {
    this._trigger('peerLeft', peerId, peerInfo, false);
  } else {
    this._hasMCU = false;
    log.log([peerId, null, null, 'MCU has stopped listening and left']);
    this._trigger('serverPeerLeft', peerId, this.SERVER_PEER_TYPE.MCU);
  }

  // check if health timer exists
  if (typeof this._peerConnections[peerId] !== 'undefined') {
    // new flag to check if datachannels are all closed
    this._peerConnections[peerId].dataChannelClosed = true;

    if (this._peerConnections[peerId].signalingState !== 'closed') {
      this._peerConnections[peerId].close();
    }

    if (peerId !== 'MCU') {
      this._handleEndedStreams(peerId);
    }

    delete this._peerConnections[peerId];
  }
  // remove peer informations session
  if (typeof this._peerInformations[peerId] !== 'undefined') {
    delete this._peerInformations[peerId];
  }
  // remove peer messages stamps session
  if (typeof this._peerMessagesStamps[peerId] !== 'undefined') {
    delete this._peerMessagesStamps[peerId];
  }
  // remove peer streams session
  if (typeof this._streamsSession[peerId] !== 'undefined') {
    delete this._streamsSession[peerId];
  }
  // remove peer streams session
  if (typeof this._peerEndOfCandidatesCounter[peerId] !== 'undefined') {
    delete this._peerEndOfCandidatesCounter[peerId];
  }

  // close datachannel connection
  if (this._dataChannels[peerId]) {
    this._closeDataChannel(peerId);
  }

  log.log([peerId, null, null, 'Successfully removed peer']);
};

/**
 * Function that creates the Peer connection.
 * @method _createPeerConnection
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._createPeerConnection = function(targetMid, isScreenSharing) {
  var pc, self = this;
  // currently the AdapterJS 0.12.1-2 causes an issue to prevent firefox from
  // using .urls feature
  try {
    pc = new RTCPeerConnection({
      iceServers: self._room.connection.peerConfig.iceServers,
      iceTransportPolicy: self._filterCandidatesType.host && self._filterCandidatesType.srflx &&
        !self._filterCandidatesType.relay ? 'relay' : 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    }, {
      optional: [
        { DtlsSrtpKeyAgreement: true },
        { googIPv6: true }
      ]
    });
    log.info([targetMid, null, null, 'Created peer connection']);
    log.debug([targetMid, null, null, 'Peer connection config:'], self._room.connection.peerConfig);
    log.debug([targetMid, null, null, 'Peer connection constraints:'], self._room.connection.peerConstraints);
  } catch (error) {
    log.error([targetMid, null, null, 'Failed creating peer connection:'], error);
    return null;
  }
  // attributes (added on by Temasys)
  pc.setOffer = '';
  pc.setAnswer = '';
  pc.hasStream = false;
  pc.hasScreen = !!isScreenSharing;
  pc.hasMainChannel = false;
  pc.firefoxStreamId = '';
  pc.processingLocalSDP = false;
  pc.processingRemoteSDP = false;
  pc.gathered = false;
  pc.gathering = false;

  // candidates
  self._gatheredCandidates[targetMid] = {
    sending: { host: [], srflx: [], relay: [] },
    receiving: { host: [], srflx: [], relay: [] }
  };

  self._streamsSession[targetMid] = self._streamsSession[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};

  // callbacks
  // standard not implemented: onnegotiationneeded,
  pc.ondatachannel = function(event) {
    var dc = event.channel || event;
    log.debug([targetMid, 'RTCDataChannel', dc.label, 'Received datachannel ->'], dc);
    if (self._enableDataChannel && self._peerInformations[targetMid] &&
      self._peerInformations[targetMid].config.enableDataChannel) {
      var channelType = self.DATA_CHANNEL_TYPE.DATA;
      var channelKey = dc.label;

      // if peer does not have main channel, the first item is main
      if (!pc.hasMainChannel) {
        channelType = self.DATA_CHANNEL_TYPE.MESSAGING;
        channelKey = 'main';
        pc.hasMainChannel = true;
      }

      self._createDataChannel(targetMid, dc);

    } else {
      log.warn([targetMid, 'RTCDataChannel', dc.label, 'Not adding datachannel as enable datachannel ' +
        'is set to false']);
    }
  };

  pc.onaddstream = function(event) {
    var stream = event.stream || event;
    var streamId = stream.id || stream.label;

    if (targetMid === 'MCU') {
      log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received remote stream from MCU ->'], stream);
      return;
    } else if (!self._sdpSettings.direction.audio.receive && !self._sdpSettings.direction.video.receive) {
      log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received empty remote stream ->'], stream);
      return;
    }

    // Fixes for the dirty-hack for Chrome offer to Firefox (inactive)
    // See: ESS-680
    if (!self._hasMCU && window.webrtcDetectedBrowser === 'firefox' &&
      pc.getRemoteStreams().length > 1 && pc.remoteDescription && pc.remoteDescription.sdp) {

      if (pc.remoteDescription.sdp.indexOf(' msid:' + streamId + ' ') === -1) {
        log.warn([targetMid, 'MediaStream', streamId, 'Ignoring received empty remote stream ->'], stream);
        return;
      }
    }

    var peerSettings = clone(self.getPeerInfo(targetMid).settings);
    var hasScreenshare = peerSettings.video && typeof peerSettings.video === 'object' && !!peerSettings.video.screenshare;

    pc.hasStream = true;
    pc.hasScreen = !!hasScreenshare;

    self._streamsSession[targetMid][streamId] = peerSettings;

    self._onRemoteStreamAdded(targetMid, stream, !!hasScreenshare);
  };

  pc.onicecandidate = function(event) {
    self._onIceCandidate(targetMid, event.candidate || event);
  };

  pc.oniceconnectionstatechange = function(evt) {
    log.debug([targetMid, 'RTCIceConnectionState', null, 'Ice connection state changed ->'], pc.iceConnectionState);

    self._trigger('iceConnectionState', pc.iceConnectionState, targetMid);

    if (pc.iceConnectionState === self.ICE_CONNECTION_STATE.FAILED && self._enableIceTrickle) {
      self._trigger('iceConnectionState', self.ICE_CONNECTION_STATE.TRICKLE_FAILED, targetMid);
    }
  };

  pc.onsignalingstatechange = function() {
    log.debug([targetMid, 'RTCSignalingState', null, 'Peer connection state changed ->'], pc.signalingState);
    self._trigger('peerConnectionState', pc.signalingState, targetMid);
  };
  pc.onicegatheringstatechange = function() {
    log.log([targetMid, 'RTCIceGatheringState', null, 'Ice gathering state changed ->'], pc.iceGatheringState);
    self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
  };

  if (window.webrtcDetectedBrowser === 'firefox') {
    pc.removeStream = function (stream) {
      var senders = pc.getSenders();
      for (var s = 0; s < senders.length; s++) {
        var tracks = stream.getTracks();
        for (var t = 0; t < tracks.length; t++) {
          if (tracks[t] === senders[s].track) {
            pc.removeTrack(senders[s]);
          }
        }
      }
    };
  }

  return pc;
};

/**
 * Function that handles the <code>_restartPeerConnection</code> scenario
 *   for MCU enabled Peer connections.
 * This is implemented currently by making the user leave and join the Room again.
 * The Peer ID will not stay the same though.
 * @method _restartMCUConnection
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._restartMCUConnection = function(callback, doIceRestart) {
  var self = this;
  var listOfPeers = Object.keys(self._peerConnections);
  var listOfPeerRestartErrors = {};
  var sendRestartMsgFn = function (peerId) {
    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: peerId,
      weight: self._peerPriorityWeight,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: self._mcuUseRenegoRestart && doIceRestart === true &&
        self._enableIceRestart && self._peerInformations[peerId] &&
        self._peerInformations[peerId].config.enableIceRestart,
      isRestartResend: false,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
      if (self._publishOnly.parentId) {
        restartMsg.parentId = self._publishOnly.parentId;
      }
    }

    log.log([listOfPeers[i], 'RTCPeerConnection', null, 'Sending restart message to signaling server ->'], restartMsg);

    self._sendChannelMessage(restartMsg);
  };

  for (var i = 0; i < listOfPeers.length; i++) {
    if (!self._peerConnections[listOfPeers[i]]) {
      var error = 'Peer connection with peer does not exists. Unable to restart';
      log.error([listOfPeers[i], 'PeerConnection', null, error]);
      listOfPeerRestartErrors[listOfPeers[i]] = new Error(error);
      continue;
    }

    if (listOfPeers[i] !== 'MCU') {
      self._trigger('peerRestart', listOfPeers[i], self.getPeerInfo(listOfPeers[i]), true, false);

      if (!self._mcuUseRenegoRestart) {
        sendRestartMsgFn(listOfPeers[i]);
      }
    }
  }

  self._trigger('serverPeerRestart', 'MCU', self.SERVER_PEER_TYPE.MCU);

  if (self._mcuUseRenegoRestart) {
    self._peerEndOfCandidatesCounter.MCU = self._peerEndOfCandidatesCounter.MCU || {};
    self._peerEndOfCandidatesCounter.MCU.len = 0;
    sendRestartMsgFn('MCU');
  } else {
    // Restart with MCU = peer leaves then rejoins room
    var peerJoinedFn = function (peerId, peerInfo, isSelf) {
      log.log([null, 'PeerConnection', null, 'Invoked all peers to restart with MCU. Firing callback']);

      if (typeof callback === 'function') {
        if (Object.keys(listOfPeerRestartErrors).length > 0) {
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        } else {
          callback(null, {
            listOfPeers: listOfPeers
          });
        }
      }
    };

    self.once('peerJoined', peerJoinedFn, function (peerId, peerInfo, isSelf) {
      return isSelf;
    });

    self.leaveRoom(false, function (error, success) {
      if (error) {
        if (typeof callback === 'function') {
          for (var i = 0; i < listOfPeers.length; i++) {
            listOfPeerRestartErrors[listOfPeers[i]] = error;
          }
          callback({
            refreshErrors: listOfPeerRestartErrors,
            listOfPeers: listOfPeers
          }, null);
        }
      } else {
        //self._trigger('serverPeerLeft', 'MCU', self.SERVER_PEER_TYPE.MCU);
        self.joinRoom(self._selectedRoom);
      }
    });
  }
};

/**
 * Function that handles the stats tabulation.
 * @method _parseConnectionStats
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._parseConnectionStats = function(prevStats, stats, prop) {
  var nTime = stats.timestamp;
  var oTime = prevStats.timestamp;
  var nVal = parseFloat(stats[prop] || '0', 10);
  var oVal = parseFloat(prevStats[prop] || '0', 10);

  if ((new Date(nTime).getTime()) === (new Date(oTime).getTime())) {
    return nVal;
  }

  return parseFloat(((nVal - oVal) / (nTime - oTime) * 1000).toFixed(3) || '0', 10);
};

/**
 * Function that signals the end-of-candidates flag.
 * @method _signalingEndOfCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._signalingEndOfCandidates = function(targetMid) {
  var self = this;

  if (!self._peerEndOfCandidatesCounter[targetMid]) {
    return;
  }

  if (self._peerConnections[targetMid].remoteDescription &&
    self._peerConnections[targetMid].remoteDescription.sdp &&
    typeof self._peerEndOfCandidatesCounter[targetMid].expectedLen === 'number' &&
    self._peerEndOfCandidatesCounter[targetMid].len >= self._peerEndOfCandidatesCounter[targetMid].expectedLen &&
    (self._peerCandidatesQueue[targetMid] ? self._peerCandidatesQueue[targetMid].length === 0 : true) &&
    !self._peerEndOfCandidatesCounter[targetMid].hasSet) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Signaling of end-of-candidates remote ICE gathering.']);
    self._peerEndOfCandidatesCounter[targetMid].hasSet = true;
    self._peerConnections[targetMid].addIceCandidate(null);
  }
};



Skylink.prototype.setUserData = function(userData) {
  var self = this;
  var updatedUserData = '';

  if (!(typeof userData === 'undefined' || userData === null)) {
    updatedUserData = userData;
  }

  this._userData = updatedUserData;

  if (self._inRoom) {
    log.log('Updated userData -> ', updatedUserData);
    self._sendChannelMessage({
      type: self._SIG_MESSAGE_TYPE.UPDATE_USER,
      mid: self._user.sid,
      rid: self._room.id,
      userData: updatedUserData,
      stamp: (new Date()).getTime()
    });
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  } else {
    log.warn('User is not in the room. Broadcast of updated information will be dropped');
  }
};

/**
 * Function that returns the User / Peer current custom data.
 * @method getUserData
 * @param {String} [peerId] The Peer ID to return the current custom data from.
 * - When not provided or that the Peer ID is does not exists, it will return
 *   the User current custom data.
 * @return {JSON|String} The User / Peer current custom data.
 * @example
 *   // Example 1: Get Peer current custom data
 *   var peerUserData = skylinkDemo.getUserData(peerId);
 *
 *   // Example 2: Get User current custom data
 *   var userUserData = skylinkDemo.getUserData();
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.getUserData = function(peerId) {
  if (peerId && this._peerInformations[peerId]) {
    var userData = this._peerInformations[peerId].userData;
    if (!(userData !== null && typeof userData === 'undefined')) {
      userData = '';
    }
    return userData;
  }
  return this._userData;
};

/**
 * Function that returns the User / Peer current session information.
 * @method getPeerInfo
 * @param {String} [peerId] The Peer ID to return the current session information from.
 * - When not provided or that the Peer ID is does not exists, it will return
 *   the User current session information.
 * @return {JSON} The User / Peer current session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @example
 *   // Example 1: Get Peer current session information
 *   var peerPeerInfo = skylinkDemo.getPeerInfo(peerId);
 *
 *   // Example 2: Get User current session information
 *   var userPeerInfo = skylinkDemo.getPeerInfo();
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.getPeerInfo = function(peerId) {
  var peerInfo = null;

  if (typeof peerId === 'string' && typeof this._peerInformations[peerId] === 'object') {
    peerInfo = clone(this._peerInformations[peerId]);
    peerInfo.room = clone(this._selectedRoom);
    peerInfo.settings.bandwidth = peerInfo.settings.bandwidth || {};
    peerInfo.settings.googleXBandwidth = peerInfo.settings.googleXBandwidth || {};

    if (!(typeof peerInfo.settings.video === 'boolean' || (peerInfo.settings.video &&
      typeof peerInfo.settings.video === 'object'))) {
      peerInfo.settings.video = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (!(typeof peerInfo.settings.audio === 'boolean' || (peerInfo.settings.audio &&
      typeof peerInfo.settings.audio === 'object'))) {
      peerInfo.settings.audio = false;
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (typeof peerInfo.mediaStatus.audioMuted !== 'boolean') {
      peerInfo.mediaStatus.audioMuted = true;
    }

    if (typeof peerInfo.mediaStatus.videoMuted !== 'boolean') {
      peerInfo.mediaStatus.videoMuted = true;
    }

    if (peerInfo.settings.maxBandwidth) {
      peerInfo.settings.bandwidth = clone(peerInfo.settings.maxBandwidth);
      delete peerInfo.settings.maxBandwidth;
    }

    if (peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
      peerInfo.settings.video.customSettings && typeof peerInfo.settings.video.customSettings === 'object') {
      if (peerInfo.settings.video.customSettings.frameRate) {
        peerInfo.settings.video.frameRate = clone(peerInfo.settings.video.customSettings.frameRate);
      }
      if (peerInfo.settings.video.customSettings.width) {
        peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
        peerInfo.settings.video.resolution.width = clone(peerInfo.settings.video.customSettings.width);
      }
      if (peerInfo.settings.video.customSettings.height) {
        peerInfo.settings.video.resolution = peerInfo.settings.video.resolution || {};
        peerInfo.settings.video.resolution.height = clone(peerInfo.settings.video.customSettings.height);
      }
      if (peerInfo.settings.video.customSettings.facingMode) {
        peerInfo.settings.video.facingMode = clone(peerInfo.settings.video.customSettings.facingMode);
      }
    }

    if (peerInfo.settings.audio && typeof peerInfo.settings.audio === 'object') {
      peerInfo.settings.audio.stereo = peerInfo.settings.audio.stereo === true;
    }

    if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
      peerInfo.userData = '';
    }

    peerInfo.parentId = peerInfo.parentId || null;

    if (peerId === 'MCU') {
      peerInfo.config.receiveOnly = true;
      peerInfo.config.publishOnly = false;
    } else if (this._hasMCU) {
      peerInfo.config.receiveOnly = false;
      peerInfo.config.publishOnly = true;
    }

  } else {
    peerInfo = {
      userData: clone(this._userData),
      settings: {
        audio: false,
        video: false
      },
      mediaStatus: clone(this._streamsMutedSettings),
      agent: {
        name: window.webrtcDetectedBrowser,
        version: window.webrtcDetectedVersion,
        os: window.navigator.platform,
        pluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
        SMProtocolVersion: this.SMProtocolVersion,
        DTProtocolVersion: this.DTProtocolVersion
      },
      room: clone(this._selectedRoom),
      config: {
        enableDataChannel: this._enableDataChannel,
        enableIceTrickle: this._enableIceTrickle,
        enableIceRestart: this._enableIceRestart,
        priorityWeight: this._peerPriorityWeight,
        receiveOnly: false,
        publishOnly: !!this._publishOnly
      }
    };

    if (!(peerInfo.userData !== null && typeof peerInfo.userData !== 'undefined')) {
      peerInfo.userData = '';
    }

    if (this._streams.screenshare) {
      peerInfo.settings = clone(this._streams.screenshare.settings);
    } else if (this._streams.userMedia) {
      peerInfo.settings = clone(this._streams.userMedia.settings);
    }

    peerInfo.settings.bandwidth = clone(this._streamsBandwidthSettings.bAS);
    peerInfo.settings.googleXBandwidth = clone(this._streamsBandwidthSettings.googleX);
    peerInfo.parentId = this._publishOnly ? this._publishOnly.parentId || null : null;
    peerInfo.config.receiveOnly = !peerInfo.settings.video && !peerInfo.settings.audio;
  }

  if (!peerInfo.settings.audio) {
    peerInfo.mediaStatus.audioMuted = true;
  }

  if (!peerInfo.settings.video) {
    peerInfo.mediaStatus.videoMuted = true;
  }

  return peerInfo;
};

/**
 * Function that gets the list of connected Peers in the Room.
 * @method getPeersInRoom
 * @return {JSON} The list of connected Peers. <ul>
 *   <li><code>#peerId</code><var><b>{</b>JSON<b>}</b></var><p>The Peer information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a> except there is
 *   the <code>isSelf</code> flag that determines if Peer is User or not.</small></p></li></ul>
 * @example
 *   // Example 1: Get the list of currently connected Peers in the same Room
 *   var peers = skylinkDemo.getPeersInRoom();
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getPeersInRoom = function() {
  var listOfPeersInfo = {};
  var listOfPeers = Object.keys(this._peerInformations);

  for (var i = 0; i < listOfPeers.length; i++) {
    listOfPeersInfo[listOfPeers[i]] = clone(this.getPeerInfo(listOfPeers[i]));
    listOfPeersInfo[listOfPeers[i]].isSelf = false;
  }

  if (this._user && this._user.sid) {
    listOfPeersInfo[this._user.sid] = clone(this.getPeerInfo());
    listOfPeersInfo[this._user.sid].isSelf = true;
  }

  return listOfPeersInfo;
};

/**
 * Function that gets the list of connected Peers Streams in the Room.
 * @method getPeersStream
 * @return {JSON} The list of Peers Stream. <ul>
 *   <li><code>#peerId</code><var><b>{</b>JSON<b>}</b></var><p>The Peer Stream.</p><ul>
 *   <li><code>stream</code><var><b>{</b>MediaStream<b>}</b></var><p>The Stream object.</p></li>
 *   <li><code>streamId</code><var><b>{</b>String<b>}</b></var><p>The Stream ID.</p></li>
 *   <li><code>isSelf</code><var><b>{</b>Boolean<b>}</b></var><p>The flag if Peer is User.</p></li>
 *   </p></li></ul></li></ul>
 * @example
 *   // Example 1: Get the list of currently connected Peers in the same Room
 *   var streams = skylinkDemo.getPeersStream();
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getPeersStream = function() {
  var listOfPeersStreams = {};
  var listOfPeers = Object.keys(this._peerConnections);

  for (var i = 0; i < listOfPeers.length; i++) {
    var stream = null;

    if (this._peerConnections[listOfPeers[i]] &&
      this._peerConnections[listOfPeers[i]].remoteDescription &&
      this._peerConnections[listOfPeers[i]].remoteDescription.sdp &&
      (this._sdpSettings.direction.audio.receive || this._sdpSettings.direction.video.receive)) {
      var streams = this._peerConnections[listOfPeers[i]].getRemoteStreams();

      for (var j = 0; j < streams.length; j++) {
        if (this._peerConnections[listOfPeers[i]].remoteDescription.sdp.indexOf(
          'msid:' + (streams[j].id || streams[j].label)) > 0) {
          stream = streams[j];
          break;
        }
      }
    }

    listOfPeersStreams[listOfPeers[i]] = {
      streamId: stream ? stream.id || stream.label || null : null,
      stream: stream,
      isSelf: false
    };
  }

  if (this._user && this._user.sid) {
    var selfStream = null;

    if (this._streams.screenshare && this._streams.screenshare.stream) {
      selfStream = this._streams.screenshare.stream;
    } else if (this._streams.userMedia && this._streams.userMedia.stream) {
      selfStream = this._streams.userMedia.stream;
    }

    listOfPeersStreams[this._user.sid] = {
      streamId: selfStream ? selfStream.id || selfStream.label || null : null,
      stream: selfStream,
      isSelf: true
    };
  }

  return listOfPeersStreams;
};

/**
 * Function that returns the User session information to be sent to Peers.
 * @method _getUserInfo
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._getUserInfo = function(peerId) {
  var userInfo = clone(this.getPeerInfo());

  // Adhere to SM protocol without breaking the other SDKs.
  if (userInfo.settings.video && typeof userInfo.settings.video === 'object') {
    userInfo.settings.video.customSettings = {};

    if (userInfo.settings.video.frameRate && typeof userInfo.settings.video.frameRate === 'object') {
      userInfo.settings.video.customSettings.frameRate = clone(userInfo.settings.video.frameRate);
      userInfo.settings.video.frameRate = -1;
    }

    if (userInfo.settings.video.resolution && typeof userInfo.settings.video.resolution === 'object') {
      if (userInfo.settings.video.resolution.width && typeof userInfo.settings.video.resolution.width === 'object') {
        userInfo.settings.video.customSettings.width = clone(userInfo.settings.video.width);
        userInfo.settings.video.resolution.width = -1;
      }

      if (userInfo.settings.video.resolution.height && typeof userInfo.settings.video.resolution.height === 'object') {
        userInfo.settings.video.customSettings.height = clone(userInfo.settings.video.height);
        userInfo.settings.video.resolution.height = -1;
      }
    }
  }

  if (userInfo.settings.bandwidth) {
    userInfo.settings.maxBandwidth = clone(userInfo.settings.bandwidth);
    delete userInfo.settings.bandwidth;
  }

  delete userInfo.agent;
  delete userInfo.room;
  return userInfo;
};

Skylink.prototype.HANDSHAKE_PROGRESS = {
  ENTER: 'enter',
  WELCOME: 'welcome',
  OFFER: 'offer',
  ANSWER: 'answer',
  ERROR: 'error'
};

/**
 * Function that creates the Peer connection offer session description.
 * @method _doOffer
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._doOffer = function(targetMid, iceRestart, peerBrowser) {
  var self = this;
  var pc = self._peerConnections[targetMid] || self._addPeer(targetMid, peerBrowser);

  log.log([targetMid, null, null, 'Checking caller status'], peerBrowser);

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer', 'Dropping of creating of offer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "stable" if setting local "offer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of creating of offer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.STABLE + '" ->'], pc.signalingState);
    return;
  }

  var peerIceRestartSupport = !!((self._peerInformations[targetMid] || {}).config || {}).enableIceRestart;

  var offerConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
    iceRestart: self._enableIceRestart && peerIceRestartSupport ? iceRestart === true : false
  };

  // NOTE: Removing ICE restart functionality as of now since Firefox does not support it yet
  // Check if ICE connection failed or disconnected, and if so, do an ICE restart
  /*if ([self.ICE_CONNECTION_STATE.DISCONNECTED, self.ICE_CONNECTION_STATE.FAILED].indexOf(pc.iceConnectionState) > -1) {
    offerConstraints.iceRestart = true;
  }*/

  // Prevent undefined OS errors
  peerBrowser.os = peerBrowser.os || '';

  /*
    Ignoring these old codes as Firefox 39 and below is no longer supported
    if (window.webrtcDetectedType === 'moz' && peerBrowser.agent === 'MCU') {
      unifiedOfferConstraints.mandatory = unifiedOfferConstraints.mandatory || {};
      unifiedOfferConstraints.mandatory.MozDontOfferDataChannel = true;
      beOfferer = true;
    }

    if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion >= 32) {
      unifiedOfferConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };
    }
  */

  // Fallback to use mandatory constraints for plugin based browsers
  if (['IE', 'safari'].indexOf(window.webrtcDetectedBrowser) > -1) {
    offerConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        iceRestart: self._enableIceRestart && peerIceRestartSupport ? iceRestart === true : false
      }
    };
  }

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  if (self._enableDataChannel && self._peerInformations[targetMid] &&
    self._peerInformations[targetMid].config.enableDataChannel) {
    // Edge doesn't support datachannels yet
    if (!(self._dataChannels[targetMid] && self._dataChannels[targetMid].main) &&
      window.webrtcDetectedBrowser !== 'edge') {
      self._createDataChannel(targetMid);
      self._peerConnections[targetMid].hasMainChannel = true;
    }
  }

  log.debug([targetMid, null, null, 'Creating offer with config:'], offerConstraints);

  pc.endOfCandidates = false;

  pc.createOffer(function(offer) {
    log.debug([targetMid, null, null, 'Created offer'], offer);

    self._setLocalAndSendMessage(targetMid, offer);

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    log.error([targetMid, null, null, 'Failed creating an offer:'], error);

  }, offerConstraints);
};

/**
 * Function that creates the Peer connection answer session description.
 * This comes after receiving and setting the offer session description.
 * @method _doAnswer
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._doAnswer = function(targetMid) {
  var self = this;
  log.log([targetMid, null, null, 'Creating answer with config:'],
    self._room.connection.sdpConstraints);
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer', 'Dropping of creating of answer ' +
      'as connection does not exists']);
    return;
  }

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of creating of answer as signalingState is not "' +
      self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER + '" ->'], pc.signalingState);
    return;
  }

  // Add stream only at offer/answer end
  if (!self._hasMCU || targetMid === 'MCU') {
    self._addLocalMediaStreams(targetMid);
  }

  // No ICE restart constraints for createAnswer as it fails in chrome 48
  // { iceRestart: true }
  pc.createAnswer(function(answer) {
    log.debug([targetMid, null, null, 'Created answer'], answer);
    self._setLocalAndSendMessage(targetMid, answer);
  }, function(error) {
    log.error([targetMid, null, null, 'Failed creating an answer:'], error);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  });
};

/**
 * Function that sets the local session description and sends to Peer.
 * If trickle ICE is disabled, the local session description will be sent after
 *   ICE gathering has been completed.
 * @method _setLocalAndSendMessage
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._setLocalAndSendMessage = function(targetMid, sessionDescription) {
  var self = this;
  var pc = self._peerConnections[targetMid];

  // Added checks to ensure that sessionDescription is defined first
  if (!(!!sessionDescription && !!sessionDescription.sdp)) {
    log.warn([targetMid, 'RTCSessionDescription', null, 'Local session description is undefined ->'], sessionDescription);
    return;
  }

  // Added checks to ensure that connection object is defined first
  if (!pc) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description will not be set as connection does not exists ->'], sessionDescription);
    return;

  } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], sessionDescription);
    return;

  // Added checks to ensure that state is "have-remote-offer" if setting local "answer"
  } else if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER &&
    pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_REMOTE_OFFER) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local session description ' +
      'will not be set as signaling state is "' + pc.signalingState + '" ->'], sessionDescription);
    return;

  // Added checks if there is a current local sessionDescription being processing before processing this one
  } else if (pc.processingLocalSDP) {
    log.warn([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description will not be set as another is being processed ->'], sessionDescription);
    return;
  }

  pc.processingLocalSDP = true;

  // Sets and expected receiving codecs etc.
  sessionDescription.sdp = self._setSDPOpusConfig(targetMid, sessionDescription);
  sessionDescription.sdp = self._setSDPCodec(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPFirefoxH264Pref(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPH264VP9AptRtxForOlderPlugin(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPCodecs(targetMid, sessionDescription);
  sessionDescription.sdp = self._handleSDPConnectionSettings(targetMid, sessionDescription);
  sessionDescription.sdp = self._setSDPBitrate(targetMid, sessionDescription);
  sessionDescription.sdp = self._removeSDPREMBPackets(targetMid, sessionDescription);

  log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
    'Local session description updated ->'], sessionDescription.sdp);

  pc.setLocalDescription(sessionDescription, function() {
    log.debug([targetMid, 'RTCSessionDescription', sessionDescription.type,
      'Local session description has been set ->'], sessionDescription);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', sessionDescription.type, targetMid);

    if (sessionDescription.type === self.HANDSHAKE_PROGRESS.ANSWER) {
      pc.setAnswer = 'local';
    } else {
      pc.setOffer = 'local';
    }

    if (!self._enableIceTrickle && !pc.gathered) {
      log.log([targetMid, 'RTCSessionDescription', sessionDescription.type,
        'Local session description sending is halted to complete ICE gathering.']);
      return;
    }

    self._sendChannelMessage({
      type: sessionDescription.type,
      sdp: self._addSDPMediaStreamTrackIDs(targetMid, sessionDescription),
      mid: self._user.sid,
      target: targetMid,
      rid: self._room.id,
      userInfo: self._getUserInfo()
    });

  }, function(error) {
    log.error([targetMid, 'RTCSessionDescription', sessionDescription.type, 'Local description failed setting ->'], error);

    pc.processingLocalSDP = false;

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);
  });
};

Skylink.prototype.GET_PEERS_STATE = {
	ENQUIRED: 'enquired',
	RECEIVED: 'received'
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * The list of <a href="#method_introducePeer"><code>introducePeer</code> method</a> Peer introduction request states.
 * @attribute INTRODUCE_STATE
 * @param {String} INTRODUCING <small>Value <code>"enquired"</code></small>
 *   The value of the state when introduction request for the selected pair of Peers has been made to the Signaling server.
 * @param {String} ERROR       <small>Value <code>"error"</code></small>
 *   The value of the state when introduction request made to the Signaling server
 *   for the selected pair of Peers has failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.INTRODUCE_STATE = {
	INTRODUCING: 'introducing',
	ERROR: 'error'
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key
 *   provided in the <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * Function that retrieves the list of Peer IDs from Rooms within the same App space.
 * @method getPeers
 * @param {Boolean} [showAll=false] The flag if Signaling server should also return the list of privileged Peer IDs.
 * <small>By default, the Signaling server does not include the list of privileged Peer IDs in the return result.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_getPeersStateChange">
 *   <code>getPeersStateChange</code> event</a> triggering <code>state</code> parameter payload value as
 *   <code>RECEIVED</code> for request success.</small>
 *   [Rel: Skylink.GET_PEERS_STATE]
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getPeers()</code> error when retrieving list of Peer IDs from Rooms
 *   within the same App space.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature matches the <code>peerList</code> parameter payload received in the
 *   <a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>If App Key provided in the <a href="#method_init"><code>init()</code> method</a> is not
 *   a Privileged enabled Key: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Retrieves the list of Peer IDs from Rooms within the same App space. <ol>
 *   <li><a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>ENQUIRED</code>.</li>
 *   <li>If received list from Signaling server successfully: <ol>
 *   <li><a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>RECEIVED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Retrieving the un-privileged Peers
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(function (error, success) {
 *        if (error) return;
 *        console.log("The list of only un-privileged Peers in the same App space ->", success);
 *     });
 *   });
 *
 *   // Example 2: Retrieving the all Peers (privileged or un-privileged)
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(true, function (error, success) {
 *        if (error) return;
 *        console.log("The list of all Peers in the same App space ->", success);
 *     });
 *   });
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.getPeers = function(showAll, callback){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	if (!self._appKey){
		log.warn('App key is not defined. Please authenticate again.');
		return;
	}

	// Only callback is provided
	if (typeof showAll === 'function'){
		callback = showAll;
		showAll = false;
	}

	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.GET_PEERS,
		showAll: showAll || false
	});

	self._trigger('getPeersStateChange',self.GET_PEERS_STATE.ENQUIRED, self._user.sid, null);

	log.log('Enquired server for peers within the realm');

	if (typeof callback === 'function'){
		self.once('getPeersStateChange', function(state, privilegedPeerId, peerList){
			callback(null, peerList);
		}, function(state, privilegedPeerId, peerList){
			return state === self.GET_PEERS_STATE.RECEIVED;
		});
	}

};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * Function that selects and introduces a pair of Peers to start connection with each other.
 * @method introducePeer
 * @param {String} sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
 * @param {String} receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
 * @trigger <ol class="desc-seq">
 *   <li>If App Key provided in the <a href="#method_init"><code>init()</code> method</a> is not
 *   a Privileged enabled Key: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Starts sending introduction request for the selected pair of Peers to the Signaling server. <ol>
 *   <li><a href="#event_introduceStateChange"><code>introduceStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>INTRODUCING</code>.</li>
 *   <li>If received errors from Signaling server: <ol>
 *   <li><a href="#event_introduceStateChange"><code>introduceStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>ERROR</code>.</li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Introduce a pair of Peers
 *   skylinkDemo.on("introduceStateChange", function (state, privilegedPeerId, sendingPeerId, receivingPeerId) {
 *	   if (state === skylinkDemo.INTRODUCE_STATE.INTRODUCING) {
 *       console.log("Peer '" + sendingPeerId + "' has been introduced to '" + receivingPeerId + "'");
 *     }
 *   });
 *
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(function (gPError, gPSuccess) {
 *        if (gPError) return;
 *        skylinkDemo.introducePeer(gPSuccess.roomName[0], gPSuccess.roomName[1]);
 *     });
 *   });
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.introducePeer = function(sendingPeerId, receivingPeerId){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		self._trigger('introduceStateChange', self.INTRODUCE_STATE.ERROR, self._user.sid, sendingPeerId, receivingPeerId, 'notPrivileged');
		return;
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	});
	self._trigger('introduceStateChange', self.INTRODUCE_STATE.INTRODUCING, self._user.sid, sendingPeerId, receivingPeerId, null);
	log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};


Skylink.prototype.SYSTEM_ACTION = {
  WARNING: 'warning',
  REJECT: 'reject'
};

/**
 * The list of Signaling server reaction states reason of action code during
 * <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * @attribute SYSTEM_ACTION_REASON
 * @param {String} CREDENTIALS_EXPIRED <small>Value <code>"oldTimeStamp"</code></small>
 *   The value of the reason code when Room session token has expired.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} CREDENTIALS_ERROR   <small>Value <code>"credentialError"</code></small>
 *   The value of the reason code when Room session token provided is invalid.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 * @param {String} DUPLICATED_LOGIN    <small>Value <code>"duplicatedLogin"</code></small>
 *   The value of the reason code when Room session token has been used already.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} ROOM_NOT_STARTED    <small>Value <code>"notStart"</code></small>
 *   The value of the reason code when Room session has not started.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} EXPIRED             <small>Value <code>"expired"</code></small>
 *   The value of the reason code when Room session has ended already.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} ROOM_LOCKED         <small>Value <code>"locked"</code></small>
 *   The value of the reason code when Room is locked.
 *   <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *   <small>Results with: <code>REJECT</code></small>
 * @param {String} FAST_MESSAGE        <small>Value <code>"fastmsg"</code></small>
 *    The value of the reason code when User is flooding socket messages to the Signaling server
 *    that is sent too quickly within less than a second interval.
 *    <small>Happens after Room session has started. This can be caused by various methods like
 *    <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *    <a href="#method_setUserData"><code>setUserData()</code> method</a>,
 *    <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *    <a href="#method_enableAudio"><code>enableAudio()</code> method</a>,
 *    <a href="#method_enableVideo"><code>enableVideo()</code> method</a>,
 *    <a href="#method_disableAudio"><code>disableAudio()</code> method</a> and
 *    <a href="#method_disableVideo"><code>disableVideo()</code> method</a></small>
 *    <small>Results with: <code>WARNING</code></small>
 * @param {String} ROOM_CLOSING        <small>Value <code>"toClose"</code></small>
 *    The value of the reason code when Room session is ending.
 *    <small>Happens after Room session has started. This serves as a prerequisite warning before
 *    <code>ROOM_CLOSED</code> occurs.</small>
 *    <small>Results with: <code>WARNING</code></small>
 * @param {String} ROOM_CLOSED         <small>Value <code>"roomclose"</code></small>
 *    The value of the reason code when Room session has just ended.
 *    <small>Happens after Room session has started.</small>
 *    <small>Results with: <code>REJECT</code></small>
 * @param {String} SERVER_ERROR        <small>Value <code>"serverError"</code></small>
 *    The value of the reason code when Room session fails to start due to some technical errors.
 *    <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *    <small>Results with: <code>REJECT</code></small>
 * @param {String} KEY_ERROR           <small>Value <code>"keyFailed"</code></small>
 *    The value of the reason code when Room session fails to start due to some technical error pertaining to
 *    App Key initialization.
 *    <small>Happens during <a href="#method_joinRoom"><code>joinRoom()</code> method</a> request.</small>
 *    <small>Results with: <code>REJECT</code></small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.SYSTEM_ACTION_REASON = {
  CREDENTIALS_EXPIRED: 'oldTimeStamp',
  CREDENTIALS_ERROR: 'credentialError',
  DUPLICATED_LOGIN: 'duplicatedLogin',
  ROOM_NOT_STARTED: 'notStart',
  EXPIRED: 'expired',
  ROOM_LOCKED: 'locked',
  FAST_MESSAGE: 'fastmsg',
  ROOM_CLOSING: 'toclose',
  ROOM_CLOSED: 'roomclose',
  SERVER_ERROR: 'serverError',
  KEY_ERROR: 'keyFailed'
};

/**
 * Function that starts the Room session.
 * @method joinRoom
 * @param {String} [room] The Room name.
 * - When not provided or is provided as an empty string, its value is the <code>options.defaultRoom</code>
 *   provided in the <a href="#method_init"><code>init()</code> method</a>.
 *   <small>Note that if you are using credentials based authentication, you cannot switch the Room
 *   that is not the same as the <code>options.defaultRoom</code> defined in the
 *   <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {JSON} [options] The Room session configuration options.
 * @param {JSON|String} [options.userData] The User custom data.
 *   <small>This can be set after Room session has started using the
 *   <a href="#method_setUserData"><code>setUserData()</code> method</a>.</small>
 * @param {Boolean} [options.useExactConstraints] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.useExactConstraints</code> parameter settings.
 *   <small>See the <code>options.useExactConstraints</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> for more information.</small>
 * @param {Boolean|JSON} [options.audio] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.audio</code> parameter settings.
 *   <small>When value is defined as <code>true</code> or an object, <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> to be invoked to retrieve new Stream. If
 *   <code>options.video</code> is not defined, it will be defined as <code>false</code>.</small>
 *   <small>Object signature matches the <code>options.audio</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Boolean|JSON} [options.video] The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options.video</code> parameter settings.
 *   <small>When value is defined as <code>true</code> or an object, <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> to be invoked to retrieve new Stream. If
 *   <code>options.audio</code> is not defined, it will be defined as <code>false</code>.</small>
 *   <small>Object signature matches the <code>options.video</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {JSON} [options.bandwidth] <blockquote class="info">Note that this is currently not supported
 *   with Firefox browsers versions 48 and below as noted in an existing
 *   <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=976521#c21">bugzilla ticket here</a>.</blockquote>
 *   The configuration to set the maximum streaming bandwidth to send to / receive from Peers.
 *   <small>Note that Peers may override the "receive from" maximum streaming bandwidth depending on the Peers configuration.</small>
 * @param {Number} [options.bandwidth.audio] The maximum audio streaming bandwidth sent to Peers in kbps.
 *   <small>Recommended values are <code>50</code> to <code>200</code>. <code>50</code> is sufficient enough for
 *   an audio call. The higher you go if you want clearer audio and to be able to hear music streaming.</small>
 * @param {Number} [options.bandwidth.video] The maximum video streaming bandwidth sent to Peers.
 *   <small>Recommended values are <code>256</code>-<code>500</code> for 180p quality,
 *   <code>500</code>-<code>1024</code> for 360p quality, <code>1024</code>-<code>2048</code> for 720p quality
 *   and <code>2048</code>-<code>4096</code> for 1080p quality.</small>
 * @param {Number} [options.bandwidth.data] The maximum data streaming bandwidth sent to Peers.
 *   <small>This affects the P2P messaging in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>,
 *   and data transfers in <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> and
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.</small>
 * @param {JSON} [options.googleXBandwidth] <blockquote class="info">Note that this is an experimental configuration
 *   and may cause disruptions in connections or connectivity issues when toggled, or may not work depending on
 *   browser supports. Currently, this only toggles the video codec bandwidth configuration.</blockquote>
 *   The configuration to set the experimental google video streaming bandwidth sent to Peers.
 *   <small>Note that Peers may override the "receive from" streaming bandwidth depending on the Peers configuration.</small>
 * @param {Number} [options.googleXBandwidth.min] The minimum experimental google video streaming bandwidth sent to Peers.
 *   <small>This toggles the <code>"x-google-min-bitrate"</code> flag in the session description.</small>
 * @param {Number} [options.googleXBandwidth.max] The maximum experimental google video streaming bandwidth sent to Peers.
 *   <small>This toggles the <code>"x-google-max-bitrate"</code> flag in the session description.</small>
 * @param {Boolean} [options.manualGetUserMedia] The flag if <code>joinRoom()</code> should trigger
 *   <a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> in which the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> or
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   must be retrieved as a requirement before Room session may begin.
 *   <small>This ignores the <code>options.audio</code> and <code>options.video</code> configuration.</small>
 *   <small>After 30 seconds without any Stream retrieved, this results in the `callback(error, ..)` result.</small>
 * @param {JSON} [options.sdpSettings] <blockquote class="info">
 *   Note that this is mainly used for debugging purposes and that it is an experimental flag, so
 *   it may cause disruptions in connections or connectivity issues when toggled. Note that it might not work
 *   with MCU enabled Peer connections or break MCU enabled Peer connections.</blockquote>
 *   The configuration to set the session description settings.
 * @param {JSON} [options.sdpSettings.connection] The configuration to set the session description connection settings.
 *   <small>Note that this configuration may disable the media streaming and these settings will be enabled for
 *   MCU server Peer connection regardless of the flags configured.</small>
 * @param {Boolean} [options.sdpSettings.connection.audio=true] The configuration to enable audio session description connection.
 * @param {Boolean} [options.sdpSettings.connection.video=true] The configuration to enable video session description connection.
 * @param {Boolean} [options.sdpSettings.connection.data=true] The configuration to enable Datachannel session description connection.
 * @param {JSON} [options.sdpSettings.direction] The configuration to set the session description connection direction
 *   to enable or disable uploading and downloading audio or video media streaming.
 *   <small>Note that this configuration does not prevent RTCP packets from being sent and received.</small>
 * @param {JSON} [options.sdpSettings.direction.audio] The configuration to set the session description
 *   connection direction for audio streaming.
 * @param {Boolean} [options.sdpSettings.direction.audio.send=true] The flag if uploading audio streaming
 *   should be enabled when available.
 * @param {Boolean} [options.sdpSettings.direction.audio.receive=true] The flag if downloading audio
 *   streaming should be enabled when available.
 * @param {JSON} [options.sdpSettings.direction.video] The configuration to set the session description
 *   connection direction for video streaming.
 * @param {Boolean} [options.sdpSettings.direction.video.send=true] The flag if uploading video streaming
 *   should be enabled when available.
 * @param {Boolean} [options.sdpSettings.direction.video.receive=true] The flag if downloading video streaming
 *   should be enabled when available.
 * @param {JSON|Boolean} [options.publishOnly] <blockquote class="info">
 *   For MCU enabled Peer connections, defining this flag would make Peer not know other Peers presence in the Room.<br>
 *   For non-MCU enable Peer connections, defining this flag would cause other Peers in the Room to
 *   not to send Stream to Peer, and overrides the config
 *   <code>options.sdpSettings.direction.audio.receive</code> value to <code>false</code>,
 *   <code>options.sdpSettings.direction.video.receive</code> value to <code>false</code>,
 *   <code>options.sdpSettings.direction.video.send</code> value to <code>true</code> and
 *   <code>options.sdpSettings.direction.audio.send</code> value to <code>true</code>.</blockquote>
 *   The config if Peer would publish only.
 * @param {String} [options.publishOnly.parentId] The parent Peer ID to match to when Peer is connected.
 *   <small>This is useful for identification for users connecting the Room twice simultaneously for multi-streaming.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerJoined">
 *   <code>peerJoined</code> event</a> triggering <code>isSelf</code> parameter payload value as <code>true</code>
 *   for request success.</small>
 * @param {JSON} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Error|String} callback.error.error The error received when starting Room session has failed.
 * @param {Number} [callback.error.errorCode] The current <a href="#method_init"><code>init()</code> method</a> ready state.
 *   <small>Defined as <code>null</code> when no <a href="#method_init"><code>init()</code> method</a>
 *   has not been called due to invalid configuration.</small>
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {String} callback.error.room The Room name.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.room The Room name.
 * @param {String} callback.success.peerId The User's Room session Peer ID.
 * @param {JSON} callback.success.peerInfo The User's current Room session information.
 *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
 *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
 * @example
 *   // Example 1: Connecting to the default Room without Stream
 *   skylinkDemo.joinRoom(function (error, success) {
 *     if (error) return;
 *     console.log("User connected.");
 *   });
 *
 *   // Example 2: Connecting to Room "testxx" with Stream
 *   skylinkDemo.joinRoom("testxx", {
 *     audio: true,
 *     video: true
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with getUserMedia() Stream.")
 *   });
 *
 *   // Example 3: Connecting to default Room with Stream retrieved earlier
 *   skylinkDemo.getUserMedia(function (gUMError, gUMSuccess) {
 *     if (gUMError) return;
 *     skylinkDemo.joinRoom(function (error, success) {
 *       if (error) return;
 *       console.log("User connected with getUserMedia() Stream.");
 *     });
 *   });
 *
 *   // Example 4: Connecting to "testxx" Room with shareScreen() Stream retrieved manually
 *   skylinkDemo.on("mediaAccessRequired", function () {
 *     skylinkDemo.shareScreen(function (sSError, sSSuccess) {
 *       if (sSError) return;
 *     });
 *   });
 *
 *   skylinkDemo.joinRoom("testxx", {
 *     manualGetUserMedia: true
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with shareScreen() Stream.");
 *   });
 *
 *   // Example 5: Connecting to "testxx" Room with User custom data
 *   var data = { username: "myusername" };
 *   skylinkDemo.joinRoom("testxx", {
 *     userData: data
 *   }, function (error, success) {
 *     if (error) return;
 *     console.log("User connected with correct user data?", success.peerInfo.userData.username === data.username);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If User is in a Room: <ol>
 *   <li>Invoke <a href="#method_leaveRoom"><code>leaveRoom()</code> method</a>
 *   to end current Room connection. <small>Invoked <a href="#method_leaveRoom"><code>leaveRoom()</code>
 *   method</a> <code>stopMediaOptions</code> parameter value will be <code>false</code>.</small>
 *   <small>Regardless of request errors, <code>joinRoom()</code> will still proceed.</small></li></ol></li>
 *   <li>Check if Room name provided matches the Room name of the currently retrieved Room session token. <ol>
 *   <li>If Room name does not matches: <ol>
 *   <li>Invoke <a href="#method_init"><code>init()</code> method</a> to retrieve new Room session token. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>Open a new socket connection to Signaling server. <ol><li>If Socket connection fails: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter payload
 *   <code>errorCode</code> as <code>CONNECTION_FAILED</code>. <ol>
 *   <li>Checks if there are fallback ports and transports to use. <ol>
 *   <li>If there are still fallback ports and transports: <ol>
 *   <li>Attempts to retry socket connection to Signaling server. <ol>
 *   <li><a href="#event_channelRetry"><code>channelRetry</code> event</a> triggers.</li>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter
 *   payload <code>errorCode</code> as <code>RECONNECTION_ATTEMPT</code>.</li>
 *   <li>If attempt to retry socket connection to Signaling server has failed: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers parameter payload
 *   <code>errorCode</code> as <code>RECONNECTION_FAILED</code>.</li>
 *   <li>Checks if there are still any more fallback ports and transports to use. <ol>
 *   <li>If there are is no more fallback ports and transports to use: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers
 *   parameter payload <code>errorCode</code> as <code>RECONNECTION_ABORTED</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>Else: <ol><li><b>REPEAT</b> attempt to retry socket connection
 *   to Signaling server step.</li></ol></li></ol></li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_socketError"><code>socketError</code> event</a> triggers
 *   parameter payload <code>errorCode</code> as <code>CONNECTION_ABORTED</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If socket connection to Signaling server has opened: <ol>
 *   <li><a href="#event_channelOpen"><code>channelOpen</code> event</a> triggers.</li></ol></li></ol></li>
 *   <li>Checks if there is <code>options.manualGetUserMedia</code> requested <ol><li>If it is requested: <ol>
 *   <li><a href="#event_mediaAccessRequired"><code>mediaAccessRequired</code> event</a> triggers.</li>
 *   <li>If more than 30 seconds has passed and no <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 *   or <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   has been retrieved: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there is <code>options.audio</code> or <code>options.video</code> requested: <ol>
 *   <li>Invoke <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   </ol></li><li>Starts the Room session <ol><li>If Room session has started successfully: <ol>
 *   <li><a href="#event_peerJoined"><code>peerJoined</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code>
 *   method</a> and connected: <ol><li><a href="#event_serverPeerJoined"><code>serverPeerJoined</code>
 *   event</a> triggers <code>serverPeerType</code> as <code>MCU</code>. <small>MCU has
 *   to be present in the Room in order for Peer connections to commence.</small></li>
 *   <li>Checks for any available Stream <ol>
 *   <li>If <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a>
 *   triggers parameter payload <code>isSelf</code> value as <code>true</code> and <code>stream</code>
 *   as <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 *   <small>User will be sending <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   to Peers.</small></li></ol></li>
 *   <li>Else if <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> is available: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter
 *   payload <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 *   <small>User will be sending <code>getUserMedia()</code> Stream to Peers.</small></li></ol></li><li>Else: <ol>
 *   <li>No Stream will be sent.</li></ol></li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_systemAction"><code>systemAction</code> event</a> triggers
 *   parameter payload <code>action</code> as <code>REJECT</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */

Skylink.prototype.joinRoom = function(room, options, callback) {
  var self = this;
  var selectedRoom = self._defaultRoom;
  var previousRoom = self._selectedRoom;
  var mediaOptions = {};

  if (room && typeof room === 'string') {
    selectedRoom = room;
  } else if (room && typeof room === 'object') {
    mediaOptions = room;
  } else if (typeof room === 'function') {
    callback = room;
  }

  if (options && typeof options === 'object') {
    mediaOptions = options;
  } else if (typeof options === 'function') {
    callback = options;
  }

  var resolveAsErrorFn = function (error, tryRoom, readyState) {
    log.error(error);

    if (typeof callback === 'function') {
      callback({
        room: tryRoom,
        errorCode: readyState || null,
        error: typeof error === 'string' ? new Error(error) : error
      });
    }
  };

  var joinRoomFn = function () {
    self._initSelectedRoom(selectedRoom, function(initError, initSuccess) {
      if (initError) {
        resolveAsErrorFn(initError.error, self._selectedRoom, self._readyState);
        return;
      }

      self._waitForOpenChannel(mediaOptions, function (error, success) {
        if (error) {
          resolveAsErrorFn(error, self._selectedRoom, self._readyState);
          return;
        }

        self.once('peerJoined', function(peerId, peerInfo, isSelf) {
          if (typeof callback === 'function') {
            log.info([null, 'Room', selectedRoom, 'Connected to Room ->'], peerInfo);

            callback(null, {
              room: self._selectedRoom,
              peerId: peerId,
              peerInfo: peerInfo
            });
          }
        }, function(peerId, peerInfo, isSelf) {
          return peerInfo.room === selectedRoom && isSelf;
        });

        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.JOIN_ROOM,
          uid: self._user.uid,
          cid: self._key,
          rid: self._room.id,
          userCred: self._user.token,
          timeStamp: self._user.timeStamp,
          apiOwner: self._appKeyOwner,
          roomCred: self._room.token,
          start: self._room.startDateTime,
          len: self._room.duration,
          isPrivileged: self._isPrivileged === true, // Default to false if undefined
          autoIntroduce: self._autoIntroduce !== false, // Default to true if undefined
          key: self._appKey
        });
      });
    });
  };

  if (room === null || ['number', 'boolean'].indexOf(typeof room) > -1) {
    resolveAsErrorFn('Invalid room name is provided', room);
    return;
  }

  if (options === null || ['number', 'boolean'].indexOf(typeof options) > -1) {
    resolveAsErrorFn('Invalid mediaOptions is provided', selectedRoom);
    return;
  }

  if (self._inRoom) {
    var stopStream = mediaOptions.audio === false && mediaOptions.video === false;

    self.leaveRoom(stopStream, function (lRError, lRSuccess) {
      log.debug([null, 'Room', previousRoom, 'Leave Room callback result ->'], [lRError, lRSuccess]);
      joinRoomFn();
    });
  } else {
    joinRoomFn();
  }
};

/**
 * <blockquote class="info">
 *   Note that this method will close any existing socket channel connection despite not being in the Room.
 * </blockquote>
 * Function that stops Room session.
 * @method leaveRoom
 * @param {Boolean|JSON} [stopMediaOptions=true] The flag if <code>leaveRoom()</code>
 *   should stop both <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>
 *   and <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * - When provided as a boolean, this sets both <code>stopMediaOptions.userMedia</code>
 *   and <code>stopMediaOptions.screenshare</code> to its boolean value.
 * @param {Boolean} [stopMediaOptions.userMedia=true] The flag if <code>leaveRoom()</code>
 *   should stop <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 *   <small>This invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</small>
 * @param {Boolean} [stopMediaOptions.screenshare=true] The flag if <code>leaveRoom()</code>
 *   should stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 *   <small>This invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_peerLeft">
 *   <code>peerLeft</code> event</a> triggering <code>isSelf</code> parameter payload value as <code>true</code>
 *   for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>leaveRoom()</code> error when stopping Room session.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.peerId The User's Room session Peer ID.
 * @param {String} callback.success.previousRoom The Room name.
 * @trigger <ol class="desc-seq">
 *   <li>If Socket connection is opened: <ol><li><a href="#event_channelClose"><code>channelClose</code> event</a> triggers.</li></ol></li>
 *   <li>Checks if User is in Room. <ol><li>If User is not in a Room: <ol><li><b>ABORT</b> and return error.</li>
 *   </ol></li><li>Else: <ol><li>If parameter <code>stopMediaOptions.userMedia</code> value is <code>true</code>: <ol>
 *   <li>Invoke <a href="#method_stopStream"><code>stopStream()</code> method</a>.
 *   <small>Regardless of request errors, <code>leaveRoom()</code> will still proceed.</small></li></ol></li>
 *   <li>If parameter <code>stopMediaOptions.screenshare</code> value is <code>true</code>: <ol>
 *   <li>Invoke <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.
 *   <small>Regardless of request errors, <code>leaveRoom()</code> will still proceed.</small></li></ol></li>
 *   <li><a href="#event_peerLeft"><code>peerLeft</code> event</a> triggers for User and all connected Peers in Room.</li>
 *   <li>If MCU is enabled for the App Key provided in <a href="#method_init"><code>init()</code> method</a>
 *   and connected: <ol><li><a href="#event_serverPeerLeft"><code>serverPeerLeft</code> event</a>
 *   triggers parameter payload <code>serverPeerType</code> as <code>MCU</code>.</li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.leaveRoom = function(stopMediaOptions, callback) {
  var self = this;
  var stopUserMedia = true;
  var stopScreenshare = true;
  var previousRoom = self._selectedRoom;
  var previousUserPeerId = self._user ? self._user.sid : null;
  var peersThatLeft = [];
  var isNotInRoom = !self._inRoom;

  if (typeof stopMediaOptions === 'boolean') {
    if (stopMediaOptions === false) {
      stopUserMedia = false;
      stopScreenshare = false;
    }
  } else if (stopMediaOptions && typeof stopMediaOptions === 'object') {
    stopUserMedia = stopMediaOptions.userMedia !== false;
    stopScreenshare = stopMediaOptions.screenshare !== false;
  } else if (typeof stopMediaOptions === 'function') {
    callback = stopMediaOptions;
  }

  for (var infoPeerId in self._peerInformations) {
    if (self._peerInformations.hasOwnProperty(infoPeerId) && self._peerInformations[infoPeerId]) {
      peersThatLeft.push(infoPeerId);
      self._removePeer(infoPeerId);
    }
  }

  for (var connPeerId in self._peerConnections) {
    if (self._peerConnections.hasOwnProperty(connPeerId) && self._peerConnections[connPeerId]) {
      if (peersThatLeft.indexOf(connPeerId) === -1) {
        peersThatLeft.push(connPeerId);
        self._removePeer(connPeerId);
      }
    }
  }

  self._inRoom = false;
  self._closeChannel();

  if (isNotInRoom) {
    var notInRoomError = 'Unable to leave room as user is not in any room';
    log.error([null, 'Room', previousRoom, notInRoomError]);

    if (typeof callback === 'function') {
      callback(new Error(notInRoomError), null);
    }
    return;
  }

  self._stopStreams({
    userMedia: stopUserMedia,
    screenshare: stopScreenshare
  });

  self._wait(function () {
    log.log([null, 'Room', previousRoom, 'User left the room']);

    self._trigger('peerLeft', previousUserPeerId, self.getPeerInfo(), true,
      self._publishOnly && self._publishOnly.parentId ? self._publishOnly.parentId : null);

    if (typeof callback === 'function') {
      callback(null, {
        peerId: previousUserPeerId,
        previousRoom: previousRoom
      });
    }
  }, function () {
    return !self._channelOpen;
  });
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that locks the current Room when in session to prevent other Peers from joining the Room.
 * @method lockRoom
 * @trigger <ol class="desc-seq">
 *   <li>Requests to Signaling server to lock Room <ol>
 *   <li><a href="#event_roomLock"><code>roomLock</code> event</a> triggers parameter payload
 *   <code>isLocked</code> value as <code>true</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.lockRoom = function() {
  log.log('Update to isRoomLocked status ->', true);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: true
  });
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that unlocks the current Room when in session to allow other Peers to join the Room.
 * @method unlockRoom
 * @trigger <ol class="desc-seq">
 *   <li>Requests to Signaling server to unlock Room <ol>
 *   <li><a href="#event_roomLock"><code>roomLock</code> event</a> triggers parameter payload
 *   <code>isLocked</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.5.0
 */
Skylink.prototype.unlockRoom = function() {
  log.log('Update to isRoomLocked status ->', false);
  this._sendChannelMessage({
    type: this._SIG_MESSAGE_TYPE.ROOM_LOCK,
    mid: this._user.sid,
    rid: this._room.id,
    lock: false
  });
};

/**
 * Function that waits for Socket connection to Signaling to be opened.
 * @method _waitForOpenChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._waitForOpenChannel = function(mediaOptions, callback) {
  var self = this;
  // when reopening room, it should stay as 0
  self._socketCurrentReconnectionAttempt = 0;

  // wait for ready state before opening
  self._wait(function() {
    self._condition('channelOpen', function() {
      mediaOptions = mediaOptions || {};

      self._userData = mediaOptions.userData || self._userData || '';
      self._streamsBandwidthSettings = {
        googleX: {},
        bAS: {}
      };
      self._publishOnly = false;
      self._sdpSettings = {
        connection: {
          audio: true,
          video: true,
          data: true
        },
        direction: {
          audio: { send: true, receive: true },
          video: { send: true, receive: true }
        }
      };

      if (mediaOptions.bandwidth) {
        if (typeof mediaOptions.bandwidth.audio === 'number') {
          self._streamsBandwidthSettings.bAS.audio = mediaOptions.bandwidth.audio;
        }

        if (typeof mediaOptions.bandwidth.video === 'number') {
          self._streamsBandwidthSettings.bAS.video = mediaOptions.bandwidth.video;
        }

        if (typeof mediaOptions.bandwidth.data === 'number') {
          self._streamsBandwidthSettings.bAS.data = mediaOptions.bandwidth.data;
        }
      }

      if (mediaOptions.googleXBandwidth) {
        if (typeof mediaOptions.googleXBandwidth.min === 'number') {
          self._streamsBandwidthSettings.googleX.min = mediaOptions.googleXBandwidth.min;
        }

        if (typeof mediaOptions.googleXBandwidth.max === 'number') {
          self._streamsBandwidthSettings.googleX.max = mediaOptions.googleXBandwidth.max;
        }
      }

      if (mediaOptions.sdpSettings) {
        if (mediaOptions.sdpSettings.direction) {
          if (mediaOptions.sdpSettings.direction.audio) {
            self._sdpSettings.direction.audio.receive = typeof mediaOptions.sdpSettings.direction.audio.receive === 'boolean' ?
              mediaOptions.sdpSettings.direction.audio.receive : true;
            self._sdpSettings.direction.audio.send = typeof mediaOptions.sdpSettings.direction.audio.send === 'boolean' ?
              mediaOptions.sdpSettings.direction.audio.send : true;
          }

          if (mediaOptions.sdpSettings.direction.video) {
            self._sdpSettings.direction.video.receive = typeof mediaOptions.sdpSettings.direction.video.receive === 'boolean' ?
              mediaOptions.sdpSettings.direction.video.receive : true;
            self._sdpSettings.direction.video.send = typeof mediaOptions.sdpSettings.direction.video.send === 'boolean' ?
              mediaOptions.sdpSettings.direction.video.send : true;
          }
        }
        if (mediaOptions.sdpSettings.connection) {
          self._sdpSettings.connection.audio = typeof mediaOptions.sdpSettings.connection.audio === 'boolean' ?
            mediaOptions.sdpSettings.connection.audio : true;
          self._sdpSettings.connection.video = typeof mediaOptions.sdpSettings.connection.video === 'boolean' ?
            mediaOptions.sdpSettings.connection.video : true;
          self._sdpSettings.connection.data = typeof mediaOptions.sdpSettings.connection.data === 'boolean' ?
            mediaOptions.sdpSettings.connection.data : true;
        }
      }

      if (mediaOptions.publishOnly) {
        self._sdpSettings.direction.audio.send = true;
        self._sdpSettings.direction.audio.receive = false;
        self._sdpSettings.direction.video.send = true;
        self._sdpSettings.direction.video.receive = false;
        self._publishOnly = { parentId: null };

        if (typeof mediaOptions.publishOnly === 'object' && mediaOptions.publishOnly.parentId &&
          typeof mediaOptions.publishOnly.parentId === 'string') {
          self._publishOnly.parentId = mediaOptions.publishOnly.parentId;
        }
      }

      // get the stream
      if (mediaOptions.manualGetUserMedia === true) {
        self._trigger('mediaAccessRequired');

        var current50Block = 0;
        var mediaAccessRequiredFailure = false;
        // wait for available audio or video stream
        self._wait(function () {
          if (mediaAccessRequiredFailure === true) {
            self._onUserMediaError(new Error('Waiting for stream timeout'), false, false);
          } else {
            callback(null, self._streams.userMedia.stream);
          }
        }, function () {
          current50Block += 1;
          if (current50Block === 600) {
            mediaAccessRequiredFailure = true;
            return true;
          }

          if (self._streams.userMedia && self._streams.userMedia.stream) {
            return true;
          }
        }, 50);
        return;
      }

      if (mediaOptions.audio || mediaOptions.video) {
        self.getUserMedia({
          useExactConstraints: !!mediaOptions.useExactConstraints,
          audio: mediaOptions.audio,
          video: mediaOptions.video

        }, function (error, success) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, success);
          }
        });
        return;
      }

      callback(null, null);

    }, function() { // open channel first if it's not opened

      if (!self._channelOpen) {
        self._openChannel();
      }
      return self._channelOpen;
    }, function(state) {
      return true;
    });
  }, function() {
    return self._readyState === self.READY_STATE_CHANGE.COMPLETED;
  });

};

Skylink.prototype.VERSION = '0.6.16';

/**
 * The list of <a href="#method_init"><code>init()</code> method</a> ready states.
 * @attribute READY_STATE_CHANGE
 * @param {Number} INIT      <small>Value <code>0</code></small>
 *   The value of the state when <code>init()</code> has just started.
 * @param {Number} LOADING   <small>Value <code>1</code></small>
 *   The value of the state when <code>init()</code> is authenticating App Key provided
 *   (and with credentials if provided as well) with the Auth server.
 * @param {Number} COMPLETED <small>Value <code>2</code></small>
 *   The value of the state when <code>init()</code> has successfully authenticated with the Auth server.
 *   Room session token is generated for joining the <code>defaultRoom</code> provided in <code>init()</code>.
 *   <small>Room session token has to be generated each time User switches to a different Room
 *   in <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.</small>
 * @param {Number} ERROR     <small>Value <code>-1</code></small>
 *   The value of the state when <code>init()</code> has failed authenticating with the Auth server.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.READY_STATE_CHANGE = {
  INIT: 0,
  LOADING: 1,
  COMPLETED: 2,
  ERROR: -1
};

/**
 * The list of <a href="#method_init"><code>init()</code> method</a> ready state failure codes.
 * @attribute READY_STATE_CHANGE_ERROR
 * @param {Number} API_INVALID                 <small>Value <code>4001</code></small>
 *   The value of the failure code when provided App Key in <code>init()</code> does not exists.
 *   <small>To resolve this, check that the provided App Key exists in
 *   <a href="https://console.temasys.io">the Temasys Console</a>.</small>
 * @param {Number} API_DOMAIN_NOT_MATCH        <small>Value <code>4002</code></small>
 *   The value of the failure code when <code>"domainName"</code> property in the App Key does not
 *   match the accessing server IP address.
 *   <small>To resolve this, contact our <a href="http://support.temasys.com.sg">support portal</a>.</small>
 * @param {Number} API_CORS_DOMAIN_NOT_MATCH   <small>Value <code>4003</code></small>
 *   The value of the failure code when <code>"corsurl"</code> property in the App Key does not match accessing CORS.
 *   <small>To resolve this, configure the App Key CORS in
 *   <a href="https://console.temasys.io">the Temasys Console</a>.</small>
 * @param {Number} API_CREDENTIALS_INVALID     <small>Value <code>4004</code></small>
 *   The value of the failure code when there is no [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   present in the HTTP headers during the request to the Auth server present nor
 *   <code>options.credentials.credentials</code> configuration provided in the <code>init()</code>.
 *   <small>To resolve this, ensure that CORS are present in the HTTP headers during the request to the Auth server.</small>
 * @param {Number} API_CREDENTIALS_NOT_MATCH   <small>Value <code>4005</code></small>
 *   The value of the failure code when the <code>options.credentials.credentials</code> configuration provided in the
 *   <code>init()</code> does not match up with the <code>options.credentials.startDateTime</code>,
 *   <code>options.credentials.duration</code> or that the <code>"secret"</code> used to generate
 *   <code>options.credentials.credentials</code> does not match the App Key's <code>"secret</code> property provided.
 *   <small>To resolve this, check that the <code>options.credentials.credentials</code> is generated correctly and
 *   that the <code>"secret"</code> used to generate it is from the App Key provided in the <code>init()</code>.</small>
 * @param {Number} API_INVALID_PARENT_KEY      <small>Value <code>4006</code></small>
 *   The value of the failure code when the App Key provided does not belong to any existing App.
 *   <small>To resolve this, check that the provided App Key exists in
 *   <a href="https://console.temasys.io">the Developer Console</a>.</small>
 * @param {Number} API_NO_MEETING_RECORD_FOUND <small>Value <code>4010</code></small>
 *   The value of the failure code when provided <code>options.credentials</code>
 *   does not match any scheduled meetings available for the "Persistent Room" enabled App Key provided.
 *   <small>See the <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article</a> to learn more.</small>
 * @param {Number} API_OVER_SEAT_LIMIT         <small>Value <code>4020</code></small>
 *   The value of the failure code when App Key has reached its current concurrent users limit.
 *   <small>To resolve this, use another App Key. To create App Keys dynamically, see the
 *   <a href="https://temasys.atlassian.net/wiki/display/TPD/SkylinkAPI+-+Application+Resources">Application REST API
 *   docs</a> for more information.</small>
 * @param {Number} API_RETRIEVAL_FAILED        <small>Value <code>4021</code></small>
 *   The value of the failure code when App Key retrieval of authentication token fails.
 *   <small>If this happens frequently, contact our <a href="http://support.temasys.com.sg">support portal</a>.</small>
 * @param {Number} API_WRONG_ACCESS_DOMAIN     <small>Value <code>5005</code></small>
 *   The value of the failure code when App Key makes request to the incorrect Auth server.
 *   <small>To resolve this, ensure that the <code>roomServer</code> is not configured. If this persists even without
 *   <code>roomServer</code> configuration, contact our <a href="http://support.temasys.com.sg">support portal</a>.</small>
 * @param {Number} XML_HTTP_REQUEST_ERROR      <small>Value <code>-1</code></small>
 *   The value of the failure code when requesting to Auth server has timed out.
 * @param {Number} NO_SOCKET_IO                <small>Value <code>1</code></small>
 *   The value of the failure code when dependency <a href="http://socket.io/download/">Socket.IO client</a> is not loaded.
 *   <small>To resolve this, ensure that the Socket.IO client dependency is loaded before the Skylink SDK.
 *   You may use the provided Socket.IO client <a href="http://socket.io/download/">CDN here</a>.</small>
 * @param {Number} NO_XMLHTTPREQUEST_SUPPORT   <small>Value <code>2</code></small>
 *   The value of the failure code when <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest">
 *   XMLHttpRequest API</a> required to make request to Auth server is not supported.
 *   <small>To resolve this, display in the Web UI to ask clients to switch to the list of supported browser
 *   as <a href="https://github.com/Temasys/SkylinkJS/tree/0.6.14#supported-browsers">listed in here</a>.</small>
 * @param {Number} NO_WEBRTC_SUPPORT           <small>Value <code>3</code></small>
 *   The value of the failure code when <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/">
 *   RTCPeerConnection API</a> required for Peer connections is not supported.
 *   <small>To resolve this, display in the Web UI to ask clients to switch to the list of supported browser
 *   as <a href="https://github.com/Temasys/SkylinkJS/tree/0.6.14#supported-browsers">listed in here</a>.
 *   For <a href="http://confluence.temasys.com.sg/display/TWPP">plugin supported browsers</a>, if the clients
 *   does not have the plugin installed, there will be an installation toolbar that will prompt for installation
 *   to support the RTCPeerConnection API.</small>
 * @param {Number} NO_PATH                     <small>Value <code>4</code></small>
 *   The value of the failure code when provided <code>init()</code> configuration has errors.
 * @param {Number} ADAPTER_NO_LOADED           <small>Value <code>7</code></small>
 *   The value of the failure code when dependency <a href="https://github.com/Temasys/AdapterJS/">AdapterJS</a>
 *   is not loaded.
 *   <small>To resolve this, ensure that the AdapterJS dependency is loaded before the Skylink dependency.
 *   You may use the provided AdapterJS <a href="https://github.com/Temasys/AdapterJS/">CDN here</a>.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.READY_STATE_CHANGE_ERROR = {
  API_INVALID: 4001,
  API_DOMAIN_NOT_MATCH: 4002,
  API_CORS_DOMAIN_NOT_MATCH: 4003,
  API_CREDENTIALS_INVALID: 4004,
  API_CREDENTIALS_NOT_MATCH: 4005,
  API_INVALID_PARENT_KEY: 4006,
  API_NO_MEETING_RECORD_FOUND: 4010,
  API_OVER_SEAT_LIMIT: 4020,
  API_RETRIEVAL_FAILED: 4021,
  API_WRONG_ACCESS_DOMAIN: 5005,
  XML_HTTP_REQUEST_ERROR: -1,
  NO_SOCKET_IO: 1,
  NO_XMLHTTPREQUEST_SUPPORT: 2,
  NO_WEBRTC_SUPPORT: 3,
  NO_PATH: 4,
  ADAPTER_NO_LOADED: 7
};

/**
 * Spoofs the REGIONAL_SERVER to prevent errors on deployed apps except the fact this no longer works.
 * Automatic regional selection has already been implemented hence REGIONAL_SERVER is no longer useful.
 * @attribute REGIONAL_SERVER
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.REGIONAL_SERVER = {
  APAC1: '',
  US1: ''
};

/**
 * Function that generates an <a href="https://en.wikipedia.org/wiki/Universally_unique_identifier">UUID</a> (Unique ID).
 * @method generateUUID
 * @return {String} Returns a generated UUID (Unique ID).
 * @for Skylink
 * @since 0.5.9
 */
/* jshint ignore:start */
Skylink.prototype.generateUUID = function() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r && 0x7 | 0x8)).toString(16);
  });
  return uuid;
};
/* jshint ignore:end */

/**
 * Function that authenticates and initialises App Key used for Room connections.
 * @method init
 * @param {JSON|String} options The configuration options.
 * - When provided as a string, it's configured as <code>options.appKey</code>.
 * @param {String} options.appKey The App Key.
 *   <small>By default, <code>init()</code> uses [HTTP CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
 *   authentication. For credentials based authentication, see the <code>options.credentials</code> configuration
 *   below. You can know more about the <a href="http://support.temasys.com.sg/support/solutions/articles/
 * 12000002712-authenticating-your-application-key-to-start-a-connection">in the authentication methods article here</a>
 *   for more details on the various authentication methods.</small>
 *   <small>If you are using the Persistent Room feature for scheduled meetings, you will require to
 *   use the credential based authentication. See the <a href="http://support.temasys.com.sg/support
 * /solutions/articles/12000002811-using-the-persistent-room-feature-to-configure-meetings">Persistent Room article here
 *   </a> for more information.</small>
 * @param {String} [options.defaultRoom] The default Room to connect to when no <code>room</code> parameter
 *    is provided in  <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.
 * - When not provided or is provided as an empty string, its value is <code>options.appKey</code>.
 *   <small>Note that switching Rooms is not available when using <code>options.credentials</code> based authentication.
 *   The Room that User will be connected to is the <code>defaultRoom</code> provided.</small>
 * @param {String} [options.roomServer] The Auth server.
 * <small>Note that this is a debugging feature and is only used when instructed for debugging purposes.</small>
 * @param {Boolean} [options.enableIceTrickle=true] The flag if Peer connections should
 *   trickle ICE for faster connectivity.
 * @param {Boolean} [options.enableDataChannel=true] The flag if Datachannel connections should be enabled.
 *   <small>This is required to be enabled for <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>,
 *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> and
 *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.</small>
 * @param {Boolean} [options.enableTURNServer=true] The flag if TURN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required and enabled for the App Key.
 * @param {Boolean} [options.enableSTUNServer=true] The flag if STUN ICE servers should
 *   be used when constructing Peer connections to allow TURN connections when required.
 * @param {Boolean} [options.forceTURN=false] The flag if Peer connections should enforce
 *   connections over the TURN server.
 *   <small>This overrides <code>options.enableTURNServer</code> value to <code>true</code> and
 *   <code>options.enableSTUNServer</code> value to <code>false</code>, <code>options.filterCandidatesType.host</code>
 *   value to <code>true</code>, <code>options.filterCandidatesType.srflx</code> value to <code>true</code> and
 *   <code>options.filterCandidatesType.relay</code> value to <code>false</code>.</small>
 *   <small>Note that currently for MCU enabled Peer connections, the <code>options.filterCandidatesType</code>
 *   configuration is not honoured as Peers connected with MCU is similar as a forced TURN connection. The flags
 *   will act as if the value is <code>false</code> and ICE candidates will never be filtered regardless of the
 *   <code>options.filterCandidatesType</code> configuration.</small>
 * @param {Boolean} [options.usePublicSTUN=true] The flag if publicly available STUN ICE servers should
 *   be used if <code>options.enableSTUNServer</code> is enabled.
 * @param {Boolean} [options.TURNServerTransport] <blockquote class="info">
 *   Note that configuring the protocol may not necessarily result in the desired network transports protocol
 *   used in the actual TURN network traffic as it depends which protocol the browser selects and connects with.
 *   This simply configures the TURN ICE server urls <code?transport=(protocol)</code> query option when constructing
 *   the Peer connection. When all protocols are selected, the ICE servers urls are duplicated with all protocols.
 *   </blockquote> The option to configure the <code>?transport=</code>
 *   query parameter in TURN ICE servers when constructing a Peer connections.
 * - When not provided, its value is <code>ANY</code>.
 *   [Rel: Skylink.TURN_TRANSPORT]
 * @param {Boolean} [options.disableVideoFecCodecs=false] <blockquote class="info">
 *   Note that this is an experimental flag and may cause disruptions in connections or connectivity issues when toggled,
 *   and to prevent connectivity issues, these codecs will not be removed for MCU enabled Peer connections.
 *   </blockquote> The flag if video FEC (Forward Error Correction)
 *   codecs like ulpfec and red should be removed in sending session descriptions.
 *   <small>This can be useful for debugging purposes to prevent redundancy and overheads in RTP encoding.</small>
 * @param {Boolean} [options.disableComfortNoiseCodec=false] <blockquote class="info">
 *   Note that this is an experimental flag and may cause disruptions in connections or connectivity issues when toggled.
 *   </blockquote> The flag if audio
 *   <a href="https://en.wikipedia.org/wiki/Comfort_noise">Comfort Noise (CN)</a> codec should be removed
 *   in sending session descriptions.
 *   <small>This can be useful for debugging purposes to test preferred audio quality and feedback.</small>
 * @param {Boolean} [options.disableREMB=false] <blockquote class="info">
 *   Note that this is mainly used for debugging purposes and that it is an experimental flag, so
 *   it may cause disruptions in connections or connectivity issues when toggled. </blockquote>
 *   The flag if video REMB feedback packets should be disabled in sending session descriptions.
 * @param {JSON} [options.credentials] The credentials used for authenticating App Key with
 *   credentials to retrieve the Room session token used for connection in <a href="#method_joinRoom">
 *   <code>joinRoom()</code> method</a>.
 *   <small>Note that switching of Rooms is not allowed when using credentials based authentication, unless
 *   <code>init()</code> is invoked again with a different set of credentials followed by invoking
 *   the <a href="#method_joinRoom"><code>joinRoom()</code> method</a>.</small>
 * @param {String} options.credentials.startDateTime The credentials User session in Room starting DateTime
 *   in <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.
 * @param {Number} options.credentials.duration The credentials User session in Room duration in hours.
 * @param {String} options.credentials.credentials The generated credentials used to authenticate
 *   the provided App Key with its <code>"secret"</code> property.
 *   <blockquote class="details"><h5>To generate the credentials:</h5><ol>
 *   <li>Concatenate a string that consists of the Room name you provide in the <code>options.defaultRoom</code>,
 *   the <code>options.credentials.duration</code> and the <code>options.credentials.startDateTime</code>.
 *   <small>Example: <code>var concatStr = defaultRoom + "_" + duration + "_" + startDateTime;</code></small></li>
 *   <li>Hash the concatenated string with the App Key <code>"secret"</code> property using
 *   <a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1</a>.
 *   <small>Example: <code>var hash = CryptoJS.HmacSHA1(concatStr, appKeySecret);</code></small>
 *   <small>See the <a href="https://code.google.com/p/crypto-js/#HMAC"><code>CryptoJS.HmacSHA1</code> library</a>.</small></li>
 *   <li>Encode the hashed string using <a href="https://en.wikipedia.org/wiki/Base64">base64</a>
 *   <small>Example: <code>var b64Str = hash.toString(CryptoJS.enc.Base64);</code></small>
 *   <small>See the <a href="https://code.google.com/p/crypto-js/#The_Cipher_Output">CryptoJS.enc.Base64</a> library</a>.</small></li>
 *   <li>Encode the base64 encoded string to replace special characters using UTF-8 encoding.
 *   <small>Example: <code>var credentials = encodeURIComponent(base64String);</code></small>
 *   <small>See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/encodeURIComponent">encodeURIComponent() API</a>.</small></li></ol></blockquote>
 * @param {Boolean} [options.audioFallback=false] The flag if <a href="#method_getUserMedia">
 *   <code>getUserMedia()</code> method</a> should fallback to retrieve only audio Stream when
 *   retrieving audio and video Stream fails.
 * @param {Boolean} [options.forceSSL=false] The flag if HTTPS connections should be enforced
 *   during request to Auth server and socket connections to Signaling server
 *   when accessing <code>window.location.protocol</code> value is <code>"http:"</code>.
 *   <small>By default, <code>"https:"</code> protocol connections uses HTTPS connections.</small>
 * @param {String} [options.audioCodec] <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.</blockquote>
 *   The option to configure the preferred audio codec
 *   to use to decode receiving audio data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   <small>Note that Peers may override the receiving audio codec depending on the Peers configuration.</small>
 *   [Rel: Skylink.AUDIO_CODEC]
 * @param {String} [options.videoCodec] <blockquote class="info">
 *   Note that if the video codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.</blockquote>
 *   The option to configure the preferred video codec
 *   to use to decode receiving video data when available for Peer connection.
 * - When not provided, its value is <code>AUTO</code>.
 *   <small>Note that Peers may override the receiving video codec depending on the Peers configuration.</small>
 *   [Rel: Skylink.VIDEO_CODEC]
 * @param {Number} [options.socketTimeout=20000] The timeout for each attempts for socket connection
 *   with the Signaling server to indicate that connection has timed out and has failed to establish.
 *   <small>Note that the mininum timeout value is <code>5000</code>. If less, this value will be <code>5000</code>.</small>
 * @param {Boolean} [options.forceTURNSSL=false] <blockquote class="info">
 *   Note that currently Firefox does not support the TURNS protocol, and that if TURNS is required,
 *   TURN ICE servers using port <code>443</code> will be used instead.</blockquote>
 *   The flag if TURNS protocol should be used when <code>options.enableTURNServer</code> is enabled.
 * @param {JSON} [options.filterCandidatesType] <blockquote class="info">
 *   Note that this a debugging feature and there might be connectivity issues when toggling these flags.
 *   </blockquote> The configuration options to filter the type of ICE candidates sent and received.
 * @param {Boolean} [options.filterCandidatesType.host=false] The flag if local network ICE candidates should be filtered out.
 * @param {Boolean} [options.filterCandidatesType.srflx=false] The flag if STUN ICE candidates should be filtered out.
 * @param {Boolean} [options.filterCandidatesType.relay=false] The flag if TURN ICE candidates should be filtered out.
 * @param {JSON} [options.throttleIntervals] The configuration options to configure the throttling method timeouts.
 * @param {Number} [options.throttleIntervals.shareScreen=10000] The interval timeout for
 *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> throttling in milliseconds.
 * @param {Number} [options.throttleIntervals.getUserMedia=0] The interval timeout for
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> throttling in milliseconds.
 * @param {Number} [options.throttleIntervals.refreshConnection=5000] <blockquote class="info">
 *   Note that this throttling is only done for MCU enabled Peer connections with the
 *   <code>options.mcuUseRenegoRestart</code> being set to <code>false</code>.
 *   </blockquote> The interval timeout for <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a> throttling in milliseconds.
 *   <small>Note that there will be no throttling when <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a> is called internally.</small>
 * @param {Boolean} [options.throttleShouldThrowError=false] The flag if throttled methods should throw errors when
 *   method is invoked less than the interval timeout value configured in <code>options.throttleIntervals</code>.
 * @param {Boolean} [options.mcuUseRenegoRestart=false] The flag if <a href="#method_refreshConnection"><code>
 *   refreshConnection()</code> method</a> should renegotiate like non-MCU enabled Peer connection for MCU
 *   enabled Peer connections instead of invoking <a href="#method_joinRoom"><code>joinRoom()</code> method</a> again.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> <code>state</code> parameter payload value
 *   as <code>COMPLETED</code> for request success.</small>
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {JSON|String} callback.error The error result in request.
 * - When defined as string, it's the error when required App Key is not provided.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {Number} callback.error.errorCode The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.errorCode</code> parameter payload value.
 *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
 * @param {Object} callback.error.error The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.content</code> parameter payload value.
 * @param {Number} callback.error.status The <a href="#event_readyStateChange"><code>readyStateChange</code>
 *   event</a> <code>error.status</code> parameter payload value.
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {String} callback.success.serverUrl The constructed REST URL requested to Auth server.
 * @param {String} callback.success.readyState The current ready state.
 *   [Rel: Skylink.READY_STATE_CHANGE]
 * @param {String} callback.success.selectedRoom The Room based on the current Room session token retrieved for.
 * @param {String} callback.success.appKey The configured value of the <code>options.appKey</code>.
 * @param {String} callback.success.defaultRoom The configured value of the <code>options.defaultRoom</code>.
 * @param {String} callback.success.roomServer The configured value of the <code>options.roomServer</code>.
 * @param {Boolean} callback.success.enableIceTrickle The configured value of the <code>options.enableIceTrickle</code>.
 * @param {Boolean} callback.success.enableDataChannel The configured value of the <code>options.enableDataChannel</code>.
 * @param {Boolean} callback.success.enableTURNServer The configured value of the <code>options.enableTURNServer</code>.
 * @param {Boolean} callback.success.enableSTUNServer The configured value of the <code>options.enableSTUNServer</code>.
 * @param {Boolean} callback.success.TURNTransport The configured value of the <code>options.TURNServerTransport</code>.
 * @param {Boolean} callback.success.audioFallback The configured value of the <code>options.audioFallback</code>.
 * @param {Boolean} callback.success.forceSSL The configured value of the <code>options.forceSSL</code>.
 * @param {String} callback.success.audioCodec The configured value of the <code>options.audioCodec</code>.
 * @param {String} callback.success.videoCodec The configured value of the <code>options.videoCodec</code>.
 * @param {Number} callback.success.socketTimeout The configured value of the <code>options.socketTimeout</code>.
 * @param {Boolean} callback.success.forceTURNSSL The configured value of the <code>options.forceTURNSSL</code>.
 * @param {Boolean} callback.success.forceTURN The configured value of the <code>options.forceTURN</code>.
 * @param {Boolean} callback.success.usePublicSTUN The configured value of the <code>options.usePublicSTUN</code>.
 * @param {Boolean} callback.success.disableVideoFecCodecs The configured value of the <code>options.disableVideoFecCodecs</code>.
 * @param {Boolean} callback.success.disableComfortNoiseCodec The configured value of the <code>options.disableComfortNoiseCodec</code>.
 * @param {Boolean} callback.success.disableREMB The configured value of the <code>options.disableREMB</code>.
 * @param {JSON} callback.success.filterCandidatesType The configured value of the <code>options.filterCandidatesType</code>.
 * @param {Number} callback.success.throttleIntervals The configured value of the <code>options.throttleIntervals</code>.
 * @param {Number} callback.success.throttleShouldThrowError The configured value of the <code>options.throttleShouldThrowError</code>.
 * @param {Number} callback.success.mcuUseRenegoRestart The configured value of the <code>options.mcuUseRenegoRestart</code>.
 * @example
 *   // Example 1: Using CORS authentication and connection to default Room
 *   skylinkDemo(appKey, function (error, success) {
 *     if (error) return;
 *     skylinkDemo.joinRoom(); // Goes to default Room
 *   });
 *
 *   // Example 2: Using CORS authentication and connection to a different Room
 *   skylinkDemo(appKey, function (error, success) {
 *     skylinkDemo.joinRoom("testxx"); // Goes to "testxx" Room
 *   });
 *
 *   // Example 3: Using credentials authentication and connection to only default Room
 *   var defaultRoom   = "test",
 *       startDateTime = (new Date()).toISOString(),
 *       duration      = 1, // Allows only User session to stay for 1 hour
 *       appKeySecret  = "xxxxxxx",
 *       hash          = CryptoJS.HmacSHA1(defaultRoom + "_" + duration + "_" + startDateTime, appKeySecret);
 *       credentials   = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
 *
 *   skylinkDemo({
 *     defaultRoom: defaultRoom,
 *     appKey: appKey,
 *     credentials: {
 *       duration: duration,
 *       startDateTime: startDateTime,
 *       credentials: credentials
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     skylinkDemo.joinRoom(); // Goes to default Room (switching to different Room is not allowed for credentials authentication)
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If parameter <code>options</code> is not provided: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks if dependecies and browser APIs are available. <ol><li>If AdapterJS is not loaded: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code> and <code>error.errorCode</code> as
 *   <code>ADAPTER_NO_LOADED</code>.</li><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If socket.io-client is not loaded: <ol><li><a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code> and <code>error.errorCode</code> as <code>NO_SOCKET_IO</code>.</li>
 *   <li><b>ABORT</b> and return error. </li></ol></li>
 *   <li>If XMLHttpRequest API is not available: <ol><li><a href="#event_readyStateChange">
 *   <code>readyStateChange</code> event</a> triggers parameter payload <code>state</code>
 *   as <code>ERROR</code> and <code>error.errorCode</code> as <code>NO_XMLHTTPREQUEST_SUPPORT</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>If WebRTC is not supported by device: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>ERROR</code> and <code>error.errorCode</code> as
 *   <code>NO_WEBRTC_SUPPORT</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li>
 *   <li>Retrieves Room session token from Auth server. <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LOADING</code>.</li>
 *   <li>If retrieval was successful: <ol><li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>COMPLETED</code>.</li></ol></li><li>Else: <ol>
 *   <li><a href="#event_readyStateChange"><code>readyStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.init = function(options, callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = undefined;
  }

  if (!options) {
    var error = 'No API key provided';
    log.error(error);
    if (typeof callback === 'function'){
      callback(error,null);
    }
    return;
  }

  var appKey, room, defaultRoom;
  var startDateTime, duration, credentials;
  var roomServer = self._roomServer;
  // NOTE: Should we get all the default values from the variables
  // rather than setting it?
  var enableIceTrickle = true;
  var enableDataChannel = true;
  var enableSTUNServer = true;
  var enableTURNServer = true;
  var TURNTransport = self.TURN_TRANSPORT.ANY;
  var audioFallback = false;
  var forceSSL = false;
  var socketTimeout = 20000;
  var forceTURNSSL = false;
  var audioCodec = self.AUDIO_CODEC.AUTO;
  var videoCodec = self.VIDEO_CODEC.AUTO;
  var forceTURN = false;
  var usePublicSTUN = true;
  var disableVideoFecCodecs = false;
  var disableComfortNoiseCodec = false;
  var disableREMB = false;
  var filterCandidatesType = {
    host: false,
    srflx: false,
    relay: false
  };
  var throttleIntervals = {
    shareScreen: 10000,
    refreshConnection: 5000,
    getUserMedia: 0
  };
  var throttleShouldThrowError = false;
  var mcuUseRenegoRestart = false;

  log.log('Provided init options:', options);

  if (typeof options === 'string') {
    // set all the default api key, default room and room
    appKey = options;
    defaultRoom = appKey;
    room = appKey;
  } else {
    // set the api key
    appKey = options.appKey || options.apiKey;
    // set the room server
    roomServer = (typeof options.roomServer === 'string') ?
      options.roomServer : roomServer;
    // check room server if it ends with /. Remove the extra /
    roomServer = (roomServer.lastIndexOf('/') ===
      (roomServer.length - 1)) ? roomServer.substring(0,
      roomServer.length - 1) : roomServer;
    // set the default room
    defaultRoom = (typeof options.defaultRoom === 'string' && options.defaultRoom) ?
      options.defaultRoom : appKey;
    // set the selected room
    room = defaultRoom;
    // set ice trickle option
    enableIceTrickle = (typeof options.enableIceTrickle === 'boolean') ?
      options.enableIceTrickle : enableIceTrickle;
    // set data channel option
    enableDataChannel = (typeof options.enableDataChannel === 'boolean') ?
      options.enableDataChannel : enableDataChannel;
    // set stun server option
    enableSTUNServer = (typeof options.enableSTUNServer === 'boolean') ?
      options.enableSTUNServer : enableSTUNServer;
    // set turn server option
    enableTURNServer = (typeof options.enableTURNServer === 'boolean') ?
      options.enableTURNServer : enableTURNServer;
    // set the force ssl always option
    forceSSL = (typeof options.forceSSL === 'boolean') ?
      options.forceSSL : forceSSL;
    // set the socket timeout option
    socketTimeout = (typeof options.socketTimeout === 'number') ?
      options.socketTimeout : socketTimeout;
    // set the socket timeout option to be above 5000
    socketTimeout = (socketTimeout < 5000) ? 5000 : socketTimeout;
    // set the force turn ssl always option
    forceTURNSSL = (typeof options.forceTURNSSL === 'boolean') ?
      options.forceTURNSSL : forceTURNSSL;
    // set the preferred audio codec
    audioCodec = typeof options.audioCodec === 'string' ?
      options.audioCodec : audioCodec;
    // set the preferred video codec
    videoCodec = typeof options.videoCodec === 'string' ?
      options.videoCodec : videoCodec;
    // set the force turn server option
    forceTURN = (typeof options.forceTURN === 'boolean') ?
      options.forceTURN : forceTURN;
    // set the use public stun option
    usePublicSTUN = (typeof options.usePublicSTUN === 'boolean') ?
      options.usePublicSTUN : usePublicSTUN;
    // set the use of disabling ulpfec and red codecs
    disableVideoFecCodecs = (typeof options.disableVideoFecCodecs === 'boolean') ?
      options.disableVideoFecCodecs : disableVideoFecCodecs;
    // set the use of disabling CN codecs
    disableComfortNoiseCodec = (typeof options.disableComfortNoiseCodec === 'boolean') ?
      options.disableComfortNoiseCodec : disableComfortNoiseCodec;
    // set the use of disabling REMB packets
    disableREMB = (typeof options.disableREMB === 'boolean') ?
      options.disableREMB : disableREMB;
    // set the flag if throttling should throw error when called less than the interval timeout configured
    throttleShouldThrowError = (typeof options.throttleShouldThrowError === 'boolean') ?
      options.throttleShouldThrowError : throttleShouldThrowError;
    // set the flag if MCU refreshConnection() should use renegotiation
    mcuUseRenegoRestart = (typeof options.mcuUseRenegoRestart === 'boolean') ?
      options.mcuUseRenegoRestart : mcuUseRenegoRestart;
    // set the use of filtering ICE candidates
    if (typeof options.filterCandidatesType === 'object' && options.filterCandidatesType) {
      filterCandidatesType.host = (typeof options.filterCandidatesType.host === 'boolean') ?
        options.filterCandidatesType.host : filterCandidatesType.host;
      filterCandidatesType.srflx = (typeof options.filterCandidatesType.srflx === 'boolean') ?
        options.filterCandidatesType.srflx : filterCandidatesType.srflx;
      filterCandidatesType.relay = (typeof options.filterCandidatesType.relay === 'boolean') ?
        options.filterCandidatesType.relay : filterCandidatesType.relay;
    }
    // set the use of throttling interval timeouts
    if (typeof options.throttleIntervals === 'object' && options.throttleIntervals) {
      throttleIntervals.shareScreen = (typeof options.throttleIntervals.shareScreen === 'number') ?
        options.throttleIntervals.shareScreen : throttleIntervals.shareScreen;
      throttleIntervals.refreshConnection = (typeof options.throttleIntervals.refreshConnection === 'number') ?
        options.throttleIntervals.refreshConnection : throttleIntervals.refreshConnection;
      throttleIntervals.getUserMedia = (typeof options.throttleIntervals.getUserMedia === 'number') ?
        options.throttleIntervals.getUserMedia : throttleIntervals.getUserMedia;
    }

    // set turn transport option
    if (typeof options.TURNServerTransport === 'string') {
      // loop out for every transport option
      for (var type in self.TURN_TRANSPORT) {
        if (self.TURN_TRANSPORT.hasOwnProperty(type)) {
          // do a check if the transport option is valid
          if (self.TURN_TRANSPORT[type] === options.TURNServerTransport) {
            TURNTransport = options.TURNServerTransport;
            break;
          }
        }
      }
    }
    // set audio fallback option
    audioFallback = options.audioFallback || audioFallback;
    // Custom default meeting timing and duration
    // Fallback to default if no duration or startDateTime provided
    if (options.credentials &&
      typeof options.credentials.credentials === 'string' &&
      typeof options.credentials.duration === 'number' &&
      typeof options.credentials.startDateTime === 'string') {
      // set start data time
      startDateTime = options.credentials.startDateTime;
      // set the duration
      duration = options.credentials.duration;
      // set the credentials
      credentials = options.credentials.credentials;
    }

    // if force turn option is set to on
    if (forceTURN === true) {
      enableTURNServer = true;
      enableSTUNServer = false;
      filterCandidatesType.host = true;
      filterCandidatesType.srflx = true;
      filterCandidatesType.relay = false;
    }
  }
  // api key path options
  self._appKey = appKey;
  self._roomServer = roomServer;
  self._defaultRoom = defaultRoom;
  self._selectedRoom = room;
  self._path = roomServer + '/api/' + appKey + '/' + room;
  // set credentials if there is
  if (credentials && startDateTime && duration) {
    self._roomStart = startDateTime;
    self._roomDuration = duration;
    self._roomCredentials = credentials;
    self._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
  }

  self._path += ((credentials) ? '&' : '?') + 'rand=' + (new Date()).toISOString();

  // skylink functionality options
  self._enableIceTrickle = enableIceTrickle;
  self._enableDataChannel = enableDataChannel;
  self._enableSTUN = enableSTUNServer;
  self._enableTURN = enableTURNServer;
  self._TURNTransport = TURNTransport;
  self._audioFallback = audioFallback;
  self._forceSSL = forceSSL;
  self._socketTimeout = socketTimeout;
  self._forceTURNSSL = forceTURNSSL;
  self._selectedAudioCodec = audioCodec;
  self._selectedVideoCodec = videoCodec;
  self._forceTURN = forceTURN;
  self._usePublicSTUN = usePublicSTUN;
  self._disableVideoFecCodecs = disableVideoFecCodecs;
  self._disableComfortNoiseCodec = disableComfortNoiseCodec;
  self._filterCandidatesType = filterCandidatesType;
  self._throttlingTimeouts = throttleIntervals;
  self._throttlingShouldThrowError = throttleShouldThrowError;
  self._disableREMB = disableREMB;
  self._mcuUseRenegoRestart = mcuUseRenegoRestart;

  log.log('Init configuration:', {
    serverUrl: self._path,
    readyState: self._readyState,
    appKey: self._appKey,
    roomServer: self._roomServer,
    defaultRoom: self._defaultRoom,
    selectedRoom: self._selectedRoom,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle,
    enableTURNServer: self._enableTURN,
    enableSTUNServer: self._enableSTUN,
    TURNTransport: self._TURNTransport,
    audioFallback: self._audioFallback,
    forceSSL: self._forceSSL,
    socketTimeout: self._socketTimeout,
    forceTURNSSL: self._forceTURNSSL,
    audioCodec: self._selectedAudioCodec,
    videoCodec: self._selectedVideoCodec,
    forceTURN: self._forceTURN,
    usePublicSTUN: self._usePublicSTUN,
    disableVideoFecCodecs: self._disableVideoFecCodecs,
    disableComfortNoiseCodec: self._disableComfortNoiseCodec,
    disableREMB: self._disableREMB,
    filterCandidatesType: self._filterCandidatesType,
    throttleIntervals: self._throttlingTimeouts,
    throttleShouldThrowError: self._throttlingShouldThrowError,
    mcuUseRenegoRestart: self._mcuUseRenegoRestart
  });
  // trigger the readystate
  self._readyState = 0;
  self._trigger('readyStateChange', self.READY_STATE_CHANGE.INIT, null, self._selectedRoom);

  if (typeof callback === 'function'){
    var hasTriggered = false;

    var readyStateChangeFn = function (readyState, error) {
      if (!hasTriggered) {
        if (readyState === self.READY_STATE_CHANGE.COMPLETED) {
          log.log([null, 'Socket', null, 'Firing callback. ' +
          'Ready state change has met provided state ->'], readyState);
          hasTriggered = true;
          self.off('readyStateChange', readyStateChangeFn);
          callback(null,{
            serverUrl: self._path,
            readyState: self._readyState,
            appKey: self._appKey,
            roomServer: self._roomServer,
            defaultRoom: self._defaultRoom,
            selectedRoom: self._selectedRoom,
            enableDataChannel: self._enableDataChannel,
            enableIceTrickle: self._enableIceTrickle,
            enableTURNServer: self._enableTURN,
            enableSTUNServer: self._enableSTUN,
            TURNTransport: self._TURNTransport,
            audioFallback: self._audioFallback,
            forceSSL: self._forceSSL,
            socketTimeout: self._socketTimeout,
            forceTURNSSL: self._forceTURNSSL,
            audioCodec: self._selectedAudioCodec,
            videoCodec: self._selectedVideoCodec,
            forceTURN: self._forceTURN,
            usePublicSTUN: self._usePublicSTUN,
            disableVideoFecCodecs: self._disableVideoFecCodecs,
            disableComfortNoiseCodec: self._disableComfortNoiseCodec,
            disableREMB: self._disableREMB,
            filterCandidatesType: self._filterCandidatesType,
            throttleIntervals: self._throttlingTimeouts,
            throttleShouldThrowError: self._throttlingShouldThrowError,
            mcuUseRenegoRestart: self._mcuUseRenegoRestart
          });
        } else if (readyState === self.READY_STATE_CHANGE.ERROR) {
          log.log([null, 'Socket', null, 'Firing callback. ' +
            'Ready state change has met provided state ->'], readyState);
          log.debug([null, 'Socket', null, 'Ready state met failure'], error);
          hasTriggered = true;
          self.off('readyStateChange', readyStateChangeFn);
          callback({
            error: new Error(error),
            errorCode: error.errorCode,
            status: error.status
          },null);
        }
      }
    };

    self.on('readyStateChange', readyStateChangeFn);
  }

  self._loadInfo();
};

/**
 * Starts retrieving Room credentials information from API server.
 * @method _requestServerInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._requestServerInfo = function(method, url, callback, params) {
  var self = this;
  // XDomainRequest is supported in IE8 - 9
  var useXDomainRequest = typeof window.XDomainRequest === 'function' ||
    typeof window.XDomainRequest === 'object';

  self._socketUseXDR = useXDomainRequest;
  var xhr;

  // set force SSL option
  url = (self._forceSSL) ? 'https:' + url : url;

  if (useXDomainRequest) {
    log.debug([null, 'XMLHttpRequest', method, 'Using XDomainRequest. ' +
      'XMLHttpRequest is now XDomainRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new XDomainRequest();
    xhr.setContentType = function (contentType) {
      xhr.contentType = contentType;
    };
  } else {
    log.debug([null, 'XMLHttpRequest', method, 'Using XMLHttpRequest'], {
      agent: window.webrtcDetectedBrowser,
      version: window.webrtcDetectedVersion
    });
    xhr = new window.XMLHttpRequest();
    xhr.setContentType = function (contentType) {
      xhr.setRequestHeader('Content-type', contentType);
    };
  }

  xhr.onload = function () {
    var response = xhr.responseText || xhr.response;
    var status = xhr.status || 200;
    log.debug([null, 'XMLHttpRequest', method, 'Received sessions parameters'],
      JSON.parse(response || '{}'));
    callback(status, JSON.parse(response || '{}'));
  };

  xhr.onerror = function (error) {
    log.error([null, 'XMLHttpRequest', method, 'Failed retrieving information:'],
      { status: xhr.status });
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: xhr.status || null,
      content: 'Network error occurred. (Status: ' + xhr.status + ')',
      errorCode: self.READY_STATE_CHANGE_ERROR.XML_HTTP_REQUEST_ERROR
    }, self._selectedRoom);
  };

  xhr.onprogress = function () {
    log.debug([null, 'XMLHttpRequest', method,
      'Retrieving information and config from webserver. Url:'], url);
    log.debug([null, 'XMLHttpRequest', method, 'Provided parameters:'], params);
  };

  xhr.open(method, url, true);
  if (params) {
    xhr.setContentType('application/json;charset=UTF-8');
    xhr.send(JSON.stringify(params));
  } else {
    xhr.send();
  }
};

/**
 * Parses the Room credentials information retrieved from API server.
 * @method _parseInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._parseInfo = function(info) {
  log.log('Parsing parameter from server', info);
  if (!info.pc_constraints && !info.offer_constraints) {
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.ERROR, {
      status: 200,
      content: info.info,
      errorCode: info.error
    }, self._selectedRoom);
    return;
  }

  log.debug('Peer connection constraints:', info.pc_constraints);
  log.debug('Offer constraints:', info.offer_constraints);

  this._key = info.cid;
  this._appKeyOwner = info.apiOwner;

  this._signalingServer = info.ipSigserver;
  this._signalingServerPort = null;

  this._isPrivileged = info.isPrivileged;
  this._autoIntroduce = info.autoIntroduce;

  this._user = {
    uid: info.username,
    token: info.userCred,
    timeStamp: info.timeStamp,
    streams: [],
    info: {}
  };
  this._room = {
    id: info.room_key,
    token: info.roomCred,
    startDateTime: info.start,
    duration: info.len,
    connection: {
      peerConstraints: JSON.parse(info.pc_constraints),
      peerConfig: null,
      offerConstraints: JSON.parse(info.offer_constraints),
      sdpConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      },
      mediaConstraints: JSON.parse(info.media_constraints)
    }
  };
  //this._parseDefaultMediaStreamSettings(this._room.connection.mediaConstraints);

  // set the socket ports
  this._socketPorts = {
    'http:': info.httpPortList,
    'https:': info.httpsPortList
  };

  // use default bandwidth and media resolution provided by server
  //this._streamSettings.bandwidth = info.bandwidth;
  //this._streamSettings.video = info.video;
  this._readyState = 2;
  this._trigger('readyStateChange', this.READY_STATE_CHANGE.COMPLETED, null, this._selectedRoom);
  log.info('Parsed parameters from webserver. ' +
    'Ready for web-realtime communication');

};

/**
 * Loads and checks the dependencies if they are loaded correctly.
 * @method _loadInfo
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._loadInfo = function() {
  var self = this;

  // check if adapterjs has been loaded already first or not
  var adapter = (function () {
    try {
      return window.AdapterJS || AdapterJS;
    } catch (error) {
      return false;
    }
  })();

  if (!(!!adapter ? typeof adapter.webRTCReady === 'function' : false)) {
    var noAdapterErrorMsg = 'AdapterJS dependency is not loaded or incorrect AdapterJS dependency is used';
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: noAdapterErrorMsg,
      errorCode: self.READY_STATE_CHANGE_ERROR.ADAPTER_NO_LOADED
    }, self._selectedRoom);
    return;
  }
  if (!window.io) {
    log.error('Socket.io not loaded. Please load socket.io');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'Socket.io not found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO
    }, self._selectedRoom);
    return;
  }
  if (!window.XMLHttpRequest) {
    log.error('XMLHttpRequest not supported. Please upgrade your browser');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'XMLHttpRequest not available',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT
    }, self._selectedRoom);
    return;
  }
  if (!self._path) {
    log.error('Skylink is not initialised. Please call init() first');
    self._readyState = -1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
      status: null,
      content: 'No API Path is found',
      errorCode: self.READY_STATE_CHANGE_ERROR.NO_PATH
    }, self._selectedRoom);
    return;
  }
  adapter.webRTCReady(function () {
    self._isUsingPlugin = !!adapter.WebRTCPlugin.plugin && !!adapter.WebRTCPlugin.plugin.VERSION;

    if (!window.RTCPeerConnection) {
      log.error('WebRTC not supported. Please upgrade your browser');
      self._readyState = -1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
        status: null,
        content: 'WebRTC not available',
        errorCode: self.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT
      }, self._selectedRoom);
      return;
    }
    self._readyState = 1;
    self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING, null, self._selectedRoom);
    self._requestServerInfo('GET', self._path, function(status, response) {
      if (status !== 200) {
        // 403 - Room is locked
        // 401 - API Not authorized
        // 402 - run out of credits
        var errorMessage = 'XMLHttpRequest status not OK\nStatus was: ' + status;
        self._readyState = 0;
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR, {
          status: status,
          content: (response) ? (response.info || errorMessage) : errorMessage,
          errorCode: response.error ||
            self.READY_STATE_CHANGE_ERROR.INVALID_XMLHTTPREQUEST_STATUS
        }, self._selectedRoom);
        return;
      }
      self._parseInfo(response);
    });
  });
};

/**
 * Starts initialising for Room credentials for room name provided in <code>joinRoom()</code> method.
 * @method _initSelectedRoom
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._initSelectedRoom = function(room, callback) {
  var self = this;
  if (typeof room === 'function' || typeof room === 'undefined') {
    log.error('Invalid room provided. Room:', room);
    return;
  }
  var defaultRoom = self._defaultRoom;
  var initOptions = {
    appKey: self._appKey,
    roomServer: self._roomServer,
    defaultRoom: room,
    enableDataChannel: self._enableDataChannel,
    enableIceTrickle: self._enableIceTrickle,
    enableTURNServer: self._enableTURN,
    enableSTUNServer: self._enableSTUN,
    TURNServerTransport: self._TURNTransport,
    audioFallback: self._audioFallback,
    forceSSL: self._forceSSL,
    socketTimeout: self._socketTimeout,
    forceTURNSSL: self._forceTURNSSL,
    audioCodec: self._selectedAudioCodec,
    videoCodec: self._selectedVideoCodec,
    forceTURN: self._forceTURN,
    usePublicSTUN: self._usePublicSTUN,
    disableVideoFecCodecs: self._disableVideoFecCodecs,
    disableComfortNoiseCodec: self._disableComfortNoiseCodec,
    disableREMB: self._disableREMB,
    filterCandidatesType: self._filterCandidatesType,
    throttleIntervals: self._throttlingTimeouts,
    throttleShouldThrowError: self._throttlingShouldThrowError,
    mcuUseRenegoRestart: self._mcuUseRenegoRestart
  };
  if (self._roomCredentials) {
    initOptions.credentials = {
      credentials: self._roomCredentials,
      duration: self._roomDuration,
      startDateTime: self._roomStart
    };
  }
  self.init(initOptions, function (error, success) {
    self._defaultRoom = defaultRoom;
    if (error) {
      callback(error, null);
    } else {
      callback(null, success);
    }
  });
};


Skylink.prototype.LOG_LEVEL = {
  DEBUG: 4,
  LOG: 3,
  INFO: 2,
  WARN: 1,
  ERROR: 0,
  NONE: -1
};

/**
 * Stores the log message starting header string.
 * E.g. "<header> - <the log message>".
 * @attribute _LOG_KEY
 * @type String
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _LOG_KEY = 'SkylinkJS';

/**
 * Stores the list of available SDK log levels.
 * @attribute _LOG_LEVELS
 * @type Array
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _LOG_LEVELS = ['error', 'warn', 'info', 'log', 'debug'];

/**
 * Stores the current SDK log level.
 * Default is ERROR (<code>0</code>).
 * @attribute _logLevel
 * @type String
 * @default 0
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _logLevel = 0;

/**
 * Stores the flag if debugging mode is enabled.
 * This manipulates the SkylinkLogs interface.
 * @attribute _enableDebugMode
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var _enableDebugMode = false;

/**
 * Stores the flag if logs should be stored in SkylinkLogs interface.
 * @attribute _enableDebugStack
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugStack = false;

/**
 * Stores the flag if logs should trace if available.
 * This uses the <code>console.trace</code> API.
 * @attribute _enableDebugTrace
 * @type Boolean
 * @default false
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _enableDebugTrace = false;

/**
 * Stores the logs used for SkylinkLogs object.
 * @attribute _storedLogs
 * @type Array
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _storedLogs = [];

/**
 * Function that gets the stored logs.
 * @method _getStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _getStoredLogsFn = function (logLevel) {
  if (typeof logLevel === 'undefined') {
    return _storedLogs;
  }
  var returnLogs = [];
  for (var i = 0; i < _storedLogs.length; i++) {
    if (_storedLogs[i][1] === _LOG_LEVELS[logLevel]) {
      returnLogs.push(_storedLogs[i]);
    }
  }
  return returnLogs;
};

/**
 * Function that clears the stored logs.
 * @method _clearAllStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _clearAllStoredLogsFn = function () {
  _storedLogs = [];
};

/**
 * Function that prints in the Web Console interface the stored logs.
 * @method _printAllStoredLogsFn
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _printAllStoredLogsFn = function () {
  for (var i = 0; i < _storedLogs.length; i++) {
    var timestamp = _storedLogs[i][0];
    var log = (console[_storedLogs[i][1]] !== 'undefined') ?
      _storedLogs[i][1] : 'log';
    var message = _storedLogs[i][2];
    var debugObject = _storedLogs[i][3];

    if (typeof debugObject !== 'undefined') {
      console[log](message, debugObject, timestamp);
    } else {
      console[log](message, timestamp);
    }
  }
};

/**
 * <blockquote class="info">
 *   To utilise and enable the <code>SkylinkLogs</code> API functionalities, the
 *   <a href="#method_setDebugMode"><code>setDebugMode()</code> method</a>
 *   <code>options.storeLogs</code> parameter has to be enabled.
 * </blockquote>
 * The object interface to manage the SDK <a href="https://developer.mozilla.org/en/docs/Web/API/console">
 * Javascript Web Console</a> logs.
 * @property SkylinkLogs
 * @type JSON
 * @global true
 * @for Skylink
 * @since 0.5.5
 */
window.SkylinkLogs = {
  /**
   * Function that gets the current stored SDK <code>console</code> logs.
   * @property SkylinkLogs.getLogs
   * @param {Number} [logLevel] The specific log level of logs to return.
   * - When not provided or that the level does not exists, it will return all logs of all levels.
   *  [Rel: Skylink.LOG_LEVEL]
   * @return {Array} The array of stored logs.<ul>
   *   <li><code><#index></code><var><b>{</b>Array<b>}</b></var><p>The stored log item.</p><ul>
   *   <li><code>0</code><var><b>{</b>Date<b>}</b></var><p>The DateTime of when the log was stored.</p></li>
   *   <li><code>1</code><var><b>{</b>String<b>}</b></var><p>The log level. [Rel: Skylink.LOG_LEVEL]</p></li>
   *   <li><code>2</code><var><b>{</b>String<b>}</b></var><p>The log message.</p></li>
   *   <li><code>3</code><var><b>{</b>Any<b>}</b></var><span class="label">Optional</span><p>The log message object.
   *   </p></li></ul></li></ul>
   * @example
   *  // Example 1: Get logs of specific level
   *  var debugLogs = SkylinkLogs.getLogs(skylinkDemo.LOG_LEVEL.DEBUG);
   *
   *  // Example 2: Get all the logs
   *  var allLogs = SkylinkLogs.getLogs();
   * @type Function
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  getLogs: _getStoredLogsFn,

  /**
   * Function that clears all the current stored SDK <code>console</code> logs.
   * @property SkylinkLogs.clearAllLogs
   * @type Function
   * @example
   *   // Example 1: Clear all the logs
   *   SkylinkLogs.clearAllLogs();
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  clearAllLogs: _clearAllStoredLogsFn,

  /**
   * Function that prints all the current stored SDK <code>console</code> logs into the
   * <a href="https://developer.mozilla.org/en/docs/Web/API/console">Javascript Web Console</a>.
   * @property SkylinkLogs.printAllLogs
   * @type Function
   * @example
   *   // Example 1: Print all the logs
   *   SkylinkLogs.printAllLogs();
   * @global true
   * @triggerForPropHackNone true
   * @for Skylink
   * @since 0.5.5
   */
  printAllLogs: _printAllStoredLogsFn
};

/**
 * Function that handles the logs received and prints in the Web Console interface according to the log level set.
 * @method _logFn
 * @private
 * @required
 * @scoped true
 * @for Skylink
 * @since 0.5.5
 */
var _logFn = function(logLevel, message, debugObject) {
  var outputLog = _LOG_KEY;

  if (typeof message === 'object') {
    outputLog += (message[0]) ? ' [' + message[0] + '] -' : ' -';
    outputLog += (message[1]) ? ' <<' + message[1] + '>>' : '';
    if (message[2]) {
      outputLog += ' ';
      if (typeof message[2] === 'object') {
        for (var i = 0; i < message[2].length; i++) {
          outputLog += '(' + message[2][i] + ')';
        }
      } else {
        outputLog += '(' + message[2] + ')';
      }
    }
    outputLog += ' ' + message[3];
  } else {
    outputLog += ' - ' + message;
  }

  if (_enableDebugMode && _enableDebugStack) {
    // store the logs
    var logItem = [(new Date()), _LOG_LEVELS[logLevel], outputLog];

    if (typeof debugObject !== 'undefined') {
      logItem.push(debugObject);
    }
    _storedLogs.push(logItem);
  }

  if (_logLevel >= logLevel) {
    // Fallback to log if failure
    logLevel = (typeof console[_LOG_LEVELS[logLevel]] === 'undefined') ? 3 : logLevel;

    if (_enableDebugMode && _enableDebugTrace) {
      var logConsole = (typeof console.trace === 'undefined') ? logLevel[3] : 'trace';
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
        // output if supported
        if (typeof console.trace !== 'undefined') {
          console.trace('');
        }
      }
    } else {
      if (typeof debugObject !== 'undefined') {
        console[_LOG_LEVELS[logLevel]](outputLog, debugObject);
      } else {
        console[_LOG_LEVELS[logLevel]](outputLog);
      }
    }
  }
};

/**
 * Stores the logging functions.
 * @attribute log
 * @param {Function} debug The function that handles the DEBUG level logs.
 * @param {Function} log The function that handles the LOG level logs.
 * @param {Function} info The function that handles the INFO level logs.
 * @param {Function} warn The function that handles the WARN level logs.
 * @param {Function} error The function that handles the ERROR level logs.
 * @type JSON
 * @private
 * @scoped true
 * @for Skylink
 * @since 0.5.4
 */
var log = {
  debug: function (message, object) {
    _logFn(4, message, object);
  },

  log: function (message, object) {
    _logFn(3, message, object);
  },

  info: function (message, object) {
    _logFn(2, message, object);
  },

  warn: function (message, object) {
    _logFn(1, message, object);
  },

  error: function (message, object) {
    _logFn(0, message, object);
  }
};

/**
 * Function that configures the level of <code>console</code> API logs to be printed in the
 * <a href="https://developer.mozilla.org/en/docs/Web/API/console">Javascript Web Console</a>.
 * @method setLogLevel
 * @param {Number} [logLevel] The specific log level of logs to return.
 * - When not provided or that the level does not exists, it will not overwrite the current log level.
 *   <small>By default, the initial log level is <code>ERROR</code>.</small>
 *   [Rel: Skylink.LOG_LEVEL]
 * @example
 *   // Example 1: Print all of the console.debug, console.log, console.info, console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.DEBUG);
 *
 *   // Example 2: Print only the console.log, console.info, console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.LOG);
 *
 *   // Example 3: Print only the console.info, console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.INFO);
 *
 *   // Example 4: Print only the console.warn and console.error logs.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.WARN);
 *
 *   // Example 5: Print only the console.error logs. This is done by default.
 *   skylinkDemo.setLogLevel(skylinkDemo.LOG_LEVEL.ERROR);
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.setLogLevel = function(logLevel) {
  if(logLevel === undefined) {
    logLevel = Skylink.LOG_LEVEL.WARN;
  }
  for (var level in this.LOG_LEVEL) {
    if (this.LOG_LEVEL[level] === logLevel) {
      _logLevel = logLevel;
      log.log([null, 'Log', level, 'Log level exists. Level is set']);
      return;
    }
  }
  log.error([null, 'Log', level, 'Log level does not exist. Level is not set']);
};

/**
 * Function that configures the debugging mode of the SDK.
 * @method setDebugMode
 * @param {Boolean|JSON} [options=false] The debugging options.
 * - When provided as a boolean, this sets both <code>options.trace</code>
 *   and <code>options.storeLogs</code> to its boolean value.
 * @param {Boolean} [options.trace=false] The flag if SDK <code>console</code> logs
 *   should output as <code>console.trace()</code> logs for tracing the <code>Function</code> call stack.
 *   <small>Note that the <code>console.trace()</code> output logs is determined by the log level set
 *   <a href="#method_setLogLevel"><code>setLogLevel()</code> method</a>.</small>
 *   <small>If <code>console.trace()</code> API is not supported, <code>setDebugMode()</code>
 *   will fallback to use <code>console.log()</code> API.</small>
 * @param {Boolean} [options.storeLogs=false] The flag if SDK should store the <code>console</code> logs.
 *   <small>This is required to be enabled for <a href="#prop_SkylinkLogs"><code>SkylinkLogs</code> API</a>.</small>
 * @example
 *   // Example 1: Enable both options.storeLogs and options.trace
 *   skylinkDemo.setDebugMode(true);
 *
 *   // Example 2: Enable only options.storeLogs
 *   skylinkDemo.setDebugMode({ storeLogs: true });
 *
 *   // Example 3: Disable debugging mode
 *   skylinkDemo.setDebugMode();
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype.setDebugMode = function(isDebugMode) {
  if (typeof isDebugMode === 'object') {
    if (Object.keys(isDebugMode).length > 0) {
      _enableDebugTrace = !!isDebugMode.trace;
      _enableDebugStack = !!isDebugMode.storeLogs;
    } else {
      _enableDebugMode = false;
      _enableDebugTrace = false;
      _enableDebugStack = false;
    }
  }
  if (isDebugMode === false) {
    _enableDebugMode = false;
    _enableDebugTrace = false;
    _enableDebugStack = false;

    return;
  }
  _enableDebugMode = true;
  _enableDebugTrace = true;
  _enableDebugStack = true;
};
var _eventsDocs = {
  /**
   * Event triggered when socket connection to Signaling server has opened.
   * @event channelOpen
   * @for Skylink
   * @since 0.1.0
   */
  channelOpen: [],

  /**
   * Event triggered when socket connection to Signaling server has closed.
   * @event channelClose
   * @for Skylink
   * @since 0.1.0
   */
  channelClose: [],

  /**
   * <blockquote class="info">
   *   Note that this is used only for SDK developer purposes.
   * </blockquote>
   * Event triggered when receiving socket message from the Signaling server.
   * @event channelMessage
   * @param {JSON} message The socket message object.
   * @for Skylink
   * @since 0.1.0
   */
  channelMessage: [],

  /**
   * <blockquote class="info">
   *   This may be caused by Javascript errors in the event listener when subscribing to events.<br>
   *   It may be resolved by checking for code errors in your Web App in the event subscribing listener.<br>
   *   <code>skylinkDemo.on("eventName", function () { // Errors here });</code>
   * </blockquote>
   * Event triggered when socket connection encountered exception.
   * @event channelError
   * @param {Error|String} error The error object.
   * @for Skylink
   * @since 0.1.0
   */
  channelError: [],

  /**
   * Event triggered when attempting to establish socket connection to Signaling server when failed.
   * @event channelRetry
   * @param {String} fallbackType The current fallback state.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @param {Number} currentAttempt The current reconnection attempt.
   * @for Skylink
   * @since 0.5.6
   */
  channelRetry: [],

  /**
   * Event triggered when attempt to establish socket connection to Signaling server has failed.
   * @event socketError
   * @param {Number} errorCode The socket connection error code.
   *   [Rel: Skylink.SOCKET_ERROR]
   * @param {Error|String|Number} error The error object.
   * @param {String} type The fallback state of the socket connection attempt.
   *   [Rel: Skylink.SOCKET_FALLBACK]
   * @for Skylink
   * @since 0.5.5
   */
  socketError: [],

  /**
   * Event triggered when <a href="#method_init"><code>init()</code> method</a> ready state changes.
   * @event readyStateChange
   * @param {Number} readyState The current <code>init()</code> ready state.
   *   [Rel: Skylink.READY_STATE_CHANGE]
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small>
   * @param {Number} error.status The HTTP status code when failed.
   * @param {Number} error.errorCode The ready state change failure code.
   *   [Rel: Skylink.READY_STATE_CHANGE_ERROR]
   * @param {Error} error.content The error object.
   * @param {String} room The Room to The Room to retrieve session token for.
   * @for Skylink
   * @since 0.4.0
   */
  readyStateChange: [],

  /**
   * Event triggered when a Peer connection establishment state has changed.
   * @event handshakeProgress
   * @param {String} state The current Peer connection establishment state.
   *   [Rel: Skylink.HANDSHAKE_PROGRESS]
   * @param {String} peerId The Peer ID.
   * @param {Error|String} [error] The error object.
   *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small>
   * @for Skylink
   * @since 0.3.0
   */
  handshakeProgress: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
   * Event triggered when a Peer connection ICE gathering state has changed.
   * @event candidateGenerationState
   * @param {String} state The current Peer connection ICE gathering state.
   *   [Rel: Skylink.CANDIDATE_GENERATION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  candidateGenerationState: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
   * Event triggered when a Peer connection session description exchanging state has changed.
   * @event peerConnectionState
   * @param {String} state The current Peer connection session description exchanging state.
   *   [Rel: Skylink.PEER_CONNECTION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  peerConnectionState: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.
   * </blockquote>
   * Event triggered when a Peer connection ICE connection state has changed.
   * @event iceConnectionState
   * @param {String} state The current Peer connection ICE connection state.
   *   [Rel: Skylink.ICE_CONNECTION_STATE]
   * @param {String} peerId The Peer ID.
   * @for Skylink
   * @since 0.1.0
   */
  iceConnectionState: [],

  /**
   * Event triggered when retrieval of Stream failed.
   * @event mediaAccessError
   * @param {Error|String} error The error object.
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallbackError The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessError: [],

  /**
   * Event triggered when Stream retrieval fallback state has changed.
   * @event mediaAccessFallback
   * @param {JSON} error The error result.
   * @param {Error|String} error.error The error object.
   * @param {JSON} [error.diff=null] The list of excepted but received audio and video tracks in Stream.
   *   <small>Defined only when <code>state</code> payload is <code>FALLBACKED</code>.</small>
   * @param {JSON} error.diff.video The expected and received video tracks.
   * @param {Number} error.diff.video.expected The expected video tracks.
   * @param {Number} error.diff.video.received The received video tracks.
   * @param {JSON} error.diff.audio The expected and received audio tracks.
   * @param {Number} error.diff.audio.expected The expected audio tracks.
   * @param {Number} error.diff.audio.received The received audio tracks.
   * @param {Number} state The fallback state.
   *   [Rel: Skylink.MEDIA_ACCESS_FALLBACK_STATE]
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   *   <small>Defined only when <code>state</code> payload is <code>FALLBACKED</code>.</small>
   * @for Skylink
   * @since 0.6.3
   */
  mediaAccessFallback: [],

  /**
   * Event triggered when retrieval of Stream is successful.
   * @event mediaAccessSuccess
   * @param {MediaStream} stream The Stream object.
   *   <small>To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.</small>
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.1.0
   */
  mediaAccessSuccess: [],

  /**
   * Event triggered when retrieval of Stream is required to complete <a href="#method_joinRoom">
   * <code>joinRoom()</code> method</a> request.
   * @event mediaAccessRequired
   * @for Skylink
   * @since 0.5.5
   */
  mediaAccessRequired: [],

  /**
   * Event triggered when Stream has stopped streaming.
   * @event mediaAccessStopped
   * @param {Boolean} isScreensharing The flag if event occurred during
   *   <a href="#method_shareScreen"><code>shareScreen()</code> method</a> and not
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
   * @param {Boolean} isAudioFallback The flag if event occurred during
   *   retrieval of audio tracks only when <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
   *   had failed to retrieve both audio and video tracks.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.6
   */
  mediaAccessStopped: [],

  /**
   * Event triggered when a Peer joins the room.
   * @event peerJoined
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   * @param {JSON|String} peerInfo.userData The Peer current custom data.
   * @param {JSON} peerInfo.settings The Peer sending Stream settings.
   * @param {Boolean|JSON} peerInfo.settings.audio The Peer Stream audio settings.
   *   <small>When defined as <code>false</code>, it means there is no audio being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.audio.stereo</code> value is
   *   considered as <code>false</code> and the <code>peerInfo.settings.audio.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {Boolean} peerInfo.settings.audio.stereo The flag if stereo band is configured
   *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for receiving audio data.
   * @param {Boolean} [peerInfo.settings.audio.usedtx] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The flag if DTX (Discontinuous Transmission) is configured when encoding audio codec
   *   is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This might help to reduce bandwidth it reduces the bitrate during silence or background noise.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Boolean} [peerInfo.settings.audio.useinbandfec] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The flag if capability to take advantage of in-band FEC (Forward Error Correction) is
   *   configured when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This might help to reduce the harm of packet loss by encoding information about the previous packet.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Number} [peerInfo.settings.audio.maxplaybackrate] <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
   *   The maximum output sampling rate rendered in Hertz (Hz) when encoding audio codec is
   *   <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
   *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
   *   <small>When not defined, the default browser configuration is used.</small>
   * @param {Boolean} peerInfo.settings.audio.echoCancellation The flag if echo cancellation is enabled for audio tracks.
   * @param {Array} [peerInfo.settings.audio.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>audio: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.audio.deviceId] The Peer Stream audio track source ID of the device used.
   * @param {Boolean} peerInfo.settings.audio.exactConstraints The flag if Peer Stream audio track is sending exact
   *   requested values of <code>peerInfo.settings.audio.deviceId</code> when provided.
   * @param {Boolean|JSON} peerInfo.settings.video The Peer Stream video settings.
   *   <small>When defined as <code>false</code>, it means there is no video being sent from Peer.</small>
   *   <small>When defined as <code>true</code>, the <code>peerInfo.settings.video.screenshare</code> value is
   *   considered as <code>false</code>  and the <code>peerInfo.settings.video.exactConstraints</code>
   *   value is considered as <code>false</code>.</small>
   * @param {JSON} [peerInfo.settings.video.resolution] The Peer Stream video resolution.
   *   [Rel: Skylink.VIDEO_RESOLUTION]
   * @param {Number|JSON} peerInfo.settings.video.resolution.width The Peer Stream video resolution width or
   *   video resolution width settings.
   *   <small>When defined as a JSON object, it is the user set resolution width settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Number|JSON} peerInfo.settings.video.resolution.height The Peer Stream video resolution height or
   *   video resolution height settings.
   *   <small>When defined as a JSON object, it is the user set resolution height settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Number|JSON} [peerInfo.settings.video.frameRate] The Peer Stream video
   *   <a href="https://en.wikipedia.org/wiki/Frame_rate">frameRate</a> per second (fps) or video frameRate settings.
   *   <small>When defined as a JSON object, it is the user set frameRate settings with (<code>"min"</code> or
   *   <code>"max"</code> or <code>"ideal"</code> or <code>"exact"</code> etc configurations).</small>
   * @param {Boolean} peerInfo.settings.video.screenshare The flag if Peer Stream is a screensharing Stream.
   * @param {Array} [peerInfo.settings.video.optional] The Peer Stream <code>navigator.getUserMedia()</code> API
   *   <code>video: { optional [..] }</code> property.
   * @param {String} [peerInfo.settings.video.deviceId] The Peer Stream video track source ID of the device used.
   * @param {Boolean} peerInfo.settings.video.exactConstraints The flag if Peer Stream video track is sending exact
   *   requested values of <code>peerInfo.settings.video.resolution</code>,
   *   <code>peerInfo.settings.video.frameRate</code> and <code>peerInfo.settings.video.deviceId</code>
   *   when provided.
   * @param {JSON} peerInfo.settings.bandwidth The maximum streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.audio] The maximum audio streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.video] The maximum video streaming bandwidth sent from Peer.
   * @param {Number} [peerInfo.settings.bandwidth.data] The maximum data streaming bandwidth sent from Peer.
   * @param {JSON} peerInfo.settings.googleXBandwidth <blockquote class="info">
   *   Note that this feature might not work depending on the browser support and implementation,
   *   and its properties and values are only defined for User's end and cannot be viewed
   *   from Peer's end (when <code>isSelf</code> value is <code>false</code>).</blockquote>
   *   The experimental google video streaming bandwidth sent to Peers.
   * @param {Number} [peerInfo.settings.googleXBandwidth.min] The minimum experimental google video streaming bandwidth sent to Peers.
   * @param {Number} [peerInfo.settings.googleXBandwidth.max] The maximum experimental google video streaming bandwidth sent to Peers.
   * @param {JSON} peerInfo.mediaStatus The Peer Stream muted settings.
   * @param {Boolean} peerInfo.mediaStatus.audioMuted The flag if Peer Stream audio tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} peerInfo.mediaStatus.videoMuted The flag if Peer Stream video tracks is muted or not.
   *   <small>If Peer <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @param {JSON} peerInfo.agent The Peer agent information.
   * @param {String} peerInfo.agent.name The Peer agent name.
   *   <small>Data may be accessing browser or non-Web SDK name.</small>
   * @param {Number} peerInfo.agent.version The Peer agent version.
   *   <small>Data may be accessing browser or non-Web SDK version. If the original value is <code>"0.9.6.1"</code>,
   *   it will be interpreted as <code>0.90601</code> where <code>0</code> helps to seperate the minor dots.</small>
   * @param {String} [peerInfo.agent.os] The Peer platform name.
   *  <small>Data may be accessing OS platform version from Web SDK.</small>
   * @param {String} [peerInfo.agent.pluginVersion] The Peer Temasys Plugin version.
   *  <small>Defined only when Peer is using the Temasys Plugin (IE / Safari).</small>
   * @param {String} peerInfo.room The Room Peer is from.
   * @param {JSON} peerInfo.config The Peer connection configuration.
   * @param {Boolean} peerInfo.config.enableIceTrickle The flag if Peer connection has
   *   trickle ICE enabled or faster connectivity.
   * @param {Boolean} peerInfo.config.enableDataChannel The flag if Datachannel connections would be enabled for Peer.
   * @param {Boolean} peerInfo.config.enableIceRestart The flag if Peer connection has ICE connection restart support.
   *   <small>Note that ICE connection restart support is not honoured for MCU enabled Peer connection.</small>
   * @param {Number} peerInfo.config.priorityWeight The flag if Peer or User should be the offerer.
   *   <small>If User's <code>priorityWeight</code> is higher than Peer's, User is the offerer, else Peer is.
   *   However for the case where the MCU is connected, User will always be the offerer.</small>
   * @param {Boolean} peerInfo.config.publishOnly The flag if Peer is publishing only stream but not receiving streams.
   * @param {Boolean} peerInfo.config.receiveOnly The flag if Peer is receiving only streams but not publishing stream.
   * @param {String} [peerInfo.parentId] The parent Peer ID that it is matched to for multi-streaming connections.
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerJoined: [],

  /**
   * Event triggered when a Peer connection has been refreshed.
   * @event peerRestart
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelfInitiateRestart The flag if User is initiating the Peer connection refresh.
   * @param {Boolean} isIceRestart The flag if Peer connection ICE connection will restart.
   * @for Skylink
   * @since 0.5.5
   */
  peerRestart: [],

  /**
   * Event triggered when a Peer session information has been updated.
   * @event peerUpdated
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerUpdated: [],

  /**
   * Event triggered when a Peer leaves the room.
   * @event peerLeft
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  peerLeft: [],

  /**
   * Event triggered when Room session has ended abruptly due to network disconnections.
   * @event sessionDisconnect
   * @param {String} peerId The User's Room session Peer ID.
   * @param {JSON} peerInfo The User's Room session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @for Skylink
   * @since 0.6.10
   */
  sessionDisconnect: [],

  /**
   * Event triggered when receiving Peer Stream.
   * @event incomingStream
   * @param {String} peerId The Peer ID.
   * @param {MediaStream} stream The Stream object.
   *   <small>To attach it to an element: <code>attachMediaStream(videoElement, stream);</code>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.5
   */
  incomingStream: [],

  /**
   * Event triggered when receiving message from Peer.
   * @event incomingMessage
   * @param {JSON} message The message result.
   * @param {JSON|String} message.content The message object.
   * @param {String} message.senderPeerId The sender Peer ID.
   * @param {String|Array} [message.targetPeerId] The value of the <code>targetPeerId</code>
   *   defined in <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   *   <small>Defined as User's Peer ID when <code>isSelf</code> payload value is <code>false</code>.</small>
   *   <small>Defined as <code>null</code> when provided <code>targetPeerId</code> in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a> is not defined.</small>
   * @param {Array} [message.listOfPeers] The list of Peers that the message has been sent to.
   *  <small>Defined only when <code>isSelf</code> payload value is <code>true</code>.</small>
   * @param {Boolean} message.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a> or
   *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>.
   * @param {Boolean} message.isDataChannel The flag if message is sent from
   *   <a href="#method_sendP2PMessage"><code>sendP2PMessage()</code> method</a>.
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.5.2
   */
  incomingMessage: [],

  /**
   * Event triggered when receiving completed data transfer from Peer.
   * @event incomingData
   * @param {Blob|String} data The data.
   * @param {String} transferId The data transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} transferInfo The data transfer information.
   *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingData: [],


  /**
   * Event triggered when receiving upload data transfer from Peer.
   * @event incomingDataRequest
   * @param {String} transferId The transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {String} transferInfo The data transfer information.
   *   <small>Object signature matches the <code>transferInfo</code> parameter payload received in the
   *   <a href="#event_dataTransferState"><code>dataTransferState</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @for Skylink
   * @since 0.6.1
   */
  incomingDataRequest: [],

  /**
   * Event triggered when Room locked status has changed.
   * @event roomLock
   * @param {Boolean} isLocked The flag if Room is locked.
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if User changed the Room locked status.
   * @for Skylink
   * @since 0.5.2
   */
  roomLock: [],

  /**
   * Event triggered when a Datachannel connection state has changed.
   * @event dataChannelState
   * @param {String} state The current Datachannel connection state.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} peerId The Peer ID.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code> or <code>SEND_MESSAGE_ERROR</code>.</small>
   * @param {String} channelName The Datachannel ID.
   * @param {String} channelType The Datachannel type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @param {String} messageType The Datachannel sending Datachannel message error type.
   *   <small>Defined only when <cod>state</code> payload is <code>SEND_MESSAGE_ERROR</code>.</small>
   *   [Rel: Skylink.DATA_CHANNEL_MESSAGE_ERROR]
   * @for Skylink
   * @since 0.1.0
   */
  dataChannelState: [],

  /**
   * Event triggered when a data transfer state has changed.
   * @event dataTransferState
   * @param {String} state The current data transfer state.
   *   [Rel: Skylink.DATA_TRANSFER_STATE]
   * @param {String} transferId The data transfer ID.
   * @param {String} peerId The Peer ID.
   * @param {JSON} transferInfo The data transfer information.
   * @param {Blob|String} [transferInfo.data] The data object.
   *   <small>Defined only when <code>state</code> payload is <code>UPLOAD_STARTED</code> or
   *   <code>DOWNLOAD_COMPLETED</code>.</small>
   * @param {String} transferInfo.name The data transfer name.
   * @param {Number} transferInfo.size The data transfer data object size.
   * @param {String} transferInfo.dataType The data transfer session type.
   *   [Rel: Skylink.DATA_TRANSFER_SESSION_TYPE]
   * @param {String} transferInfo.chunkType The data transfer type of data chunk being used to send to Peer for transfers.
   *   <small>For <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> data transfers, the
   *   initial data chunks value may change depending on the currently received data chunk type or the
   *   agent supported sending type of data chunks.</small>
   *   <small>For <a href="#method_sendURLData"><code>sendURLData()</code> method</a> data transfers, it is
   *   <code>STRING</code> always.</small>
   *   [Rel: Skylink.DATA_TRANSFER_DATA_TYPE]
   * @param {String} [transferInfo.mimeType] The data transfer data object MIME type.
   *   <small>Defined only when <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>
   *   data object sent MIME type information is defined.</small>
   * @param {Number} transferInfo.chunkSize The data transfer data chunk size.
   * @param {Number} transferInfo.percentage The data transfer percentage of completion progress.
   * @param {Number} transferInfo.timeout The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a> or
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a>.
   * @param {Boolean} transferInfo.isPrivate The flag if message is targeted or not, basing
   *   off the <code>targetPeerId</code> parameter being defined in
   *   <a href="#method_sendBlobData"><code>sendBlobData()</code> method</a> or
   *   <a href="#method_sendURLData"><code>sendURLData()</code> method</a>.
   * @param {String} transferInfo.direction The data transfer direction.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @param {JSON} [error] The error result.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>, <code>CANCEL</code>,
   *   <code>REJECTED</code> or <code>USER_REJECTED</code>.</small>
   * @param {Error|String} error.message The error object.
   * @param {String} error.transferType The data transfer direction from where the error occurred.
   *   [Rel: Skylink.DATA_TRANSFER_TYPE]
   * @for Skylink
   * @since 0.4.1
   */
  dataTransferState: [],

  /**
   * Event triggered when Signaling server reaction state has changed.
   * @event systemAction
   * @param {String} action The current Signaling server reaction state.
   *   [Rel: Skylink.SYSTEM_ACTION]
   * @param {String} message The message.
   * @param {String} reason The Signaling server reaction state reason of action code.
   *   [Rel: Skylink.SYSTEM_ACTION_REASON]
   * @for Skylink
   * @since 0.5.1
   */
  systemAction: [],

  /**
   * Event triggered when a server Peer joins the room.
   * @event serverPeerJoined
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerJoined: [],

  /**
   * Event triggered when a server Peer leaves the room.
   * @event serverPeerLeft
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerLeft: [],

  /**
   * Event triggered when a server Peer connection has been refreshed.
   * @event serverPeerRestart
   * @param {String} peerId The Peer ID.
   * @param {String} serverPeerType The server Peer type
   *   [Rel: Skylink.SERVER_PEER_TYPE]
   * @for Skylink
   * @since 0.6.1
   */
  serverPeerRestart: [],

  /**
   * Event triggered when a Peer Stream streaming has stopped.
   * <small>Note that it may not be the currently sent Stream to User, and it also triggers
   * when User leaves the Room for any currently sent Stream to User from Peer.</small>
   * @event streamEnded
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @param {String} streamId The Stream ID.
   * @for Skylink
   * @since 0.5.10
   */
  streamEnded: [],

  /**
   * Event triggered when Peer Stream audio or video tracks has been muted / unmuted.
   * @event streamMuted
   * @param {String} peerId The Peer ID.
   * @param {JSON} peerInfo The Peer session information.
   *   <small>Object signature matches the <code>peerInfo</code> parameter payload received in the
   *   <a href="#event_peerJoined"><code>peerJoined</code> event</a>.</small>
   * @param {Boolean} isSelf The flag if Peer is User.
   * @param {Boolean} isScreensharing The flag if Peer Stream is a screensharing Stream.
   * @for Skylink
   * @since 0.6.1
   */
  streamMuted: [],

  /**
   * Event triggered when <a href="#method_getPeers"><code>getPeers()</code> method</a> retrieval state changes.
   * @event getPeersStateChange
   * @param {String} state The current <code>getPeers()</code> retrieval state.
   *   [Rel: Skylink.GET_PEERS_STATE]
   * @param {String} privilegedPeerId The User's privileged Peer ID.
   * @param {JSON} peerList The list of Peer IDs Rooms within the same App space.
   * @param {Array} peerList.#room The list of Peer IDs associated with the Room defined in <code>#room</code> property.
   * @for Skylink
   * @since 0.6.1
   */
  getPeersStateChange: [],

  /**
   * Event triggered when <a href="#method_introducePeer"><code>introducePeer()</code> method</a>
   * introduction request state changes.
   * @event introduceStateChange
   * @param {String} state The current <code>introducePeer()</code> introduction request state.
   *   [Rel: Skylink.INTRODUCE_STATE]
   * @param {String} privilegedPeerId The User's privileged Peer ID.
   * @param {String} sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
   * @param {String} receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
   * @param {String} [reason] The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.1
   */
  introduceStateChange: [],

  /**
   * Event triggered when recording session state has changed.
   * @event recordingState
   * @param {Number} state The current recording session state.
   *   [Rel: Skylink.RECORDING_STATE]
   * @param {String} recordingId The recording session ID.
   * @param {JSON} link The recording session mixin videos link in
   *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
   *   <small>Defined only when <code>state</code> payload is <code>LINK</code>.</small>
   * @param {String} link.#peerId The recording session recorded Peer only video associated
   *   with the Peer ID defined in <code>#peerId</code> property.
   *   <small>If <code>#peerId</code> value is <code>"mixin"</code>, it means that is the mixin
   *   video of all Peers in the Room.</small>
   * @param {Error|String} error The error object.
   *   <small>Defined only when <code>state</code> payload is <code>ERROR</code>.</small>
   * @beta
   * @for Skylink
   * @since 0.6.16
   */
  recordingState: [],

  /**
   * Event triggered when <a href="#method_getConnectionStatus"><code>getConnectionStatus()</code> method</a>
   * retrieval state changes.
   * @event getConnectionStatusStateChange
   * @param {Number} state The current <code>getConnectionStatus()</code> retrieval state.
   *   [Rel: Skylink.GET_CONNECTION_STATUS_STATE]
   * @param {String} peerId The Peer ID.
   * @param {JSON} [stats] The Peer connection current stats.
   *   <small>Defined only when <code>state</code> payload is <code>RETRIEVE_SUCCESS</code>.</small>
   * @param {JSON} stats.raw The Peer connection raw stats before parsing.
   * @param {JSON} stats.audio The Peer connection audio streaming stats.
   * @param {JSON} stats.audio.sending The Peer connection sending audio streaming stats.
   * @param {Number} stats.audio.sending.bytes The Peer connection current sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.sending.totalBytes The Peer connection total sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.sending.packets The Peer connection current sending audio streaming packets.
   * @param {Number} stats.audio.sending.totalPackets The Peer connection total sending audio streaming packets.
   * @param {Number} stats.audio.sending.packetsLost The Peer connection current sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.totalPacketsLost The Peer connection total sending audio streaming packets lost.
   * @param {Number} stats.audio.sending.ssrc The Peer connection sending audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.sending.rtt The Peer connection sending audio streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} stats.audio.sending.jitter The Peer connection sending audio streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.jitterBufferMs] The Peer connection sending audio streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.audio.sending.codec] The Peer connection sending audio streaming selected codec information.
   *   <small>Defined as <code>null</code> if local session description is not available before parsing.</small>
   * @param {String} stats.audio.sending.codec.name The Peer connection sending audio streaming selected codec name.
   * @param {Number} stats.audio.sending.codec.payloadType The Peer connection sending audio streaming selected codec payload type.
   * @param {String} [stats.audio.sending.codec.implementation] The Peer connection sending audio streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.codec.channels] The Peer connection sending audio streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.audio.sending.codec.clockRate] The Peer connection sending audio streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.audio.sending.codec.params] The Peer connection sending audio streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.inputLevel] The Peer connection sending audio streaming input level.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.echoReturnLoss] The Peer connection sending audio streaming echo return loss in db (decibels).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.sending.echoReturnLossEnhancement] The Peer connection sending audio streaming
   *   echo return loss enhancement db (decibels).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.audio.receiving The Peer connection receiving audio streaming stats.
   * @param {Number} stats.audio.receiving.bytes The Peer connection current sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.receiving.totalBytes The Peer connection total sending audio streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.audio.receiving.packets The Peer connection current receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.totalPackets The Peer connection total receiving audio streaming packets.
   * @param {Number} stats.audio.receiving.packetsLost The Peer connection current receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.totalPacketsLost The Peer connection total receiving audio streaming packets lost.
   * @param {Number} stats.audio.receiving.ssrc The Peer connection receiving audio streaming RTP packets SSRC.
   * @param {Number} stats.audio.receiving.jitter The Peer connection receiving audio streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.jitterBufferMs] The Peer connection receiving audio streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.audio.receiving.codec] The Peer connection receiving audio streaming selected codec information.
   *   <small>Defined as <code>null</code> if remote session description is not available before parsing.</small>
   * @param {String} stats.audio.receiving.codec.name The Peer connection receiving audio streaming selected codec name.
   * @param {Number} stats.audio.receiving.codec.payloadType The Peer connection receiving audio streaming selected codec payload type.
   * @param {String} [stats.audio.receiving.codec.implementation] The Peer connection receiving audio streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.codec.channels] The Peer connection receiving audio streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.audio.receiving.codec.clockRate] The Peer connection receiving audio streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.audio.receiving.codec.params] The Peer connection receiving audio streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.audio.receiving.outputLevel] The Peer connection receiving audio streaming output level.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.video The Peer connection video streaming stats.
   * @param {JSON} stats.video.sending The Peer connection sending video streaming stats.
   * @param {Number} stats.video.sending.bytes The Peer connection current sending video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.sending.totalBytes The Peer connection total sending video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.sending.packets The Peer connection current sending video streaming packets.
   * @param {Number} stats.video.sending.totalPackets The Peer connection total sending video streaming packets.
   * @param {Number} stats.video.sending.packetsLost The Peer connection current sending video streaming packets lost.
   * @param {Number} stats.video.sending.totalPacketsLost The Peer connection total sending video streaming packets lost.
   * @param {Number} stats.video.sending.ssrc The Peer connection sending video streaming RTP packets SSRC.
   * @param {Number} stats.video.sending.rtt The Peer connection sending video streaming RTT (Round-trip delay time).
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} stats.video.sending.jitter The Peer connection sending video streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.jitterBufferMs] The Peer connection sending video streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.video.sending.codec] The Peer connection sending video streaming selected codec information.
   *   <small>Defined as <code>null</code> if local session description is not available before parsing.</small>
   * @param {String} stats.video.sending.codec.name The Peer connection sending video streaming selected codec name.
   * @param {Number} stats.video.sending.codec.payloadType The Peer connection sending video streaming selected codec payload type.
   * @param {String} [stats.video.sending.codec.implementation] The Peer connection sending video streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.codec.channels] The Peer connection sending video streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.video.sending.codec.clockRate] The Peer connection sending video streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.video.sending.codec.params] The Peer connection sending video streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frames] The Peer connection sending video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesInput] The Peer connection sending video streaming frames input.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.framesDropped] The Peer connection sending video streaming frames dropped.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateMean] The Peer connection sending video streaming fps mean.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.frameRateStdDev] The Peer connection sending video streaming fps standard deviation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.nacks] The Peer connection current sending video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalNacks] The Peer connection total sending video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.plis] The Peer connection current sending video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalPlis] The Peer connection total sending video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.firs] The Peer connection current sending video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.sending.totalFirs] The Peer connection total sending video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.video.receiving The Peer connection receiving video streaming stats.
   * @param {Number} stats.video.receiving.bytes The Peer connection current receiving video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.receiving.totalBytes The Peer connection total receiving video streaming bytes.
   *   <small>Note that value is in bytes so you have to convert that to bits for displaying for an example kbps.</small>
   * @param {Number} stats.video.receiving.packets The Peer connection current receiving video streaming packets.
   * @param {Number} stats.video.receiving.totalPackets The Peer connection total receiving video streaming packets.
   * @param {Number} stats.video.receiving.packetsLost The Peer connection current receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.totalPacketsLost The Peer connection total receiving video streaming packets lost.
   * @param {Number} stats.video.receiving.ssrc The Peer connection receiving video streaming RTP packets SSRC.
   * @param {Number} stats.video.receiving.e2eDelay The Peer connection receiving video streaming e2e delay.
   *   <small>Defined as <code>null</code> if it's not present in original raw stats before parsing, and that
   *   it finds any existing audio, video or object (plugin) DOM elements that has set with the
   *   Peer remote stream object to parse current time. Note that <code>document.getElementsByTagName</code> function
   *   and DOM <code>.currentTime</code> has to be supported inorder for data to be parsed correctly.</small>
   * @param {Number} stats.video.receiving.jitter The Peer connection receiving video streaming RTP packets jitter in seconds.
   *   <small>Defined as <code>0</code> if it's not present in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.jitterBufferMs] The Peer connection receiving video streaming
   *   RTP packets jitter buffer in miliseconds.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} [stats.video.receiving.codec] The Peer connection receiving video streaming selected codec information.
   *   <small>Defined as <code>null</code> if remote session description is not available before parsing.</small>
   * @param {String} stats.video.receiving.codec.name The Peer connection receiving video streaming selected codec name.
   * @param {Number} stats.video.receiving.codec.payloadType The Peer connection receiving video streaming selected codec payload type.
   * @param {String} [stats.video.receiving.codec.implementation] The Peer connection receiving video streaming selected codec implementation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.codec.channels] The Peer connection receiving video streaming selected codec channels (2 for stereo).
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing,
   *   and this is usually present in <code>stats.audio</code> property.</small>
   * @param {Number} [stats.video.receiving.codec.clockRate] The Peer connection receiving video streaming selected codec media sampling rate.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {String} [stats.video.receiving.codec.params] The Peer connection receiving video streaming selected codec parameters.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frames] The Peer connection receiving video streaming frames.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesOutput] The Peer connection receiving video streaming frames output.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.framesDecoded] The Peer connection receiving video streaming frames decoded.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frameRateMean] The Peer connection receiving video streaming fps mean.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.frameRateStdDev] The Peer connection receiving video streaming fps standard deviation.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.nacks] The Peer connection current receiving video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalNacks] The Peer connection total receiving video streaming nacks.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.plis] The Peer connection current receiving video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalPlis] The Peer connection totally receiving video streaming plis.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.firs] The Peer connection current receiving video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {Number} [stats.video.receiving.totalFirs] The Peer connection total receiving video streaming firs.
   *   <small>Defined as <code>null</code> if it's not available in original raw stats before parsing.</small>
   * @param {JSON} stats.selectedCandidate The Peer connection selected ICE candidate pair stats.
   * @param {JSON} stats.selectedCandidate.local The Peer connection selected local ICE candidate.
   * @param {String} stats.selectedCandidate.local.ipAddress The Peer connection selected
   *   local ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.local.portNumber The Peer connection selected
   *   local ICE candidate port number.
   * @param {String} stats.selectedCandidate.local.transport The Peer connection selected
   *   local ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.local.candidateType The Peer connection selected
   *   local ICE candidate type.
   * @param {JSON} stats.selectedCandidate.remote The Peer connection selected remote ICE candidate.
   * @param {String} stats.selectedCandidate.remote.ipAddress The Peer connection selected
   *   remote ICE candidate IP address.
   * @param {Number} stats.selectedCandidate.remote.portNumber The Peer connection selected
   *   remote ICE candidate port number.
   * @param {String} stats.selectedCandidate.remote.transport The Peer connection selected
   *   remote ICE candidate IP transport type.
   * @param {String} stats.selectedCandidate.remote.candidateType The Peer connection selected
   *   remote ICE candidate type.
   * @param {JSON} stats.connection The Peer connection object stats.
   * @param {String} stats.connection.iceConnectionState The Peer connection ICE connection state.
   * @param {String} stats.connection.iceGatheringState The Peer connection ICE gathering state.
   * @param {String} stats.connection.signalingState The Peer connection signaling state.
   * @param {JSON} stats.connection.localDescription The Peer connection local session description.
   * @param {String} stats.connection.localDescription.type The Peer connection local session description type.
   *   <small>Defined as <code>null</code> when local session description is not available.</small>
   * @param {String} stats.connection.localDescription.sdp The Peer connection local session description SDP.
   *   <small>Defined as <code>null</code> when local session description is not available.</small>
   * @param {JSON} stats.connection.remoteDescription The Peer connection remote session description.
   * @param {String} stats.connection.remoteDescription.type The Peer connection remote session description type.
   *   <small>Defined as <code>null</code> when remote session description is not available.</small>
   * @param {String} stats.connection.remoteDescription.sdp The Peer connection remote session description sdp.
   *   <small>Defined as <code>null</code> when remote session description is not available.</small>
   * @param {JSON} stats.connection.candidates The Peer connection list of ICE candidates sent or received.
   * @param {JSON} stats.connection.candidates.sending The Peer connection list of local ICE candidates sent.
   * @param {Array} stats.connection.candidates.sending.host The Peer connection list of local
   *   <code>"host"</code> (local network) ICE candidates sent.
   * @param {JSON} stats.connection.candidates.sending.host.#index The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate.
   * @param {String} stats.connection.candidates.sending.host.#index.candidate The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.host.#index.sdpMid The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.host.#index.sdpMLineIndex The Peer connection local
   *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {Array} stats.connection.candidates.sending.srflx The Peer connection list of local
   *   <code>"srflx"</code> (STUN) ICE candidates sent.
   * @param {JSON} stats.connection.candidates.sending.srflx.#index The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate.
   * @param {String} stats.connection.candidates.sending.srflx.#index.candidate The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.srflx.#index.sdpMid The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.srflx.#index.sdpMLineIndex The Peer connection local
   *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {Array} stats.connection.candidates.sending.relay The Peer connection list of local
   *   <code>"relay"</code> (TURN) candidates sent.
   * @param {JSON} stats.connection.candidates.sending.relay.#index The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate.
   * @param {String} stats.connection.candidates.sending.relay.#index.candidate The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.sending.relay.#index.sdpMid The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate identifier based on the local session description.
   * @param {Number} stats.connection.candidates.sending.relay.#index.sdpMLineIndex The Peer connection local
   *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the local session description.
   * @param {JSON} stats.connection.candidates.receiving The Peer connection list of remote ICE candidates received.
   * @param {Array} stats.connection.candidates.receiving.host The Peer connection list of remote
   *   <code>"host"</code> (local network) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.host.#index The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.host.#index.candidate The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.host.#index.sdpMid The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.host.#index.sdpMLineIndex The Peer connection remote
   *   <code>"host"</code> (local network) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {Array} stats.connection.candidates.receiving.srflx The Peer connection list of remote
   *   <code>"srflx"</code> (STUN) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.srflx.#index The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.srflx.#index.candidate The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.srflx.#index.sdpMid The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.srflx.#index.sdpMLineIndex The Peer connection remote
   *   <code>"srflx"</code> (STUN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {Array} stats.connection.candidates.receiving.relay The Peer connection list of remote
   *   <code>"relay"</code> (TURN) ICE candidates received.
   * @param {JSON} stats.connection.candidates.receiving.relay.#index The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate.
   * @param {String} stats.connection.candidates.receiving.relay.#index.candidate The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate connection description.
   * @param {String} stats.connection.candidates.receiving.relay.#index.sdpMid The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate identifier based on the remote session description.
   * @param {Number} stats.connection.candidates.receiving.relay.#index.sdpMLineIndex The Peer connection remote
   *   <code>"relay"</code> (TURN) ICE candidate media description index (starting from <code>0</code>)
   *   based on the remote session description.
   * @param {JSON} stats.connection.dataChannels The Peer connection list of Datachannel connections.
   * @param {JSON} stats.connection.dataChannels.#channelName The Peer connection Datachannel connection stats.
   * @param {String} stats.connection.dataChannels.#channelName.label The Peer connection Datachannel connection ID.
   * @param {String} stats.connection.dataChannels.#channelName.readyState The Peer connection Datachannel connection readyState.
   *   [Rel: Skylink.DATA_CHANNEL_STATE]
   * @param {String} stats.connection.dataChannels.#channelName.type The Peer connection Datachannel connection type.
   *   [Rel: Skylink.DATA_CHANNEL_TYPE]
   * @param {String} stats.connection.dataChannels.#channelName.currentTransferId The Peer connection
   *   Datachannel connection current progressing transfer session ID.
   *   <small>Defined as <code>null</code> when there is currently no transfer session progressing on the Datachannel connection.</small>
   * @param {Error} error The error object received.
   *   <small>Defined only when <code>state</code> payload is <code>RETRIEVE_ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.14
   */
  getConnectionStatusStateChange: [],

  /**
   * Event triggered when <a href="#method_muteStream"><code>muteStream()</code> method</a> changes
   * User Streams audio and video tracks muted status.
   * @event localMediaMuted
   * @param {JSON} mediaStatus The Streams muted settings.
   *   <small>This indicates the muted settings for both
   *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
   *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.</small>
   * @param {Boolean} mediaStatus.audioMuted The flag if all Streams audio tracks is muted or not.
   *   <small>If User's <code>peerInfo.settings.audio</code> is false, this will be defined as <code>true</code>.</small>
   * @param {Boolean} mediaStatus.videoMuted The flag if all Streams video tracks is muted or not.
   *   <small>If User's <code>peerInfo.settings.video</code> is false, this will be defined as <code>true</code>.</small>
   * @for Skylink
   * @since 0.6.15
   */
  localMediaMuted: [],

  /**
   * <blockquote class="info">
   *   Learn more about how ICE works in this
   *   <a href="https://temasys.com.sg/ice-what-is-this-sorcery/">article here</a>.<br>
   *   Note that this event may not be triggered for MCU enabled Peer connections as ICE candidates
   *   may be received in the session description instead.
   * </blockquote>
   * Event triggered when remote ICE candidate processing state has changed when Peer is using trickle ICE.
   * @event candidateProcessingState
   * @param {String} state The ICE candidate processing state.
   *   [Rel: Skylink.CANDIDATE_PROCESSING_STATE]
   * @param {String} peerId The Peer ID.
   * @param {String} candidateId The remote ICE candidate session ID.
   *   <small>Note that this value is not related to WebRTC API but for identification of remote ICE candidate received.</small>
   * @param {String} candidateType The remote ICE candidate type.
   *   <small>Expected values are <code>"host"</code> (local network), <code>"srflx"</code> (STUN) and <code>"relay"</code> (TURN).</small>
   * @param {JSON} candidate The remote ICE candidate.
   * @param {String} candidate.candidate The remote ICE candidate connection description.
   * @param {String} candidate.sdpMid The remote ICE candidate identifier based on the remote session description.
   * @param {Number} candidate.sdpMLineIndex The remote ICE candidate media description index
   *   (starting from <code>0</code>) based on the remote session description.
   * @param {Error} [error] The error object.
   *   <small>Defined only when <code>state</code> is <code>DROPPED</code> or <code>PROCESS_ERROR</code>.</small>
   * @for Skylink
   * @since 0.6.16
   */
  candidateProcessingState: []
};

/**
 * Function that subscribes a listener to an event.
 * @method on
 * @param {String} eventName The event.
 * @param {Function} callback The listener.
 *   <small>This will be invoked when event is triggered.</small>
 * @example
 *   // Example 1: Subscribing to "peerJoined" event
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     console.info("peerJoined event has been triggered with:", peerId, peerInfo, isSelf);
 *   });
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype.on = function(eventName, callback) {
  if ('function' === typeof callback) {
    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    this._EVENTS[eventName].push(callback);
    log.log([null, 'Event', eventName, 'Event is subscribed']);
  } else {
    log.error([null, 'Event', eventName, 'Provided parameter is not a function']);
  }
};

/**
 * Function that subscribes a listener to an event once.
 * @method once
 * @param {String} eventName The event.
 * @param {Function} callback The listener.
 *   <small>This will be invoked once when event is triggered and conditional function is satisfied.</small>
 * @param {Function} [condition] The conditional function that will be invoked when event is triggered.
 *   <small>Return <code>true</code> when invoked to satisfy condition.</small>
 *   <small>When not provided, the conditional function will always return <code>true</code>.</small>
 * @param {Boolean} [fireAlways=false] The flag that indicates if <code>once()</code> should act like
 *   <code>on()</code> but only invoke listener only when conditional function is satisfied.
 * @example
 *   // Example 1: Subscribing to "peerJoined" event that triggers without condition
 *   skylinkDemo.once("peerJoined", function (peerId, peerInfo, isSelf) {
 *     console.info("peerJoined event has been triggered once with:", peerId, peerInfo, isSelf);
 *   });
 *
 *   // Example 2: Subscribing to "incomingStream" event that triggers with condition
 *   skylinkDemo.once("incomingStream", function (peerId, stream, isSelf, peerInfo) {
 *     console.info("incomingStream event has been triggered with User stream:", stream);
 *   }, function (peerId, peerInfo, isSelf) {
 *     return isSelf;
 *   });
 *
 *   // Example 3: Subscribing to "dataTransferState" event that triggers always only when condition is satisfied
 *   skylinkDemo.once("dataTransferState", function (state, transferId, peerId, transferInfo) {
 *     console.info("Received data transfer from Peer:", transferInfo.data);
 *   }, function (state, transferId, peerId) {
 *     if (state === skylinkDemo.DATA_TRANSFER_STATE.UPLOAD_REQUEST) {
 *       skylinkDemo.acceptDataTransfer(peerId, transferId);
 *     }
 *     return state === skylinkDemo.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED;
 *   }, true);
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype.once = function(eventName, callback, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  condition = (typeof condition !== 'function') ? function () {
    return true;
  } : condition;

  if (typeof callback === 'function') {

    this._EVENTS[eventName] = this._EVENTS[eventName] || [];
    // prevent undefined error
    this._onceEvents[eventName] = this._onceEvents[eventName] || [];
    this._onceEvents[eventName].push([callback, condition, fireAlways]);
    log.log([null, 'Event', eventName, 'Event is subscribed on condition']);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback is not a function']);
  }
};

/**
 * Function that unsubscribes listeners from an event.
 * @method off
 * @param {String} eventName The event.
 * @param {Function} [callback] The listener to unsubscribe.
 * - When not provided, all listeners associated to the event will be unsubscribed.
 * @example
 *   // Example 1: Unsubscribe all "peerJoined" event
 *   skylinkDemo.off("peerJoined");
 *
 *   // Example 2: Unsubscribe only one listener from "peerJoined event"
 *   var pJListener = function (peerId, peerInfo, isSelf) {
 *     console.info("peerJoined event has been triggered with:", peerId, peerInfo, isSelf);
 *   };
 *
 *   skylinkDemo.off("peerJoined", pJListener);
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.off = function(eventName, callback) {
  if (callback === undefined) {
    this._EVENTS[eventName] = [];
    this._onceEvents[eventName] = [];
    log.log([null, 'Event', eventName, 'All events are unsubscribed']);
    return;
  }
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName];

  // unsubscribe events that is triggered always
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === callback) {
      log.log([null, 'Event', eventName, 'Event is unsubscribed']);
      arr.splice(i, 1);
      break;
    }
  }
  // unsubscribe events fired only once
  if(once !== undefined) {
    for (var j = 0; j < once.length; j++) {
      if (once[j][0] === callback) {
        log.log([null, 'Event', eventName, 'One-time Event is unsubscribed']);
        once.splice(j, 1);
        break;
      }
    }
  }
};

/**
 * Function that triggers an event.
 * The rest of the parameters after the <code>eventName</code> parameter is considered as the event parameter payloads.
 * @method _trigger
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._trigger = function(eventName) {
  //convert the arguments into an array
  var args = Array.prototype.slice.call(arguments);
  var arr = this._EVENTS[eventName];
  var once = this._onceEvents[eventName] || null;
  args.shift(); //Omit the first argument since it's the event name
  if (arr) {
    // for events subscribed forever
    for (var i = 0; i < arr.length; i++) {
      try {
        log.log([null, 'Event', eventName, 'Event is fired']);
        if(arr[i].apply(this, args) === false) {
          break;
        }
      } catch(error) {
        log.error([null, 'Event', eventName, 'Exception occurred in event:'], error);
        throw error;
      }
    }
  }
  if (once){
    // for events subscribed on once
    for (var j = 0; j < once.length; j++) {
      if (once[j][1].apply(this, args) === true) {
        log.log([null, 'Event', eventName, 'Condition is met. Firing event']);
        if(once[j][0].apply(this, args) === false) {
          break;
        }
        if (once[j] && !once[j][2]) {
          log.log([null, 'Event', eventName, 'Removing event after firing once']);
          once.splice(j, 1);
          //After removing current element, the next element should be element of the same index
          j--;
        }
      } else {
        log.log([null, 'Event', eventName, 'Condition is still not met. ' +
          'Holding event from being fired']);
      }
    }
  }

  log.log([null, 'Event', eventName, 'Event is triggered']);
};



/**
 * Function that checks if the current state condition is met before subscribing
 *   event handler to wait for condition to be fulfilled.
 * @method _condition
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._condition = function(eventName, callback, checkFirst, condition, fireAlways) {
  if (typeof condition === 'boolean') {
    fireAlways = condition;
    condition = null;
  }
  if (typeof callback === 'function' && typeof checkFirst === 'function') {
    if (checkFirst()) {
      log.log([null, 'Event', eventName, 'First condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', eventName, 'First condition is not met. Subscribing to event']);
    this.once(eventName, callback, condition, fireAlways);
  } else {
    log.error([null, 'Event', eventName, 'Provided callback or checkFirst is not a function']);
  }
};

/**
 * Function that starts an interval check to wait for a condition to be resolved.
 * @method _wait
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._wait = function(callback, condition, intervalTime, fireAlways) {
  fireAlways = (typeof fireAlways === 'undefined' ? false : fireAlways);
  if (typeof callback === 'function' && typeof condition === 'function') {
    if (condition()) {
      log.log([null, 'Event', null, 'Condition is met. Firing callback']);
      callback();
      return;
    }
    log.log([null, 'Event', null, 'Condition is not met. Doing a check.']);

    intervalTime = (typeof intervalTime === 'number') ? intervalTime : 50;

    var doWait = setInterval(function () {
      if (condition()) {
        log.log([null, 'Event', null, 'Condition is met after waiting. Firing callback']);
        if (!fireAlways){
          clearInterval(doWait);
        }
        callback();
      }
    }, intervalTime);
  } else {
    if (typeof callback !== 'function'){
      log.error([null, 'Event', null, 'Provided callback is not a function']);
    }
    if (typeof condition !== 'function'){
      log.error([null, 'Event', null, 'Provided condition is not a function']);
    }
  }
};

/**
 * Function that throttles a method function to prevent multiple invokes over a specified amount of time.
 * Returns a function to be invoked <code>._throttle(fn, 1000)()</code> to make throttling functionality work.
 * @method _throttle
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._throttle = function(func, prop, wait){
  var self = this;
  var now = (new Date()).getTime();

  if (!(self._timestamp[prop] && ((now - self._timestamp[prop]) < wait))) {
    func(true);
    self._timestamp[prop] = now;
  } else {
    func(false);
  }
};
Skylink.prototype.SOCKET_ERROR = {
  CONNECTION_FAILED: 0,
  RECONNECTION_FAILED: -1,
  CONNECTION_ABORTED: -2,
  RECONNECTION_ABORTED: -3,
  RECONNECTION_ATTEMPT: -4
};

/**
 * The list of <a href="#method_joinRoom"><code>joinRoom()</code> method</a> socket connection reconnection states.
 * @attribute SOCKET_FALLBACK
 * @param {String} NON_FALLBACK      <small>Value <code>"nonfallback"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is at its initial state
 *   without transitioning to any new socket port or transports yet.
 * @param {String} FALLBACK_PORT     <small>Value <code>"fallbackPortNonSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTP port using WebSocket transports to attempt to establish connection with Signaling server.
 * @param {String} FALLBACK_PORT_SSL <small>Value <code>"fallbackPortSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTPS port using WebSocket transports to attempt to establish connection with Signaling server.
 * @param {String} LONG_POLLING      <small>Value <code>"fallbackLongPollingNonSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTP port using Polling transports to attempt to establish connection with Signaling server.
 * @param {String} LONG_POLLING      <small>Value <code>"fallbackLongPollingSSL"</code></small>
 *   The value of the reconnection state when <code>joinRoom()</code> socket connection is reconnecting with
 *   another new HTTPS port using Polling transports to attempt to establish connection with Signaling server.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.SOCKET_FALLBACK = {
  NON_FALLBACK: 'nonfallback',
  FALLBACK_PORT: 'fallbackPortNonSSL',
  FALLBACK_SSL_PORT: 'fallbackPortSSL',
  LONG_POLLING: 'fallbackLongPollingNonSSL',
  LONG_POLLING_SSL: 'fallbackLongPollingSSL'
};

/**
 * Function that sends a socket message over the socket connection to the Signaling.
 * @method _sendChannelMessage
 * @private
 * @for Skylink
 * @since 0.5.8
 */
Skylink.prototype._sendChannelMessage = function(message) {
  var self = this;
  var interval = 1000;
  var throughput = 16;

  if (!self._channelOpen || !self._user || !self._socket) {
    log.warn([null, 'Socket', null, 'Dropping of message as Socket connection is not opened or is at ' +
      'incorrect step ->'], message);
    return;
  }

  if (self._user.sid && !self._peerMessagesStamps[self._user.sid]) {
    self._peerMessagesStamps[self._user.sid] = {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };
  }

  var checkStampFn = function (statusMessage) {
    if (statusMessage.type === self._SIG_MESSAGE_TYPE.UPDATE_USER) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].userData;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].videoMuted;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO) {
      if (!self._user.sid) {
        return false;
      }
      return statusMessage.stamp > self._peerMessagesStamps[self._user.sid].audioMuted;
    }
    return true;
  };

  var setStampFn = function (statusMessage) {
    if (statusMessage.type === self._SIG_MESSAGE_TYPE.UPDATE_USER) {
      self._peerMessagesStamps[self._user.sid].userData = statusMessage.stamp;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO) {
      self._peerMessagesStamps[self._user.sid].videoMuted = statusMessage.stamp;
    } else if (statusMessage.type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO) {
      self._peerMessagesStamps[self._user.sid].audioMuted = statusMessage.stamp;
    }
  };

  var setQueueFn = function () {
    log.debug([null, 'Socket', null, 'Starting queue timeout']);

    self._socketMessageTimeout = setTimeout(function () {
      if (((new Date ()).getTime() - self._timestamp.socketMessage) <= interval) {
        log.debug([null, 'Socket', null, 'Restarting queue timeout']);
        setQueueFn();
        return;
      }
      startSendingQueuedMessageFn();
    }, interval - ((new Date ()).getTime() - self._timestamp.socketMessage));
  };

  var triggerEventFn = function (eventMessage) {
    if (eventMessage.type === self._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE) {
      self._trigger('incomingMessage', {
        content: eventMessage.data,
        isPrivate: false,
        targetPeerId: null,
        listOfPeers: Object.keys(self._peerInformations),
        isDataChannel: false,
        senderPeerId: self._user.sid
      }, self._user.sid, self.getPeerInfo(), true);

    } else if (eventMessage.type === self._SIG_MESSAGE_TYPE.ROOM_LOCK) {
      self._roomLocked = !!eventMessage.lock;
      self._trigger('roomLock', !!eventMessage.lock, self._user.sid, self.getPeerInfo(), true);
    }
  };

  var sendGroupMessageFn = function (groupMessageList) {
    self._socketMessageTimeout = null;

    if (!self._channelOpen || !(self._user && self._user.sid) || !self._socket) {
      log.warn([null, 'Socket', null, 'Dropping of group messages as Socket connection is not opened or is at ' +
        'incorrect step ->'], groupMessageList);
      return;
    }

    var strGroupMessageList = [];
    var stamps = {
      userData: 0,
      audioMuted: 0,
      videoMuted: 0
    };

    for (var k = 0; k < groupMessageList.length; k++) {
      if (checkStampFn(groupMessageList[k])) {
        if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.UPDATE_USER &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].userData &&
          groupMessageList[k].stamp > stamps.userData) {
          stamps.userData = groupMessageList[k].stamp;
        } else if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].audioMuted &&
          groupMessageList[k].stamp > stamps.audioMuted) {
          stamps.audioMuted = groupMessageList[k].stamp;
        } else if (groupMessageList[k].type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO &&
          groupMessageList[k].stamp > self._peerMessagesStamps[self._user.sid].videoMuted &&
          groupMessageList[k].stamp > stamps.videoMuted) {
          stamps.videoMuted = groupMessageList[k].stamp;
        }
      }
    }

    for (var i = 0; i < groupMessageList.length; i++) {
      if ((groupMessageList[i].type === self._SIG_MESSAGE_TYPE.UPDATE_USER &&
          groupMessageList[i].stamp < stamps.userData) ||
          (groupMessageList[i].type === self._SIG_MESSAGE_TYPE.MUTE_AUDIO &&
          groupMessageList[i].stamp < stamps.audioMuted) ||
          (groupMessageList[i].type === self._SIG_MESSAGE_TYPE.MUTE_VIDEO &&
          groupMessageList[i].stamp < stamps.videoMuted)) {
        log.warn([null, 'Socket', null, 'Dropping of outdated status message ->'], clone(groupMessageList[i]));
        groupMessageList.splice(i, 1);
        i--;
        continue;
      }
      strGroupMessageList.push(JSON.stringify(groupMessageList[i]));
    }

    if (strGroupMessageList.length > 0) {
      var groupMessage = {
        type: self._SIG_MESSAGE_TYPE.GROUP,
        lists: strGroupMessageList,
        mid: self._user.sid,
        rid: self._room.id
      };

      log.debug([null, 'Socket', null, 'Sending queued messages (max: 16 per group) ->'], groupMessage);

      self._socket.send(JSON.stringify(groupMessage));
      self._timestamp.socketMessage = (new Date()).getTime();

      for (var j = 0; j < groupMessageList.length; j++) {
        setStampFn(groupMessageList[j]);
        triggerEventFn(groupMessageList[j]);
      }
    }
  };

  var startSendingQueuedMessageFn = function(){
    if (self._socketMessageQueue.length > 0){
      if (self._socketMessageQueue.length < throughput){
        sendGroupMessageFn(self._socketMessageQueue.splice(0, self._socketMessageQueue.length));
      } else {
        sendGroupMessageFn(self._socketMessageQueue.splice(0, throughput));
        setQueueFn();
      }
    }
  };

  if (self._groupMessageList.indexOf(message.type) > -1) {
    if (!(self._timestamp.socketMessage && ((new Date ()).getTime() - self._timestamp.socketMessage) <= interval)) {
      if (!checkStampFn(message)) {
        log.warn([null, 'Socket', null, 'Dropping of outdated status message ->'], message);
        return;
      }
      if (self._socketMessageTimeout) {
        clearTimeout(self._socketMessageTimeout);
      }
      self._socket.send(JSON.stringify(message));
      setStampFn(message);
      triggerEventFn(message);

      self._timestamp.socketMessage = (new Date()).getTime();

    } else {
      log.warn([null, 'Socket', null, 'Queueing socket message to prevent message drop ->'], message);

      self._socketMessageQueue.push(message);

      if (!self._socketMessageTimeout) {
        setQueueFn();
      }
    }
  } else {
    self._socket.send(JSON.stringify(message));
  }
};

/**
 * Function that creates and opens a socket connection to the Signaling.
 * @method _createSocket
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._createSocket = function (type) {
  var self = this;

  var options = {
    forceNew: true,
    //'sync disconnect on unload' : true,
    reconnection: false,
    timeout: self._socketTimeout
  };

  var ports = self._socketPorts[self._signalingServerProtocol];
  var connectionType = null;

  // just beginning
  if (self._signalingServerPort === null) {
    self._signalingServerPort = ports[0];
    connectionType = self.SOCKET_FALLBACK.NON_FALLBACK;

  // reached the end of the last port for the protocol type
  } else if ( ports.indexOf(self._signalingServerPort) === ports.length - 1 ) {

    // re-refresh to long-polling port
    if (type === 'WebSocket') {
      type = 'Polling';
      self._signalingServerPort = ports[0];

    } else if (type === 'Polling') {
      options.reconnection = true;
      options.reconnectionAttempts = 4;
      options.reconectionDelayMax = 1000;
    }

  // move to the next port
  } else {
    self._signalingServerPort = ports[ ports.indexOf(self._signalingServerPort) + 1 ];
  }

  var url = self._signalingServerProtocol + '//' + self._signalingServer + ':' + self._signalingServerPort;
    //'http://ec2-52-8-93-170.us-west-1.compute.amazonaws.com:6001';

  if (type === 'WebSocket') {
    options.transports = ['websocket'];
  } else if (type === 'Polling') {
    options.transports = ['xhr-polling', 'jsonp-polling', 'polling'];
  }

  // if socket instance already exists, exit
  if (self._socket) {
    self._socket.removeAllListeners('connect_error');
    self._socket.removeAllListeners('reconnect_attempt');
    self._socket.removeAllListeners('reconnect_error');
    self._socket.removeAllListeners('reconnect_failed');
    self._socket.removeAllListeners('connect');
    self._socket.removeAllListeners('reconnect');
    self._socket.removeAllListeners('error');
    self._socket.removeAllListeners('disconnect');
    self._socket.removeAllListeners('message');
    self._socket.disconnect();
    self._socket = null;
  }

  self._channelOpen = false;

  log.log('Opening channel with signaling server url:', {
    url: url,
    useXDR: self._socketUseXDR,
    options: options
  });

  self._socketSession = {
    type: type,
    options: options,
    url: url
  };

  self._socket = io.connect(url, options);

  if (connectionType === null) {
    connectionType = self._signalingServerProtocol === 'http:' ?
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING :
        self.SOCKET_FALLBACK.FALLBACK_PORT) :
      (type === 'Polling' ? self.SOCKET_FALLBACK.LONG_POLLING_SSL :
        self.SOCKET_FALLBACK.FALLBACK_SSL_PORT);
  }

  self._socket.on('connect_error', function (error) {
    self._channelOpen = false;

    self._trigger('socketError', self.SOCKET_ERROR.CONNECTION_FAILED,
      error, connectionType);

    self._trigger('channelRetry', connectionType, 1);

    if (options.reconnection === false) {
      self._createSocket(type);
    }
  });

  self._socket.on('reconnect_attempt', function (attempt) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ATTEMPT,
      attempt, connectionType);

    self._trigger('channelRetry', connectionType, attempt);
  });

  self._socket.on('reconnect_error', function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_FAILED,
      error, connectionType);
  });

  self._socket.on('reconnect_failed', function (error) {
    self._channelOpen = false;
    self._trigger('socketError', self.SOCKET_ERROR.RECONNECTION_ABORTED,
      error, connectionType);
  });

  self._socket.on('connect', function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  });

  self._socket.on('reconnect', function () {
    if (!self._channelOpen) {
      self._channelOpen = true;
      self._trigger('channelOpen');
      log.log([null, 'Socket', null, 'Channel opened']);
    }
  });

  self._socket.on('error', function(error) {
    self._channelOpen = false;
    self._trigger('channelError', error);
    log.error([null, 'Socket', null, 'Exception occurred:'], error);
  });

  self._socket.on('disconnect', function() {
    self._channelOpen = false;
    self._trigger('channelClose');
    log.log([null, 'Socket', null, 'Channel closed']);

    if (self._inRoom) {
      self.leaveRoom(false);
      self._trigger('sessionDisconnect', self._user.sid, self.getPeerInfo());
    }
  });

  self._socket.on('message', function(message) {
    log.log([null, 'Socket', null, 'Received message']);
    self._processSigMessage(message);
  });
};

/**
 * Function that starts the socket connection to the Signaling.
 * This starts creating the socket connection and called at first not when requiring to fallback.
 * @method _openChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._openChannel = function() {
  var self = this;
  if (self._channelOpen) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as there is already an ongoing channel connection']);
    return;
  }

  if (self._readyState !== self.READY_STATE_CHANGE.COMPLETED) {
    log.error([null, 'Socket', null, 'Unable to instantiate a new channel connection ' +
      'as readyState is not ready']);
    return;
  }

  // set if forceSSL
  if (self._forceSSL) {
    self._signalingServerProtocol = 'https:';
  } else {
    self._signalingServerProtocol = window.location.protocol;
  }

  var socketType = 'WebSocket';

  // For IE < 9 that doesn't support WebSocket
  if (!window.WebSocket) {
    socketType = 'Polling';
  }

  self._signalingServerPort = null;

  // Begin with a websocket connection
  self._createSocket(socketType);
};

/**
 * Function that stops the socket connection to the Signaling.
 * @method _closeChannel
 * @private
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype._closeChannel = function() {
  if (!this._channelOpen) {
    return;
  }
  if (this._socket) {
    this._socket.removeAllListeners('connect_error');
    this._socket.removeAllListeners('reconnect_attempt');
    this._socket.removeAllListeners('reconnect_error');
    this._socket.removeAllListeners('reconnect_failed');
    this._socket.removeAllListeners('connect');
    this._socket.removeAllListeners('reconnect');
    this._socket.removeAllListeners('error');
    this._socket.removeAllListeners('disconnect');
    this._socket.removeAllListeners('message');
    this._socket.disconnect();
    this._socket = null;
  }
  this._channelOpen = false;
  this._trigger('channelClose');
};
Skylink.prototype.SM_PROTOCOL_VERSION = '0.1.2';

/**
 * Stores the list of socket messaging protocol types.
 * See confluence docs for the list based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @attribute _SIG_MESSAGE_TYPE
 * @type JSON
 * @readOnly
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._SIG_MESSAGE_TYPE = {
  JOIN_ROOM: 'joinRoom',
  IN_ROOM: 'inRoom',
  ENTER: 'enter',
  WELCOME: 'welcome',
  RESTART: 'restart',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  BYE: 'bye',
  REDIRECT: 'redirect',
  UPDATE_USER: 'updateUserEvent',
  ROOM_LOCK: 'roomLockEvent',
  MUTE_VIDEO: 'muteVideoEvent',
  MUTE_AUDIO: 'muteAudioEvent',
  PUBLIC_MESSAGE: 'public',
  PRIVATE_MESSAGE: 'private',
  STREAM: 'stream',
  GROUP: 'group',
  GET_PEERS: 'getPeers',
  PEER_LIST: 'peerList',
  INTRODUCE: 'introduce',
  INTRODUCE_ERROR: 'introduceError',
  APPROACH: 'approach',
  START_RECORDING: 'startRecordingRoom',
  STOP_RECORDING: 'stopRecordingRoom',
  RECORDING: 'recordingEvent',
  END_OF_CANDIDATES: 'endOfCandidates'
};

/**
 * Stores the list of socket messaging protocol types to queue when sent less than a second interval.
 * @attribute _groupMessageList
 * @type Array
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._groupMessageList = [
  Skylink.prototype._SIG_MESSAGE_TYPE.STREAM,
  Skylink.prototype._SIG_MESSAGE_TYPE.UPDATE_USER,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_AUDIO,
  Skylink.prototype._SIG_MESSAGE_TYPE.MUTE_VIDEO,
  Skylink.prototype._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
];

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that sends a message to Peers via the Signaling socket connection.
 * @method sendMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers in the Room.
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.sendMessage("Hi all!");
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty.push(peerId);
 *     }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     skylinkDemo.sendMessage(message, peersInExclusiveParty);
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Sends socket connection message to all targeted Peers via Signaling server. <ol>
 *   <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers parameter payload
 *   <code>message.isDataChannel</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._peerInformations);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !this._socket || !this._user) {
    log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._peerInformations[peerId]) {
      log.error([peerId, 'Socket', null, 'Dropping of sending message to Peer as ' +
        'Peer session does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (isPrivate) {
      log.debug([peerId, 'Socket', null, 'Sending private message to Peer']);

      this._sendChannelMessage({
        cid: this._key,
        data: message,
        mid: this._user.sid,
        rid: this._room.id,
        target: peerId,
        type: this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE
      });
    }
  }

  if (listOfPeers.length === 0) {
    log.warn('Currently there are no Peers to send message to (unless the message is queued and ' +
      'there are Peer connected by then).');
  }

  if (!isPrivate) {
    log.debug([null, 'Socket', null, 'Broadcasting message to Peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  } else {
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: isPrivate,
      targetPeerId: targetPeerId || null,
      listOfPeers: listOfPeers,
      isDataChannel: false,
      senderPeerId: this._user.sid
    }, this._user.sid, this.getPeerInfo(), true);
  }
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.com.sg">contact us on our support portal</a>.
 * </blockquote>
 * Starts a recording session.
 * @method startRecording
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>START</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>startRecording()</code> error when starting a new recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggered <code>recordingId</code> parameter payload.</small>
 * @example
 *   // Example 1: Start recording session
 *   skylinkDemo.startRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has started. ID ->", success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is an existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to start recording session. <ol>
 *   <li>If recording session has been started successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>START</code>.</li></ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.startRecording = function (callback) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to start recording as MCU is not connected';
    log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (self._currentRecordingId) {
    var hasRecordingSessionError = 'Unable to start recording as there is an existing recording in-progress';
    log.error(hasRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(hasRecordingSessionError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    self.once('recordingState', function (state, recordingId) {
      callback(null, recordingId);
    }, function (state) {
      return state === self.RECORDING_STATE.START;
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.START_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  log.debug(['MCU', 'Recording', null, 'Starting recording']);
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.com.sg">contact us on our support portal</a>.
 * </blockquote>
 * Stops a recording session.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_recordingState">
 *   <code>recordingState</code> event</a> triggering <code>state</code> parameter payload as <code>STOP</code>
 *   or as <code>LINK</code> when the value of <code>callbackSuccessWhenLink</code> is <code>true</code>.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>stopRecording()</code> error when stopping current recording session.</small>
 * @param {String|JSON} callback.success The success result in request.
 * - When <code>callbackSuccessWhenLink</code> value is <code>false</code>, it is defined as string as
 *   the recording session ID.
 * - when <code>callbackSuccessWhenLink</code> value is <code>true</code>, it is defined as an object as
 *   the recording session information.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 * @param {JSON} callback.success.recordingId The recording session ID.
 * @param {JSON} callback.success.link The recording session mixin videos link in
 *   <a href="https://en.wikipedia.org/wiki/MPEG-4_Part_14">MP4</a> format.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 * @param {Boolean} [callbackSuccessWhenLink=false] The flag if <code>callback</code> function provided
 *   should result in success only when <a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggering <code>state</code> parameter payload as <code>LINK</code>.
 * @method stopRecording
 * @example
 *   // Example 1: Stop recording session
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has stopped. ID ->", success);
 *   });
 *
 *   // Example 2: Stop recording session with mixin videos link
 *   skylinkDemo.stopRecording(function (error, success) {
 *     if (error) return;
 *     console.info("Recording session has compiled with links ->", success.link);
 *   }, true);
 * @trigger <ol class="desc-seq">
 *   <li>If MCU is not connected: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If there is no existing recording session currently going on: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>If existing recording session recording time has not elapsed more than 4 seconds:
 *   <small>4 seconds is mandatory for recording session to ensure better recording
 *   experience and stability.</small> <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Sends to MCU via Signaling server to stop recording session: <ol>
 *   <li>If recording session has been stopped successfully: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>START</code>.
 *   <li>MCU starts mixin recorded session videos: <ol>
 *   <li>If recording session has been mixin successfully with links: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>LINK</code>.<li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a> triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>.<li><b>ABORT</b> and return error.</ol></li>
 *   </ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_recordingState"><code>recordingState</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>ERROR</code>.</li><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol>
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.stopRecording = function (callback, callbackSuccessWhenLink) {
  var self = this;

  if (!self._hasMCU) {
    var noMCUError = 'Unable to stop recording as MCU is not connected';
    log.error(noMCUError);
    if (typeof callback === 'function') {
      callback(new Error(noMCUError), null);
    }
    return;
  }

  if (!self._currentRecordingId) {
    var noRecordingSessionError = 'Unable to stop recording as there is no recording in-progress';
    log.error(noRecordingSessionError);
    if (typeof callback === 'function') {
      callback(new Error(noRecordingSessionError), null);
    }
    return;
  }

  if (self._recordingStartInterval) {
    var recordingSecsRequiredError = 'Unable to stop recording as 4 seconds has not been recorded yet';
    log.error(recordingSecsRequiredError);
    if (typeof callback === 'function') {
      callback(new Error(recordingSecsRequiredError), null);
    }
    return;
  }

  if (typeof callback === 'function') {
    var expectedRecordingId = self._currentRecordingId;

    self.once('recordingState', function (state, recordingId, link, error) {
      if (callbackSuccessWhenLink) {
        if (error) {
          callback(error, null);
          return;
        }

        callback(null, {
          link: link,
          recordingId: recordingId
        });
        return;
      }

      callback(null, recordingId);

    }, function (state, recordingId) {
      if (expectedRecordingId === recordingId) {
        if (callbackSuccessWhenLink) {
          return [self.RECORDING_STATE.LINK, self.RECORDING_STATE.ERROR].indexOf(state) > -1;
        }
        return state === self.RECORDING_STATE.STOP;
      }
    });
  }

  self._sendChannelMessage({
    type: self._SIG_MESSAGE_TYPE.STOP_RECORDING,
    rid: self._room.id,
    target: 'MCU'
  });

  log.debug(['MCU', 'Recording', null, 'Stopping recording']);
};

/**
 * <blockquote class="info">
 *   Note that this feature requires MCU and recording to be enabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>. If recording feature is not available to
 *   be enabled in the <a href="https://console.temasys.io">Developer Console</a>, please
 *   <a href="http://support.temasys.com.sg">contact us on our support portal</a>.
 * </blockquote>
 * Gets the list of current recording sessions since User has connected to the Room.
 * @method getRecordings
 * @return {JSON} The list of recording sessions.<ul>
 *   <li><code>#recordingId</code><var><b>{</b>JSON<b>}</b></var><p>The recording session.</p><ul>
 *   <li><code>active</code><var><b>{</b>Boolean<b>}</b></var><p>The flag that indicates if the recording session is currently active.</p></li>
 *   <li><code>state</code><var><b>{</b>Number<b>}</b></var><p>The current recording state. [Rel: Skylink.RECORDING_STATE]</p></li>
 *   <li><code>startedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session started DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the start event is received.</small></p></li>
 *   <li><code>endedDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session ended DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the stop event is received.</small>
 *   <small>Defined only after <code>state</code> has triggered <code>STOP</code>.</small></p></li>
 *   <li><code>mixingDateTime</code><var><b>{</b>String<b>}</b></var><p>The recording session mixing completed DateTime in
 *   <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601 format</a>.<small>Note that this value may not be
 *   very accurate as this value is recorded when the mixing completed event is received.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>links</code><var><b>{</b>JSON<b>}</b></var><p>The recording session links.
 *   <small>Object signature matches the <code>link</code> parameter payload received in the
 *   <a href="#event_recordingState"><code>recordingState</code> event</a>.</small>
 *   <small>Defined only when <code>state</code> is <code>LINK</code>.</small></p></li>
 *   <li><code>error</code><var><b>{</b>Error<b>}</b></var><p>The recording session error.
 *   <small>Defined only when <code>state</code> is <code>ERROR</code>.</small></p></li></ul></li></ul>
 * @example
 *   // Example 1: Get recording sessions
 *   skylinkDemo.getRecordings();
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.getRecordings = function () {
  return clone(this._recordings);
};

/**
 * Function that process and parses the socket message string received from the Signaling.
 * @method _processSigMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSigMessage = function(messageString) {
  var message = JSON.parse(messageString);
  if (message.type === this._SIG_MESSAGE_TYPE.GROUP) {
    log.debug('Bundle of ' + message.lists.length + ' messages');
    for (var i = 0; i < message.lists.length; i++) {
      this._processSingleMessage(JSON.parse(message.lists[i]));
    }
  } else {
    this._processSingleMessage(message);
  }
};

/**
 * Function that handles and processes the socket message received.
 * @method _processingSingleMessage
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._processSingleMessage = function(message) {
  this._trigger('channelMessage', message);
  var origin = message.mid;
  if (!origin || origin === this._user.sid) {
    origin = 'Server';
  }
  log.debug([origin, null, null, 'Received from peer ->'], message.type);
  if (message.mid === this._user.sid &&
    message.type !== this._SIG_MESSAGE_TYPE.REDIRECT &&
    message.type !== this._SIG_MESSAGE_TYPE.IN_ROOM) {
    log.debug([origin, null, null, 'Ignoring message ->'], message.type);
    return;
  }
  switch (message.type) {
  //--- BASIC API Messages ----
  case this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE:
    this._publicMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE:
    this._privateMessageHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.IN_ROOM:
    this._inRoomHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ENTER:
    this._enterHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.WELCOME:
    this._welcomeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RESTART:
    this._restartHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.OFFER:
    this._offerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ANSWER:
    this._answerHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.CANDIDATE:
    this._candidateHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.BYE:
    this._byeHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.REDIRECT:
    this._redirectHandler(message);
    break;
    //--- ADVANCED API Messages ----
  case this._SIG_MESSAGE_TYPE.UPDATE_USER:
    this._updateUserEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_VIDEO:
    this._muteVideoEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.MUTE_AUDIO:
    this._muteAudioEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.STREAM:
    this._streamEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.ROOM_LOCK:
    this._roomLockEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.PEER_LIST:
    this._peerListEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.INTRODUCE_ERROR:
    this._introduceErrorEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.APPROACH:
    this._approachEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.RECORDING:
    this._recordingEventHandler(message);
    break;
  case this._SIG_MESSAGE_TYPE.END_OF_CANDIDATES:
    this._endOfCandidatesHandler(message);
    break;
  default:
    log.error([message.mid, null, null, 'Unsupported message ->'], message.type);
    break;
  }
};

/**
 * Function that handles the "peerList" socket message received.
 * See confluence docs for the "peerList" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _peerListEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerListEventHandler = function(message){
  var self = this;
  self._peerList = message.result;
  log.log(['Server', null, message.type, 'Received list of peers'], self._peerList);
  self._trigger('getPeersStateChange',self.GET_PEERS_STATE.RECEIVED, self._user.sid, self._peerList);
};

/**
 * Function that handles the "endOfCandidates" socket message received.
 * See confluence docs for the "endOfCandidates" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _endOfCandidatesHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._endOfCandidatesHandler = function(message){
  var self = this;
  var targetMid = message.mid;

  if (!(self._peerConnections[targetMid] &&
    self._peerConnections[targetMid].signalingState !== self.PEER_CONNECTION_STATE.CLOSED)) {
    return;
  }

  self._peerEndOfCandidatesCounter[targetMid].expectedLen = message.noOfExpectedCandidates || 0;
  self._signalingEndOfCandidates(targetMid);
};

/**
 * Function that handles the "introduceError" socket message received.
 * See confluence docs for the "introduceError" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _introduceErrorEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._introduceErrorEventHandler = function(message){
  var self = this;
  log.log(['Server', null, message.type, 'Introduce failed. Reason: '+message.reason]);
  self._trigger('introduceStateChange',self.INTRODUCE_STATE.ERROR, self._user.sid,
    message.sendingPeerId, message.receivingPeerId, message.reason);
};

/**
 * Function that handles the "approach" socket message received.
 * See confluence docs for the "approach" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _approachEventHandler
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._approachEventHandler = function(message){
  var self = this;
  log.log(['Server', null, message.type, 'Approaching peer'], message.target);
  // self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  // self._inRoom = true;
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: (window.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    target: message.target,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
    if (self._publishOnly.parentId) {
      enterMsg.parentId = self._publishOnly.parentId;
    }
  }

  self._sendChannelMessage(enterMsg);
};

/**
 * Function that handles the "redirect" socket message received.
 * See confluence docs for the "redirect" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _redirectHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._redirectHandler = function(message) {
  log.log(['Server', null, message.type, 'System action warning:'], {
    message: message.info,
    reason: message.reason,
    action: message.action
  });

  if (message.action === this.SYSTEM_ACTION.REJECT) {
  	for (var key in this._peerConnections) {
  		if (this._peerConnections.hasOwnProperty(key)) {
  			this._removePeer(key);
  		}
  	}
  }

  // Handle the differences provided in Signaling server
  if (message.reason === 'toClose') {
    message.reason = 'toclose';
  }

  this._trigger('systemAction', message.action, message.info, message.reason);
};

/**
 * Function that handles the "updateUserEvent" socket message received.
 * See confluence docs for the "updateUserEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _updateUserEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._updateUserEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer updated userData:'], message.userData);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].userData) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].userData = message.stamp;
    }
    this._peerInformations[targetMid].userData = message.userData || {};
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "roomLockEvent" socket message received.
 * See confluence docs for the "roomLockEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _roomLockEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._roomLockEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, message.type, 'Room lock status:'], message.lock);
  this._trigger('roomLock', message.lock, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "muteAudioEvent" socket message received.
 * See confluence docs for the "muteAudioEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteAudioEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteAudioEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s audio muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].audioMuted) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].audioMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.audioMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "muteVideoEvent" socket message received.
 * See confluence docs for the "muteVideoEvent" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _muteVideoEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._muteVideoEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s video muted:'], message.muted);
  if (this._peerInformations[targetMid]) {
    if (this._peerMessagesStamps[targetMid] && typeof message.stamp === 'number') {
      if (message.stamp < this._peerMessagesStamps[targetMid].videoMuted) {
        log.warn([targetMid, null, message.type, 'Dropping outdated status ->'], message);
        return;
      }
      this._peerMessagesStamps[targetMid].videoMuted = message.stamp;
    }
    this._peerInformations[targetMid].mediaStatus.videoMuted = message.muted;
    this._trigger('streamMuted', targetMid, this.getPeerInfo(targetMid), false,
      this._peerInformations[targetMid].settings.video &&
      this._peerInformations[targetMid].settings.video.screenshare);
    this._trigger('peerUpdated', targetMid, this.getPeerInfo(targetMid), false);
  } else {
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "stream" socket message received.
 * See confluence docs for the "stream" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _streamEventHandler
 * @private
 * @for Skylink
 * @since 0.2.0
 */
Skylink.prototype._streamEventHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type, 'Peer\'s stream status:'], message.status);

  if (this._peerInformations[targetMid] && message.streamId) {
    this._streamsSession[targetMid] = this._streamsSession[targetMid] || {};
    if (message.status === 'ended') {
      if (message.settings && typeof message.settings === 'object' &&
        typeof this._streamsSession[targetMid][message.streamId] === 'undefined') {
        this._streamsSession[targetMid][message.streamId] = {
          audio: message.settings.audio,
          video: message.settings.video
        };
      }

      this._handleEndedStreams(targetMid, message.streamId);
  	}
  } else {
    // Probably left the room already
    log.log([targetMid, null, message.type, 'Peer does not have any user information']);
  }
};

/**
 * Function that handles the "bye" socket message received.
 * See confluence docs for the "bye" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _byeHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._byeHandler = function(message) {
  var targetMid = message.mid;
  var selfId = (this._user || {}).sid;

  if (selfId !== targetMid){
    log.log([targetMid, null, message.type, 'Peer has left the room']);
    this._removePeer(targetMid);
  } else {
    log.log([targetMid, null, message.type, 'Self has left the room']);
  }
};

/**
 * Function that handles the "private" socket message received.
 * See confluence docs for the "private" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _privateMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._privateMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received private message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: true,
    targetPeerId: message.target, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Function that handles the "public" socket message received.
 * See confluence docs for the "public" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _publicMessageHandler
 * @private
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype._publicMessageHandler = function(message) {
  var targetMid = message.mid;
  log.log([targetMid, null, message.type,
    'Received public message from peer:'], message.data);
  this._trigger('incomingMessage', {
    content: message.data,
    isPrivate: false,
    targetPeerId: null, // is not null if there's user
    isDataChannel: false,
    senderPeerId: targetMid
  }, targetMid, this.getPeerInfo(targetMid), false);
};

/**
 * Handles the RECORDING Protocol message event received from the platform signaling.
 * @method _recordingEventHandler
 * @param {JSON} message The message object received from platform signaling.
 *    This should contain the <code>RECORDING</code> payload.
 * @param {String} message.url The recording URL if mixing has completed.
 * @param {String} message.action The recording action received.
 * @param {String} message.error The recording error exception received.
 * @private
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._recordingEventHandler = function (message) {
  var self = this;

  log.debug(['MCU', 'Recording', null, 'Received recording message ->'], message);

  if (message.action === 'on') {
    if (!self._recordings[message.recordingId]) {
      log.debug(['MCU', 'Recording', message.recordingId, 'Started recording']);

      self._currentRecordingId = message.recordingId;
      self._recordings[message.recordingId] = {
        active: true,
        state: self.RECORDING_STATE.START,
        startedDateTime: (new Date()).toISOString(),
        endedDateTime: null,
        mixingDateTime: null,
        links: null,
        error: null
      };
      self._recordingStartInterval = setTimeout(function () {
        log.log(['MCU', 'Recording', message.recordingId, '4 seconds has been recorded. Recording can be stopped now']);
        self._recordingStartInterval = null;
      }, 4000);
      self._trigger('recordingState', self.RECORDING_STATE.START, message.recordingId, null, null);
    }

  } else if (message.action === 'off') {
    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received request of "off" but the session is empty']);
      return;
    }

    self._currentRecordingId = null;

    if (self._recordingStartInterval) {
      clearTimeout(self._recordingStartInterval);
      log.warn(['MCU', 'Recording', message.recordingId, 'Recording stopped abruptly before 4 seconds']);
      self._recordingStartInterval = null;
    }

    log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording']);

    self._recordings[message.recordingId].active = false;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.STOP;
    self._recordings[message.recordingId].endedDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, null);

  } else if (message.action === 'url') {
    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received URL but the session is empty']);
      return;
    }

    var links = {};

    if (Array.isArray(message.urls)) {
      for (var i = 0; i < message.urls.length; i++) {
        links[messages.urls[i].id || ''] = messages.urls[i].url || '';
      }
    } else if (typeof message.url === 'string') {
      links.mixin = message.url;
    }

    self._recordings[message.recordingId].links = links;
    self._recordings[message.recordingId].state = self.RECORDING_STATE.LINK;
    self._recordings[message.recordingId].mixingDateTime = (new Date()).toISOString();
    self._trigger('recordingState', self.RECORDING_STATE.LINK, message.recordingId, links, null);

  } else {
    var recordingError = new Error(message.error || 'Unknown error');
    if (!self._recordings[message.recordingId]) {
      log.error(['MCU', 'Recording', message.recordingId, 'Received error but the session is empty ->'], recordingError);
      return;
    }

    log.error(['MCU', 'Recording', message.recordingId, 'Recording failure ->'], recordingError);

    self._recordings[message.recordingId].state = self.RECORDING_STATE.ERROR;
    self._recordings[message.recordingId].error = recordingError;

    if (self._recordings[message.recordingId].active) {
      log.debug(['MCU', 'Recording', message.recordingId, 'Stopped recording abruptly']);
      self._recordings[message.recordingId].active = false;
      //self._trigger('recordingState', self.RECORDING_STATE.STOP, message.recordingId, null, recordingError);
    }

    self._trigger('recordingState', self.RECORDING_STATE.ERROR, message.recordingId, null, recordingError);
  }
};

/**
 * Function that handles the "inRoom" socket message received.
 * See confluence docs for the "inRoom" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _inRoomHandler
 * @private
 * @for Skylink
 * @since 0.1.0
 */
Skylink.prototype._inRoomHandler = function(message) {
  var self = this;
  log.log(['Server', null, message.type, 'User is now in the room and ' +
    'functionalities are now available. Config received:'], message.pc_config);
  self._room.connection.peerConfig = self._setIceServers(message.pc_config);
  self._inRoom = true;
  self._user.sid = message.sid;
  self._peerPriorityWeight = message.tieBreaker;

  self._trigger('peerJoined', self._user.sid, self.getPeerInfo(), true);
  self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, self._user.sid);

  var streamId = null;

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    streamId = self._streams.screenshare.stream.id || self._streams.screenshare.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.screenshare.stream, true, self.getPeerInfo(), true, streamId);
  } else if (self._streams.userMedia && self._streams.userMedia.stream) {
    streamId = self._streams.userMedia.stream.id || self._streams.userMedia.stream.label;
    self._trigger('incomingStream', self._user.sid, self._streams.userMedia.stream, true, self.getPeerInfo(), false, streamId);
  }
  // NOTE ALEX: should we wait for local streams?
  // or just go with what we have (if no stream, then one way?)
  // do we hardcode the logic here, or give the flexibility?
  // It would be better to separate, do we could choose with whom
  // we want to communicate, instead of connecting automatically to all.
  var enterMsg = {
    type: self._SIG_MESSAGE_TYPE.ENTER,
    mid: self._user.sid,
    rid: self._room.id,
    agent: window.webrtcDetectedBrowser,
    version: (window.webrtcDetectedVersion || 0).toString(),
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    enterMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
    if (self._publishOnly.parentId) {
      enterMsg.parentId = self._publishOnly.parentId;
    }
  }

  self._sendChannelMessage(enterMsg);
};

/**
 * Function that handles the "enter" socket message received.
 * See confluence docs for the "enter" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _enterHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._enterHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : '0.1.0'
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "enter" received ->'], message);

  if (self._publishOnly && ((self._hasMCU && targetMid !== 'MCU') || (self._publishOnly.parentId &&
    self._publishOnly.parentId === targetMid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "enter" for publishOnly case ->'], message);
    return;
  }

  if (!self._peerInformations[targetMid]) {
    isNewPeer = true;

    self._peerInformations[targetMid] = userInfo;

    var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
      !!userInfo.settings.video.screenshare;

    self._addPeer(targetMid, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, false, false, message.receiveOnly, hasScreenshare);

    if (targetMid === 'MCU') {
      log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

      self._hasMCU = true;
      self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

    } else {
      self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
    }

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
  }

  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };

  var welcomeMsg = {
    type: self._SIG_MESSAGE_TYPE.WELCOME,
    mid: self._user.sid,
    rid: self._room.id,
    enableIceTrickle: self._enableIceTrickle,
    enableDataChannel: self._enableDataChannel,
    enableIceRestart: self._enableIceRestart,
    agent: window.webrtcDetectedBrowser,
    version: (window.webrtcDetectedVersion || 0).toString(),
    receiveOnly: self.getPeerInfo().config.receiveOnly,
    os: window.navigator.platform,
    userInfo: self._getUserInfo(),
    target: targetMid,
    weight: self._peerPriorityWeight,
    temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
    SMProtocolVersion: self.SM_PROTOCOL_VERSION,
    DTProtocolVersion: self.DT_PROTOCOL_VERSION
  };

  if (self._publishOnly) {
    welcomeMsg.publishOnly = {
      type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
    };
    if (self._publishOnly.parentId) {
      welcomeMsg.parentId = self._publishOnly.parentId;
    }
  }

  self._sendChannelMessage(welcomeMsg);

  if (isNewPeer) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }
};

/**
 * Function that handles the "restart" socket message received.
 * See confluence docs for the "restart" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _restartHandler
 * @private
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype._restartHandler = function(message){
  var self = this;
  var targetMid = message.mid;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : '0.1.0'
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "restart" received ->'], message);

  if (!self._peerInformations[targetMid]) {
    log.error([targetMid, 'RTCPeerConnection', null, 'Peer does not have an existing session. Ignoring restart process.']);
    return;
  }

  if (self._hasMCU && !self._mcuUseRenegoRestart) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Dropping restart request as MCU does not support re-negotiation. ' +
      'Restart workaround is to re-join Room for Peer.']);
    self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, false);
    return;
  }

  self._peerInformations[targetMid] = userInfo;
  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0
  };
  self._peerEndOfCandidatesCounter[targetMid] = self._peerEndOfCandidatesCounter[targetMid] || {};
  self._peerEndOfCandidatesCounter[targetMid].len = 0;

  // Make peer with highest weight do the offer
  if (self._hasMCU ? message.isRestartResend : self._peerPriorityWeight > message.weight) {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Re-negotiating new offer/answer.']);

    if (self._peerMessagesStamps[targetMid].hasRestart) {
      log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "restart" received.']);
      return;
    }

    self._peerMessagesStamps[targetMid].hasRestart = true;
    self._doOffer(targetMid, message.doIceRestart === true, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, true);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start re-negotiation.']);

    var restartMsg = {
      type: self._SIG_MESSAGE_TYPE.RESTART,
      mid: self._user.sid,
      rid: self._room.id,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: targetMid,
      weight: self._peerPriorityWeight,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      doIceRestart: message.doIceRestart === true,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      isRestartResend: true,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION,
    };

    if (self._publishOnly) {
      restartMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
      if (self._publishOnly.parentId) {
        restartMsg.parentId = self._publishOnly.parentId;
      }
    }

    self._sendChannelMessage(restartMsg);
  }

  self._trigger('peerRestart', targetMid, self.getPeerInfo(targetMid), false, message.doIceRestart === true);
};

/**
 * Function that handles the "welcome" socket message received.
 * See confluence docs for the "welcome" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _welcomeHandler
 * @private
 * @for Skylink
 * @since 0.5.4
 */
Skylink.prototype._welcomeHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var isNewPeer = false;
  var userInfo = message.userInfo || {};
  userInfo.settings = userInfo.settings || {};
  userInfo.mediaStatus = userInfo.mediaStatus || {};
  userInfo.config = {
    enableIceTrickle: typeof message.enableIceTrickle === 'boolean' ? message.enableIceTrickle : true,
    enableIceRestart: typeof message.enableIceRestart === 'boolean' ? message.enableIceRestart : false,
    enableDataChannel: typeof message.enableDataChannel === 'boolean' ? message.enableDataChannel : true,
    priorityWeight: typeof message.weight === 'number' ? message.weight : 0,
    receiveOnly: message.receiveOnly === true,
    publishOnly: !!message.publishOnly
  };
  userInfo.parentId = message.parentId || null;
  userInfo.agent = {
    name: typeof message.agent === 'string' && message.agent ? message.agent : 'other',
    version: (function () {
      if (!(message.version && typeof message.version === 'string')) {
        return 0;
      }
      // E.g. 0.9.6, replace minor "." with 0
      if (message.version.indexOf('.') > -1) {
        var parts = message.version.split('.');
        if (parts.length > 2) {
          var majorVer = parts[0] || '0';
          parts.splice(0, 1);
          return parseFloat(majorVer + '.' + parts.join('0'), 10);
        }
        return parseFloat(message.version || '0', 10);
      }
      return parseInt(message.version || '0', 10);
    })(),
    os: typeof message.os === 'string' && message.os ? message.os : '',
    pluginVersion: typeof message.temasysPluginVersion === 'string' && message.temasysPluginVersion ?
      message.temasysPluginVersion : null,
    SMProtocolVersion: message.SMProtocolVersion && typeof message.SMProtocolVersion === 'string' ?
      message.SMProtocolVersion : '0.1.1',
    DTProtocolVersion: message.DTProtocolVersion && typeof message.DTProtocolVersion === 'string' ?
      message.DTProtocolVersion : '0.1.0'
  };

  log.log([targetMid, 'RTCPeerConnection', null, 'Peer "welcome" received ->'], message);

  if (self._publishOnly && ((self._hasMCU && targetMid !== 'MCU') || (self._publishOnly.parentId &&
    self._publishOnly.parentId === targetMid))) {
    log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding "welcome" for publishOnly case ->'], message);
    return;
  }

  if (!self._peerInformations[targetMid]) {
    isNewPeer = true;

    self._peerInformations[targetMid] = userInfo;

    var hasScreenshare = userInfo.settings.video && typeof userInfo.settings.video === 'object' &&
      !!userInfo.settings.video.screenshare;

    self._addPeer(targetMid, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, false, false, message.receiveOnly, hasScreenshare);

    if (targetMid === 'MCU') {
      log.info([targetMid, 'RTCPeerConnection', null, 'MCU feature has been enabled']);

      self._hasMCU = true;
      self._trigger('serverPeerJoined', targetMid, self.SERVER_PEER_TYPE.MCU);

    } else {
      self._trigger('peerJoined', targetMid, self.getPeerInfo(targetMid), false);
    }

    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
  }

  self._peerMessagesStamps[targetMid] = self._peerMessagesStamps[targetMid] || {
    userData: 0,
    audioMuted: 0,
    videoMuted: 0,
    hasWelcome: false
  };

  if (self._hasMCU || self._peerPriorityWeight > message.weight) {
    if (self._peerMessagesStamps[targetMid].hasWelcome) {
      log.warn([targetMid, 'RTCPeerConnection', null, 'Discarding extra "welcome" received.']);
      return;
    }

    log.debug([targetMid, 'RTCPeerConnection', null, 'Starting negotiation']);

    self._peerMessagesStamps[targetMid].hasWelcome = true;
    self._doOffer(targetMid, false, {
      agent: userInfo.agent.name,
      version: userInfo.agent.version,
      os: userInfo.agent.os
    }, true);

  } else {
    log.debug([targetMid, 'RTCPeerConnection', null, 'Waiting for peer to start negotiation.']);

    var welcomeMsg = {
      type: self._SIG_MESSAGE_TYPE.WELCOME,
      mid: self._user.sid,
      rid: self._room.id,
      enableIceTrickle: self._enableIceTrickle,
      enableDataChannel: self._enableDataChannel,
      enableIceRestart: self._enableIceRestart,
      receiveOnly: self.getPeerInfo().config.receiveOnly,
      agent: window.webrtcDetectedBrowser,
      version: (window.webrtcDetectedVersion || 0).toString(),
      os: window.navigator.platform,
      userInfo: self._getUserInfo(),
      target: targetMid,
      weight: self._peerPriorityWeight,
      temasysPluginVersion: AdapterJS.WebRTCPlugin.plugin ? AdapterJS.WebRTCPlugin.plugin.VERSION : null,
      SMProtocolVersion: self.SM_PROTOCOL_VERSION,
      DTProtocolVersion: self.DT_PROTOCOL_VERSION
    };

    if (self._publishOnly) {
      welcomeMsg.publishOnly = {
        type: self._streams.screenshare && self._streams.screenshare.stream ? 'screenshare' : 'video'
      };
      if (self._publishOnly.parentId) {
        welcomeMsg.parentId = self._publishOnly.parentId;
      }
    }

    self._sendChannelMessage(welcomeMsg);
  }
};

/**
 * Function that handles the "offer" socket message received.
 * See confluence docs for the "offer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _offerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._offerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;
  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for offer']);
    return;
  }

  /*if (pc.localDescription ? !!pc.localDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.localDescription);
    return;
  }*/

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  log.log([targetMid, null, message.type, 'Received offer from peer. ' +
    'Session description:'], clone(message));

  var offer = new RTCSessionDescription({
    type: message.type,
    sdp: self._hasMCU ? message.sdp.split('\n').join('\r\n') : message.sdp
  });
  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], offer);

  offer.sdp = self._removeSDPFilteredCandidates(targetMid, offer);
  offer.sdp = self._setSDPBitrate(targetMid, offer);
  offer.sdp = self._setSDPOpusConfig(targetMid, offer);
  offer.sdp = self._removeSDPCodecs(targetMid, offer);
  offer.sdp = self._removeSDPREMBPackets(targetMid, offer);

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote offer ->'], offer.sdp);

  // This is always the initial state. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"stable" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.resend
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'offer',
      'Dropping of setting local offer as there is another ' +
      'sessionDescription being processed ->'], offer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(offer, function() {
    log.debug([targetMid, 'RTCSessionDescription', message.type, 'Remote description set']);
    pc.setOffer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.OFFER, targetMid);
    self._addIceCandidateFromQueue(targetMid);
    self._doAnswer(targetMid);
  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], error);
  });
};


/**
 * Function that handles the "candidate" socket message received.
 * See confluence docs for the "candidate" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _candidateHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._candidateHandler = function(message) {
  var targetMid = message.mid;

  if (!message.candidate && !message.id) {
    log.warn([targetMid, 'RTCIceCandidate', null, 'Received invalid ICE candidate message ->'], message);
    return;
  }

  var canId = 'can-' + (new Date()).getTime();
  var candidateType = message.candidate.split(' ')[7] || '';
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: message.label,
    candidate: message.candidate,
    sdpMid: message.id
  });

  log.debug([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Received ICE candidate ->'], candidate);

  this._peerEndOfCandidatesCounter[targetMid] = this._peerEndOfCandidatesCounter[targetMid] || {};
  this._peerEndOfCandidatesCounter[targetMid].len = this._peerEndOfCandidatesCounter[targetMid].len || 0;
  this._peerEndOfCandidatesCounter[targetMid].hasSet = false;
  this._peerEndOfCandidatesCounter[targetMid].len++;

  this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.RECEIVED,
    targetMid, canId, candidateType, {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex
  }, null);

  if (!(this._peerConnections[targetMid] &&
    this._peerConnections[targetMid].signalingState !== this.PEER_CONNECTION_STATE.CLOSED)) {
    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping ICE candidate ' +
      'as Peer connection does not exists or is closed'], this._peerConnections[targetMid].signalingState);
    this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
      targetMid, canId, candidateType, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex
    }, new Error('Failed processing ICE candidate as Peer connection does not exists or is closed.'));
    this._signalingEndOfCandidates(targetMid);
    return;
  }

  if (this._filterCandidatesType[candidateType]) {
    if (!(this._hasMCU && this._forceTURN)) {
      log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Dropping received ICE candidate as ' +
        'it matches ICE candidate filtering flag ->'], candidate);
      this._trigger('candidateProcessingState', this.CANDIDATE_PROCESSING_STATE.DROPPED,
        targetMid, canId, candidateType, {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      }, new Error('Dropping of processing ICE candidate as it matches ICE candidate filtering flag.'));
      this._signalingEndOfCandidates(targetMid);
      return;
    }

    log.warn([targetMid, 'RTCIceCandidate', canId + ':' + candidateType, 'Not dropping received ICE candidate as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured ->'], candidate);
  }

  if (this._peerConnections[targetMid].remoteDescription && this._peerConnections[targetMid].remoteDescription.sdp &&
    this._peerConnections[targetMid].localDescription && this._peerConnections[targetMid].localDescription.sdp) {
    this._addIceCandidate(targetMid, canId, candidate);
  } else {
    this._addIceCandidateToQueue(targetMid, canId, candidate);
  }

  this._signalingEndOfCandidates(targetMid);

  if (!this._gatheredCandidates[targetMid]) {
    this._gatheredCandidates[targetMid] = {
      sending: { host: [], srflx: [], relay: [] },
      receiving: { host: [], srflx: [], relay: [] }
    };
  }

  this._gatheredCandidates[targetMid].receiving[candidateType].push({
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate
  });
};

/**
 * Function that handles the "answer" socket message received.
 * See confluence docs for the "answer" expected properties to be received
 *   based on the current <code>SM_PROTOCOL_VERSION</code>.
 * @method _answerHandler
 * @private
 * @for Skylink
 * @since 0.5.1
 */
Skylink.prototype._answerHandler = function(message) {
  var self = this;
  var targetMid = message.mid;

  log.log([targetMid, null, message.type,
    'Received answer from peer. Session description:'], clone(message));

  var pc = self._peerConnections[targetMid];

  if (!pc) {
    log.error([targetMid, null, message.type, 'Peer connection object ' +
      'not found. Unable to setRemoteDescription for answer']);
    return;
  }

  // Add-on by Web SDK fixes
  if (message.userInfo && typeof message.userInfo === 'object') {
    var userInfo = message.userInfo || {};

    self._peerInformations[targetMid].settings = userInfo.settings || {};
    self._peerInformations[targetMid].mediaStatus = userInfo.mediaStatus || {};
    self._peerInformations[targetMid].userData = userInfo.userData;
  }

  var answer = new RTCSessionDescription({
    type: message.type,
    sdp: self._hasMCU ? message.sdp.split('\n').join('\r\n') : message.sdp
  });

  log.log([targetMid, 'RTCSessionDescription', message.type,
    'Session description object created'], answer);

  /*if (pc.remoteDescription ? !!pc.remoteDescription.sdp : false) {
    log.warn([targetMid, null, message.type, 'Peer has an existing connection'],
      pc.remoteDescription);
    return;
  }

  if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE) {
    log.error([targetMid, null, message.type, 'Unable to set peer connection ' +
      'at signalingState "stable". Ignoring remote answer'], pc.signalingState);
    return;
  }*/

  answer.sdp = self._removeSDPFilteredCandidates(targetMid, answer);
  answer.sdp = self._setSDPBitrate(targetMid, answer);
  answer.sdp = self._setSDPOpusConfig(targetMid, answer);
  answer.sdp = self._removeSDPCodecs(targetMid, answer);
  answer.sdp = self._removeSDPREMBPackets(targetMid, answer);

  log.log([targetMid, 'RTCSessionDescription', message.type, 'Updated remote answer ->'], answer.sdp);


  // This should be the state after offer is received. or even after negotiation is successful
  if (pc.signalingState !== self.PEER_CONNECTION_STATE.HAVE_LOCAL_OFFER) {
    log.warn([targetMid, null, message.type, 'Peer connection state is not in ' +
      '"have-local-offer" state for re-negotiation. Dropping message.'], {
        signalingState: pc.signalingState,
        isRestart: !!message.restart
      });
    return;
  }

  // Added checks if there is a current remote sessionDescription being processing before processing this one
  if (pc.processingRemoteSDP) {
    log.warn([targetMid, 'RTCSessionDescription', 'answer',
      'Dropping of setting local answer as there is another ' +
      'sessionDescription being processed ->'], answer);
    return;
  }

  pc.processingRemoteSDP = true;

  pc.setRemoteDescription(answer, function() {
    log.debug([targetMid, null, message.type, 'Remote description set']);
    pc.setAnswer = 'remote';
    pc.processingRemoteSDP = false;
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    self._addIceCandidateFromQueue(targetMid);

    if (self._peerMessagesStamps[targetMid]) {
      self._peerMessagesStamps[targetMid].hasRestart = false;
    }

  }, function(error) {
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ERROR, targetMid, error);

    pc.processingRemoteSDP = false;

    log.error([targetMid, null, message.type, 'Failed setting remote description:'], {
      error: error,
      state: pc.signalingState
    });
  });
};

/**
 * Function that compares the SM / DT protocol versions to see if it in the version.
 * @method _isLowerThanVersion
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._isLowerThanVersion = function (agentVer, requiredVer) {
  var partsA = agentVer.split('.');
  var partsB = requiredVer.split('.');

  for (var i = 0; i < partsB.length; i++) {
    if (parseInt(partsA[i] || '0', 10) < parseInt(partsB[i] || '0', 10)) {
      return true;
    }
  }

  return false;
};

Skylink.prototype.VIDEO_CODEC = {
  AUTO: 'auto',
  VP8: 'VP8',
  H264: 'H264',
  VP9: 'VP9'
  //H264UC: 'H264UC'
};

/**
 * <blockquote class="info">
 *   Note that if the audio codec is not supported, the SDK will not configure the local <code>"offer"</code> or
 *   <code>"answer"</code> session description to prefer the codec.
 * </blockquote>
 * The list of available audio codecs to set as the preferred audio codec to use to encode
 * sending audio data when available encoded audio codec for Peer connections
 * configured in the <a href="#method_init"><code>init()</code> method</a>.
 * @attribute AUDIO_CODEC
 * @param {String} AUTO <small>Value <code>"auto"</code></small>
 *   The value of the option to not prefer any audio codec but rather use the created
 *   local <code>"offer"</code> / <code>"answer"</code> session description audio codec preference.
 * @param {String} OPUS <small>Value <code>"opus"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Opus_(audio_format)">OPUS</a> audio codec.
 * @param {String} ISAC <small>Value <code>"ISAC"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/Internet_Speech_Audio_Codec">ISAC</a> audio codec.
 * @param {String} G722 <small>Value <code>"G722"</code></small>
 *   The value of the option to prefer the <a href="https://en.wikipedia.org/wiki/G.722">G722</a> audio codec.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype.AUDIO_CODEC = {
  AUTO: 'auto',
  ISAC: 'ISAC',
  OPUS: 'opus',
  //ILBC: 'ILBC',
  //G711: 'G711',
  G722: 'G722'
  //SILK: 'SILK'
};

/**
 * <blockquote class="info">
 *   Note that currently <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> only configures
 *   the maximum resolution of the Stream due to browser interopability and support.
 * </blockquote>
 * The list of <a href="https://en.wikipedia.org/wiki/Graphics_display_resolution#Video_Graphics_Array">
 * video resolutions</a> sets configured in the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 * @attribute VIDEO_RESOLUTION
 * @param {JSON} QQVGA <small>Value <code>{ width: 160, height: 120 }</code></small>
 *   The value of the option to configure QQVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} HQVGA <small>Value <code>{ width: 240, height: 160 }</code></small>
 *   The value of the option to configure HQVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} QVGA <small>Value <code>{ width: 320, height: 240 }</code></small>
 *   The value of the option to configure QVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 * @param {JSON} WQVGA <small>Value <code>{ width: 384, height: 240 }</code></small>
 *   The value of the option to configure WQVGA resolution.
 *   <small>Aspect ratio: <code>16:10</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} HVGA <small>Value <code>{ width: 480, height: 320 }</code></small>
 *   The value of the option to configure HVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} VGA <small>Value <code>{ width: 640, height: 480 }</code></small>
 *   The value of the option to configure VGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 * @param {JSON} WVGA <small>Value <code>{ width: 768, height: 480 }</code></small>
 *   The value of the option to configure WVGA resolution.
 *   <small>Aspect ratio: <code>16:10</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} FWVGA <small>Value <code>{ width: 854, height: 480 }</code></small>
 *   The value of the option to configure FWVGA resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} SVGA <small>Value <code>{ width: 800, height: 600 }</code></small>
 *   The value of the option to configure SVGA resolution.
 *   <small>Aspect ratio: <code>4:3</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} DVGA <small>Value <code>{ width: 960, height: 640 }</code></small>
 *   The value of the option to configure DVGA resolution.
 *   <small>Aspect ratio: <code>3:2</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} WSVGA <small>Value <code>{ width: 1024, height: 576 }</code></small>
 *   The value of the option to configure WSVGA resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 * @param {JSON} HD <small>Value <code>{ width: 1280, height: 720 }</code></small>
 *   The value of the option to configure HD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on device supports.</small>
 * @param {JSON} HDPLUS <small>Value <code>{ width: 1600, height: 900 }</code></small>
 *   The value of the option to configure HDPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} FHD <small>Value <code>{ width: 1920, height: 1080 }</code></small>
 *   The value of the option to configure FHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on device supports.</small>
 * @param {JSON} QHD <small>Value <code>{ width: 2560, height: 1440 }</code></small>
 *   The value of the option to configure QHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} WQXGAPLUS <small>Value <code>{ width: 3200, height: 1800 }</code></small>
 *   The value of the option to configure WQXGAPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} UHD <small>Value <code>{ width: 3840, height: 2160 }</code></small>
 *   The value of the option to configure UHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} UHDPLUS <small>Value <code>{ width: 5120, height: 2880 }</code></small>
 *   The value of the option to configure UHDPLUS resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} FUHD <small>Value <code>{ width: 7680, height: 4320 }</code></small>
 *   The value of the option to configure FUHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @param {JSON} QUHD <small>Value <code>{ width: 15360, height: 8640 }</code></small>
 *   The value of the option to configure QUHD resolution.
 *   <small>Aspect ratio: <code>16:9</code></small>
 *   <small>Note that configurating this resolution may not be supported depending on browser and device supports.</small>
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.VIDEO_RESOLUTION = {
  QQVGA: { width: 160, height: 120 /*, aspectRatio: '4:3'*/ },
  HQVGA: { width: 240, height: 160 /*, aspectRatio: '3:2'*/ },
  QVGA: { width: 320, height: 240 /*, aspectRatio: '4:3'*/ },
  WQVGA: { width: 384, height: 240 /*, aspectRatio: '16:10'*/ },
  HVGA: { width: 480, height: 320 /*, aspectRatio: '3:2'*/ },
  VGA: { width: 640, height: 480 /*, aspectRatio: '4:3'*/ },
  WVGA: { width: 768, height: 480 /*, aspectRatio: '16:10'*/ },
  FWVGA: { width: 854, height: 480 /*, aspectRatio: '16:9'*/ },
  SVGA: { width: 800, height: 600 /*, aspectRatio: '4:3'*/ },
  DVGA: { width: 960, height: 640 /*, aspectRatio: '3:2'*/ },
  WSVGA: { width: 1024, height: 576 /*, aspectRatio: '16:9'*/ },
  HD: { width: 1280, height: 720 /*, aspectRatio: '16:9'*/ },
  HDPLUS: { width: 1600, height: 900 /*, aspectRatio: '16:9'*/ },
  FHD: { width: 1920, height: 1080 /*, aspectRatio: '16:9'*/ },
  QHD: { width: 2560, height: 1440 /*, aspectRatio: '16:9'*/ },
  WQXGAPLUS: { width: 3200, height: 1800 /*, aspectRatio: '16:9'*/ },
  UHD: { width: 3840, height: 2160 /*, aspectRatio: '16:9'*/ },
  UHDPLUS: { width: 5120, height: 2880 /*, aspectRatio: '16:9'*/ },
  FUHD: { width: 7680, height: 4320 /*, aspectRatio: '16:9'*/ },
  QUHD: { width: 15360, height: 8640 /*, aspectRatio: '16:9'*/ }
};

/**
 * The list of <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> or
 * <a href="#method_shareScreen"><code>shareScreen()</code> method</a> Stream fallback states.
 * @attribute MEDIA_ACCESS_FALLBACK_STATE
 * @param {JSON} FALLBACKING <small>Value <code>0</code></small>
 *   The value of the state when <code>getUserMedia()</code> will retrieve audio track only
 *   when retrieving audio and video tracks failed.
 *   <small>This can be configured by <a href="#method_init"><code>init()</code> method</a>
 *   <code>audioFallback</code> option.</small>
 * @param {JSON} FALLBACKED  <small>Value <code>1</code></small>
 *   The value of the state when <code>getUserMedia()</code> or <code>shareScreen()</code>
 *   retrieves camera / screensharing Stream successfully but with missing originally required audio or video tracks.
 * @param {JSON} ERROR       <small>Value <code>-1</code></small>
 *   The value of the state when <code>getUserMedia()</code> failed to retrieve audio track only
 *   after retrieving audio and video tracks failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.14
 */
Skylink.prototype.MEDIA_ACCESS_FALLBACK_STATE = {
  FALLBACKING: 0,
  FALLBACKED: 1,
  ERROR: -1
};

/**
 * The list of recording states.
 * @attribute RECORDING_STATE
 * @param {Number} START <small>Value <code>0</code></small>
 *   The value of the state when recording session has started.
 * @param {Number} STOP <small>Value <code>1</code></small>
 *   The value of the state when recording session has stopped.<br>
 *   <small>At this stage, the recorded videos will go through the mixin server to compile the videos.</small>
 * @param {Number} LINK <small>Value <code>2</code></small>
 *   The value of the state when recording session mixin request has been completed.
 * @param {Number} ERROR <small>Value <code>-1</code></small>
 *   The value of the state state when recording session has errors.
 *   <small>This can happen during recording session or during mixin of recording videos,
 *   and at this stage, any current recording session or mixin is aborted.</small>
 * @type JSON
 * @beta
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype.RECORDING_STATE = {
  START: 0,
  STOP: 1,
  LINK: 2,
  ERROR: -1
};

/**
 * <blockquote class="info">
 *   For a better user experience, the functionality is throttled when invoked many times in less
 *   than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Function that retrieves camera Stream.
 * @method getUserMedia
 * @param {JSON} [options] The camera Stream configuration options.
 * - When not provided, the value is set to <code>{ audio: true, video: true }</code>.
 *   <small>To fallback to retrieve audio track only when retrieving of audio and video tracks failed,
 *   enable the <code>audioFallback</code> flag in the <a href="#method_init"><code>init()</code> method</a>.</small>
 * @param {Boolean} [options.useExactConstraints=false] <blockquote class="info">
 *   Note that by enabling this flag, exact values will be requested when retrieving camera Stream,
 *   but it does not prevent constraints related errors. By default when not enabled,
 *   expected mandatory maximum values (or optional values for source ID) will requested to prevent constraints related
 *   errors, with an exception for <code>options.video.frameRate</code> option in Safari and IE (any plugin-enabled) browsers,
 *   where the expected maximum value will not be requested due to the lack of support.</blockquote>
 *   The flag if <code>getUserMedia()</code> should request for camera Stream to match exact requested values of
 *   <code>options.audio.deviceId</code> and <code>options.video.deviceId</code>, <code>options.video.resolution</code>
 *   and <code>options.video.frameRate</code> when provided.
 * @param {Boolean|JSON} [options.audio=false] The audio configuration options.
 * @param {Boolean} [options.audio.stereo=false] The flag if stereo band should be configured
 *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>Note that Peers may override the "receiving" <code>stereo</code> config depending on the Peers configuration.</small>
 * @param {Boolean} [options.audio.usedtx] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if DTX (Discontinuous Transmission) should be configured when encoding audio codec
 *   is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>This might help to reduce bandwidth it reduces the bitrate during silence or background noise.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 *   <small>Note that Peers may override the "receiving" <code>usedtx</code> config depending on the Peers configuration.</small>
 * @param {Boolean} [options.audio.useinbandfec] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if capability to take advantage of in-band FEC (Forward Error Correction) should be
 *   configured when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>This might help to reduce the harm of packet loss by encoding information about the previous packet.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 *   <small>Note that Peers may override the "receiving" <code>useinbandfec</code> config depending on the Peers configuration.</small>
 * @param {Number} [options.audio.maxplaybackrate] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The maximum output sampling rate rendered in Hertz (Hz) when encoding audio codec is
 *   <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending / receiving audio data.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 *   <small>Note that Peers may override the "receiving" <code>maxplaybackrate</code> config depending on the Peers configuration.</small>
 * @param {Boolean} [options.audio.mute=false] The flag if audio tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.audioMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.audioMuted</code> value to
 *   <code>true</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> audio tracks as well.</small>
 * @param {Array} [options.audio.optional] <blockquote class="info">
 *   Note that this may result in constraints related error when <code>options.useExactConstraints</code> value is
 *   <code>true</code>. If you are looking to set the requested source ID of the audio track,
 *   use <code>options.audio.deviceId</code> instead.</blockquote>
 *   The <code>navigator.getUserMedia()</code> API <code>audio: { optional [..] }</code> property.
 * @param {String} [options.audio.deviceId] <blockquote class="info">
 *   Note this is currently not supported in Firefox browsers.
 *   </blockquote> The audio track source ID of the device to use.
 *   <small>The list of available audio source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.</small>
 * @param {Boolean} [options.audio.echoCancellation=false] The flag to enable audio tracks echo cancellation.
 * @param {Boolean|JSON} [options.video=false] The video configuration options.
 * @param {Boolean} [options.video.mute=false] The flag if video tracks should be muted upon receiving them.
 *   <small>Providing the value as <code>false</code> does nothing to <code>peerInfo.mediaStatus.videoMuted</code>,
 *   but when provided as <code>true</code>, this sets the <code>peerInfo.mediaStatus.videoMuted</code> value to
 *   <code>true</code> and mutes any existing <a href="#method_shareScreen">
 *   <code>shareScreen()</code> Stream</a> video tracks as well.</small>
 * @param {JSON} [options.video.resolution] The video resolution.
 *   <small>By default, <a href="#attr_VIDEO_RESOLUTION"><code>VGA</code></a> resolution option
 *   is selected when not provided.</small>
 *   [Rel: Skylink.VIDEO_RESOLUTION]
 * @param {Number|JSON} [options.video.resolution.width] The video resolution width.
 * - When provided as a number, it is the video resolution width.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.width</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal resolution width, <code>"exact"</code> for exact video resolution width,
 *   <code>"min"</code> for min video resolution width and <code>"max"</code> for max video resolution width.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @param {Number|JSON} [options.video.resolution.height] The video resolution height.
 * - When provided as a number, it is the video resolution height.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.height</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video resolution height, <code>"exact"</code> for exact video resolution height,
 *   <code>"min"</code> for min video resolution height and <code>"max"</code> for max video resolution height.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @param {Number|JSON} [options.video.frameRate] The video <a href="https://en.wikipedia.org/wiki/Frame_rate">
 *   frameRate</a> per second (fps).
 * - When provided as a number, it is the video framerate.
 * - When provided as a JSON, it is the <code>navigator.mediaDevices.getUserMedia()</code> <code>.frameRate</code> settings.
 *   Parameters are <code>"ideal"</code> for ideal video framerate, <code>"exact"</code> for exact video framerate,
 *   <code>"min"</code> for min video framerate and <code>"max"</code> for max video framerate.
 *   Note that this may result in constraints related errors depending on the browser/hardware supports.
 * @param {Array} [options.video.optional] <blockquote class="info">
 *   Note that this may result in constraints related error when <code>options.useExactConstraints</code> value is
 *   <code>true</code>. If you are looking to set the requested source ID of the video track,
 *   use <code>options.video.deviceId</code> instead.</blockquote>
 *   The <code>navigator.getUserMedia()</code> API <code>video: { optional [..] }</code> property.
 * @param {String} [options.video.deviceId] <blockquote class="info">
 *   Note this is currently not supported in Firefox browsers.
 *   </blockquote> The video track source ID of the device to use.
 *   <small>The list of available video source ID can be retrieved by the <a href="https://developer.
 * mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"><code>navigator.mediaDevices.enumerateDevices</code>
 *   API</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter
 *   payload value as <code>false</code> for request success.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getUserMedia()</code> error when retrieving camera Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the camera Stream object.</small>
 * @example
 *   // Example 1: Get both audio and video.
 *   skylinkDemo.getUserMedia(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 2: Get only audio.
 *   skylinkDemo.getUserMedia({
 *     audio: true
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-audio"), success);
 *   });
 *
 *   // Example 3: Configure resolution for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       resolution: skylinkDemo.VIDEO_RESOLUTION.HD
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 4: Configure stereo flag for OPUS codec audio (OPUS is always used by default)
 *   skylinkDemo.init({
 *     appKey: "xxxxxx",
 *     audioCodec: skylinkDemo.AUDIO_CODEC.OPUS
 *   }, function (initErr, initSuccess) {
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         stereo: true
 *       },
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   });
 *
 *   // Example 5: Configure frameRate for video
 *   skylinkDemo.getUserMedia({
 *     audio: true,
 *     video: {
 *       frameRate: 50
 *     }
 *   }, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-video"), success);
 *   });
 *
 *   // Example 6: Configure video and audio based on selected sources. Does not work for Firefox currently.
 *   var sources = { audio: [], video: [] };
 *
 *   function selectStream (audioSourceId, videoSourceId) {
 *     if (window.webrtcDetectedBrowser === 'firefox') {
 *       console.warn("Currently this feature is not supported by Firefox browsers!");
 *       return;
 *     }
 *     skylinkDemo.getUserMedia({
 *       audio: {
 *         optional: [{ sourceId: audioSourceId }]
 *       },
 *       video: {
 *         optional: [{ sourceId: videoSourceId }]
 *       }
 *     }, function (error, success) {
 *       if (error) return;
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   navigator.mediaDevices.enumerateDevices().then(function(devices) {
 *     var selectedAudioSourceId = "";
 *     var selectedVideoSourceId = "";
 *     devices.forEach(function(device) {
 *       console.log(device.kind + ": " + device.label + " source ID = " + device.deviceId);
 *       if (device.kind === "audio") {
 *         selectedAudioSourceId = device.deviceId;
 *       } else {
 *         selectedVideoSourceId = device.deviceId;
 *       }
 *     });
 *     selectStream(selectedAudioSourceId, selectedVideoSourceId);
 *   }).catch(function (error) {
 *      console.error("Failed", error);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If <code>options.audio</code> value is <code>false</code> and <code>options.video</code>
 *   value is <code>false</code>: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Retrieve camera Stream. <ol><li>If retrieval was succesful: <ol>
 *   <li>If there is any previous <code>getUserMedia()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</li></ol></li>
 *   <li>If there are missing audio or video tracks requested: <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in <code>peerInfo.mediaStatus</code>.
 *   <small>This can be retrieved with <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If <code>options.audioFallback</code> is enabled in the <a href="#method_init"><code>init()</code> method</a>,
 *   <code>options.audio</code> value is <code>true</code> and <code>options.video</code> value is <code>true</code>: <ol>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>FALLBACKING</code>, <code>isScreensharing</code>
 *   value as <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li>Retrieve camera Stream with audio tracks only. <ol><li>If retrieval was successful: <ol>
 *   <li>If there is any previous <code>getUserMedia()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in <code>peerInfo.mediaStatus</code>.
 *   <small>This can be retrieved with <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallback</code> value as <code>true</code>.</li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and
 *   <code>isAudioFallbackError</code> value as <code>true</code>.</li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> event triggers
 *   parameter payload <code>state</code> as <code>ERROR</code>, <code>isScreensharing</code> value as
 *   <code>false</code> and <code>isAudioFallback</code> value as <code>true</code>.</li>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallbackError</code> value as
 *   <code>false</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.getUserMedia = function(options,callback) {
  var self = this;

  if (typeof options === 'function'){
    callback = options;
    options = {
      audio: true,
      video: true
    };

  } else if (typeof options !== 'object' || options === null) {
    if (typeof options === 'undefined') {
      options = {
        audio: true,
        video: true
      };

    } else {
      var invalidOptionsError = 'Please provide a valid options';
      log.error(invalidOptionsError, options);
      if (typeof callback === 'function') {
        callback(new Error(invalidOptionsError), null);
      }
      return;
    }

  } else if (!options.audio && !options.video) {
    var noConstraintOptionsSelectedError = 'Please select audio or video';
    log.error(noConstraintOptionsSelectedError, options);
    if (typeof callback === 'function') {
      callback(new Error(noConstraintOptionsSelectedError), null);
    }
    return;
  }

  /*if (window.location.protocol !== 'https:' && window.webrtcDetectedBrowser === 'chrome' &&
    window.webrtcDetectedVersion > 46) {
    errorMsg = 'getUserMedia() has to be called in https:// application';
    log.error(errorMsg, options);
    if (typeof callback === 'function') {
      callback(new Error(errorMsg), null);
    }
    return;
  }*/

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.getUserMedia + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    if (typeof callback === 'function') {
      var mediaAccessSuccessFn = function (stream) {
        self.off('mediaAccessError', mediaAccessErrorFn);
        callback(null, stream);
      };
      var mediaAccessErrorFn = function (error) {
        self.off('mediaAccessSuccess', mediaAccessSuccessFn);
        callback(error, null);
      };

      self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
        return !isScreensharing;
      });

      self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
        return !isScreensharing;
      });
    }

    // Parse stream settings
    var settings = self._parseStreamSettings(options);

    navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
      if (settings.mutedSettings.shouldAudioMuted) {
        self._streamsMutedSettings.audioMuted = true;
      }

      if (settings.mutedSettings.shouldVideoMuted) {
        self._streamsMutedSettings.videoMuted = true;
      }

      self._onStreamAccessSuccess(stream, settings, false, false);

    }, function (error) {
      self._onStreamAccessError(error, settings, false, false);
    });
  }, 'getUserMedia', self._throttlingTimeouts.getUserMedia);
};

/**
 * <blockquote class="info">
 *   Note that if <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is available despite having
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> available, the
 *   <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> is sent instead of the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> to Peers.
 * </blockquote>
 * Function that sends a new <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>
 * to all connected Peers in the Room.
 * @method sendStream
 * @param {JSON|MediaStream} options The <a href="#method_getUserMedia"><code>getUserMedia()</code>
 *   method</a> <code>options</code> parameter settings.
 * - When provided as a <code>MediaStream</code> object, this configures the <code>options.audio</code> and
 *   <code>options.video</code> based on the tracks available in the <code>MediaStream</code> object,
 *   and configures the <code>options.audio.mute</code> and <code>options.video.mute</code> based on the tracks
 *   <code>.enabled</code> flags in the tracks provided in the <code>MediaStream</code> object without
 *   invoking <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.
 *   <small>Object signature matches the <code>options</code> parameter in the
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter payload value
 *   as <code>false</code> for request success when User is in Room without Peers,
 *   or by the <a href="#event_peerRestart"><code>peerRestart</code> event</a> triggering
 *   <code>isSelfInitiateRestart</code> parameter payload value as <code>true</code> for all connected Peers
 *   for request success when User is in Room with Peers.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> error or
 *   when invalid <code>options</code> is provided.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a>
 *   Stream object.</small>
 * @example
 *   // Example 1: Send MediaStream object
 *   function retrieveStreamBySourceForFirefox (sourceId) {
 *     navigator.mediaDevices.getUserMedia({
 *       audio: true,
 *       video: {
 *         sourceId: { exact: sourceId }
 *       }
 *     }).then(function (stream) {
 *       skylinkDemo.sendStream(stream, function (error, success) {
 *         if (err) return;
 *         if (stream === success) {
 *           console.info("Same MediaStream has been sent");
 *         }
 *         console.log("Stream is now being sent to Peers");
 *         attachMediaStream(document.getElementById("my-video"), success);
 *       });
 *     });
 *   }
 *
 *   // Example 2: Send video later
 *   var inRoom = false;
 *
 *   function sendVideo () {
 *     if (!inRoom) return;
 *     skylinkDemo.sendStream({
 *       audio: true,
 *       video: true
 *     }, function (error, success) {
 *       if (error) return;
 *       console.log("getUserMedia() Stream with video is now being sent to Peers");
 *       attachMediaStream(document.getElementById("my-video"), success);
 *     });
 *   }
 *
 *   skylinkDemo.joinRoom({
 *     audio: true
 *   }, function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     inRoom = true;
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If User is not in Room: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks <code>options</code> provided. <ol><li>If provided parameter <code>options</code> is not valid: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Else if provided parameter <code>options</code> is a Stream object: <ol>
 *   <li>Checks if there is any audio or video tracks. <ol><li>If there is no tracks: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>Else: <ol>
 *   <li>Set <code>options.audio</code> value as <code>true</code> if Stream has audio tracks.</li>
 *   <li>Set <code>options.video</code> value as <code>false</code> if Stream has video tracks.</li>
 *   <li>Mutes / Unmutes audio and video tracks based on current muted settings in
 *   <code>peerInfo.mediaStatus</code>. <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small></li>
 *   <li>If there is any previous <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>:
 *   <ol><li>Invokes <a href="#method_stopStream"><code>stopStream()</code> method</a> to stop previous Stream.</li></ol></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>Invoke <a href="#method_getUserMedia"><code>getUserMedia()</code> method</a> with
 *   <code>options</code> provided in <code>sendStream()</code>. <ol><li>If request has errors: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If there is currently no <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a>. <ol>
 *   <li>If MCU is enabled: <ol><li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code>
 *   method</a>. <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li>
 *   <li>Else: <ol><li>If there are connected Peers in the Room: <ol>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>. <ol>
 *   <li>If request has errors: <ol><li><b>ABORT</b> and return error.
 *   </li></ol></li></ol></li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */

Skylink.prototype.sendStream = function(options, callback) {
  var self = this;

  var restartFn = function (stream) {
    if (self._inRoom) {
      if (!self._streams.screenshare) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), false, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }

      if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
        self._refreshPeerConnection(Object.keys(self._peerConnections), false, function (err, success) {
          if (err) {
            log.error('Failed refreshing connections for sendStream() ->', err);
            if (typeof callback === 'function') {
              callback(new Error('Failed refreshing connections.'), null);
            }
            return;
          }
          if (typeof callback === 'function') {
            callback(null, stream);
          }
        });
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    } else {
      var notInRoomAgainError = 'Unable to send stream as user is not in the Room.';
      log.error(notInRoomAgainError, stream);
      if (typeof callback === 'function') {
        callback(new Error(notInRoomAgainError), null);
      }
    }
  };

  if (typeof options !== 'object' || options === null) {
    var invalidOptionsError = 'Provided stream settings is invalid';
    log.error(invalidOptionsError, options);
    if (typeof callback === 'function'){
      callback(new Error(invalidOptionsError),null);
    }
    return;
  }

  if (!self._inRoom) {
    var notInRoomError = 'Unable to send stream as user is not in the Room.';
    log.error(notInRoomError, options);
    if (typeof callback === 'function'){
      callback(new Error(notInRoomError),null);
    }
    return;
  }

  if (typeof options.getAudioTracks === 'function' || typeof options.getVideoTracks === 'function') {
    var checkActiveTracksFn = function (tracks) {
      for (var t = 0; t < tracks.length; t++) {
        if (!(tracks[t].ended || (typeof tracks[t].readyState === 'string' ?
          tracks[t].readyState !== 'live' : false))) {
          return true;
        }
      }
      return false;
    };

    if (!checkActiveTracksFn( options.getAudioTracks() ) && !checkActiveTracksFn( options.getVideoTracks() )) {
      var invalidStreamError = 'Provided stream object does not have audio or video tracks.';
      log.error(invalidStreamError, options);
      if (typeof callback === 'function'){
        callback(new Error(invalidStreamError),null);
      }
      return;
    }

    self._onStreamAccessSuccess(options, {
      settings: {
        audio: true,
        video: true
      },
      getUserMediaSettings: {
        audio: true,
        video: true
      }
    }, false, false);

    restartFn(options);

  } else {
    self.getUserMedia(options, function (err, stream) {
      if (err) {
        if (typeof callback === 'function') {
          callback(err, null);
        }
        return;
      }
      restartFn(stream);
    });
  }
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that stops <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.
 * @method stopStream
 * @example
 *   function stopStream () {
 *     skylinkDemo.stopStream();
 *   }
 *
 *   skylinkDemo.getUserMedia();
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter
 *   payload <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as<code>false</code>
 *   .</li><li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.6
 */
Skylink.prototype.stopStream = function () {
  if (this._streams.userMedia) {
    this._stopStreams({
      userMedia: true
    });
  }
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio or video tracks.
 * @method muteStream
 * @param {JSON} options The Streams muting options.
 * @param {Boolean} [options.audioMuted=true] The flag if all Streams audio
 *   tracks should be muted or not.
 * @param {Boolean} [options.videoMuted=true] The flag if all Streams video
 *   tracks should be muted or not.
 * @example
 *   // Example 1: Mute both audio and video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: true
 *   });
 *
 *   // Example 2: Mute only audio tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: true,
 *     videoMuted: false
 *   });
 *
 *   // Example 3: Mute only video tracks in all Streams
 *   skylinkDemo.muteStream({
 *     audioMuted: false,
 *     videoMuted: true
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>If provided parameter <code>options</code> is invalid: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Checks if there is any available Streams: <ol><li>If there is no available Streams: <ol>
 *   <li><b>ABORT</b> and return error.</li></ol></li><li>If User is in Room: <ol>
 *   <li>Checks if there is audio tracks to mute / unmute: <ol><li>If there is audio tracks to mute / unmute: <ol>
 *   <li>If <code>options.audioMuted</code> value is not the same as the current
 *   <code>peerInfo.mediaStatus.audioMuted</code>: <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small> <ol>
 *   <li><em>For Peer only</em> <a href="#event_peerUpdated"><code>peerUpdated</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_streamMuted"><code>streamMuted</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li>
 *   <li>Checks if there is video tracks to mute / unmute: <ol><li>If there is video tracks to mute / unmute: <ol>
 *   <li>If <code>options.videoMuted</code> value is not the same as the current
 *   <code>peerInfo.mediaStatus.videoMuted</code>: <small>This can be retrieved with
 *   <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a>.</small> <ol>
 *   <li><em>For Peer only</em> <a href="#event_peerUpdated"><code>peerUpdated</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>false</code>.</li>
 *   <li><em>For Peer only</em> <a href="#event_streamMuted"><code>streamMuted</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li></ol></li>
 *   <li>If <code>options.audioMuted</code> value is not the same as the current
 *   <code>peerInfo.mediaStatus.audioMuted</code> or <code>options.videoMuted</code> value is not
 *   the same as the current <code>peerInfo.mediaStatus.videoMuted</code>: <ol>
 *   <li><a href="#event_localMediaMuted"><code>localMediaMuted</code> event</a> triggers.</li>
 *   <li>If User is in Room: <ol><li><a href="#event_streamMuted"><code>streamMuted</code> event</a>
 *   triggers with parameter payload <code>isSelf</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers with
 *   parameter payload <code>isSelf</code> value as <code>true</code>.</li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.5.7
 */
Skylink.prototype.muteStream = function(options) {
  var self = this;

  if (typeof options !== 'object') {
    log.error('Provided settings is not an object');
    return;
  }

  if (!(self._streams.userMedia && self._streams.userMedia.stream) &&
    !(self._streams.screenshare && self._streams.screenshare.stream)) {
    log.warn('No streams are available to mute / unmute!');
    return;
  }

  var audioMuted = typeof options.audioMuted === 'boolean' ? options.audioMuted : true;
  var videoMuted = typeof options.videoMuted === 'boolean' ? options.videoMuted : true;
  var hasToggledAudio = false;
  var hasToggledVideo = false;

  if (self._streamsMutedSettings.audioMuted !== audioMuted) {
    self._streamsMutedSettings.audioMuted = audioMuted;
    hasToggledAudio = true;
  }

  if (self._streamsMutedSettings.videoMuted !== videoMuted) {
    self._streamsMutedSettings.videoMuted = videoMuted;
    hasToggledVideo = true;
  }

  if (hasToggledVideo || hasToggledAudio) {
    var streamTracksAvailability = self._muteStreams();

    if (hasToggledVideo && self._inRoom) {
      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.MUTE_VIDEO,
        mid: self._user.sid,
        rid: self._room.id,
        muted: self._streamsMutedSettings.videoMuted,
        stamp: (new Date()).getTime()
      });
    }

    if (hasToggledAudio && self._inRoom) {
      setTimeout(function () {
        self._sendChannelMessage({
          type: self._SIG_MESSAGE_TYPE.MUTE_AUDIO,
          mid: self._user.sid,
          rid: self._room.id,
          muted: self._streamsMutedSettings.audioMuted,
          stamp: (new Date()).getTime()
        });
      }, hasToggledVideo ? 1050 : 0);
    }

    if ((streamTracksAvailability.hasVideo && hasToggledVideo) ||
      (streamTracksAvailability.hasAudio && hasToggledAudio)) {

      self._trigger('localMediaMuted', {
        audioMuted: streamTracksAvailability.hasAudio ? self._streamsMutedSettings.audioMuted : true,
        videoMuted: streamTracksAvailability.hasVideo ? self._streamsMutedSettings.videoMuted : true
      });

      if (self._inRoom) {
        self._trigger('streamMuted', self._user.sid, self.getPeerInfo(), true,
          self._streams.screenshare && self._streams.screenshare.stream);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
      }
    }
  }
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method enableAudio
 * @deprecated true
 * @example
 *   function unmuteAudio () {
 *     skylinkDemo.enableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>false</code> and
 *   <code>options.videoMuted</code> value with current <code>peerInfo.mediaStatus.videoMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableAudio = function() {
  this.muteStream({
    audioMuted: false,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> audio tracks.
 * @method disableAudio
 * @deprecated true
 * @example
 *   function muteAudio () {
 *     skylinkDemo.disableAudio();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.audioMuted</code> value as <code>true</code> and
 *   <code>options.videoMuted</code> value with current <code>peerInfo.mediaStatus.videoMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableAudio = function() {
  this.muteStream({
    audioMuted: true,
    videoMuted: this._streamsMutedSettings.videoMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that unmutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method enableVideo
 * @deprecated true
 * @example
 *   function unmuteVideo () {
 *     skylinkDemo.enableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>false</code> and
 *   <code>options.audioMuted</code> value with current <code>peerInfo.mediaStatus.audioMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.enableVideo = function() {
  this.muteStream({
    videoMuted: false,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};

/**
 * <blockquote class="info"><b>Deprecation Warning!</b>
 *   This method has been deprecated. Use <a href="#method_muteStream"><code>muteStream()</code> method</a> instead.
 * </blockquote>
 * Function that mutes both <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a> and
 * <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> video tracks.
 * @method disableVideo
 * @deprecated true
 * @example
 *   function muteVideo () {
 *     skylinkDemo.disableVideo();
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Invokes <a href="#method_muteStream"><code>muteStream()</code> method</a> with
 *   <code>options.videoMuted</code> value as <code>true</code> and
 *   <code>options.audioMuted</code> value with current <code>peerInfo.mediaStatus.audioMuted</code> value.
 *   <small>See <a href="#method_getPeerInfo"><code>getPeerInfo()</code> method</a> for more information.</small></li></ol>
 * @for Skylink
 * @since 0.5.5
 */
Skylink.prototype.disableVideo = function() {
  this.muteStream({
    videoMuted: true,
    audioMuted: this._streamsMutedSettings.audioMuted
  });
};

/**
 * <blockquote class="info">
 *   For a better user experience, the functionality is throttled when invoked many times in less
 *   than the milliseconds interval configured in the <a href="#method_init"><code>init()</code> method</a>.
 * </blockquote>
 * Function that retrieves screensharing Stream.
 * @method shareScreen
 * @param {JSON|Boolean} [enableAudio=false] The flag if audio tracks should be retrieved.
 * @param {Boolean} [enableAudio.stereo=false] The flag if stereo band should be configured
 *   when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
 * @param {Boolean} [enableAudio.usedtx] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if DTX (Discontinuous Transmission) should be configured when encoding audio codec
 *   is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
 *   <small>This might help to reduce bandwidth it reduces the bitrate during silence or background noise.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.useinbandfec] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The flag if capability to take advantage of in-band FEC (Forward Error Correction) should be
 *   configured when encoding audio codec is <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
 *   <small>This might help to reduce the harm of packet loss by encoding information about the previous packet.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Number} [enableAudio.maxplaybackrate] <blockquote class="info">
 *   Note that this feature might not work depending on the browser support and implementation.</blockquote>
 *   The maximum output sampling rate rendered in Hertz (Hz) when encoding audio codec is
 *   <a href="#attr_AUDIO_CODEC"><code>OPUS</code></a> for sending audio data.
 *   <small>This value must be between <code>8000</code> to <code>48000</code>.</small>
 *   <small>When not provided, the default browser configuration is used.</small>
 * @param {Boolean} [enableAudio.echoCancellation=false] The flag to enable audio tracks echo cancellation.
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggering <code>isScreensharing</code> parameter payload value
 *   as <code>true</code> for request success when User is not in the Room or is in Room without Peers,
 *   or by the <a href="#event_peerRestart"><code>peerRestart</code> event</a> triggering
 *   <code>isSelfInitiateRestart</code> parameter payload value as <code>true</code> for all connected Peers
 *   for request success when User is in Room with Peers.</small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>shareScreen()</code> error when retrieving screensharing Stream.</small>
 * @param {MediaStream} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature is the screensharing Stream object.</small>
 * @example
 *   // Example 1: Share screen with audio
 *   skylinkDemo.shareScreen(function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 *
 *   // Example 2: Share screen without audio
 *   skylinkDemo.shareScreen(false, function (error, success) {
 *     if (error) return;
 *     attachMediaStream(document.getElementById("my-screen"), success);
 *   });
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves screensharing Stream. <ol><li>If retrieval was successful: <ol><li>If browser is Firefox: <ol>
 *   <li>If there are missing audio or video tracks requested: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If audio is requested: <small>Chrome, Safari and IE currently doesn't support retrieval of
 *   audio track together with screensharing video track.</small> <ol><li>Retrieves audio Stream: <ol>
 *   <li>If retrieval was successful: <ol><li>Attempts to attach screensharing Stream video track to audio Stream. <ol>
 *   <li>If attachment was successful: <ol><li><a href="#event_mediaAccessSuccess">
 *   <code>mediaAccessSuccess</code> event</a> triggers parameter payload <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li><li>Else: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a> triggers parameter payload
 *   <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there is any previous <code>shareScreen()</code> Stream: <ol>
 *   <li>Invokes <a href="#method_stopScreen"><code>stopScreen()</code> method</a>.</li></ol></li>
 *   <li><a href="#event_mediaAccessFallback"><code>mediaAccessFallback</code> event</a>
 *   triggers parameter payload <code>state</code> as <code>FALLBACKED</code>, <code>isScreensharing</code>
 *   value as <code>true</code> and <code>isAudioFallback</code> value as <code>false</code>.</li>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a> triggers
 *   parameter payload <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code>
 *   value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessSuccess"><code>mediaAccessSuccess</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code>
 *   and <code>isAudioFallback</code> value as <code>false</code>.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li><a href="#event_mediaAccessError"><code>mediaAccessError</code> event</a> triggers parameter payload
 *   <code>isScreensharing</code> value as <code>true</code> and <code>isAudioFallback</code> value as
 *   <code>false</code>.</li><li><b>ABORT</b> and return error.</li></ol></li></ol></li><li>If User is in Room: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as <code>shareScreen()</code> Stream.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   <li>Checks if MCU is enabled for App Key provided in <a href="#method_init"><code>init()</code> method</a>. <ol>
 *   <li>If MCU is enabled: <ol><li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.
 *   <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li></ol></li></ol></li></ol></li><li>Else: <ol>
 *   <li>If there are connected Peers in the Room: <ol><li>Invoke <a href="#method_refreshConnection">
 *   <code>refreshConnection()</code> method</a>. <ol><li>If request has errors: <ol><li><b>ABORT</b> and return error.</li>
 *   </ol></li></ol></li></ol></li></ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.shareScreen = function (enableAudio, callback) {
  var self = this;
  var enableAudioSettings = {
    stereo: true
  };

  if (typeof enableAudio === 'function') {
    callback = enableAudio;
    enableAudio = true;

  } else if (enableAudio && typeof enableAudio === 'object') {
    enableAudioSettings.usedtx = typeof enableAudio.usedtx === 'boolean' ? enableAudio.usedtx : null;
    enableAudioSettings.useinbandfec = typeof enableAudio.useinbandfec === 'boolean' ? enableAudio.useinbandfec : null;
    enableAudioSettings.stereo = enableAudio.stereo === true;
    enableAudioSettings.echoCancellation = enableAudio.echoCancellation === true;
  }

  self._throttle(function (runFn) {
    if (!runFn) {
      if (self._throttlingShouldThrowError) {
        var throttleLimitError = 'Unable to run as throttle interval has not reached (' + self._throttlingTimeouts.shareScreen + 'ms).';
        log.error(throttleLimitError);

        if (typeof callback === 'function') {
          callback(new Error(throttleLimitError), null);
        }
      }
      return;
    }

    var settings = {
      settings: {
        audio: enableAudio === true || (enableAudio && typeof enableAudio === 'object') ? enableAudioSettings : false,
        video: {
          screenshare: true,
          exactConstraints: false
        }
      },
      getUserMediaSettings: {
        video: {
          mediaSource: 'window'
        }
      }
    };

    var mediaAccessSuccessFn = function (stream) {
      self.off('mediaAccessError', mediaAccessErrorFn);

      if (self._inRoom) {
        self._trigger('incomingStream', self._user.sid, stream, true, self.getPeerInfo(), true, stream.id || stream.label);
        self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);

        if (Object.keys(self._peerConnections).length > 0 || self._hasMCU) {
          self._refreshPeerConnection(Object.keys(self._peerConnections), false, function (err, success) {
            if (err) {
              log.error('Failed refreshing connections for shareScreen() ->', err);
              if (typeof callback === 'function') {
                callback(new Error('Failed refreshing connections.'), null);
              }
              return;
            }
            if (typeof callback === 'function') {
              callback(null, stream);
            }
          });
        } else if (typeof callback === 'function') {
          callback(null, stream);
        }
      } else if (typeof callback === 'function') {
        callback(null, stream);
      }
    };

    var mediaAccessErrorFn = function (error) {
      self.off('mediaAccessSuccess', mediaAccessSuccessFn);

      if (typeof callback === 'function') {
        callback(error, null);
      }
    };

    self.once('mediaAccessSuccess', mediaAccessSuccessFn, function (stream, isScreensharing) {
      return isScreensharing;
    });

    self.once('mediaAccessError', mediaAccessErrorFn, function (error, isScreensharing) {
      return isScreensharing;
    });

    try {
      if (enableAudio && window.webrtcDetectedBrowser === 'firefox') {
        settings.getUserMediaSettings.audio = true;
      }

      navigator.getUserMedia(settings.getUserMediaSettings, function (stream) {
        if (window.webrtcDetectedBrowser === 'firefox' || !enableAudio) {
          self._onStreamAccessSuccess(stream, settings, true, false);
          return;
        }

        navigator.getUserMedia({
          audio: true

        }, function (audioStream) {
          try {
            audioStream.addTrack(stream.getVideoTracks()[0]);

            self.once('mediaAccessSuccess', function () {
              self._streams.screenshare.streamClone = stream;
            }, function (stream, isScreensharing) {
              return isScreensharing;
            });

            self._onStreamAccessSuccess(audioStream, settings, true, false);

          } catch (error) {
            log.error('Failed retrieving audio stream for screensharing stream', error);
            self._onStreamAccessSuccess(stream, settings, true, false);
          }
        }, function (error) {
          log.error('Failed retrieving audio stream for screensharing stream', error);
          self._onStreamAccessSuccess(stream, settings, true, false);
        });

      }, function (error) {
        self._onStreamAccessError(error, settings, true, false);
      });

    } catch (error) {
      self._onStreamAccessError(error, settings, true, false);
    }
  }, 'shareScreen', self._throttlingTimeouts.shareScreen);
};

/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that stops <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>.
 * @method stopScreen
 * @example
 *   function stopScreen () {
 *     skylinkDemo.stopScreen();
 *   }
 *
 *   skylinkDemo.shareScreen();
 * @trigger <ol class="desc-seq">
 *   <li>Checks if there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>. <ol>
 *   <li>If there is <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a>: <ol>
 *   <li>Stop <a href="#method_shareScreen"><code>shareScreen()</code> Stream</a> Stream. <ol>
 *   <li><a href="#event_mediaAccessStopped"><code>mediaAccessStopped</code> event</a>
 *   triggers parameter payload <code>isScreensharing</code> value as <code>true</code> and
 *   <code>isAudioFallback</code> value as <code>false</code>.</li><li>If User is in Room: <ol>
 *   <li><a href="#event_streamEnded"><code>streamEnded</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>isScreensharing</code> value as <code>true</code>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li>
 *   </ol></li></ol></li><li>If User is in Room: <small><b>SKIP</b> this step if <code>stopScreen()</code>
 *   was invoked from <a href="#method_shareScreen"><code>shareScreen()</code> method</a>.</small> <ol>
 *   <li>If there is <a href="#method_getUserMedia"> <code>getUserMedia()</code>Stream</a> Stream: <ol>
 *   <li><a href="#event_incomingStream"><code>incomingStream</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code> and <code>stream</code> as
 *   <a href="#method_getUserMedia"><code>getUserMedia()</code> Stream</a>.</li>
 *   <li><a href="#event_peerUpdated"><code>peerUpdated</code> event</a> triggers parameter payload
 *   <code>isSelf</code> value as <code>true</code>.</li></ol></li>
 *   <li>Invoke <a href="#method_refreshConnection"><code>refreshConnection()</code> method</a>.</li>
 *   </ol></li></ol></li></ol></li></ol>
 * @for Skylink
 * @since 0.6.0
 */
Skylink.prototype.stopScreen = function () {
  if (this._streams.screenshare) {
    this._stopStreams({
      screenshare: true
    });

    if (this._inRoom) {
      if (this._streams.userMedia && this._streams.userMedia.stream) {
        this._trigger('incomingStream', this._user.sid, this._streams.userMedia.stream, true, this.getPeerInfo(),
          false, this._streams.userMedia.stream.id || this._streams.userMedia.stream.label);
        this._trigger('peerUpdated', this._user.sid, this.getPeerInfo(), true);
      }
      this._refreshPeerConnection(Object.keys(this._peerConnections), false);
    }
  }
};

/**
 * Function that handles the muting of Stream audio and video tracks.
 * @method _muteStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._muteStreams = function () {
  var self = this;
  var hasVideo = false;
  var hasAudio = false;

  var muteFn = function (stream) {
    var audioTracks = stream.getAudioTracks();
    var videoTracks = stream.getVideoTracks();

    for (var a = 0; a < audioTracks.length; a++) {
      audioTracks[a].enabled = !self._streamsMutedSettings.audioMuted;
      hasAudio = true;
    }

    for (var v = 0; v < videoTracks.length; v++) {
      videoTracks[v].enabled = !self._streamsMutedSettings.videoMuted;
      hasVideo = true;
    }
  };

  if (self._streams.userMedia && self._streams.userMedia.stream) {
    muteFn(self._streams.userMedia.stream);
  }

  if (self._streams.screenshare && self._streams.screenshare.stream) {
    muteFn(self._streams.screenshare.stream);
  }

  if (self._streams.screenshare && self._streams.screenshare.streamClone) {
    muteFn(self._streams.screenshare.streamClone);
  }

  log.debug('Updated Streams muted status ->', self._streamsMutedSettings);

  return {
    hasVideo: hasVideo,
    hasAudio: hasAudio
  };
};

/**
 * Function that handles stopping the Stream streaming.
 * @method _stopStreams
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._stopStreams = function (options) {
  var self = this;
  var stopFn = function (stream) {
    var streamId = stream.id || stream.label;
    log.debug([null, 'MediaStream', streamId, 'Stopping Stream ->'], stream);

    try {
      var audioTracks = stream.getAudioTracks();
      var videoTracks = stream.getVideoTracks();

      for (var a = 0; a < audioTracks.length; a++) {
        audioTracks[a].stop();
      }

      for (var v = 0; v < videoTracks.length; v++) {
        videoTracks[v].stop();
      }

    } catch (error) {
      stream.stop();
    }

    if (self._streamsStoppedCbs[streamId]) {
      self._streamsStoppedCbs[streamId]();
      delete self._streamsStoppedCbs[streamId];
    }
  };

  var stopUserMedia = false;
  var stopScreenshare = false;
  var hasStoppedMedia = false;

  if (typeof options === 'object') {
    stopUserMedia = options.userMedia === true;
    stopScreenshare = options.screenshare === true;
  }

  if (stopUserMedia && self._streams.userMedia) {
    if (self._streams.userMedia.stream) {
      stopFn(self._streams.userMedia.stream);
    }

    self._streams.userMedia = null;
    hasStoppedMedia = true;
  }

  if (stopScreenshare && self._streams.screenshare) {
    if (self._streams.screenshare.streamClone) {
      stopFn(self._streams.screenshare.streamClone);
    }

    if (self._streams.screenshare.stream) {
      stopFn(self._streams.screenshare.stream);
    }

    self._streams.screenshare = null;
    hasStoppedMedia = true;
  }

  if (self._inRoom && hasStoppedMedia) {
    self._trigger('peerUpdated', self._user.sid, self.getPeerInfo(), true);
  }

  log.log('Stopping Streams with settings ->', options);
};

/**
 * Function that parses the <code>getUserMedia()</code> settings provided.
 * @method _parseStreamSettings
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._parseStreamSettings = function(options) {
  var settings = {
    settings: { audio: false, video: false },
    mutedSettings: { shouldAudioMuted: false, shouldVideoMuted: false },
    getUserMediaSettings: { audio: false, video: false }
  };

  if (options.audio) {
    // For Edge to work since they do not support the advanced constraints yet
    if (window.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.audio = true;
    } else {
      settings.settings.audio = {
        stereo: false,
        exactConstraints: !!options.useExactConstraints,
        echoCancellation: false
      };
      settings.getUserMediaSettings.audio = {
        echoCancellation: false
      };

      if (typeof options.audio === 'object') {
        if (typeof options.audio.stereo === 'boolean') {
          settings.settings.audio.stereo = options.audio.stereo;
        }

        if (typeof options.audio.useinbandfec === 'boolean') {
          settings.settings.audio.useinbandfec = options.audio.useinbandfec;
        }

        if (typeof options.audio.usedtx === 'boolean') {
          settings.settings.audio.usedtx = options.audio.usedtx;
        }

        if (typeof options.audio.maxplaybackrate === 'number' &&
          options.audio.maxplaybackrate >= 8000 && options.audio.maxplaybackrate <= 48000) {
          settings.settings.audio.maxplaybackrate = options.audio.maxplaybackrate;
        }

        if (typeof options.audio.mute === 'boolean') {
          settings.mutedSettings.shouldAudioMuted = options.audio.mute;
        }

        if (typeof options.audio.echoCancellation === 'boolean') {
          settings.settings.audio.echoCancellation = options.audio.echoCancellation;
          settings.getUserMediaSettings.audio.echoCancellation = options.audio.echoCancellation;
        }

        if (Array.isArray(options.audio.optional)) {
          settings.settings.audio.optional = clone(options.audio.optional);
          settings.getUserMediaSettings.audio.optional = clone(options.audio.optional);
        }

        if (options.audio.deviceId && typeof options.audio.deviceId === 'string' &&
          window.webrtcDetectedBrowser !== 'firefox') {
          settings.settings.audio.deviceId = options.audio.deviceId;

          if (options.useExactConstraints) {
            settings.getUserMediaSettings.audio.deviceId = { exact: options.audio.deviceId };

          } else {
            if (!Array.isArray(settings.getUserMediaSettings.audio.optional)) {
              settings.getUserMediaSettings.audio.optional = [];
            }

            settings.getUserMediaSettings.audio.optional.push({
              sourceId: options.audio.deviceId
            });
          }
        }
      }
    }
  }

  if (options.video) {
    // For Edge to work since they do not support the advanced constraints yet
    if (window.webrtcDetectedBrowser === 'edge') {
      settings.getUserMediaSettings.video = true;
    } else {
      settings.settings.video = {
        resolution: clone(this.VIDEO_RESOLUTION.VGA),
        screenshare: false,
        exactConstraints: !!options.useExactConstraints
      };
      settings.getUserMediaSettings.video = {};

      if (typeof options.video === 'object') {
        if (typeof options.video.mute === 'boolean') {
          settings.mutedSettings.shouldVideoMuted = options.video.mute;
        }

        if (Array.isArray(options.video.optional)) {
          settings.settings.video.optional = clone(options.video.optional);
          settings.getUserMediaSettings.video.optional = clone(options.video.optional);
        }

        if (options.video.deviceId && typeof options.video.deviceId === 'string' &&
          window.webrtcDetectedBrowser !== 'firefox') {
          settings.settings.video.deviceId = options.video.deviceId;

          if (options.useExactConstraints) {
            settings.getUserMediaSettings.video.deviceId = { exact: options.video.deviceId };

          } else {
            if (!Array.isArray(settings.getUserMediaSettings.video.optional)) {
              settings.getUserMediaSettings.video.optional = [];
            }

            settings.getUserMediaSettings.video.optional.push({
              sourceId: options.video.deviceId
            });
          }
        }

        if (options.video.resolution && typeof options.video.resolution === 'object') {
          if ((options.video.resolution.width && typeof options.video.resolution.width === 'object') ||
            typeof options.video.resolution.width === 'number') {
            settings.settings.video.resolution.width = options.video.resolution.width;
          }
          if ((options.video.resolution.height && typeof options.video.resolution.height === 'object') ||
            typeof options.video.resolution.height === 'number') {
            settings.settings.video.resolution.height = options.video.resolution.height;
          }
        }

        settings.getUserMediaSettings.video.width = typeof settings.settings.video.resolution.width === 'object' ?
          settings.settings.video.resolution.width : (options.useExactConstraints ?
          { exact: settings.settings.video.resolution.width } : { max: settings.settings.video.resolution.width });

        settings.getUserMediaSettings.video.height = typeof settings.settings.video.resolution.height === 'object' ?
          settings.settings.video.resolution.height : (options.useExactConstraints ?
          { exact: settings.settings.video.resolution.height } : { max: settings.settings.video.resolution.height });

        if ((options.video.frameRate && typeof options.video.frameRate === 'object') || typeof object.video.frameRate === 'number') {
          //
          if (!(typeof options.video.frameRate === 'number' && !options.useExactConstraints && self._isUsingPlugin)) {
            settings.settings.video.frameRate = options.video.frameRate;
            settings.getUserMediaSettings.video.frameRate = typeof settings.settings.video.frameRate === 'object' ?
              settings.settings.video.frameRate : (options.useExactConstraints ?
              { exact: settings.settings.video.frameRate } : { max: settings.settings.video.frameRate });
          }
        }
      } else if (options.useExactConstraints) {
        settings.getUserMediaSettings.video = {
          width: { exact: settings.settings.video.resolution.width },
          height: { exact: settings.settings.video.resolution.height }
        };

      } else {
        settings.getUserMediaSettings.video.mandatory = {
          maxWidth: settings.settings.video.resolution.width,
          maxHeight: settings.settings.video.resolution.height
        };
      }
    }
  }

  return settings;
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API success callback result.
 * @method _onStreamAccessSuccess
 * @private
 * @for Skylink
 * @since 0.3.0
 */
Skylink.prototype._onStreamAccessSuccess = function(stream, settings, isScreenSharing, isAudioFallback) {
  var self = this;
  var streamId = stream.id || stream.label;

  log.log([null, 'MediaStream', streamId, 'Has access to stream ->'], stream);

  // Stop previous stream
  if (!isScreenSharing && self._streams.userMedia) {
    self._stopStreams({
      userMedia: true,
      screenshare: false
    });

  } else if (isScreenSharing && self._streams.screenshare) {
    self._stopStreams({
      userMedia: false,
      screenshare: true
    });
  }

  self._streamsStoppedCbs[streamId] = function () {
    log.log([null, 'MediaStream', streamId, 'Stream has ended']);

    self._trigger('mediaAccessStopped', !!isScreenSharing, !!isAudioFallback, streamId);

    if (self._inRoom) {
      log.debug([null, 'MediaStream', streamId, 'Sending Stream ended status to Peers']);

      self._sendChannelMessage({
        type: self._SIG_MESSAGE_TYPE.STREAM,
        mid: self._user.sid,
        rid: self._room.id,
        cid: self._key,
        streamId: streamId,
        settings: settings.settings,
        status: 'ended'
      });

      self._trigger('streamEnded', self._user.sid, self.getPeerInfo(), true, !!isScreenSharing, streamId);

      if (isScreenSharing && self._streams.screenshare && self._streams.screenshare.stream &&
        (self._streams.screenshare.stream.id || self._streams.screenshare.stream.label) === streamId) {
        self._streams.screenshare = null;

      } else if (!isScreenSharing && self._streams.userMedia && self._streams.userMedia.stream &&
        (self._streams.userMedia.stream.id || self._streams.userMedia.stream.label) === streamId) {
        self._streams.userMedia = null;
      }
    }
  };

  // Handle event for Chrome / Opera
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1) {
    stream.oninactive = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };

  // Handle event for Firefox (use an interval)
  } else if (window.webrtcDetectedBrowser === 'firefox') {
    stream.endedInterval = setInterval(function () {
      if (typeof stream.recordedTime === 'undefined') {
        stream.recordedTime = 0;
      }
      if (stream.recordedTime === stream.currentTime) {
        clearInterval(stream.endedInterval);

        if (self._streamsStoppedCbs[streamId]) {
          self._streamsStoppedCbs[streamId]();
          delete self._streamsStoppedCbs[streamId];
        }

      } else {
        stream.recordedTime = stream.currentTime;
      }
    }, 1000);

  } else {
    stream.onended = function () {
      if (self._streamsStoppedCbs[streamId]) {
        self._streamsStoppedCbs[streamId]();
        delete self._streamsStoppedCbs[streamId];
      }
    };
  }

  if ((settings.settings.audio && stream.getAudioTracks().length === 0) ||
    (settings.settings.video && stream.getVideoTracks().length === 0)) {

    var tracksNotSameError = 'Expected audio tracks length with ' +
      (settings.settings.audio ? '1' : '0') + ' and video tracks length with ' +
      (settings.settings.video ? '1' : '0') + ' but received audio tracks length ' +
      'with ' + stream.getAudioTracks().length + ' and video ' +
      'tracks length with ' + stream.getVideoTracks().length;

    log.warn([null, 'MediaStream', streamId, tracksNotSameError]);

    var requireAudio = !!settings.settings.audio;
    var requireVideo = !!settings.settings.video;

    if (settings.settings.audio && stream.getAudioTracks().length === 0) {
      settings.settings.audio = false;
    }

    if (settings.settings.video && stream.getVideoTracks().length === 0) {
      settings.settings.video = false;
    }

    self._trigger('mediaAccessFallback', {
      error: new Error(tracksNotSameError),
      diff: {
        video: { expected: requireVideo ? 1 : 0, received: stream.getVideoTracks().length },
        audio: { expected: requireAudio ? 1 : 0, received: stream.getAudioTracks().length }
      }
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKED, !!isScreenSharing, !!isAudioFallback, streamId);
  }

  self._streams[ isScreenSharing ? 'screenshare' : 'userMedia' ] = {
    stream: stream,
    settings: settings.settings,
    constraints: settings.getUserMediaSettings
  };
  self._muteStreams();
  self._trigger('mediaAccessSuccess', stream, !!isScreenSharing, !!isAudioFallback, streamId);
};

/**
 * Function that handles the native <code>navigator.getUserMedia()</code> API failure callback result.
 * @method _onStreamAccessError
 * @private
 * @for Skylink
 * @since 0.6.15
 */
Skylink.prototype._onStreamAccessError = function(error, settings, isScreenSharing) {
  var self = this;

  if (!isScreenSharing && settings.settings.audio && settings.settings.video && self._audioFallback) {
    log.debug('Fallbacking to retrieve audio only Stream');

    self._trigger('mediaAccessFallback', {
      error: error,
      diff: null
    }, self.MEDIA_ACCESS_FALLBACK_STATE.FALLBACKING, false, true);

    navigator.getUserMedia({
      audio: true
    }, function (stream) {
      self._onStreamAccessSuccess(stream, settings, false, true);

    }, function (error) {
      log.error('Failed fallbacking to retrieve audio only Stream ->', error);

      self._trigger('mediaAccessError', error, false, true);
      self._trigger('mediaAccessFallback', {
        error: error,
        diff: null
      }, self.MEDIA_ACCESS_FALLBACK_STATE.ERROR, false, true);
    });
    return;
  }

  log.error('Failed retrieving ' + (isScreenSharing ? 'screensharing' : 'camera') + ' Stream ->', error);

  self._trigger('mediaAccessError', error, !!isScreenSharing, false);
};

/**
 * Function that handles the <code>RTCPeerConnection.onaddstream</code> remote MediaStream received.
 * @method _onRemoteStreamAdded
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._onRemoteStreamAdded = function(targetMid, stream, isScreenSharing) {
  var self = this;

  if (!self._peerInformations[targetMid]) {
    log.warn([targetMid, 'MediaStream', stream.id,
      'Received remote stream when peer is not connected. ' +
      'Ignoring stream ->'], stream);
    return;
  }

  /*if (!self._peerInformations[targetMid].settings.audio &&
    !self._peerInformations[targetMid].settings.video && !isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id,
      'Receive remote stream but ignoring stream as it is empty ->'
      ], stream);
    return;
  }*/
  log.log([targetMid, 'MediaStream', stream.id, 'Received remote stream ->'], stream);

  if (isScreenSharing) {
    log.log([targetMid, 'MediaStream', stream.id, 'Peer is having a screensharing session with user']);
  }

  self._trigger('incomingStream', targetMid, stream, false, self.getPeerInfo(targetMid), isScreenSharing, stream.id || stream.label);
  self._trigger('peerUpdated', targetMid, self.getPeerInfo(targetMid), false);
};

/**
 * Function that sets User's Stream to send to Peer connection.
 * Priority for <code>shareScreen()</code> Stream over <code>getUserMedia()</code> Stream.
 * @method _addLocalMediaStreams
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._addLocalMediaStreams = function(peerId) {
  var self = this;

  // NOTE ALEX: here we could do something smarter
  // a mediastream is mainly a container, most of the info
  // are attached to the tracks. We should iterates over track and print
  try {
    log.log([peerId, null, null, 'Adding local stream']);

    var pc = self._peerConnections[peerId];

    if (pc) {
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        // Updates the streams accordingly
        var updateStreamFn = function (updatedStream) {
          var hasStream = false;

          // remove streams
          var streams = pc.getLocalStreams();
          for (var i = 0; i < streams.length; i++) {
            if (updatedStream !== null && streams[i].id === updatedStream.id) {
              hasStream = true;
              continue;
            }
            // try removeStream
            pc.removeStream(streams[i]);
          }

          if (updatedStream !== null && !hasStream) {
            pc.addStream(updatedStream);
          }
        };

        if (self._streams.screenshare && self._streams.screenshare.stream) {
          log.debug([peerId, 'MediaStream', null, 'Sending screen'], self._streams.screenshare.stream);

          updateStreamFn(self._streams.screenshare.stream);

        } else if (self._streams.userMedia && self._streams.userMedia.stream) {
          log.debug([peerId, 'MediaStream', null, 'Sending stream'], self._streams.userMedia.stream);

          updateStreamFn(self._streams.userMedia.stream);

        } else {
          log.warn([peerId, 'MediaStream', null, 'No media to send. Will be only receiving']);

          updateStreamFn(null);
        }

      } else {
        log.warn([peerId, 'MediaStream', null,
          'Not adding any stream as signalingState is closed']);
      }
    } else {
      log.warn([peerId, 'MediaStream', self._mediaStream,
        'Not adding stream as peerconnection object does not exists']);
    }
  } catch (error) {
    if ((error.message || '').indexOf('already added') > -1) {
      log.warn([peerId, null, null, 'Not re-adding stream as LocalMediaStream is already added'], error);
    } else {
      // Fix errors thrown like NS_ERROR_UNEXPECTED
      log.error([peerId, null, null, 'Failed adding local stream'], error);
    }
  }
};

/**
 * Function that handles ended streams.
 * @method _handleEndedStreams
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleEndedStreams = function (peerId, checkStreamId) {
  var self = this;
  self._streamsSession[peerId] = self._streamsSession[peerId] || {};

  var renderEndedFn = function (streamId) {
    var shouldTrigger = !!self._streamsSession[peerId][streamId];

    if (!checkStreamId && self._peerConnections[peerId] &&
      self._peerConnections[peerId].signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
      var streams = self._peerConnections[peerId].getRemoteStreams();

      for (var i = 0; i < streams.length; i++) {
        if (streamId === (streams[i].id || streams[i].label)) {
          shouldTrigger = false;
          break;
        }
      }
    }

    if (shouldTrigger) {
      var peerInfo = clone(self.getPeerInfo(peerId));
      peerInfo.settings.audio = clone(self._streamsSession[peerId][streamId].audio);
      peerInfo.settings.video = clone(self._streamsSession[peerId][streamId].video);
      var hasScreenshare = peerInfo.settings.video && typeof peerInfo.settings.video === 'object' &&
        !!peerInfo.settings.video.screenshare;
      self._streamsSession[peerId][streamId] = false;
      self._trigger('streamEnded', peerId, peerInfo, false, hasScreenshare, streamId);
    }
  };

  if (checkStreamId) {
    renderEndedFn(checkStreamId);
  } else {
    for (var prop in self._streamsSession[peerId]) {
      if (self._streamsSession[peerId].hasOwnProperty(prop) && self._streamsSession[peerId][prop]) {
        renderEndedFn(prop);
      }
    }
  }
};
Skylink.prototype._setSDPOpusConfig = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var payload = null;
  var appendFmtpLineAtIndex = -1;
  var userAudioSettings = this.getPeerInfo().settings.audio;
  var opusSettings = {
    useinbandfec: null,
    usedtx: null,
    maxplaybackrate: null,
    stereo: false
  };

  if (userAudioSettings && typeof userAudioSettings === 'object') {
    opusSettings.stereo = userAudioSettings.stereo === true;
    opusSettings.useinbandfec = typeof userAudioSettings.useinbandfec === 'boolean' ? userAudioSettings.useinbandfec : null;
    opusSettings.usedtx = typeof userAudioSettings.usedtx === 'boolean' ? userAudioSettings.usedtx : null;
    opusSettings.maxplaybackrate = typeof userAudioSettings.maxplaybackrate === 'number' ? userAudioSettings.maxplaybackrate : null;
  }


  // Find OPUS RTPMAP line
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('a=rtpmap:') === 0 && (sdpLines[i].toLowerCase()).indexOf('opus/48000') > 0) {
      payload = (sdpLines[i].split(' ')[0] || '').split(':')[1] || null;
      appendFmtpLineAtIndex = i;
      break;
    }
  }

  if (!payload) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Failed to find OPUS payload. Not configuring options.']);
    return sessionDescription.sdp;
  }

  // Set OPUS FMTP line
  for (var j = 0; j < sdpLines.length; j++) {
    if (sdpLines[j].indexOf('a=fmtp:' + payload) === 0) {
      var opusConfigs = (sdpLines[j].split('a=fmtp:' + payload)[1] || '').replace(/\s/g, '').split(';');
      var updatedOpusParams = '';

      for (var k = 0; k < opusConfigs.length; k++) {
        if (!(opusConfigs[k] && opusConfigs[k].indexOf('=') > 0)) {
          continue;
        }

        var params = opusConfigs[k].split('=');

        if (['useinbandfec', 'usedtx', 'sprop-stereo', 'stereo', 'maxplaybackrate'].indexOf(params[0]) > -1) {
          // Get default OPUS useinbandfec
          if (params[0] === 'useinbandfec' && params[1] === '1' && opusSettings.useinbandfec === null) {
            log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Received OPUS useinbandfec as true by default.']);
            opusSettings.useinbandfec = true;

          // Get default OPUS usedtx
          } else if (params[0] === 'usedtx' && params[1] === '1' && opusSettings.usedtx === null) {
            log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Received OPUS usedtx as true by default.']);
            opusSettings.usedtx = true;

          // Get default OPUS maxplaybackrate
          } else if (params[0] === 'maxplaybackrate' && parseInt(params[1] || '0', 10) > 0 && opusSettings.maxplaybackrate === null) {
            log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Received OPUS maxplaybackrate as ' + params[1] + ' by default.']);
            opusSettings.maxplaybackrate = params[1];
          }
        } else {
          updatedOpusParams += opusConfigs[k] + ';';
        }
      }

      if (opusSettings.stereo === true) {
        updatedOpusParams += 'stereo=1;';
      }

      if (opusSettings.useinbandfec === true) {
        updatedOpusParams += 'useinbandfec=1;';
      }

      if (opusSettings.usedtx === true) {
        updatedOpusParams += 'usedtx=1;';
      }

      if (opusSettings.maxplaybackrate) {
        updatedOpusParams += 'maxplaybackrate=' + opusSettings.maxplaybackrate + ';';
      }

      log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Updated OPUS parameters ->'], updatedOpusParams);

      sdpLines[j] = 'a=fmtp:' + payload + ' ' + updatedOpusParams;
      appendFmtpLineAtIndex = -1;
      break;
    }
  }

  if (appendFmtpLineAtIndex > 0) {
    var newFmtpLine = 'a=fmtp:' + payload + ' ';

    if (opusSettings.stereo === true) {
      newFmtpLine += 'stereo=1;';
    }

    if (opusSettings.useinbandfec === true) {
      newFmtpLine += 'useinbandfec=1;';
    }

    if (opusSettings.usedtx === true) {
      newFmtpLine += 'usedtx=1;';
    }

    if (opusSettings.maxplaybackrate) {
      newFmtpLine += 'maxplaybackrate=' + opusSettings.maxplaybackrate + ';';
    }

    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Created OPUS parameters ->'], newFmtpLine);

    sdpLines.splice(appendFmtpLineAtIndex + 1, 0, newFmtpLine);
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to limit the maximum sending bandwidth.
 * Setting this may not necessarily work in Firefox.
 * @method _setSDPBitrate
 * @private
 * @for Skylink
 * @since 0.5.10
 */
Skylink.prototype._setSDPBitrate = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, bw) {
    var mLineType = type;
    var mLineIndex = -1;
    var cLineIndex = -1;

    if (type === 'data') {
      mLineType = 'application';
    }

    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + mLineType) === 0) {
        mLineIndex = i;
      } else if (mLineIndex > 0) {
        if (sdpLines[i].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[i].indexOf('c=') === 0) {
          cLineIndex = i;
        // Remove previous b:AS settings
        } else if (sdpLines[i].indexOf('b=AS:') === 0 || sdpLines[i].indexOf('b:TIAS:') === 0) {
          sdpLines.splice(i, 1);
          i--;
        }
      }
    }

    if (!(typeof bw === 'number' && bw > 0)) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not limiting "' + type + '" bandwidth']);
      return;
    }

    if (cLineIndex === -1) {
      log.error([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Failed setting "' +
        type + '" bandwidth as c-line is missing.']);
      return;
    }

    // Follow RFC 4566, that the b-line should follow after c-line.
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Limiting maximum sending "' + type + '" bandwidth ->'], bw);
    sdpLines.splice(cLineIndex + 1, 0, window.webrtcDetectedBrowser === 'firefox' ? 'b=TIAS:' + (bw * 1024) : 'b=AS:' + bw);
  };

  parseFn('audio', this._streamsBandwidthSettings.bAS.audio);
  parseFn('video', this._streamsBandwidthSettings.bAS.video);
  parseFn('data', this._streamsBandwidthSettings.bAS.data);

  // Sets the experimental google bandwidth
  if ((typeof this._streamsBandwidthSettings.googleX.min === 'number') || (typeof this._streamsBandwidthSettings.googleX.max === 'number')) {
    var codec = null;
    var codecRtpMapLineIndex = -1;
    var codecFmtpLineIndex = -1;

    for (var j = 0; j < sdpLines.length; j++) {
      if (sdpLines[j].indexOf('m=video') === 0) {
        codec = sdpLines[j].split(' ')[3];
      } else if (codec) {
        if (sdpLines[j].indexOf('m=') === 0) {
          break;
        }

        if (sdpLines[j].indexOf('a=rtpmap:' + codec + ' ') === 0) {
          codecRtpMapLineIndex = j;
        } else if (sdpLines[j].indexOf('a=fmtp:' + codec + ' ') === 0) {
          sdpLines[j] = sdpLines[j].replace(/x-google-(min|max)-bitrate=[0-9]*[;]*/gi, '');
          codecFmtpLineIndex = j;
          break;
        }
      }
    }

    if (codecRtpMapLineIndex > -1) {
      var xGoogleParams = '';

      if (typeof this._streamsBandwidthSettings.googleX.min === 'number') {
        xGoogleParams += 'x-google-min-bitrate=' + this._streamsBandwidthSettings.googleX.min + ';';
      }

      if (typeof this._streamsBandwidthSettings.googleX.max === 'number') {
        xGoogleParams += 'x-google-max-bitrate=' + this._streamsBandwidthSettings.googleX.max + ';';
      }

      if (codecFmtpLineIndex > -1) {
        sdpLines[codecFmtpLineIndex] += (!sdpLines[codecFmtpLineIndex].split(' ')[1] ? ';' : '') + xGoogleParams;
      } else {
        sdpLines.splice(codecRtpMapLineIndex + 1, 0, 'a=fmtp:' + codec + ' ' + xGoogleParams);
      }
    }
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to set the preferred audio/video codec.
 * @method _setSDPCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._setSDPCodec = function(targetMid, sessionDescription) {
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var parseFn = function (type, codec) {
    if (codec === 'auto') {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not preferring any codec for "' + type + '" streaming. Using browser selection.']);
      return;
    }

    // Find the codec first
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('a=rtpmap:') === 0 && (sdpLines[i].toLowerCase()).indexOf(codec.toLowerCase()) > 0) {
        var payload = sdpLines[i].split(':')[1].split(' ')[0] || null;

        if (!payload) {
          log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not preferring "' +
            codec + '" for "' + type + '" streaming as payload is not found.']);
          return;
        }

        for (var j = 0; j < sdpLines.length; j++) {
          if (sdpLines[j].indexOf('m=' + type) === 0) {
            log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Preferring "' +
              codec + '" for "' + type + '" streaming.']);

            var parts = sdpLines[j].split(' ');

            if (parts.indexOf(payload) >= 3) {
              parts.splice(parts.indexOf(payload), 1);
            }

            // Example: m=audio 9 UDP/TLS/RTP/SAVPF 111
            parts.splice(3, 0, payload);
            sdpLines[j] = parts.join(' ');
            break;
          }
        }
      }
    }
  };

  parseFn('audio', this._selectedAudioCodec);
  parseFn('video', this._selectedVideoCodec);

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to remove the previous experimental H264
 * codec that is apparently breaking connections.
 * NOTE: We should perhaps not remove it since H264 is supported?
 * @method _removeSDPFirefoxH264Pref
 * @private
 * @for Skylink
 * @since 0.5.2
 */
Skylink.prototype._removeSDPFirefoxH264Pref = function(targetMid, sessionDescription) {
  log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
    'Removing Firefox experimental H264 flag to ensure interopability reliability']);

  return sessionDescription.sdp.replace(/a=fmtp:0 profile-level-id=0x42e00c;packetization-mode=1\r\n/g, '');
};

/**
 * Function that modifies the session description to append the MediaStream and MediaStreamTrack IDs that seems
 * to be missing from Firefox answer session description to Chrome connection causing freezes in re-negotiation.
 * @method _addSDPMediaStreamTrackIDs
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._addSDPMediaStreamTrackIDs = function (targetMid, sessionDescription) {
  if (!(this._peerConnections[targetMid] && this._peerConnections[targetMid].getLocalStreams().length > 0)) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Not enforcing MediaStream IDs as no Streams is sent.']);
    return sessionDescription.sdp;
  }

  var sessionDescriptionStr = sessionDescription.sdp;

  if (!this._enableIceTrickle) {
    sessionDescriptionStr = sessionDescriptionStr.replace(/a=end-of-candidates\r\n/g, '');
  }

  var sdpLines = sessionDescriptionStr.split('\r\n');
  var agent = ((this._peerInformations[targetMid] || {}).agent || {}).name || '';
  var localStream = this._peerConnections[targetMid].getLocalStreams()[0];
  var localStreamId = localStream.id || localStream.label;

  var parseFn = function (type, tracks) {
    if (tracks.length === 0) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not enforcing "' + type + '" MediaStreamTrack IDs as no Stream "' + type + '" tracks is sent.']);
      return;
    }

    var trackId = tracks[0].id || tracks[0].label;
    var trackLabel = tracks[0].label || 'Default';
    var ssrcId = null;
    var hasReachedType = false;

    // Get SSRC ID
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('m=' + type) === 0) {
        if (!hasReachedType) {
          hasReachedType = true;
          continue;
        } else {
          break;
        }
      }

      if (hasReachedType && sdpLines[i].indexOf('a=ssrc:') === 0) {
        ssrcId = (sdpLines[i].split(':')[1] || '').split(' ')[0] || null;

        var msidLine = 'a=ssrc:' + ssrcId + ' msid:' + localStreamId + ' ' + trackId;
        var mslabelLine = 'a=ssrc:' + ssrcId + ' mslabel:' + trackLabel;
        var labelLine = 'a=ssrc:' + ssrcId + ' label:' + trackLabel;

        if (sdpLines.indexOf(msidLine) === -1) {
          sdpLines.splice(i + 1, 0, msidLine);
          i++;
        }

        if (sdpLines.indexOf(mslabelLine) === -1) {
          sdpLines.splice(i + 1, 0, mslabelLine);
          i++;
        }

        if (sdpLines.indexOf(labelLine) === -1) {
          sdpLines.splice(i + 1, 0, labelLine);
          i++;
        }
        break;
      }
    }
  };

  parseFn('audio', localStream.getAudioTracks());
  parseFn('video', localStream.getVideoTracks());

  // Signaling end-of-candidates
  if (!this._enableIceTrickle){
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].indexOf('a=candidate:') === 0) {
        if (sdpLines[i + 1] ? !(sdpLines[i + 1].indexOf('a=candidate:') === 0 ||
          sdpLines[i + 1].indexOf('a=end-of-candidates') === 0) : true) {
          sdpLines.splice(i + 1, 0, 'a=end-of-candidates');
          i++;
        }
      }
    }
  }

  return sdpLines.join('\r\n');
};

/**
 * Function that modifies the session description to remove VP9 and H264 apt/rtx lines to prevent plugin connection breaks.
 * @method _removeSDPH264VP9AptRtxForOlderPlugin
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPH264VP9AptRtxForOlderPlugin = function (targetMid, sessionDescription) {
  var removeVP9AptRtxPayload = false;
  var agent = (this._peerInformations[targetMid] || {}).agent || {};

  if (agent.pluginVersion) {
    // 0.8.870 supports
    var parts = agent.pluginVersion.split('.');
    removeVP9AptRtxPayload = parseInt(parts[0], 10) >= 0 && parseInt(parts[1], 10) >= 8 &&
      parseInt(parts[2], 10) >= 870;
  }

  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  if (['chrome', 'opera'].indexOf(window.webrtcDetectedBrowser) > -1 && removeVP9AptRtxPayload) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Removing VP9/H264 apt= and rtx payload lines causing connectivity issues']);

    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=101\r\n/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtpmap:\d+ rtx\/\d+\r\na=fmtp:\d+ apt=107\r\n/g, '');
  }

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to remove codecs.
 * @method _removeSDPCodecs
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPCodecs = function (targetMid, sessionDescription) {
  var audioSettings = this.getPeerInfo().settings.audio;

  var parseFn = function (type, codec) {
    var payloadList = sessionDescription.sdp.match(new RegExp('a=rtpmap:(\\d*)\\ ' + codec + '.*', 'gi'));

    if (!(Array.isArray(payloadList) && payloadList.length > 0)) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "' + codec + '" as it does not exists.']);
      return;
    }

    for (var i = 0; i < payloadList.length; i++) {
      var payload = payloadList[i].split(' ')[0].split(':')[1];

      log.info([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Removing "' + codec + '" payload ->'], payload);

      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=rtpmap:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=fmtp:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(
        new RegExp('a=rtpmap:\\d+ rtx\\/\\d+\\r\\na=fmtp:\\d+ apt=' + payload + '\\r\\n', 'g'), '');

      // Remove the m-line codec
      var sdpLines = sessionDescription.sdp.split('\r\n');

      for (var j = 0; j < sdpLines.length; j++) {
        if (sdpLines[j].indexOf('m=' + type) === 0) {
          var parts = sdpLines[j].split(' ');

          if (parts.indexOf(payload) >= 3) {
            parts.splice(parts.indexOf(payload), 1);
          }

          sdpLines[j] = parts.join(' ');
          break;
        }
      }

      sessionDescription.sdp = sdpLines.join('\r\n');
    }
  };

  if (this._disableVideoFecCodecs) {
    if (this._hasMCU) {
      log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "ulpfec" or "red" codecs as connected to MCU to prevent connectivity issues.']);
    } else {
      parseFn('video', 'red');
      parseFn('video', 'ulpfec');
    }
  }

  if (this._disableComfortNoiseCodec && audioSettings && typeof audioSettings === 'object' && audioSettings.stereo) {
    parseFn('audio', 'CN');
  }

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to remove REMB packets fb.
 * @method _removeSDPREMBPackets
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPREMBPackets = function (targetMid, sessionDescription) {
  if (!this._disableREMB) {
    return sessionDescription.sdp;
  }

  log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing REMB packets.']);
  return sessionDescription.sdp.replace(/a=rtcp-fb:\d+ goog-remb\r\n/g, '');
};

/**
 * Function that retrieves the session description selected codec.
 * @method _getSDPSelectedCodec
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._getSDPSelectedCodec = function (targetMid, sessionDescription, type) {
  if (!(sessionDescription && sessionDescription.sdp)) {
    return null;
  }

  var sdpLines = sessionDescription.sdp.split('\r\n');
  var selectedCodecInfo = {
    name: null,
    implementation: null,
    clockRate: null,
    channels: null,
    payloadType: null,
    params: null
  };

  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('m=' + type) === 0) {
      var parts = sdpLines[i].split(' ');

      if (parts.length < 4) {
        break;
      }

      selectedCodecInfo.payloadType = parseInt(parts[3], 10);

    } else if (selectedCodecInfo.payloadType !== null) {
      if (sdpLines[i].indexOf('m=') === 0) {
        break;
      }

      if (sdpLines[i].indexOf('a=rtpmap:' + selectedCodecInfo.payloadType + ' ') === 0) {
        var params = (sdpLines[i].split(' ')[1] || '').split('/');
        selectedCodecInfo.name = params[0] || '';
        selectedCodecInfo.clockRate = params[1] ? parseInt(params[1], 10) : null;
        selectedCodecInfo.channels = params[2] ? parseInt(params[2], 10) : null;

      } else if (sdpLines[i].indexOf('a=fmtp:' + selectedCodecInfo.payloadType + ' ') === 0) {
        selectedCodecInfo.params = sdpLines[i].split('a=fmtp:' + selectedCodecInfo.payloadType + ' ')[1] || null;
      }
    }
  }

  log.debug([targetMid, 'RTCSessionDesription', sessionDescription.type,
    'Parsing session description "' + type + '" codecs ->'], selectedCodecInfo);

  return selectedCodecInfo;
};

/**
 * Function that modifies the session description to remove non-relay ICE candidates.
 * @method _removeSDPFilteredCandidates
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._removeSDPFilteredCandidates = function (targetMid, sessionDescription) {
  // Handle Firefox MCU Peer ICE candidates
  if (targetMid === 'MCU' && sessionDescription.type === this.HANDSHAKE_PROGRESS.ANSWER &&
    window.webrtcDetectedBrowser === 'firefox') {
    sessionDescription.sdp = sessionDescription.sdp.replace(/ generation 0/g, '');
    sessionDescription.sdp = sessionDescription.sdp.replace(/ udp /g, ' UDP ');
  }

  if (this._forceTURN && this._hasMCU) {
    log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Not filtering ICE candidates as ' +
      'TURN connections are enforced as MCU is present (and act as a TURN itself) so filtering of ICE candidate ' +
      'flags are not honoured']);
    return sessionDescription.sdp;
  }

  if (this._filterCandidatesType.host) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "host" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*host.*\r\n/g, '');
  }

  if (this._filterCandidatesType.srflx) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "srflx" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*srflx.*\r\n/g, '');
  }

  if (this._filterCandidatesType.relay) {
    log.info([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Removing "relay" ICE candidates.']);
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:.*relay.*\r\n/g, '');
  }

  // sessionDescription.sdp = sessionDescription.sdp.replace(/a=candidate:(?!.*relay.*).*\r\n/g, '');

  return sessionDescription.sdp;
};

/**
 * Function that modifies the session description to handle the connection settings.
 * This is experimental and never recommended to end-users.
 * @method _handleSDPConnectionSettings
 * @private
 * @for Skylink
 * @since 0.6.16
 */
Skylink.prototype._handleSDPConnectionSettings = function (targetMid, sessionDescription) {
  var self = this;
  var sdpLines = sessionDescription.sdp.split('\r\n');
  var mediaType = '';

  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].indexOf('m=') === 0) {
      mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0] || '';
    }

    if (mediaType) {
      if (!self._sdpSettings.connection[mediaType === 'application' ? 'data' : mediaType] && targetMid !== 'MCU') {
        sdpLines.splice(i, 1);
        i--;
      } else if (mediaType && ['audio', 'video'].indexOf(mediaType) > -1 &&
        ['a=sendrecv', 'a=sendonly', 'a=recvonly'].indexOf(sdpLines[i]) > -1) {
        if (self._hasMCU) {
          sdpLines[i] = targetMid === 'MCU' ? 'a=sendonly' : 'a=recvonly';
        }

        if (self._sdpSettings.direction[mediaType].send && !self._sdpSettings.direction[mediaType].receive) {
          sdpLines[i] = sdpLines[i].indexOf('send') > -1 ? 'a=sendonly' : 'a=inactive';
        } else if (!self._sdpSettings.direction[mediaType].send && self._sdpSettings.direction[mediaType].receive) {
          sdpLines[i] = sdpLines[i].indexOf('recv') > -1 ? 'a=recvonly' : 'a=inactive';
        } else if (!self._sdpSettings.direction[mediaType].send && !self._sdpSettings.direction[mediaType].receive) {
          sdpLines[i] = 'a=inactive';
        }

        // MCU currently does not support a=inactive flag
        if (!self._hasMCU) {
          var agent = ((self._peerInformations[targetMid] || {}).agent || {}).name || '';
          // Handle Chrome bundle bug. - See: https://bugs.chromium.org/p/webrtc/issues/detail?id=6280
          if (window.webrtcDetectedBrowser !== 'firefox' && agent === 'firefox' &&
            sessionDescription.type === self.HANDSHAKE_PROGRESS.OFFER && sdpLines[i] === 'a=recvonly') {
            log.warn([targetMid, 'RTCSessionDesription', sessionDescription.type, 'Overriding any original settings ' +
              'to receive only to send and receive to resolve chrome BUNDLE errors.']);
            sdpLines[i] = 'a=sendrecv';
          }
        }
      }
    }
  }

  return sdpLines.join('\r\n');
};


  if(typeof exports !== 'undefined') {
    // Prevent breaking code
    module.exports = {
      Skylink: Skylink
    };
  }

  if (refThis) {
    refThis.Skylink = Skylink;
  }

  if (window) {
    window.Skylink = Skylink;
  }

})(this);
