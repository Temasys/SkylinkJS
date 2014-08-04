/*! skywayjs - v0.3.0 - 2014-08-04 */

!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.io=e():"undefined"!=typeof global?global.io=e():"undefined"!=typeof self&&(self.io=e())}(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){module.exports=require("./lib/")},{"./lib/":2}],2:[function(require,module,exports){var url=require("./url");var parser=require("socket.io-parser");var Manager=require("./manager");var debug=require("debug")("socket.io-client");module.exports=exports=lookup;var cache=exports.managers={};function lookup(uri,opts){if(typeof uri=="object"){opts=uri;uri=undefined}opts=opts||{};var parsed=url(uri);var source=parsed.source;var id=parsed.id;var io;if(opts.forceNew||opts["force new connection"]||false===opts.multiplex){debug("ignoring socket cache for %s",source);io=Manager(source,opts)}else{if(!cache[id]){debug("new io instance for %s",source);cache[id]=Manager(source,opts)}io=cache[id]}return io.socket(parsed.path)}exports.protocol=parser.protocol;exports.connect=lookup;exports.Manager=require("./manager");exports.Socket=require("./socket")},{"./manager":3,"./socket":5,"./url":6,debug:9,"socket.io-parser":40}],3:[function(require,module,exports){var url=require("./url");var eio=require("engine.io-client");var Socket=require("./socket");var Emitter=require("component-emitter");var parser=require("socket.io-parser");var on=require("./on");var bind=require("component-bind");var object=require("object-component");var debug=require("debug")("socket.io-client:manager");module.exports=Manager;function Manager(uri,opts){if(!(this instanceof Manager))return new Manager(uri,opts);if(uri&&"object"==typeof uri){opts=uri;uri=undefined}opts=opts||{};opts.path=opts.path||"/socket.io";this.nsps={};this.subs=[];this.opts=opts;this.reconnection(opts.reconnection!==false);this.reconnectionAttempts(opts.reconnectionAttempts||Infinity);this.reconnectionDelay(opts.reconnectionDelay||1e3);this.reconnectionDelayMax(opts.reconnectionDelayMax||5e3);this.timeout(null==opts.timeout?2e4:opts.timeout);this.readyState="closed";this.uri=uri;this.connected=0;this.attempts=0;this.encoding=false;this.packetBuffer=[];this.encoder=new parser.Encoder;this.decoder=new parser.Decoder;this.open()}Manager.prototype.emitAll=function(){this.emit.apply(this,arguments);for(var nsp in this.nsps){this.nsps[nsp].emit.apply(this.nsps[nsp],arguments)}};Emitter(Manager.prototype);Manager.prototype.reconnection=function(v){if(!arguments.length)return this._reconnection;this._reconnection=!!v;return this};Manager.prototype.reconnectionAttempts=function(v){if(!arguments.length)return this._reconnectionAttempts;this._reconnectionAttempts=v;return this};Manager.prototype.reconnectionDelay=function(v){if(!arguments.length)return this._reconnectionDelay;this._reconnectionDelay=v;return this};Manager.prototype.reconnectionDelayMax=function(v){if(!arguments.length)return this._reconnectionDelayMax;this._reconnectionDelayMax=v;return this};Manager.prototype.timeout=function(v){if(!arguments.length)return this._timeout;this._timeout=v;return this};Manager.prototype.maybeReconnectOnOpen=function(){if(!this.openReconnect&&!this.reconnecting&&this._reconnection){this.openReconnect=true;this.reconnect()}};Manager.prototype.open=Manager.prototype.connect=function(fn){debug("readyState %s",this.readyState);if(~this.readyState.indexOf("open"))return this;debug("opening %s",this.uri);this.engine=eio(this.uri,this.opts);var socket=this.engine;var self=this;this.readyState="opening";var openSub=on(socket,"open",function(){self.onopen();fn&&fn()});var errorSub=on(socket,"error",function(data){debug("connect_error");self.cleanup();self.readyState="closed";self.emitAll("connect_error",data);if(fn){var err=new Error("Connection error");err.data=data;fn(err)}self.maybeReconnectOnOpen()});if(false!==this._timeout){var timeout=this._timeout;debug("connect attempt will timeout after %d",timeout);var timer=setTimeout(function(){debug("connect attempt timed out after %d",timeout);openSub.destroy();socket.close();socket.emit("error","timeout");self.emitAll("connect_timeout",timeout)},timeout);this.subs.push({destroy:function(){clearTimeout(timer)}})}this.subs.push(openSub);this.subs.push(errorSub);return this};Manager.prototype.onopen=function(){debug("open");this.cleanup();this.readyState="open";this.emit("open");var socket=this.engine;this.subs.push(on(socket,"data",bind(this,"ondata")));this.subs.push(on(this.decoder,"decoded",bind(this,"ondecoded")));this.subs.push(on(socket,"error",bind(this,"onerror")));this.subs.push(on(socket,"close",bind(this,"onclose")))};Manager.prototype.ondata=function(data){this.decoder.add(data)};Manager.prototype.ondecoded=function(packet){this.emit("packet",packet)};Manager.prototype.onerror=function(err){debug("error",err);this.emitAll("error",err)};Manager.prototype.socket=function(nsp){var socket=this.nsps[nsp];if(!socket){socket=new Socket(this,nsp);this.nsps[nsp]=socket;var self=this;socket.on("connect",function(){self.connected++})}return socket};Manager.prototype.destroy=function(socket){--this.connected||this.close()};Manager.prototype.packet=function(packet){debug("writing packet %j",packet);var self=this;if(!self.encoding){self.encoding=true;this.encoder.encode(packet,function(encodedPackets){for(var i=0;i<encodedPackets.length;i++){self.engine.write(encodedPackets[i])}self.encoding=false;self.processPacketQueue()})}else{self.packetBuffer.push(packet)}};Manager.prototype.processPacketQueue=function(){if(this.packetBuffer.length>0&&!this.encoding){var pack=this.packetBuffer.shift();this.packet(pack)}};Manager.prototype.cleanup=function(){var sub;while(sub=this.subs.shift())sub.destroy();this.packetBuffer=[];this.encoding=false;this.decoder.destroy()};Manager.prototype.close=Manager.prototype.disconnect=function(){this.skipReconnect=true;this.engine.close()};Manager.prototype.onclose=function(reason){debug("close");this.cleanup();this.readyState="closed";this.emit("close",reason);if(this._reconnection&&!this.skipReconnect){this.reconnect()}};Manager.prototype.reconnect=function(){if(this.reconnecting)return this;var self=this;this.attempts++;if(this.attempts>this._reconnectionAttempts){debug("reconnect failed");this.emitAll("reconnect_failed");this.reconnecting=false}else{var delay=this.attempts*this.reconnectionDelay();delay=Math.min(delay,this.reconnectionDelayMax());debug("will wait %dms before reconnect attempt",delay);this.reconnecting=true;var timer=setTimeout(function(){debug("attempting reconnect");self.emitAll("reconnect_attempt",self.attempts);self.emitAll("reconnecting",self.attempts);self.open(function(err){if(err){debug("reconnect attempt error");self.reconnecting=false;self.reconnect();self.emitAll("reconnect_error",err.data)}else{debug("reconnect success");self.onreconnect()}})},delay);this.subs.push({destroy:function(){clearTimeout(timer)}})}};Manager.prototype.onreconnect=function(){var attempt=this.attempts;this.attempts=0;this.reconnecting=false;this.emitAll("reconnect",attempt)}},{"./on":4,"./socket":5,"./url":6,"component-bind":7,"component-emitter":8,debug:9,"engine.io-client":11,"object-component":37,"socket.io-parser":40}],4:[function(require,module,exports){module.exports=on;function on(obj,ev,fn){obj.on(ev,fn);return{destroy:function(){obj.removeListener(ev,fn)}}}},{}],5:[function(require,module,exports){var parser=require("socket.io-parser");var Emitter=require("component-emitter");var toArray=require("to-array");var on=require("./on");var bind=require("component-bind");var debug=require("debug")("socket.io-client:socket");var hasBin=require("has-binary-data");var indexOf=require("indexof");module.exports=exports=Socket;var events={connect:1,connect_error:1,connect_timeout:1,disconnect:1,error:1,reconnect:1,reconnect_attempt:1,reconnect_failed:1,reconnect_error:1,reconnecting:1};var emit=Emitter.prototype.emit;function Socket(io,nsp){this.io=io;this.nsp=nsp;this.json=this;this.ids=0;this.acks={};this.open();this.receiveBuffer=[];this.sendBuffer=[];this.connected=false;this.disconnected=true;this.subEvents()}Emitter(Socket.prototype);Socket.prototype.subEvents=function(){var io=this.io;this.subs=[on(io,"open",bind(this,"onopen")),on(io,"packet",bind(this,"onpacket")),on(io,"close",bind(this,"onclose"))]};Socket.prototype.open=Socket.prototype.connect=function(){if(this.connected)return this;this.io.open();if("open"==this.io.readyState)this.onopen();return this};Socket.prototype.send=function(){var args=toArray(arguments);args.unshift("message");this.emit.apply(this,args);return this};Socket.prototype.emit=function(ev){if(events.hasOwnProperty(ev)){emit.apply(this,arguments);return this}var args=toArray(arguments);var parserType=parser.EVENT;if(hasBin(args)){parserType=parser.BINARY_EVENT}var packet={type:parserType,data:args};if("function"==typeof args[args.length-1]){debug("emitting packet with ack id %d",this.ids);this.acks[this.ids]=args.pop();packet.id=this.ids++}if(this.connected){this.packet(packet)}else{this.sendBuffer.push(packet)}return this};Socket.prototype.packet=function(packet){packet.nsp=this.nsp;this.io.packet(packet)};Socket.prototype.onopen=function(){debug("transport is open - connecting");if("/"!=this.nsp){this.packet({type:parser.CONNECT})}};Socket.prototype.onclose=function(reason){debug("close (%s)",reason);this.connected=false;this.disconnected=true;this.emit("disconnect",reason)};Socket.prototype.onpacket=function(packet){if(packet.nsp!=this.nsp)return;switch(packet.type){case parser.CONNECT:this.onconnect();break;case parser.EVENT:this.onevent(packet);break;case parser.BINARY_EVENT:this.onevent(packet);break;case parser.ACK:this.onack(packet);break;case parser.BINARY_ACK:this.onack(packet);break;case parser.DISCONNECT:this.ondisconnect();break;case parser.ERROR:this.emit("error",packet.data);break}};Socket.prototype.onevent=function(packet){var args=packet.data||[];debug("emitting event %j",args);if(null!=packet.id){debug("attaching ack callback to event");args.push(this.ack(packet.id))}if(this.connected){emit.apply(this,args)}else{this.receiveBuffer.push(args)}};Socket.prototype.ack=function(id){var self=this;var sent=false;return function(){if(sent)return;sent=true;var args=toArray(arguments);debug("sending ack %j",args);var type=hasBin(args)?parser.BINARY_ACK:parser.ACK;self.packet({type:type,id:id,data:args})}};Socket.prototype.onack=function(packet){debug("calling ack %s with %j",packet.id,packet.data);var fn=this.acks[packet.id];fn.apply(this,packet.data);delete this.acks[packet.id]};Socket.prototype.onconnect=function(){this.connected=true;this.disconnected=false;this.emit("connect");this.emitBuffered()};Socket.prototype.emitBuffered=function(){var i;for(i=0;i<this.receiveBuffer.length;i++){emit.apply(this,this.receiveBuffer[i])}this.receiveBuffer=[];for(i=0;i<this.sendBuffer.length;i++){this.packet(this.sendBuffer[i])}this.sendBuffer=[]};Socket.prototype.ondisconnect=function(){debug("server disconnect (%s)",this.nsp);this.destroy();this.onclose("io server disconnect")};Socket.prototype.destroy=function(){for(var i=0;i<this.subs.length;i++){this.subs[i].destroy()}this.io.destroy(this)};Socket.prototype.close=Socket.prototype.disconnect=function(){if(!this.connected)return this;debug("performing disconnect (%s)",this.nsp);this.packet({type:parser.DISCONNECT});this.destroy();this.onclose("io client disconnect");return this}},{"./on":4,"component-bind":7,"component-emitter":8,debug:9,"has-binary-data":32,indexof:36,"socket.io-parser":40,"to-array":43}],6:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var parseuri=require("parseuri");var debug=require("debug")("socket.io-client:url");module.exports=url;function url(uri,loc){var obj=uri;var loc=loc||global.location;if(null==uri)uri=loc.protocol+"//"+loc.hostname;if("string"==typeof uri){if("/"==uri.charAt(0)){if("undefined"!=typeof loc){uri=loc.hostname+uri}}if(!/^(https?|wss?):\/\//.test(uri)){debug("protocol-less url %s",uri);if("undefined"!=typeof loc){uri=loc.protocol+"//"+uri}else{uri="https://"+uri}}debug("parse %s",uri);obj=parseuri(uri)}if(!obj.port){if(/^(http|ws)$/.test(obj.protocol)){obj.port="80"}else if(/^(http|ws)s$/.test(obj.protocol)){obj.port="443"}}obj.path=obj.path||"/";obj.id=obj.protocol+"://"+obj.host+":"+obj.port;obj.href=obj.protocol+"://"+obj.host+(loc&&loc.port==obj.port?"":":"+obj.port);return obj}},{debug:9,parseuri:38}],7:[function(require,module,exports){var slice=[].slice;module.exports=function(obj,fn){if("string"==typeof fn)fn=obj[fn];if("function"!=typeof fn)throw new Error("bind() requires a function");var args=slice.call(arguments,2);return function(){return fn.apply(obj,args.concat(slice.call(arguments)))}}},{}],8:[function(require,module,exports){module.exports=Emitter;function Emitter(obj){if(obj)return mixin(obj)}function mixin(obj){for(var key in Emitter.prototype){obj[key]=Emitter.prototype[key]}return obj}Emitter.prototype.on=Emitter.prototype.addEventListener=function(event,fn){this._callbacks=this._callbacks||{};(this._callbacks[event]=this._callbacks[event]||[]).push(fn);return this};Emitter.prototype.once=function(event,fn){var self=this;this._callbacks=this._callbacks||{};function on(){self.off(event,on);fn.apply(this,arguments)}on.fn=fn;this.on(event,on);return this};Emitter.prototype.off=Emitter.prototype.removeListener=Emitter.prototype.removeAllListeners=Emitter.prototype.removeEventListener=function(event,fn){this._callbacks=this._callbacks||{};if(0==arguments.length){this._callbacks={};return this}var callbacks=this._callbacks[event];if(!callbacks)return this;if(1==arguments.length){delete this._callbacks[event];return this}var cb;for(var i=0;i<callbacks.length;i++){cb=callbacks[i];if(cb===fn||cb.fn===fn){callbacks.splice(i,1);break}}return this};Emitter.prototype.emit=function(event){this._callbacks=this._callbacks||{};var args=[].slice.call(arguments,1),callbacks=this._callbacks[event];if(callbacks){callbacks=callbacks.slice(0);for(var i=0,len=callbacks.length;i<len;++i){callbacks[i].apply(this,args)}}return this};Emitter.prototype.listeners=function(event){this._callbacks=this._callbacks||{};return this._callbacks[event]||[]};Emitter.prototype.hasListeners=function(event){return!!this.listeners(event).length}},{}],9:[function(require,module,exports){module.exports=debug;function debug(name){if(!debug.enabled(name))return function(){};return function(fmt){fmt=coerce(fmt);var curr=new Date;var ms=curr-(debug[name]||curr);debug[name]=curr;fmt=name+" "+fmt+" +"+debug.humanize(ms);window.console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}}debug.names=[];debug.skips=[];debug.enable=function(name){try{localStorage.debug=name}catch(e){}var split=(name||"").split(/[\s,]+/),len=split.length;for(var i=0;i<len;i++){name=split[i].replace("*",".*?");if(name[0]==="-"){debug.skips.push(new RegExp("^"+name.substr(1)+"$"))}else{debug.names.push(new RegExp("^"+name+"$"))}}};debug.disable=function(){debug.enable("")};debug.humanize=function(ms){var sec=1e3,min=60*1e3,hour=60*min;if(ms>=hour)return(ms/hour).toFixed(1)+"h";if(ms>=min)return(ms/min).toFixed(1)+"m";if(ms>=sec)return(ms/sec|0)+"s";return ms+"ms"};debug.enabled=function(name){for(var i=0,len=debug.skips.length;i<len;i++){if(debug.skips[i].test(name)){return false}}for(var i=0,len=debug.names.length;i<len;i++){if(debug.names[i].test(name)){return true}}return false};function coerce(val){if(val instanceof Error)return val.stack||val.message;return val}try{if(window.localStorage)debug.enable(localStorage.debug)}catch(e){}},{}],10:[function(require,module,exports){var index=require("indexof");module.exports=Emitter;function Emitter(obj){if(obj)return mixin(obj)}function mixin(obj){for(var key in Emitter.prototype){obj[key]=Emitter.prototype[key]}return obj}Emitter.prototype.on=function(event,fn){this._callbacks=this._callbacks||{};(this._callbacks[event]=this._callbacks[event]||[]).push(fn);return this};Emitter.prototype.once=function(event,fn){var self=this;this._callbacks=this._callbacks||{};function on(){self.off(event,on);fn.apply(this,arguments)}fn._off=on;this.on(event,on);return this};Emitter.prototype.off=Emitter.prototype.removeListener=Emitter.prototype.removeAllListeners=function(event,fn){this._callbacks=this._callbacks||{};if(0==arguments.length){this._callbacks={};return this}var callbacks=this._callbacks[event];if(!callbacks)return this;if(1==arguments.length){delete this._callbacks[event];return this}var i=index(callbacks,fn._off||fn);if(~i)callbacks.splice(i,1);return this};Emitter.prototype.emit=function(event){this._callbacks=this._callbacks||{};var args=[].slice.call(arguments,1),callbacks=this._callbacks[event];if(callbacks){callbacks=callbacks.slice(0);for(var i=0,len=callbacks.length;i<len;++i){callbacks[i].apply(this,args)}}return this};Emitter.prototype.listeners=function(event){this._callbacks=this._callbacks||{};return this._callbacks[event]||[]};Emitter.prototype.hasListeners=function(event){return!!this.listeners(event).length}},{indexof:36}],11:[function(require,module,exports){module.exports=require("./lib/")},{"./lib/":12}],12:[function(require,module,exports){module.exports=require("./socket");module.exports.parser=require("engine.io-parser")},{"./socket":13,"engine.io-parser":22}],13:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var transports=require("./transports");var Emitter=require("component-emitter");var debug=require("debug")("engine.io-client:socket");var index=require("indexof");var parser=require("engine.io-parser");var parseuri=require("parseuri");var parsejson=require("parsejson");var parseqs=require("parseqs");module.exports=Socket;function noop(){}function Socket(uri,opts){if(!(this instanceof Socket))return new Socket(uri,opts);opts=opts||{};if(uri&&"object"==typeof uri){opts=uri;uri=null}if(uri){uri=parseuri(uri);opts.host=uri.host;opts.secure=uri.protocol=="https"||uri.protocol=="wss";opts.port=uri.port;if(uri.query)opts.query=uri.query}this.secure=null!=opts.secure?opts.secure:global.location&&"https:"==location.protocol;if(opts.host){var pieces=opts.host.split(":");opts.hostname=pieces.shift();if(pieces.length)opts.port=pieces.pop()}this.agent=opts.agent||false;this.hostname=opts.hostname||(global.location?location.hostname:"localhost");this.port=opts.port||(global.location&&location.port?location.port:this.secure?443:80);this.query=opts.query||{};if("string"==typeof this.query)this.query=parseqs.decode(this.query);this.upgrade=false!==opts.upgrade;this.path=(opts.path||"/engine.io").replace(/\/$/,"")+"/";this.forceJSONP=!!opts.forceJSONP;this.forceBase64=!!opts.forceBase64;this.timestampParam=opts.timestampParam||"t";this.timestampRequests=opts.timestampRequests;this.transports=opts.transports||["polling","websocket"];this.readyState="";this.writeBuffer=[];this.callbackBuffer=[];this.policyPort=opts.policyPort||843;this.rememberUpgrade=opts.rememberUpgrade||false;this.open();this.binaryType=null;this.onlyBinaryUpgrades=opts.onlyBinaryUpgrades}Socket.priorWebsocketSuccess=false;Emitter(Socket.prototype);Socket.protocol=parser.protocol;Socket.Socket=Socket;Socket.Transport=require("./transport");Socket.transports=require("./transports");Socket.parser=require("engine.io-parser");Socket.prototype.createTransport=function(name){debug('creating transport "%s"',name);var query=clone(this.query);query.EIO=parser.protocol;query.transport=name;if(this.id)query.sid=this.id;var transport=new transports[name]({agent:this.agent,hostname:this.hostname,port:this.port,secure:this.secure,path:this.path,query:query,forceJSONP:this.forceJSONP,forceBase64:this.forceBase64,timestampRequests:this.timestampRequests,timestampParam:this.timestampParam,policyPort:this.policyPort,socket:this});return transport};function clone(obj){var o={};for(var i in obj){if(obj.hasOwnProperty(i)){o[i]=obj[i]}}return o}Socket.prototype.open=function(){var transport;if(this.rememberUpgrade&&Socket.priorWebsocketSuccess&&this.transports.indexOf("websocket")!=-1){transport="websocket"}else{transport=this.transports[0]}this.readyState="opening";var transport=this.createTransport(transport);transport.open();this.setTransport(transport)};Socket.prototype.setTransport=function(transport){debug("setting transport %s",transport.name);var self=this;if(this.transport){debug("clearing existing transport %s",this.transport.name);this.transport.removeAllListeners()}this.transport=transport;transport.on("drain",function(){self.onDrain()}).on("packet",function(packet){self.onPacket(packet)}).on("error",function(e){self.onError(e)}).on("close",function(){self.onClose("transport close")})};Socket.prototype.probe=function(name){debug('probing transport "%s"',name);var transport=this.createTransport(name,{probe:1}),failed=false,self=this;Socket.priorWebsocketSuccess=false;function onTransportOpen(){if(self.onlyBinaryUpgrades){var upgradeLosesBinary=!this.supportsBinary&&self.transport.supportsBinary;failed=failed||upgradeLosesBinary}if(failed)return;debug('probe transport "%s" opened',name);transport.send([{type:"ping",data:"probe"}]);transport.once("packet",function(msg){if(failed)return;if("pong"==msg.type&&"probe"==msg.data){debug('probe transport "%s" pong',name);self.upgrading=true;self.emit("upgrading",transport);Socket.priorWebsocketSuccess="websocket"==transport.name;debug('pausing current transport "%s"',self.transport.name);self.transport.pause(function(){if(failed)return;if("closed"==self.readyState||"closing"==self.readyState){return}debug("changing transport and sending upgrade packet");cleanup();self.setTransport(transport);transport.send([{type:"upgrade"}]);self.emit("upgrade",transport);transport=null;self.upgrading=false;self.flush()})}else{debug('probe transport "%s" failed',name);var err=new Error("probe error");err.transport=transport.name;self.emit("upgradeError",err)}})}function freezeTransport(){if(failed)return;failed=true;cleanup();transport.close();transport=null}function onerror(err){var error=new Error("probe error: "+err);error.transport=transport.name;freezeTransport();debug('probe transport "%s" failed because of error: %s',name,err);self.emit("upgradeError",error)}function onTransportClose(){onerror("transport closed")}function onclose(){onerror("socket closed")}function onupgrade(to){if(transport&&to.name!=transport.name){debug('"%s" works - aborting "%s"',to.name,transport.name);freezeTransport()}}function cleanup(){transport.removeListener("open",onTransportOpen);transport.removeListener("error",onerror);transport.removeListener("close",onTransportClose);self.removeListener("close",onclose);self.removeListener("upgrading",onupgrade)}transport.once("open",onTransportOpen);transport.once("error",onerror);transport.once("close",onTransportClose);this.once("close",onclose);this.once("upgrading",onupgrade);transport.open()};Socket.prototype.onOpen=function(){debug("socket open");this.readyState="open";Socket.priorWebsocketSuccess="websocket"==this.transport.name;this.emit("open");this.flush();if("open"==this.readyState&&this.upgrade&&this.transport.pause){debug("starting upgrade probes");for(var i=0,l=this.upgrades.length;i<l;i++){this.probe(this.upgrades[i])}}};Socket.prototype.onPacket=function(packet){if("opening"==this.readyState||"open"==this.readyState){debug('socket receive: type "%s", data "%s"',packet.type,packet.data);this.emit("packet",packet);this.emit("heartbeat");switch(packet.type){case"open":this.onHandshake(parsejson(packet.data));break;case"pong":this.setPing();break;case"error":var err=new Error("server error");err.code=packet.data;this.emit("error",err);break;case"message":this.emit("data",packet.data);this.emit("message",packet.data);break}}else{debug('packet received with socket readyState "%s"',this.readyState)}};Socket.prototype.onHandshake=function(data){this.emit("handshake",data);this.id=data.sid;this.transport.query.sid=data.sid;this.upgrades=this.filterUpgrades(data.upgrades);this.pingInterval=data.pingInterval;this.pingTimeout=data.pingTimeout;this.onOpen();if("closed"==this.readyState)return;this.setPing();this.removeListener("heartbeat",this.onHeartbeat);this.on("heartbeat",this.onHeartbeat)};Socket.prototype.onHeartbeat=function(timeout){clearTimeout(this.pingTimeoutTimer);var self=this;self.pingTimeoutTimer=setTimeout(function(){if("closed"==self.readyState)return;self.onClose("ping timeout")},timeout||self.pingInterval+self.pingTimeout)};Socket.prototype.setPing=function(){var self=this;clearTimeout(self.pingIntervalTimer);self.pingIntervalTimer=setTimeout(function(){debug("writing ping packet - expecting pong within %sms",self.pingTimeout);self.ping();self.onHeartbeat(self.pingTimeout)},self.pingInterval)};Socket.prototype.ping=function(){this.sendPacket("ping")};Socket.prototype.onDrain=function(){for(var i=0;i<this.prevBufferLen;i++){if(this.callbackBuffer[i]){this.callbackBuffer[i]()}}this.writeBuffer.splice(0,this.prevBufferLen);this.callbackBuffer.splice(0,this.prevBufferLen);this.prevBufferLen=0;if(this.writeBuffer.length==0){this.emit("drain")}else{this.flush()}};Socket.prototype.flush=function(){if("closed"!=this.readyState&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){debug("flushing %d packets in socket",this.writeBuffer.length);this.transport.send(this.writeBuffer);this.prevBufferLen=this.writeBuffer.length;this.emit("flush")}};Socket.prototype.write=Socket.prototype.send=function(msg,fn){this.sendPacket("message",msg,fn);return this};Socket.prototype.sendPacket=function(type,data,fn){var packet={type:type,data:data};this.emit("packetCreate",packet);this.writeBuffer.push(packet);this.callbackBuffer.push(fn);this.flush()};Socket.prototype.close=function(){if("opening"==this.readyState||"open"==this.readyState){this.onClose("forced close");debug("socket closing - telling transport to close");this.transport.close()}return this};Socket.prototype.onError=function(err){debug("socket error %j",err);Socket.priorWebsocketSuccess=false;this.emit("error",err);this.onClose("transport error",err)};Socket.prototype.onClose=function(reason,desc){if("opening"==this.readyState||"open"==this.readyState){debug('socket close with reason: "%s"',reason);var self=this;clearTimeout(this.pingIntervalTimer);clearTimeout(this.pingTimeoutTimer);setTimeout(function(){self.writeBuffer=[];self.callbackBuffer=[];self.prevBufferLen=0},0);this.transport.removeAllListeners("close");this.transport.close();this.transport.removeAllListeners();this.readyState="closed";this.id=null;this.emit("close",reason,desc)}};Socket.prototype.filterUpgrades=function(upgrades){var filteredUpgrades=[];for(var i=0,j=upgrades.length;i<j;i++){if(~index(this.transports,upgrades[i]))filteredUpgrades.push(upgrades[i])}return filteredUpgrades}},{"./transport":14,"./transports":15,"component-emitter":8,debug:9,"engine.io-parser":22,indexof:36,parsejson:29,parseqs:30,parseuri:38}],14:[function(require,module,exports){var parser=require("engine.io-parser");var Emitter=require("component-emitter");module.exports=Transport;function Transport(opts){this.path=opts.path;this.hostname=opts.hostname;this.port=opts.port;this.secure=opts.secure;this.query=opts.query;this.timestampParam=opts.timestampParam;this.timestampRequests=opts.timestampRequests;this.readyState="";this.agent=opts.agent||false;this.socket=opts.socket}Emitter(Transport.prototype);Transport.timestamps=0;Transport.prototype.onError=function(msg,desc){var err=new Error(msg);err.type="TransportError";err.description=desc;this.emit("error",err);return this};Transport.prototype.open=function(){if("closed"==this.readyState||""==this.readyState){this.readyState="opening";this.doOpen()}return this};Transport.prototype.close=function(){if("opening"==this.readyState||"open"==this.readyState){this.doClose();this.onClose()}return this};Transport.prototype.send=function(packets){if("open"==this.readyState){this.write(packets)}else{throw new Error("Transport not open")}};Transport.prototype.onOpen=function(){this.readyState="open";this.writable=true;this.emit("open")};Transport.prototype.onData=function(data){try{var packet=parser.decodePacket(data,this.socket.binaryType);this.onPacket(packet)}catch(e){e.data=data;this.onError("parser decode error",e)}};Transport.prototype.onPacket=function(packet){this.emit("packet",packet)};Transport.prototype.onClose=function(){this.readyState="closed";this.emit("close")}},{"component-emitter":8,"engine.io-parser":22}],15:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var XMLHttpRequest=require("xmlhttprequest");var XHR=require("./polling-xhr");var JSONP=require("./polling-jsonp");var websocket=require("./websocket");exports.polling=polling;exports.websocket=websocket;function polling(opts){var xhr;var xd=false;if(global.location){var isSSL="https:"==location.protocol;var port=location.port;if(!port){port=isSSL?443:80}xd=opts.hostname!=location.hostname||port!=opts.port}opts.xdomain=xd;xhr=new XMLHttpRequest(opts);if("open"in xhr&&!opts.forceJSONP){return new XHR(opts)}else{return new JSONP(opts)}}},{"./polling-jsonp":16,"./polling-xhr":17,"./websocket":19,xmlhttprequest:20}],16:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var Polling=require("./polling");var inherit=require("component-inherit");module.exports=JSONPPolling;var rNewline=/\n/g;var rEscapedNewline=/\\n/g;var callbacks;var index=0;function empty(){}function JSONPPolling(opts){Polling.call(this,opts);this.query=this.query||{};if(!callbacks){if(!global.___eio)global.___eio=[];callbacks=global.___eio}this.index=callbacks.length;var self=this;callbacks.push(function(msg){self.onData(msg)});this.query.j=this.index;if(global.document&&global.addEventListener){global.addEventListener("beforeunload",function(){if(self.script)self.script.onerror=empty})}}inherit(JSONPPolling,Polling);JSONPPolling.prototype.supportsBinary=false;JSONPPolling.prototype.doClose=function(){if(this.script){this.script.parentNode.removeChild(this.script);this.script=null}if(this.form){this.form.parentNode.removeChild(this.form);this.form=null}Polling.prototype.doClose.call(this)};JSONPPolling.prototype.doPoll=function(){var self=this;var script=document.createElement("script");if(this.script){this.script.parentNode.removeChild(this.script);this.script=null}script.async=true;script.src=this.uri();script.onerror=function(e){self.onError("jsonp poll error",e)};var insertAt=document.getElementsByTagName("script")[0];insertAt.parentNode.insertBefore(script,insertAt);this.script=script;var isUAgecko="undefined"!=typeof navigator&&/gecko/i.test(navigator.userAgent);if(isUAgecko){setTimeout(function(){var iframe=document.createElement("iframe");document.body.appendChild(iframe);document.body.removeChild(iframe)},100)}};JSONPPolling.prototype.doWrite=function(data,fn){var self=this;if(!this.form){var form=document.createElement("form");var area=document.createElement("textarea");var id=this.iframeId="eio_iframe_"+this.index;var iframe;form.className="socketio";form.style.position="absolute";form.style.top="-1000px";form.style.left="-1000px";form.target=id;form.method="POST";form.setAttribute("accept-charset","utf-8");area.name="d";form.appendChild(area);document.body.appendChild(form);this.form=form;this.area=area}this.form.action=this.uri();function complete(){initIframe();fn()}function initIframe(){if(self.iframe){try{self.form.removeChild(self.iframe)
}catch(e){self.onError("jsonp polling iframe removal error",e)}}try{var html='<iframe src="javascript:0" name="'+self.iframeId+'">';iframe=document.createElement(html)}catch(e){iframe=document.createElement("iframe");iframe.name=self.iframeId;iframe.src="javascript:0"}iframe.id=self.iframeId;self.form.appendChild(iframe);self.iframe=iframe}initIframe();data=data.replace(rEscapedNewline,"\\\n");this.area.value=data.replace(rNewline,"\\n");try{this.form.submit()}catch(e){}if(this.iframe.attachEvent){this.iframe.onreadystatechange=function(){if(self.iframe.readyState=="complete"){complete()}}}else{this.iframe.onload=complete}}},{"./polling":18,"component-inherit":21}],17:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var XMLHttpRequest=require("xmlhttprequest");var Polling=require("./polling");var Emitter=require("component-emitter");var inherit=require("component-inherit");var debug=require("debug")("engine.io-client:polling-xhr");module.exports=XHR;module.exports.Request=Request;function empty(){}function XHR(opts){Polling.call(this,opts);if(global.location){var isSSL="https:"==location.protocol;var port=location.port;if(!port){port=isSSL?443:80}this.xd=opts.hostname!=global.location.hostname||port!=opts.port}}inherit(XHR,Polling);XHR.prototype.supportsBinary=true;XHR.prototype.request=function(opts){opts=opts||{};opts.uri=this.uri();opts.xd=this.xd;opts.agent=this.agent||false;opts.supportsBinary=this.supportsBinary;return new Request(opts)};XHR.prototype.doWrite=function(data,fn){var isBinary=typeof data!=="string"&&data!==undefined;var req=this.request({method:"POST",data:data,isBinary:isBinary});var self=this;req.on("success",fn);req.on("error",function(err){self.onError("xhr post error",err)});this.sendXhr=req};XHR.prototype.doPoll=function(){debug("xhr poll");var req=this.request();var self=this;req.on("data",function(data){self.onData(data)});req.on("error",function(err){self.onError("xhr poll error",err)});this.pollXhr=req};function Request(opts){this.method=opts.method||"GET";this.uri=opts.uri;this.xd=!!opts.xd;this.async=false!==opts.async;this.data=undefined!=opts.data?opts.data:null;this.agent=opts.agent;this.create(opts.isBinary,opts.supportsBinary)}Emitter(Request.prototype);Request.prototype.create=function(isBinary,supportsBinary){var xhr=this.xhr=new XMLHttpRequest({agent:this.agent,xdomain:this.xd});var self=this;try{debug("xhr open %s: %s",this.method,this.uri);xhr.open(this.method,this.uri,this.async);if(supportsBinary){xhr.responseType="arraybuffer"}if("POST"==this.method){try{if(isBinary){xhr.setRequestHeader("Content-type","application/octet-stream")}else{xhr.setRequestHeader("Content-type","text/plain;charset=UTF-8")}}catch(e){}}if("withCredentials"in xhr){xhr.withCredentials=true}xhr.onreadystatechange=function(){var data;try{if(4!=xhr.readyState)return;if(200==xhr.status||1223==xhr.status){var contentType=xhr.getResponseHeader("Content-Type");if(contentType==="application/octet-stream"){data=xhr.response}else{if(!supportsBinary){data=xhr.responseText}else{data="ok"}}}else{setTimeout(function(){self.onError(xhr.status)},0)}}catch(e){self.onError(e)}if(null!=data){self.onData(data)}};debug("xhr data %s",this.data);xhr.send(this.data)}catch(e){setTimeout(function(){self.onError(e)},0);return}if(global.document){this.index=Request.requestsCount++;Request.requests[this.index]=this}};Request.prototype.onSuccess=function(){this.emit("success");this.cleanup()};Request.prototype.onData=function(data){this.emit("data",data);this.onSuccess()};Request.prototype.onError=function(err){this.emit("error",err);this.cleanup()};Request.prototype.cleanup=function(){if("undefined"==typeof this.xhr||null===this.xhr){return}this.xhr.onreadystatechange=empty;try{this.xhr.abort()}catch(e){}if(global.document){delete Request.requests[this.index]}this.xhr=null};Request.prototype.abort=function(){this.cleanup()};if(global.document){Request.requestsCount=0;Request.requests={};if(global.attachEvent){global.attachEvent("onunload",unloadHandler)}else if(global.addEventListener){global.addEventListener("beforeunload",unloadHandler)}}function unloadHandler(){for(var i in Request.requests){if(Request.requests.hasOwnProperty(i)){Request.requests[i].abort()}}}},{"./polling":18,"component-emitter":8,"component-inherit":21,debug:9,xmlhttprequest:20}],18:[function(require,module,exports){var Transport=require("../transport");var parseqs=require("parseqs");var parser=require("engine.io-parser");var inherit=require("component-inherit");var debug=require("debug")("engine.io-client:polling");module.exports=Polling;var hasXHR2=function(){var XMLHttpRequest=require("xmlhttprequest");var xhr=new XMLHttpRequest({agent:this.agent,xdomain:false});return null!=xhr.responseType}();function Polling(opts){var forceBase64=opts&&opts.forceBase64;if(!hasXHR2||forceBase64){this.supportsBinary=false}Transport.call(this,opts)}inherit(Polling,Transport);Polling.prototype.name="polling";Polling.prototype.doOpen=function(){this.poll()};Polling.prototype.pause=function(onPause){var pending=0;var self=this;this.readyState="pausing";function pause(){debug("paused");self.readyState="paused";onPause()}if(this.polling||!this.writable){var total=0;if(this.polling){debug("we are currently polling - waiting to pause");total++;this.once("pollComplete",function(){debug("pre-pause polling complete");--total||pause()})}if(!this.writable){debug("we are currently writing - waiting to pause");total++;this.once("drain",function(){debug("pre-pause writing complete");--total||pause()})}}else{pause()}};Polling.prototype.poll=function(){debug("polling");this.polling=true;this.doPoll();this.emit("poll")};Polling.prototype.onData=function(data){var self=this;debug("polling got data %s",data);var callback=function(packet,index,total){if("opening"==self.readyState){self.onOpen()}if("close"==packet.type){self.onClose();return false}self.onPacket(packet)};parser.decodePayload(data,this.socket.binaryType,callback);if("closed"!=this.readyState){this.polling=false;this.emit("pollComplete");if("open"==this.readyState){this.poll()}else{debug('ignoring poll - transport state "%s"',this.readyState)}}};Polling.prototype.doClose=function(){var self=this;function close(){debug("writing close packet");self.write([{type:"close"}])}if("open"==this.readyState){debug("transport open - closing");close()}else{debug("transport not open - deferring close");this.once("open",close)}};Polling.prototype.write=function(packets){var self=this;this.writable=false;var callbackfn=function(){self.writable=true;self.emit("drain")};var self=this;parser.encodePayload(packets,this.supportsBinary,function(data){self.doWrite(data,callbackfn)})};Polling.prototype.uri=function(){var query=this.query||{};var schema=this.secure?"https":"http";var port="";if(false!==this.timestampRequests){query[this.timestampParam]=+new Date+"-"+Transport.timestamps++}if(!this.supportsBinary&&!query.sid){query.b64=1}query=parseqs.encode(query);if(this.port&&("https"==schema&&this.port!=443||"http"==schema&&this.port!=80)){port=":"+this.port}if(query.length){query="?"+query}return schema+"://"+this.hostname+port+this.path+query}},{"../transport":14,"component-inherit":21,debug:9,"engine.io-parser":22,parseqs:30,xmlhttprequest:20}],19:[function(require,module,exports){var Transport=require("../transport");var parser=require("engine.io-parser");var parseqs=require("parseqs");var inherit=require("component-inherit");var debug=require("debug")("engine.io-client:websocket");var WebSocket=require("ws");module.exports=WS;function WS(opts){var forceBase64=opts&&opts.forceBase64;if(forceBase64){this.supportsBinary=false}Transport.call(this,opts)}inherit(WS,Transport);WS.prototype.name="websocket";WS.prototype.supportsBinary=true;WS.prototype.doOpen=function(){if(!this.check()){return}var self=this;var uri=this.uri();var protocols=void 0;var opts={agent:this.agent};this.ws=new WebSocket(uri,protocols,opts);if(this.ws.binaryType===undefined){this.supportsBinary=false}this.ws.binaryType="arraybuffer";this.addEventListeners()};WS.prototype.addEventListeners=function(){var self=this;this.ws.onopen=function(){self.onOpen()};this.ws.onclose=function(){self.onClose()};this.ws.onmessage=function(ev){self.onData(ev.data)};this.ws.onerror=function(e){self.onError("websocket error",e)}};if("undefined"!=typeof navigator&&/iPad|iPhone|iPod/i.test(navigator.userAgent)){WS.prototype.onData=function(data){var self=this;setTimeout(function(){Transport.prototype.onData.call(self,data)},0)}}WS.prototype.write=function(packets){var self=this;this.writable=false;for(var i=0,l=packets.length;i<l;i++){parser.encodePacket(packets[i],this.supportsBinary,function(data){try{self.ws.send(data)}catch(e){debug("websocket closed before onclose event")}})}function ondrain(){self.writable=true;self.emit("drain")}setTimeout(ondrain,0)};WS.prototype.onClose=function(){Transport.prototype.onClose.call(this)};WS.prototype.doClose=function(){if(typeof this.ws!=="undefined"){this.ws.close()}};WS.prototype.uri=function(){var query=this.query||{};var schema=this.secure?"wss":"ws";var port="";if(this.port&&("wss"==schema&&this.port!=443||"ws"==schema&&this.port!=80)){port=":"+this.port}if(this.timestampRequests){query[this.timestampParam]=+new Date}if(!this.supportsBinary){query.b64=1}query=parseqs.encode(query);if(query.length){query="?"+query}return schema+"://"+this.hostname+port+this.path+query};WS.prototype.check=function(){return!!WebSocket&&!("__initialize"in WebSocket&&this.name===WS.prototype.name)}},{"../transport":14,"component-inherit":21,debug:9,"engine.io-parser":22,parseqs:30,ws:31}],20:[function(require,module,exports){var hasCORS=require("has-cors");module.exports=function(opts){var xdomain=opts.xdomain;try{if("undefined"!=typeof XMLHttpRequest&&(!xdomain||hasCORS)){return new XMLHttpRequest}}catch(e){}if(!xdomain){try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(e){}}}},{"has-cors":34}],21:[function(require,module,exports){module.exports=function(a,b){var fn=function(){};fn.prototype=b.prototype;a.prototype=new fn;a.prototype.constructor=a}},{}],22:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var keys=require("./keys");var sliceBuffer=require("arraybuffer.slice");var base64encoder=require("base64-arraybuffer");var after=require("after");var utf8=require("utf8");var isAndroid=navigator.userAgent.match(/Android/i);exports.protocol=2;var packets=exports.packets={open:0,close:1,ping:2,pong:3,message:4,upgrade:5,noop:6};var packetslist=keys(packets);var err={type:"error",data:"parser error"};var Blob=require("blob");exports.encodePacket=function(packet,supportsBinary,callback){if(typeof supportsBinary=="function"){callback=supportsBinary;supportsBinary=false}var data=packet.data===undefined?undefined:packet.data.buffer||packet.data;if(global.ArrayBuffer&&data instanceof ArrayBuffer){return encodeArrayBuffer(packet,supportsBinary,callback)}else if(Blob&&data instanceof global.Blob){return encodeBlob(packet,supportsBinary,callback)}var encoded=packets[packet.type];if(undefined!==packet.data){encoded+=utf8.encode(String(packet.data))}return callback(""+encoded)};function encodeArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback)}var data=packet.data;var contentArray=new Uint8Array(data);var resultBuffer=new Uint8Array(1+data.byteLength);resultBuffer[0]=packets[packet.type];for(var i=0;i<contentArray.length;i++){resultBuffer[i+1]=contentArray[i]}return callback(resultBuffer.buffer)}function encodeBlobAsArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback)}var fr=new FileReader;fr.onload=function(){packet.data=fr.result;exports.encodePacket(packet,supportsBinary,callback)};return fr.readAsArrayBuffer(packet.data)}function encodeBlob(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback)}if(isAndroid){return encodeBlobAsArrayBuffer(packet,supportsBinary,callback)}var length=new Uint8Array(1);length[0]=packets[packet.type];var blob=new Blob([length.buffer,packet.data]);return callback(blob)}exports.encodeBase64Packet=function(packet,callback){var message="b"+exports.packets[packet.type];if(Blob&&packet.data instanceof Blob){var fr=new FileReader;fr.onload=function(){var b64=fr.result.split(",")[1];callback(message+b64)};return fr.readAsDataURL(packet.data)}var b64data;try{b64data=String.fromCharCode.apply(null,new Uint8Array(packet.data))}catch(e){var typed=new Uint8Array(packet.data);var basic=new Array(typed.length);for(var i=0;i<typed.length;i++){basic[i]=typed[i]}b64data=String.fromCharCode.apply(null,basic)}message+=global.btoa(b64data);return callback(message)};exports.decodePacket=function(data,binaryType){if(typeof data=="string"||data===undefined){if(data.charAt(0)=="b"){return exports.decodeBase64Packet(data.substr(1),binaryType)}data=utf8.decode(data);var type=data.charAt(0);if(Number(type)!=type||!packetslist[type]){return err}if(data.length>1){return{type:packetslist[type],data:data.substring(1)}}else{return{type:packetslist[type]}}}var asArray=new Uint8Array(data);var type=asArray[0];var rest=sliceBuffer(data,1);if(Blob&&binaryType==="blob"){rest=new Blob([rest])}return{type:packetslist[type],data:rest}};exports.decodeBase64Packet=function(msg,binaryType){var type=packetslist[msg.charAt(0)];if(!global.ArrayBuffer){return{type:type,data:{base64:true,data:msg.substr(1)}}}var data=base64encoder.decode(msg.substr(1));if(binaryType==="blob"&&Blob){data=new Blob([data])}return{type:type,data:data}};exports.encodePayload=function(packets,supportsBinary,callback){if(typeof supportsBinary=="function"){callback=supportsBinary;supportsBinary=null}if(supportsBinary){if(Blob&&!isAndroid){return exports.encodePayloadAsBlob(packets,callback)}return exports.encodePayloadAsArrayBuffer(packets,callback)}if(!packets.length){return callback("0:")}function setLengthHeader(message){return message.length+":"+message}function encodeOne(packet,doneCallback){exports.encodePacket(packet,supportsBinary,function(message){doneCallback(null,setLengthHeader(message))})}map(packets,encodeOne,function(err,results){return callback(results.join(""))})};function map(ary,each,done){var result=new Array(ary.length);var next=after(ary.length,done);var eachWithIndex=function(i,el,cb){each(el,function(error,msg){result[i]=msg;cb(error,result)})};for(var i=0;i<ary.length;i++){eachWithIndex(i,ary[i],next)}}exports.decodePayload=function(data,binaryType,callback){if(typeof data!="string"){return exports.decodePayloadAsBinary(data,binaryType,callback)}if(typeof binaryType==="function"){callback=binaryType;binaryType=null}var packet;if(data==""){return callback(err,0,1)}var length="",n,msg;for(var i=0,l=data.length;i<l;i++){var chr=data.charAt(i);if(":"!=chr){length+=chr}else{if(""==length||length!=(n=Number(length))){return callback(err,0,1)}msg=data.substr(i+1,n);if(length!=msg.length){return callback(err,0,1)}if(msg.length){packet=exports.decodePacket(msg,binaryType);if(err.type==packet.type&&err.data==packet.data){return callback(err,0,1)}var ret=callback(packet,i+n,l);if(false===ret)return}i+=n;length=""}}if(length!=""){return callback(err,0,1)}};exports.encodePayloadAsArrayBuffer=function(packets,callback){if(!packets.length){return callback(new ArrayBuffer(0))}function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,function(data){return doneCallback(null,data)})}map(packets,encodeOne,function(err,encodedPackets){var totalLength=encodedPackets.reduce(function(acc,p){var len;if(typeof p==="string"){len=p.length}else{len=p.byteLength}return acc+len.toString().length+len+2},0);var resultArray=new Uint8Array(totalLength);var bufferIndex=0;encodedPackets.forEach(function(p){var isString=typeof p==="string";var ab=p;if(isString){var view=new Uint8Array(p.length);for(var i=0;i<p.length;i++){view[i]=p.charCodeAt(i)}ab=view.buffer}if(isString){resultArray[bufferIndex++]=0}else{resultArray[bufferIndex++]=1}var lenStr=ab.byteLength.toString();for(var i=0;i<lenStr.length;i++){resultArray[bufferIndex++]=parseInt(lenStr[i])}resultArray[bufferIndex++]=255;var view=new Uint8Array(ab);for(var i=0;i<view.length;i++){resultArray[bufferIndex++]=view[i]}});return callback(resultArray.buffer)})};exports.encodePayloadAsBlob=function(packets,callback){function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,function(encoded){var binaryIdentifier=new Uint8Array(1);binaryIdentifier[0]=1;if(typeof encoded==="string"){var view=new Uint8Array(encoded.length);for(var i=0;i<encoded.length;i++){view[i]=encoded.charCodeAt(i)}encoded=view.buffer;binaryIdentifier[0]=0}var len=encoded instanceof ArrayBuffer?encoded.byteLength:encoded.size;var lenStr=len.toString();var lengthAry=new Uint8Array(lenStr.length+1);for(var i=0;i<lenStr.length;i++){lengthAry[i]=parseInt(lenStr[i])}lengthAry[lenStr.length]=255;if(Blob){var blob=new Blob([binaryIdentifier.buffer,lengthAry.buffer,encoded]);doneCallback(null,blob)}})}map(packets,encodeOne,function(err,results){return callback(new Blob(results))})};exports.decodePayloadAsBinary=function(data,binaryType,callback){if(typeof binaryType==="function"){callback=binaryType;binaryType=null}var bufferTail=data;var buffers=[];while(bufferTail.byteLength>0){var tailArray=new Uint8Array(bufferTail);var isString=tailArray[0]===0;var msgLength="";for(var i=1;;i++){if(tailArray[i]==255)break;msgLength+=tailArray[i]}bufferTail=sliceBuffer(bufferTail,2+msgLength.length);msgLength=parseInt(msgLength);var msg=sliceBuffer(bufferTail,0,msgLength);if(isString){try{msg=String.fromCharCode.apply(null,new Uint8Array(msg))}catch(e){var typed=new Uint8Array(msg);msg="";for(var i=0;i<typed.length;i++){msg+=String.fromCharCode(typed[i])}}}buffers.push(msg);bufferTail=sliceBuffer(bufferTail,msgLength)}var total=buffers.length;buffers.forEach(function(buffer,i){callback(exports.decodePacket(buffer,binaryType),i,total)})}},{"./keys":23,after:24,"arraybuffer.slice":25,"base64-arraybuffer":26,blob:27,utf8:28}],23:[function(require,module,exports){module.exports=Object.keys||function keys(obj){var arr=[];var has=Object.prototype.hasOwnProperty;for(var i in obj){if(has.call(obj,i)){arr.push(i)}}return arr}},{}],24:[function(require,module,exports){module.exports=after;function after(count,callback,err_cb){var bail=false;err_cb=err_cb||noop;proxy.count=count;return count===0?callback():proxy;function proxy(err,result){if(proxy.count<=0){throw new Error("after called too many times")}--proxy.count;if(err){bail=true;callback(err);callback=err_cb}else if(proxy.count===0&&!bail){callback(null,result)}}}function noop(){}},{}],25:[function(require,module,exports){module.exports=function(arraybuffer,start,end){var bytes=arraybuffer.byteLength;start=start||0;end=end||bytes;if(arraybuffer.slice){return arraybuffer.slice(start,end)}if(start<0){start+=bytes}if(end<0){end+=bytes}if(end>bytes){end=bytes}if(start>=bytes||start>=end||bytes===0){return new ArrayBuffer(0)}var abv=new Uint8Array(arraybuffer);var result=new Uint8Array(end-start);for(var i=start,ii=0;i<end;i++,ii++){result[ii]=abv[i]}return result.buffer}},{}],26:[function(require,module,exports){(function(chars){"use strict";exports.encode=function(arraybuffer){var bytes=new Uint8Array(arraybuffer),i,len=bytes.length,base64="";for(i=0;i<len;i+=3){base64+=chars[bytes[i]>>2];base64+=chars[(bytes[i]&3)<<4|bytes[i+1]>>4];base64+=chars[(bytes[i+1]&15)<<2|bytes[i+2]>>6];base64+=chars[bytes[i+2]&63]}if(len%3===2){base64=base64.substring(0,base64.length-1)+"="}else if(len%3===1){base64=base64.substring(0,base64.length-2)+"=="}return base64};exports.decode=function(base64){var bufferLength=base64.length*.75,len=base64.length,i,p=0,encoded1,encoded2,encoded3,encoded4;if(base64[base64.length-1]==="="){bufferLength--;if(base64[base64.length-2]==="="){bufferLength--}}var arraybuffer=new ArrayBuffer(bufferLength),bytes=new Uint8Array(arraybuffer);for(i=0;i<len;i+=4){encoded1=chars.indexOf(base64[i]);encoded2=chars.indexOf(base64[i+1]);encoded3=chars.indexOf(base64[i+2]);encoded4=chars.indexOf(base64[i+3]);bytes[p++]=encoded1<<2|encoded2>>4;bytes[p++]=(encoded2&15)<<4|encoded3>>2;bytes[p++]=(encoded3&3)<<6|encoded4&63}return arraybuffer}})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")},{}],27:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var BlobBuilder=global.BlobBuilder||global.WebKitBlobBuilder||global.MSBlobBuilder||global.MozBlobBuilder;var blobSupported=function(){try{var b=new Blob(["hi"]);return b.size==2}catch(e){return false}}();var blobBuilderSupported=BlobBuilder&&BlobBuilder.prototype.append&&BlobBuilder.prototype.getBlob;function BlobBuilderConstructor(ary,options){options=options||{};var bb=new BlobBuilder;for(var i=0;i<ary.length;i++){bb.append(ary[i])}return options.type?bb.getBlob(options.type):bb.getBlob()}module.exports=function(){if(blobSupported){return global.Blob}else if(blobBuilderSupported){return BlobBuilderConstructor}else{return undefined}}()},{}],28:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};(function(root){var freeExports=typeof exports=="object"&&exports;var freeModule=typeof module=="object"&&module&&module.exports==freeExports&&module;var freeGlobal=typeof global=="object"&&global;if(freeGlobal.global===freeGlobal||freeGlobal.window===freeGlobal){root=freeGlobal}var stringFromCharCode=String.fromCharCode;function ucs2decode(string){var output=[];var counter=0;var length=string.length;var value;var extra;while(counter<length){value=string.charCodeAt(counter++);if(value>=55296&&value<=56319&&counter<length){extra=string.charCodeAt(counter++);if((extra&64512)==56320){output.push(((value&1023)<<10)+(extra&1023)+65536)}else{output.push(value);counter--}}else{output.push(value)}}return output}function ucs2encode(array){var length=array.length;var index=-1;var value;var output="";while(++index<length){value=array[index];if(value>65535){value-=65536;output+=stringFromCharCode(value>>>10&1023|55296);value=56320|value&1023}output+=stringFromCharCode(value)}return output}function createByte(codePoint,shift){return stringFromCharCode(codePoint>>shift&63|128)}function encodeCodePoint(codePoint){if((codePoint&4294967168)==0){return stringFromCharCode(codePoint)}var symbol="";if((codePoint&4294965248)==0){symbol=stringFromCharCode(codePoint>>6&31|192)}else if((codePoint&4294901760)==0){symbol=stringFromCharCode(codePoint>>12&15|224);symbol+=createByte(codePoint,6)}else if((codePoint&4292870144)==0){symbol=stringFromCharCode(codePoint>>18&7|240);symbol+=createByte(codePoint,12);symbol+=createByte(codePoint,6)}symbol+=stringFromCharCode(codePoint&63|128);return symbol}function utf8encode(string){var codePoints=ucs2decode(string);var length=codePoints.length;var index=-1;var codePoint;var byteString="";while(++index<length){codePoint=codePoints[index];byteString+=encodeCodePoint(codePoint)}return byteString}function readContinuationByte(){if(byteIndex>=byteCount){throw Error("Invalid byte index")}var continuationByte=byteArray[byteIndex]&255;byteIndex++;if((continuationByte&192)==128){return continuationByte&63}throw Error("Invalid continuation byte")}function decodeSymbol(){var byte1;var byte2;var byte3;var byte4;var codePoint;if(byteIndex>byteCount){throw Error("Invalid byte index")}if(byteIndex==byteCount){return false}byte1=byteArray[byteIndex]&255;byteIndex++;if((byte1&128)==0){return byte1}if((byte1&224)==192){var byte2=readContinuationByte();codePoint=(byte1&31)<<6|byte2;if(codePoint>=128){return codePoint}else{throw Error("Invalid continuation byte")}}if((byte1&240)==224){byte2=readContinuationByte();byte3=readContinuationByte();codePoint=(byte1&15)<<12|byte2<<6|byte3;if(codePoint>=2048){return codePoint}else{throw Error("Invalid continuation byte")}}if((byte1&248)==240){byte2=readContinuationByte();byte3=readContinuationByte();byte4=readContinuationByte();codePoint=(byte1&15)<<18|byte2<<12|byte3<<6|byte4;if(codePoint>=65536&&codePoint<=1114111){return codePoint}}throw Error("Invalid UTF-8 detected")}var byteArray;var byteCount;var byteIndex;function utf8decode(byteString){byteArray=ucs2decode(byteString);byteCount=byteArray.length;byteIndex=0;var codePoints=[];var tmp;while((tmp=decodeSymbol())!==false){codePoints.push(tmp)}return ucs2encode(codePoints)}var utf8={version:"2.0.0",encode:utf8encode,decode:utf8decode};if(typeof define=="function"&&typeof define.amd=="object"&&define.amd){define(function(){return utf8})}else if(freeExports&&!freeExports.nodeType){if(freeModule){freeModule.exports=utf8}else{var object={};var hasOwnProperty=object.hasOwnProperty;for(var key in utf8){hasOwnProperty.call(utf8,key)&&(freeExports[key]=utf8[key])}}}else{root.utf8=utf8}})(this)},{}],29:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var rvalidchars=/^[\],:{}\s]*$/;var rvalidescape=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;var rvalidtokens=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;var rvalidbraces=/(?:^|:|,)(?:\s*\[)+/g;var rtrimLeft=/^\s+/;var rtrimRight=/\s+$/;module.exports=function parsejson(data){if("string"!=typeof data||!data){return null}data=data.replace(rtrimLeft,"").replace(rtrimRight,"");if(global.JSON&&JSON.parse){return JSON.parse(data)}if(rvalidchars.test(data.replace(rvalidescape,"@").replace(rvalidtokens,"]").replace(rvalidbraces,""))){return new Function("return "+data)()}}},{}],30:[function(require,module,exports){exports.encode=function(obj){var str="";for(var i in obj){if(obj.hasOwnProperty(i)){if(str.length)str+="&";str+=encodeURIComponent(i)+"="+encodeURIComponent(obj[i])}}return str};exports.decode=function(qs){var qry={};var pairs=qs.split("&");for(var i=0,l=pairs.length;i<l;i++){var pair=pairs[i].split("=");qry[decodeURIComponent(pair[0])]=decodeURIComponent(pair[1])}return qry}},{}],31:[function(require,module,exports){var global=function(){return this}();var WebSocket=global.WebSocket||global.MozWebSocket;module.exports=WebSocket?ws:null;function ws(uri,protocols,opts){var instance;if(protocols){instance=new WebSocket(uri,protocols)}else{instance=new WebSocket(uri)}return instance}if(WebSocket)ws.prototype=WebSocket.prototype},{}],32:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var isArray=require("isarray");module.exports=hasBinary;function hasBinary(data){function recursiveCheckForBinary(obj){if(!obj)return false;if(global.Buffer&&Buffer.isBuffer(obj)||global.ArrayBuffer&&obj instanceof ArrayBuffer||global.Blob&&obj instanceof Blob||global.File&&obj instanceof File){return true}if(isArray(obj)){for(var i=0;i<obj.length;i++){if(recursiveCheckForBinary(obj[i])){return true}}}else if(obj&&"object"==typeof obj){if(obj.toJSON){obj=obj.toJSON()}for(var key in obj){if(recursiveCheckForBinary(obj[key])){return true}}}return false}return recursiveCheckForBinary(data)}},{isarray:33}],33:[function(require,module,exports){module.exports=Array.isArray||function(arr){return Object.prototype.toString.call(arr)=="[object Array]"}},{}],34:[function(require,module,exports){var global=require("global");try{module.exports="XMLHttpRequest"in global&&"withCredentials"in new global.XMLHttpRequest}catch(err){module.exports=false}},{global:35}],35:[function(require,module,exports){module.exports=function(){return this}()},{}],36:[function(require,module,exports){var indexOf=[].indexOf;module.exports=function(arr,obj){if(indexOf)return arr.indexOf(obj);for(var i=0;i<arr.length;++i){if(arr[i]===obj)return i}return-1}},{}],37:[function(require,module,exports){var has=Object.prototype.hasOwnProperty;exports.keys=Object.keys||function(obj){var keys=[];for(var key in obj){if(has.call(obj,key)){keys.push(key)}}return keys};exports.values=function(obj){var vals=[];for(var key in obj){if(has.call(obj,key)){vals.push(obj[key])}}return vals};exports.merge=function(a,b){for(var key in b){if(has.call(b,key)){a[key]=b[key]}}return a};exports.length=function(obj){return exports.keys(obj).length};exports.isEmpty=function(obj){return 0==exports.length(obj)}},{}],38:[function(require,module,exports){var re=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;var parts=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];module.exports=function parseuri(str){var m=re.exec(str||""),uri={},i=14;while(i--){uri[parts[i]]=m[i]||""}return uri}},{}],39:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var isArray=require("isarray");exports.deconstructPacket=function(packet){var buffers=[];var packetData=packet.data;function deconstructBinPackRecursive(data){if(!data)return data;if(global.Buffer&&Buffer.isBuffer(data)||global.ArrayBuffer&&data instanceof ArrayBuffer){var placeholder={_placeholder:true,num:buffers.length};buffers.push(data);return placeholder}else if(isArray(data)){var newData=new Array(data.length);for(var i=0;i<data.length;i++){newData[i]=deconstructBinPackRecursive(data[i])}return newData}else if("object"==typeof data&&!(data instanceof Date)){var newData={};for(var key in data){newData[key]=deconstructBinPackRecursive(data[key])}return newData}return data}var pack=packet;pack.data=deconstructBinPackRecursive(packetData);pack.attachments=buffers.length;return{packet:pack,buffers:buffers}};exports.reconstructPacket=function(packet,buffers){var curPlaceHolder=0;function reconstructBinPackRecursive(data){if(data&&data._placeholder){var buf=buffers[data.num];return buf}else if(isArray(data)){for(var i=0;i<data.length;i++){data[i]=reconstructBinPackRecursive(data[i])}return data}else if(data&&"object"==typeof data){for(var key in data){data[key]=reconstructBinPackRecursive(data[key])}return data}return data}packet.data=reconstructBinPackRecursive(packet.data);packet.attachments=undefined;return packet};exports.removeBlobs=function(data,callback){function removeBlobsRecursive(obj,curKey,containingObject){if(!obj)return obj;if(global.Blob&&obj instanceof Blob||global.File&&obj instanceof File){pendingBlobs++;var fileReader=new FileReader;fileReader.onload=function(){if(containingObject){containingObject[curKey]=this.result}else{bloblessData=this.result}if(!--pendingBlobs){callback(bloblessData)}};fileReader.readAsArrayBuffer(obj)}if(isArray(obj)){for(var i=0;i<obj.length;i++){removeBlobsRecursive(obj[i],i,obj)}}else if(obj&&"object"==typeof obj&&!isBuf(obj)){for(var key in obj){removeBlobsRecursive(obj[key],key,obj)}}}var pendingBlobs=0;var bloblessData=data;removeBlobsRecursive(bloblessData);if(!pendingBlobs){callback(bloblessData)}};function isBuf(obj){return global.Buffer&&Buffer.isBuffer(obj)||global.ArrayBuffer&&obj instanceof ArrayBuffer}},{isarray:41}],40:[function(require,module,exports){var global=typeof self!=="undefined"?self:typeof window!=="undefined"?window:{};var debug=require("debug")("socket.io-parser");var json=require("json3");var isArray=require("isarray");var Emitter=require("emitter");var binary=require("./binary");exports.protocol=3;exports.types=["CONNECT","DISCONNECT","EVENT","BINARY_EVENT","ACK","BINARY_ACK","ERROR"];exports.CONNECT=0;exports.DISCONNECT=1;exports.EVENT=2;exports.ACK=3;exports.ERROR=4;exports.BINARY_EVENT=5;exports.BINARY_ACK=6;exports.Encoder=Encoder;function Encoder(){}Encoder.prototype.encode=function(obj,callback){debug("encoding packet %j",obj);if(exports.BINARY_EVENT==obj.type||exports.BINARY_ACK==obj.type){encodeAsBinary(obj,callback)}else{var encoding=encodeAsString(obj);
callback([encoding])}};function encodeAsString(obj){var str="";var nsp=false;str+=obj.type;if(exports.BINARY_EVENT==obj.type||exports.BINARY_ACK==obj.type){str+=obj.attachments;str+="-"}if(obj.nsp&&"/"!=obj.nsp){nsp=true;str+=obj.nsp}if(null!=obj.id){if(nsp){str+=",";nsp=false}str+=obj.id}if(null!=obj.data){if(nsp)str+=",";str+=json.stringify(obj.data)}debug("encoded %j as %s",obj,str);return str}function encodeAsBinary(obj,callback){function writeEncoding(bloblessData){var deconstruction=binary.deconstructPacket(bloblessData);var pack=encodeAsString(deconstruction.packet);var buffers=deconstruction.buffers;buffers.unshift(pack);callback(buffers)}binary.removeBlobs(obj,writeEncoding)}exports.Decoder=Decoder;function Decoder(){this.reconstructor=null}Emitter(Decoder.prototype);Decoder.prototype.add=function(obj){var packet;if("string"==typeof obj){packet=decodeString(obj);if(exports.BINARY_EVENT==packet.type||exports.BINARY_ACK==packet.type){this.reconstructor=new BinaryReconstructor(packet);if(this.reconstructor.reconPack.attachments==0){this.emit("decoded",packet)}}else{this.emit("decoded",packet)}}else if(global.Buffer&&Buffer.isBuffer(obj)||global.ArrayBuffer&&obj instanceof ArrayBuffer||obj.base64){if(!this.reconstructor){throw new Error("got binary data when not reconstructing a packet")}else{packet=this.reconstructor.takeBinaryData(obj);if(packet){this.reconstructor=null;this.emit("decoded",packet)}}}else{throw new Error("Unknown type: "+obj)}};function decodeString(str){var p={};var i=0;p.type=Number(str.charAt(0));if(null==exports.types[p.type])return error();if(exports.BINARY_EVENT==p.type||exports.BINARY_ACK==p.type){p.attachments="";while(str.charAt(++i)!="-"){p.attachments+=str.charAt(i)}p.attachments=Number(p.attachments)}if("/"==str.charAt(i+1)){p.nsp="";while(++i){var c=str.charAt(i);if(","==c)break;p.nsp+=c;if(i+1==str.length)break}}else{p.nsp="/"}var next=str.charAt(i+1);if(""!=next&&Number(next)==next){p.id="";while(++i){var c=str.charAt(i);if(null==c||Number(c)!=c){--i;break}p.id+=str.charAt(i);if(i+1==str.length)break}p.id=Number(p.id)}if(str.charAt(++i)){try{p.data=json.parse(str.substr(i))}catch(e){return error()}}debug("decoded %s as %j",str,p);return p}Decoder.prototype.destroy=function(){if(this.reconstructor){this.reconstructor.finishedReconstruction()}};function BinaryReconstructor(packet){this.reconPack=packet;this.buffers=[]}BinaryReconstructor.prototype.takeBinaryData=function(binData){this.buffers.push(binData);if(this.buffers.length==this.reconPack.attachments){var packet=binary.reconstructPacket(this.reconPack,this.buffers);this.finishedReconstruction();return packet}return null};BinaryReconstructor.prototype.finishedReconstruction=function(){this.reconPack=null;this.buffers=[]};function error(data){return{type:exports.ERROR,data:"parser error"}}},{"./binary":39,debug:9,emitter:10,isarray:41,json3:42}],41:[function(require,module,exports){module.exports=require(33)},{}],42:[function(require,module,exports){(function(window){var getClass={}.toString,isProperty,forEach,undef;var isLoader=typeof define==="function"&&define.amd;var nativeJSON=typeof JSON=="object"&&JSON;var JSON3=typeof exports=="object"&&exports&&!exports.nodeType&&exports;if(JSON3&&nativeJSON){JSON3.stringify=nativeJSON.stringify;JSON3.parse=nativeJSON.parse}else{JSON3=window.JSON=nativeJSON||{}}var isExtended=new Date(-0xc782b5b800cec);try{isExtended=isExtended.getUTCFullYear()==-109252&&isExtended.getUTCMonth()===0&&isExtended.getUTCDate()===1&&isExtended.getUTCHours()==10&&isExtended.getUTCMinutes()==37&&isExtended.getUTCSeconds()==6&&isExtended.getUTCMilliseconds()==708}catch(exception){}function has(name){if(has[name]!==undef){return has[name]}var isSupported;if(name=="bug-string-char-index"){isSupported="a"[0]!="a"}else if(name=="json"){isSupported=has("json-stringify")&&has("json-parse")}else{var value,serialized='{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';if(name=="json-stringify"){var stringify=JSON3.stringify,stringifySupported=typeof stringify=="function"&&isExtended;if(stringifySupported){(value=function(){return 1}).toJSON=value;try{stringifySupported=stringify(0)==="0"&&stringify(new Number)==="0"&&stringify(new String)=='""'&&stringify(getClass)===undef&&stringify(undef)===undef&&stringify()===undef&&stringify(value)==="1"&&stringify([value])=="[1]"&&stringify([undef])=="[null]"&&stringify(null)=="null"&&stringify([undef,getClass,null])=="[null,null,null]"&&stringify({a:[value,true,false,null,"\x00\b\n\f\r	"]})==serialized&&stringify(null,value)==="1"&&stringify([1,2],null,1)=="[\n 1,\n 2\n]"&&stringify(new Date(-864e13))=='"-271821-04-20T00:00:00.000Z"'&&stringify(new Date(864e13))=='"+275760-09-13T00:00:00.000Z"'&&stringify(new Date(-621987552e5))=='"-000001-01-01T00:00:00.000Z"'&&stringify(new Date(-1))=='"1969-12-31T23:59:59.999Z"'}catch(exception){stringifySupported=false}}isSupported=stringifySupported}if(name=="json-parse"){var parse=JSON3.parse;if(typeof parse=="function"){try{if(parse("0")===0&&!parse(false)){value=parse(serialized);var parseSupported=value["a"].length==5&&value["a"][0]===1;if(parseSupported){try{parseSupported=!parse('"	"')}catch(exception){}if(parseSupported){try{parseSupported=parse("01")!==1}catch(exception){}}if(parseSupported){try{parseSupported=parse("1.")!==1}catch(exception){}}}}}catch(exception){parseSupported=false}}isSupported=parseSupported}}return has[name]=!!isSupported}if(!has("json")){var functionClass="[object Function]";var dateClass="[object Date]";var numberClass="[object Number]";var stringClass="[object String]";var arrayClass="[object Array]";var booleanClass="[object Boolean]";var charIndexBuggy=has("bug-string-char-index");if(!isExtended){var floor=Math.floor;var Months=[0,31,59,90,120,151,181,212,243,273,304,334];var getDay=function(year,month){return Months[month]+365*(year-1970)+floor((year-1969+(month=+(month>1)))/4)-floor((year-1901+month)/100)+floor((year-1601+month)/400)}}if(!(isProperty={}.hasOwnProperty)){isProperty=function(property){var members={},constructor;if((members.__proto__=null,members.__proto__={toString:1},members).toString!=getClass){isProperty=function(property){var original=this.__proto__,result=property in(this.__proto__=null,this);this.__proto__=original;return result}}else{constructor=members.constructor;isProperty=function(property){var parent=(this.constructor||constructor).prototype;return property in this&&!(property in parent&&this[property]===parent[property])}}members=null;return isProperty.call(this,property)}}var PrimitiveTypes={"boolean":1,number:1,string:1,undefined:1};var isHostType=function(object,property){var type=typeof object[property];return type=="object"?!!object[property]:!PrimitiveTypes[type]};forEach=function(object,callback){var size=0,Properties,members,property;(Properties=function(){this.valueOf=0}).prototype.valueOf=0;members=new Properties;for(property in members){if(isProperty.call(members,property)){size++}}Properties=members=null;if(!size){members=["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];forEach=function(object,callback){var isFunction=getClass.call(object)==functionClass,property,length;var hasProperty=!isFunction&&typeof object.constructor!="function"&&isHostType(object,"hasOwnProperty")?object.hasOwnProperty:isProperty;for(property in object){if(!(isFunction&&property=="prototype")&&hasProperty.call(object,property)){callback(property)}}for(length=members.length;property=members[--length];hasProperty.call(object,property)&&callback(property));}}else if(size==2){forEach=function(object,callback){var members={},isFunction=getClass.call(object)==functionClass,property;for(property in object){if(!(isFunction&&property=="prototype")&&!isProperty.call(members,property)&&(members[property]=1)&&isProperty.call(object,property)){callback(property)}}}}else{forEach=function(object,callback){var isFunction=getClass.call(object)==functionClass,property,isConstructor;for(property in object){if(!(isFunction&&property=="prototype")&&isProperty.call(object,property)&&!(isConstructor=property==="constructor")){callback(property)}}if(isConstructor||isProperty.call(object,property="constructor")){callback(property)}}}return forEach(object,callback)};if(!has("json-stringify")){var Escapes={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"};var leadingZeroes="000000";var toPaddedString=function(width,value){return(leadingZeroes+(value||0)).slice(-width)};var unicodePrefix="\\u00";var quote=function(value){var result='"',index=0,length=value.length,isLarge=length>10&&charIndexBuggy,symbols;if(isLarge){symbols=value.split("")}for(;index<length;index++){var charCode=value.charCodeAt(index);switch(charCode){case 8:case 9:case 10:case 12:case 13:case 34:case 92:result+=Escapes[charCode];break;default:if(charCode<32){result+=unicodePrefix+toPaddedString(2,charCode.toString(16));break}result+=isLarge?symbols[index]:charIndexBuggy?value.charAt(index):value[index]}}return result+'"'};var serialize=function(property,object,callback,properties,whitespace,indentation,stack){var value,className,year,month,date,time,hours,minutes,seconds,milliseconds,results,element,index,length,prefix,result;try{value=object[property]}catch(exception){}if(typeof value=="object"&&value){className=getClass.call(value);if(className==dateClass&&!isProperty.call(value,"toJSON")){if(value>-1/0&&value<1/0){if(getDay){date=floor(value/864e5);for(year=floor(date/365.2425)+1970-1;getDay(year+1,0)<=date;year++);for(month=floor((date-getDay(year,0))/30.42);getDay(year,month+1)<=date;month++);date=1+date-getDay(year,month);time=(value%864e5+864e5)%864e5;hours=floor(time/36e5)%24;minutes=floor(time/6e4)%60;seconds=floor(time/1e3)%60;milliseconds=time%1e3}else{year=value.getUTCFullYear();month=value.getUTCMonth();date=value.getUTCDate();hours=value.getUTCHours();minutes=value.getUTCMinutes();seconds=value.getUTCSeconds();milliseconds=value.getUTCMilliseconds()}value=(year<=0||year>=1e4?(year<0?"-":"+")+toPaddedString(6,year<0?-year:year):toPaddedString(4,year))+"-"+toPaddedString(2,month+1)+"-"+toPaddedString(2,date)+"T"+toPaddedString(2,hours)+":"+toPaddedString(2,minutes)+":"+toPaddedString(2,seconds)+"."+toPaddedString(3,milliseconds)+"Z"}else{value=null}}else if(typeof value.toJSON=="function"&&(className!=numberClass&&className!=stringClass&&className!=arrayClass||isProperty.call(value,"toJSON"))){value=value.toJSON(property)}}if(callback){value=callback.call(object,property,value)}if(value===null){return"null"}className=getClass.call(value);if(className==booleanClass){return""+value}else if(className==numberClass){return value>-1/0&&value<1/0?""+value:"null"}else if(className==stringClass){return quote(""+value)}if(typeof value=="object"){for(length=stack.length;length--;){if(stack[length]===value){throw TypeError()}}stack.push(value);results=[];prefix=indentation;indentation+=whitespace;if(className==arrayClass){for(index=0,length=value.length;index<length;index++){element=serialize(index,value,callback,properties,whitespace,indentation,stack);results.push(element===undef?"null":element)}result=results.length?whitespace?"[\n"+indentation+results.join(",\n"+indentation)+"\n"+prefix+"]":"["+results.join(",")+"]":"[]"}else{forEach(properties||value,function(property){var element=serialize(property,value,callback,properties,whitespace,indentation,stack);if(element!==undef){results.push(quote(property)+":"+(whitespace?" ":"")+element)}});result=results.length?whitespace?"{\n"+indentation+results.join(",\n"+indentation)+"\n"+prefix+"}":"{"+results.join(",")+"}":"{}"}stack.pop();return result}};JSON3.stringify=function(source,filter,width){var whitespace,callback,properties,className;if(typeof filter=="function"||typeof filter=="object"&&filter){if((className=getClass.call(filter))==functionClass){callback=filter}else if(className==arrayClass){properties={};for(var index=0,length=filter.length,value;index<length;value=filter[index++],(className=getClass.call(value),className==stringClass||className==numberClass)&&(properties[value]=1));}}if(width){if((className=getClass.call(width))==numberClass){if((width-=width%1)>0){for(whitespace="",width>10&&(width=10);whitespace.length<width;whitespace+=" ");}}else if(className==stringClass){whitespace=width.length<=10?width:width.slice(0,10)}}return serialize("",(value={},value[""]=source,value),callback,properties,whitespace,"",[])}}if(!has("json-parse")){var fromCharCode=String.fromCharCode;var Unescapes={92:"\\",34:'"',47:"/",98:"\b",116:"	",110:"\n",102:"\f",114:"\r"};var Index,Source;var abort=function(){Index=Source=null;throw SyntaxError()};var lex=function(){var source=Source,length=source.length,value,begin,position,isSigned,charCode;while(Index<length){charCode=source.charCodeAt(Index);switch(charCode){case 9:case 10:case 13:case 32:Index++;break;case 123:case 125:case 91:case 93:case 58:case 44:value=charIndexBuggy?source.charAt(Index):source[Index];Index++;return value;case 34:for(value="@",Index++;Index<length;){charCode=source.charCodeAt(Index);if(charCode<32){abort()}else if(charCode==92){charCode=source.charCodeAt(++Index);switch(charCode){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:value+=Unescapes[charCode];Index++;break;case 117:begin=++Index;for(position=Index+4;Index<position;Index++){charCode=source.charCodeAt(Index);if(!(charCode>=48&&charCode<=57||charCode>=97&&charCode<=102||charCode>=65&&charCode<=70)){abort()}}value+=fromCharCode("0x"+source.slice(begin,Index));break;default:abort()}}else{if(charCode==34){break}charCode=source.charCodeAt(Index);begin=Index;while(charCode>=32&&charCode!=92&&charCode!=34){charCode=source.charCodeAt(++Index)}value+=source.slice(begin,Index)}}if(source.charCodeAt(Index)==34){Index++;return value}abort();default:begin=Index;if(charCode==45){isSigned=true;charCode=source.charCodeAt(++Index)}if(charCode>=48&&charCode<=57){if(charCode==48&&(charCode=source.charCodeAt(Index+1),charCode>=48&&charCode<=57)){abort()}isSigned=false;for(;Index<length&&(charCode=source.charCodeAt(Index),charCode>=48&&charCode<=57);Index++);if(source.charCodeAt(Index)==46){position=++Index;for(;position<length&&(charCode=source.charCodeAt(position),charCode>=48&&charCode<=57);position++);if(position==Index){abort()}Index=position}charCode=source.charCodeAt(Index);if(charCode==101||charCode==69){charCode=source.charCodeAt(++Index);if(charCode==43||charCode==45){Index++}for(position=Index;position<length&&(charCode=source.charCodeAt(position),charCode>=48&&charCode<=57);position++);if(position==Index){abort()}Index=position}return+source.slice(begin,Index)}if(isSigned){abort()}if(source.slice(Index,Index+4)=="true"){Index+=4;return true}else if(source.slice(Index,Index+5)=="false"){Index+=5;return false}else if(source.slice(Index,Index+4)=="null"){Index+=4;return null}abort()}}return"$"};var get=function(value){var results,hasMembers;if(value=="$"){abort()}if(typeof value=="string"){if((charIndexBuggy?value.charAt(0):value[0])=="@"){return value.slice(1)}if(value=="["){results=[];for(;;hasMembers||(hasMembers=true)){value=lex();if(value=="]"){break}if(hasMembers){if(value==","){value=lex();if(value=="]"){abort()}}else{abort()}}if(value==","){abort()}results.push(get(value))}return results}else if(value=="{"){results={};for(;;hasMembers||(hasMembers=true)){value=lex();if(value=="}"){break}if(hasMembers){if(value==","){value=lex();if(value=="}"){abort()}}else{abort()}}if(value==","||typeof value!="string"||(charIndexBuggy?value.charAt(0):value[0])!="@"||lex()!=":"){abort()}results[value.slice(1)]=get(lex())}return results}abort()}return value};var update=function(source,property,callback){var element=walk(source,property,callback);if(element===undef){delete source[property]}else{source[property]=element}};var walk=function(source,property,callback){var value=source[property],length;if(typeof value=="object"&&value){if(getClass.call(value)==arrayClass){for(length=value.length;length--;){update(value,length,callback)}}else{forEach(value,function(property){update(value,property,callback)})}}return callback.call(source,property,value)};JSON3.parse=function(source,callback){var result,value;Index=0;Source=""+source;result=get(lex());if(lex()!="$"){abort()}Index=Source=null;return callback&&getClass.call(callback)==functionClass?walk((value={},value[""]=result,value),"",callback):result}}}if(isLoader){define(function(){return JSON3})}})(this)},{}],43:[function(require,module,exports){module.exports=toArray;function toArray(list,index){var array=[];index=index||0;for(var i=index||0;i<list.length;i++){array[i-index]=list[i]}return array}},{}]},{},[1])(1)});;/*! adapterjs - v0.0.3 - 2014-07-10 */

RTCPeerConnection = null;
/**
 * Note:
 *  Get UserMedia (only difference is the prefix).
 * [Credits] Code from Adam Barth.
 *
 * [attribute] RTCIceCandidate
 * [type] Function
 */
getUserMedia = null;
/**
 * Note:
 *  Attach a media stream to an element.
 *
 * [attribute] attachMediaStream
 * [type] Function
 */
attachMediaStream = null;
/**
 * Note:
 *  Re-attach a media stream to an element.
 *
 * [attribute] reattachMediaStream
 * [type] Function
 */
reattachMediaStream = null;
/**
 * Note:
 *  This function detects whether or not a plugin is installed
 *  - Com name : the company name,
 *  - plugName : the plugin name
 *  - installedCb : callback if the plugin is detected (no argument)
 *  - notInstalledCb : callback if the plugin is not detected (no argument)
 * @method isPluginInstalled
 * @protected
 */
isPluginInstalled = null;
/**
 * Note:
 *  defines webrtc's JS interface according to the plugin's implementation
 * [attribute] defineWebRTCInterface
 * [type] Function
 */
defineWebRTCInterface = null;
/**
 * Note:
 *  This function will be called if the plugin is needed
 *  (browser different from Chrome or Firefox),
 *  but the plugin is not installed
 *  Override it according to your application logic.
 * [attribute] pluginNeededButNotInstalledCb
 * [type] Function
 */
pluginNeededButNotInstalledCb = null;
/**
 * Note:
 *  The Object used in SkywayJS to check the WebRTC Detected type
 * [attribute] WebRTCDetectedBrowser
 * [type] JSON
 */
webrtcDetectedBrowser = {};
/**
 * Note:
 *   The results of each states returns
 * @attribute ICEConnectionState
 * @type JSON
 */
ICEConnectionState = {
  starting : 'starting',
  checking : 'checking',
  connected : 'connected',
  completed : 'connected',
  done : 'completed',
  disconnected : 'disconnected',
  failed : 'failed',
  closed : 'closed'
};
/**
 * Note:
 *   The states of each Peer
 * @attribute ICEConnectionFiredStates
 * @type JSON
 */
ICEConnectionFiredStates = {};
/**
 * Note:
 *  The Object to store the list of DataChannels
 * [attribute] RTCDataChannels
 * [type] JSON
 */
RTCDataChannels = {};
/**
 * Note:
 *  The Object to store Plugin information
 * [attribute] temPluginInfo
 * [type] JSON
 */
temPluginInfo = {
  pluginId : 'plugin0',
  type : 'application/x-temwebrtcplugin',
  onload : 'TemInitPlugin0'
};
/**
 * Note:
 * Unique identifier of each opened page
 * [attribute] TemPageId
 * [type] String
 */
TemPageId = Math.random().toString(36).slice(2);
/**
 * Note:
 * - Latest Opera supports Webkit WebRTC
 * - IE is detected as Safari
 * - Older Firefox and Chrome does not support WebRTC
 * - Detected "Safari" Browsers:
 *   - Firefox 1.0+
 *   - IE 6+
 *   - Safari 3+: '[object HTMLElementConstructor]'
 *   - Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
 *   - Chrome 1+
 * 1st Step: Get browser OS
 * 2nd Step: Check browser DataChannels Support
 * 3rd Step: Check browser WebRTC Support type
 * 4th Step: Get browser version
 * @author Get version of Browser. Code provided by kennebec@stackoverflow.com
 * @author IsSCTP/isRTPD Supported. Code provided by DetectRTC by Muaz Khan
 *
 * @method getBrowserVersion
 * @protected
 */
getBrowserVersion = function () {
  var agent = {},
  na = navigator,
  ua = na.userAgent,
  tem;
  var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  if (na.mozGetUserMedia) {
    agent.mozWebRTC = true;
  } else if (na.webkitGetUserMedia) {
    agent.webkitWebRTC = true;
  } else {
    if (ua.indexOf('Safari')) {
      if (typeof InstallTrigger !== 'undefined') {
        agent.browser = 'Firefox';
      } else if (/*@cc_on!@*/
        false || !!document.documentMode) {
        agent.browser = 'IE';
      } else if (
        Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        agent.browser = 'Safari';
      } else if (!!window.opera || na.userAgent.indexOf(' OPR/') >= 0) {
        agent.browser = 'Opera';
      } else if (!!window.chrome) {
        agent.browser = 'Chrome';
      }
      agent.pluginWebRTC = true;
    }
  }
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    agent.browser = 'IE';
    agent.version = parseInt(tem[1] || '0', 10);
  } else if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/);
    if (tem !== null) {
      agent.browser = 'Opera';
      agent.version = parseInt(tem[1], 10);
    }
  }
  if (!agent.browser) {
    agent.browser = M[1];
  }
  if (!agent.version) {
    try {
      M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
      if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
        M.splice(1, 1, tem[1]);
      }
      agent.version = parseInt(M[1], 10);
    } catch (err) {
      agent.version = 0;
    }
  }
  agent.os = navigator.platform;
  agent.isSCTPDCSupported = agent.mozWebRTC ||
    (agent.browser === 'Chrome' && agent.version > 30) ||
    (agent.browser === 'Opera' && agent.version > 19);
  agent.isRTPDCSupported = agent.browser === 'Chrome' && agent.version < 30 && agent.version > 24;
  agent.isPluginSupported = !agent.isSCTPDCSupported && !agent.isRTPDCSupported;
  return agent;
};
webrtcDetectedBrowser = getBrowserVersion();
/**
 * Note:
 *  use this whenever you want to call the plugin
 * [attribute] plugin
 * [type DOM] {Object}
 * [protected]
 */
TemRTCPlugin = null;
/**
 * Note:
 *  webRTC readu Cb, should only be called once.
 *  Need to prevent Chrome + plugin form calling WebRTCReadyCb twice
 *  --------------------------------------------------------------------------
 *  WebRTCReadyCb is callback function called when the browser is webrtc ready
 *  this can be because of the browser or because of the plugin
 *  Override WebRTCReadyCb and use it to do whatever you need to do when the
 *  page is ready
 * [attribute] TemPrivateWebRTCReadyCb
 * [type] Function
 * [private]
 */
TemPrivateWebRTCReadyCb = function () {
  arguments.callee.StaticWasInit = arguments.callee.StaticWasInit || 1;
  if (arguments.callee.StaticWasInit === 1) {
    if (typeof WebRTCReadyCb === 'function') {
      WebRTCReadyCb();
    }
  }
  arguments.callee.StaticWasInit++;
};
/**
 * Note:
 *  !!! DO NOT OVERRIDE THIS FUNCTION !!!
 *  This function will be called when plugin is ready
 *  it sends necessary details to the plugin.
 *  If you need to do something once the page/plugin is ready, override
 *  TemPrivateWebRTCReadyCb instead.
 *  This function is not in the IE/Safari condition brackets so that
 *  TemPluginLoaded function might be called on Chrome/Firefox
 * [attribute] TemInitPlugin0
 * [type] Function
 * [protected]
 */
TemInitPlugin0 = function () {
  TemRTCPlugin.setPluginId(TemPageId, temPluginInfo.pluginId);
  TemRTCPlugin.setLogFunction(console);
  TemPrivateWebRTCReadyCb();
};
/**
 * Note:
 *  To Fix Configuration as some browsers,
 *  some browsers does not support the 'urls' attribute
 * - .urls is not supported in FF yet.
 * [attribute] maybeFixConfiguration
 * [type] Function
 * _ [param] {JSON} pcConfig
 * [private]
 */
maybeFixConfiguration = function (pcConfig) {
  if (pcConfig === null) {
    return;
  }
  for (var i = 0; i < pcConfig.iceServers.length; i++) {
    if (pcConfig.iceServers[i].hasOwnProperty('urls')) {
      pcConfig.iceServers[i].url = pcConfig.iceServers[i].urls;
      delete pcConfig.iceServers[i].urls;
    }
  }
};
/**
 * Note:
 *   Handles the differences for all Browsers
 *
 * @method checkIceConnectionState
 * @param {String} peerID
 * @param {String} iceConnectionState
 * @param {Function} callback
 * @param {Boolean} returnStateAlways
 * @protected
 */
checkIceConnectionState = function (peerID, iceConnectionState, callback, returnStateAlways) {
  if (typeof callback !== 'function') {
    return;
  }
  peerID = (peerID) ? peerID : 'peer';
  var returnState = false, err = null;
  console.log('ICECONNECTIONSTATE: ' + iceConnectionState);

  if (!ICEConnectionFiredStates[peerID] ||
    iceConnectionState === ICEConnectionState.disconnected ||
    iceConnectionState === ICEConnectionState.failed ||
    iceConnectionState === ICEConnectionState.closed) {
    ICEConnectionFiredStates[peerID] = [];
  }
  iceConnectionState = ICEConnectionState[iceConnectionState];
  if (ICEConnectionFiredStates[peerID].indexOf(iceConnectionState) === -1) {
    ICEConnectionFiredStates[peerID].push(iceConnectionState);
    if (iceConnectionState === ICEConnectionState.connected) {
      setTimeout(function () {
        ICEConnectionFiredStates[peerID].push(ICEConnectionState.done);
        callback(ICEConnectionState.done);
      }, 1000);
    }
    returnState = true;
  }
  if (returnStateAlways || returnState) {
    callback(iceConnectionState);
  }
  return;
};
/**
 * Note:
 *   Set the settings for creating DataChannels, MediaStream for Cross-browser compability.
 *   This is only for SCTP based support browsers
 *
 * @method checkMediaDataChannelSettings
 * @param {Boolean} isOffer
 * @param {String} peerBrowserAgent
 * @param {Function} callback
 * @param {JSON} constraints
 * @protected
 */
checkMediaDataChannelSettings = function (isOffer, peerBrowserAgent, callback, constraints) {
  if (typeof callback !== 'function') {
    return;
  }
  var peerBrowserVersion, beOfferer = false;

  console.log('Self: ' + webrtcDetectedBrowser.browser + ' | Peer: ' + peerBrowserAgent);

  if (peerBrowserAgent.indexOf('|') > -1) {
    peerBrowser = peerBrowserAgent.split('|');
    peerBrowserAgent = peerBrowser[0];
    peerBrowserVersion = parseInt(peerBrowser[1], 10);
    console.info('Peer Browser version: ' + peerBrowserVersion);
  }
  var isLocalFirefox = webrtcDetectedBrowser.mozWebRTC;
  // Nightly version does not require MozDontOfferDataChannel for interop
  var isLocalFirefoxInterop = webrtcDetectedBrowser.mozWebRTC &&
    webrtcDetectedBrowser.version > 30;
  var isPeerFirefox = peerBrowserAgent === 'Firefox';
  var isPeerFirefoxInterop = peerBrowserAgent === 'Firefox' &&
    ((peerBrowserVersion) ? (peerBrowserVersion > 30) : false);

  // Resends an updated version of constraints for MozDataChannel to work
  // If other userAgent is firefox and user is firefox, remove MozDataChannel
  if (isOffer) {
    if ((isLocalFirefox && isPeerFirefox) || (isLocalFirefoxInterop)) {
      try {
        delete constraints.mandatory.MozDontOfferDataChannel;
      } catch (err) {
        console.error('Failed deleting MozDontOfferDataChannel');
        console.exception(err);
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
    console.log('Set Offer constraints for DataChannel and MediaStream interopability');
    console.dir(constraints);
    callback(constraints);
  } else {
    // Tells user to resend an 'enter' again
    // Firefox (not interopable) cannot offer DataChannel as it will cause problems to the
    // interopability of the media stream
    if (!isLocalFirefox && isPeerFirefox && !isPeerFirefoxInterop) {
      beOfferer = true;
    }
    console.info('Resend Enter: ' + beOfferer);
    callback(beOfferer);
  }
};
/*******************************************************************
 Check for browser types and react accordingly
*******************************************************************/
if (webrtcDetectedBrowser.mozWebRTC) {
  /**
   * Note:
   *  Creates a RTCPeerConnection object for moz
   *
   * [method] RTCPeerConnection
   * [param] {JSON} pcConfig
   * [param] {JSON} pcConstraints
   */
  RTCPeerConnection = function (pcConfig, pcConstraints) {
    maybeFixConfiguration(pcConfig);
    return new mozRTCPeerConnection(pcConfig, pcConstraints);
  };

  RTCSessionDescription = mozRTCSessionDescription;
  RTCIceCandidate = mozRTCIceCandidate;
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  /**
   * Note:
   *   Creates iceServer from the url for Firefox.
   *  - Create iceServer with stun url.
   *  - Create iceServer with turn url.
   *    - Ignore the transport parameter from TURN url for FF version <=27.
   *    - Return null for createIceServer if transport=tcp.
   *  - FF 27 and above supports transport parameters in TURN url,
   *    - So passing in the full url to create iceServer.
   *
   * [method] createIceServer
   * [param] {String} url
   * [param] {String} username
   * [param] {String} password
   */
  createIceServer = function (url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      iceServer = { 'url' : url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedBrowser.version < 27) {
        var turn_url_parts = url.split('?');
        if (turn_url_parts.length === 1 || turn_url_parts[1].indexOf('transport=udp') === 0) {
          iceServer = {
            'url' : turn_url_parts[0],
            'credential' : password,
            'username' : username
          };
        }
      } else {
        iceServer = {
          'url' : url,
          'credential' : password,
          'username' : username
        };
      }
    }
    return iceServer;
  };

  /**
   * Note:
   *  Creates IceServers for Firefox
   *  - Use .url for FireFox.
   *  - Multiple Urls support
   *
   * [method] createIceServers
   * [param] {JSON} pcConfig
   * [param] {JSON} pcConstraints
   */
  createIceServers = function (urls, username, password) {
    var iceServers = [];
    for (i = 0; i < urls.length; i++) {
      var iceServer = createIceServer(urls[i], username, password);
      if (iceServer !== null) {
        iceServers.push(iceServer);
      }
    }
    return iceServers;
  };

  /**
   * Note:
   *  Attach Media Stream for moz
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} element
   * [param] {Blob} Stream
   */
  attachMediaStream = function (element, stream) {
    console.log('Attaching media stream');
    element.mozSrcObject = stream;
    element.play();
    return element;
  };

  /**
   * Note:
   *  Re-attach Media Stream for moz
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} to
   * [param] {HTMLVideoDOM} from
   */
  reattachMediaStream = function (to, from) {
    console.log('Reattaching media stream');
    to.mozSrcObject = from.mozSrcObject;
    to.play();
    return to;
  };

  /*******************************************************
   Fake get{Video,Audio}Tracks
  ********************************************************/
  if (!MediaStream.prototype.getVideoTracks) {
    MediaStream.prototype.getVideoTracks = function () {
      return [];
    };
  }
  if (!MediaStream.prototype.getAudioTracks) {
    MediaStream.prototype.getAudioTracks = function () {
      return [];
    };
  }
  TemPrivateWebRTCReadyCb();
} else if (webrtcDetectedBrowser.webkitWebRTC) {
  /**
   * Note:
   *  Creates iceServer from the url for Chrome M33 and earlier.
   *  - Create iceServer with stun url.
   *  - Chrome M28 & above uses below TURN format.
   *
   * [method] createIceServer
   * [param] {String} url
   * [param] {String} username
   * [param] {String} password
   */
  createIceServer = function (url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      iceServer = { 'url' : url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      iceServer = {
        'url' : url,
        'credential' : password,
        'username' : username
      };
    }
    return iceServer;
  };

   /**
   * Note:
   *   Creates iceServers from the urls for Chrome M34 and above.
   *  - .urls is supported since Chrome M34.
   *  - Multiple Urls support
   *
   * [method] createIceServers
   * [param] {Array} urls
   * [param] {String} username
   * [param] {String} password
   */
  createIceServers = function (urls, username, password) {
    var iceServers = [];
    if (webrtcDetectedBrowser.version >= 34) {
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

  /**
   * Note:
   *  Creates an RTCPeerConection Object for webkit
   * - .urls is supported since Chrome M34.
   * [method] RTCPeerConnection
   * [param] {String} url
   * [param] {String} username
   * [param] {String} password
   */
  RTCPeerConnection = function (pcConfig, pcConstraints) {
    if (webrtcDetectedBrowser.version < 34) {
      maybeFixConfiguration(pcConfig);
    }
    return new webkitRTCPeerConnection(pcConfig, pcConstraints);
  };

  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  /**
   * Note:
   *  Attach Media Stream for webkit
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} element
   * [param] {Blob} Stream
   */
  attachMediaStream = function (element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
    return element;
  };

  /**
   * Note:
   *  Re-attach Media Stream for webkit
   *
   * [method] attachMediaStream
   * [param] {HTMLVideoDOM} to
   * [param] {HTMLVideoDOM} from
   */
  reattachMediaStream = function (to, from) {
    to.src = from.src;
    return to;
  };
  TemPrivateWebRTCReadyCb();
} else if (webrtcDetectedBrowser.pluginWebRTC) {
  // var isOpera = webrtcDetectedBrowser.browser === 'Opera'; // Might not be used.
  var isFirefox = webrtcDetectedBrowser.browser === 'Firefox';
  var isSafari = webrtcDetectedBrowser.browser === 'Safari';
  var isChrome = webrtcDetectedBrowser.browser === 'Chrome';
  var isIE = webrtcDetectedBrowser.browser === 'IE';

  /********************************************************************************
    Load Plugin
  ********************************************************************************/
  TemRTCPlugin = document.createElement('object');
  TemRTCPlugin.id = temPluginInfo.pluginId;
  TemRTCPlugin.style.visibility = 'hidden';
  TemRTCPlugin.type = temPluginInfo.type;
  TemRTCPlugin.innerHTML = '<param name="onload" value="' +
    temPluginInfo.onload + '">' +
    '<param name="pluginId" value="' +
    temPluginInfo.pluginId + '">' +
    '<param name="pageId" value="' + TemPageId + '">';
  document.getElementsByTagName('body')[0].appendChild(TemRTCPlugin);
  TemRTCPlugin.onreadystatechange = function (state) {
    console.log('Plugin: Ready State : ' + state);
    if (state === 4) {
      console.log('Plugin has been loaded');
    }
  };
  /**
   * Note:
   *   Checks if the Plugin is installed
   *  - Check If Not IE (firefox, for example)
   *  - Else If it's IE - we're running IE and do something
   *  - Else Unsupported
   *
   * [method] isPluginInstalled
   * [param] {String} comName
   * [param] {String} plugName
   * [param] {Function} installedCb
   * [param] {Function} notInstalledCb
   */
  isPluginInstalled = function (comName, plugName, installedCb, notInstalledCb) {
    if (isChrome || isSafari || isFirefox) {
      var pluginArray = navigator.plugins;
      for (var i = 0; i < pluginArray.length; i++) {
        if (pluginArray[i].name.indexOf(plugName) >= 0) {
          installedCb();
          return;
        }
      }
      notInstalledCb();
    } else if (isIE) {
      try {
        var axo = new ActiveXObject(comName + '.' + plugName);
      } catch (e) {
        notInstalledCb();
        return;
      }
      installedCb();
    } else {
      return;
    }
  };

  /**
   * Note:
   *   Define Plugin Browsers as WebRTC Interface
   *
   * [method] defineWebRTCInterface
   */
  defineWebRTCInterface = function () {
    /**
    * Note:
    *   Check if WebRTC Interface is Defined
    * - This is a Util Function
    *
    * [method] isDefined
    * [param] {String} variable
    */
    isDefined = function (variable) {
      return variable !== null && variable !== undefined;
    };

    /**
    * Note:
    *   Creates Ice Server for Plugin Browsers
    * - If Stun - Create iceServer with stun url.
    * - Else - Create iceServer with turn url
    * - This is a WebRTC Function
    *
    * [method] createIceServer
    * [param] {String} url
    * [param] {String} username
    * [param] {String} password
    */
    createIceServer = function (url, username, password) {
      var iceServer = null;
      var url_parts = url.split(':');
      if (url_parts[0].indexOf('stun') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : false
        };
      } else if (url_parts[0].indexOf('turn') === 0) {
        iceServer = {
          'url' : url,
          'hasCredentials' : true,
          'credential' : password,
          'username' : username
        };
      }
      return iceServer;
    };

    /**
    * Note:
    *   Creates Ice Servers for Plugin Browsers
    * - Multiple Urls support
    * - This is a WebRTC Function
    *
    * [method] createIceServers
    * [param] {Array} urls
    * [param] {String} username
    * [param] {String} password
    */
    createIceServers = function (urls, username, password) {
      var iceServers = [];
      for (var i = 0; i < urls.length; ++i) {
        iceServers.push(createIceServer(urls[i], username, password));
      }
      return iceServers;
    };

    /**
    * Note:
    *   Creates RTCSessionDescription object for Plugin Browsers
    * - This is a WebRTC Function
    *
    * [method] RTCSessionDescription
    * [param] {Array} urls
    * [param] {String} username
    * [param] {String} password
    */
    RTCSessionDescription = function (info) {
      return TemRTCPlugin.ConstructSessionDescription(info.type, info.sdp);
    };

    /**
    * Note:
    *   Creates RTCPeerConnection object for Plugin Browsers
    * - This is a WebRTC Function
    *
    * [method] RTCSessionDescription
    * [param] {JSON} servers
    * [param] {JSON} contstraints
    */
    RTCPeerConnection = function (servers, constraints) {
      var iceServers = null;
      if (servers) {
        iceServers = servers.iceServers;
        for (var i = 0; i < iceServers.length; i++) {
          if (iceServers[i].urls && !iceServers[i].url) {
            iceServers[i].url = iceServers[i].urls;
          }
          iceServers[i].hasCredentials = isDefined(iceServers[i].username) &&
          isDefined(iceServers[i].credential);
        }
      }
      var mandatory = (constraints && constraints.mandatory) ? constraints.mandatory : null;
      var optional = (constraints && constraints.optional) ? constraints.optional : null;
      return TemRTCPlugin.PeerConnection(TemPageId, iceServers, mandatory, optional);
    };

    MediaStreamTrack = {};
    MediaStreamTrack.getSources = function (callback) {
      TemRTCPlugin.GetSources(callback);
    };

    /*******************************************************
     getUserMedia
    ********************************************************/
    getUserMedia = function (constraints, successCallback, failureCallback) {
      if (!constraints.audio) {
        constraints.audio = false;
      }
      TemRTCPlugin.getUserMedia(constraints, successCallback, failureCallback);
    };
    navigator.getUserMedia = getUserMedia;

    /**
     * Note:
     *  Attach Media Stream for Plugin Browsers
     *  - If Check is audio element
     *  - Else The sound was enabled, there is nothing to do here
     *
     * [method] attachMediaStream
     * [param] {HTMLVideoDOM} element
     * [param] {Blob} Stream
     */
    attachMediaStream = function (element, stream) {
      stream.enableSoundTracks(true);
      if (element.nodeName.toLowerCase() !== 'audio') {
        var elementId = element.id.length === 0 ? Math.random().toString(36).slice(2) : element.id;
        if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
          var frag = document.createDocumentFragment();
          var temp = document.createElement('div');
          var classHTML = (element.className) ? 'class="' + element.className + '" ' : '';
          temp.innerHTML = '<object id="' + elementId + '" ' + classHTML +
            'type="application/x-temwebrtcplugin">' +
            '<param name="pluginId" value="' + elementId + '" /> ' +
            '<param name="pageId" value="' + TemPageId + '" /> ' +
            '<param name="streamId" value="' + stream.id + '" /> ' +
            '</object>';
          while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
          }
          var rectObject = element.getBoundingClientRect();
          element.parentNode.insertBefore(frag, element);
          frag = document.getElementById(elementId);
          frag.width = rectObject.width + 'px';
          frag.height = rectObject.height + 'px';
          element.parentNode.removeChild(element);
        } else {
          var children = element.children;
          for (var i = 0; i !== children.length; ++i) {
            if (children[i].name === 'streamId') {
              children[i].value = stream.id;
              break;
            }
          }
          element.setStreamId(stream.id);
        }
        var newElement = document.getElementById(elementId);
        newElement.onclick = (element.onclick) ? element.onclick : function (arg) {};
        newElement._TemOnClick = function (id) {
          var arg = {
            srcElement : document.getElementById(id)
          };
          newElement.onclick(arg);
        };
        return newElement;
      } else {
        return element;
      }
    };

    /**
     * Note:
     *  Re-attach Media Stream for Plugin Browsers
     *
     * [method] attachMediaStream
     * [param] {HTMLVideoDOM} to
     * [param] {HTMLVideoDOM} from
     */
    reattachMediaStream = function (to, from) {
      var stream = null;
      var children = from.children;
      for (var i = 0; i !== children.length; ++i) {
        if (children[i].name === 'streamId') {
          stream = TemRTCPlugin.getStreamWithId(TemPageId, children[i].value);
          break;
        }
      }
      if (stream !== null) {
        return attachMediaStream(to, stream);
      } else {
        alert('Could not find the stream associated with this element');
      }
    };

    /**
    * Note:
    *   Creates RTCIceCandidate object for Plugin Browsers
    * - This is a WebRTC Function
    *
    * [method] RTCIceCandidate
    * [param] {JSON} candidate
    */
    RTCIceCandidate = function (candidate) {
      if (!candidate.sdpMid) {
        candidate.sdpMid = '';
      }
      return TemRTCPlugin.ConstructIceCandidate(
        candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate
      );
    };
  };

  pluginNeededButNotInstalledCb = function () {
    alert('Your browser is not webrtc ready and Temasys plugin is not installed');
  };
  // Try to detect the plugin and act accordingly
  isPluginInstalled('Tem', 'TemWebRTCPlugin', defineWebRTCInterface, pluginNeededButNotInstalledCb);
} else {
  console.log('Browser does not appear to be WebRTC-capable');
}
;(function () {
  /**
   * Call 'init()' to initialize Skyway
   * @class Skyway
   * @constructor
   */
  function Skyway() {
    if (!(this instanceof Skyway)) {
      return new Skyway();
    }
    /**
     * Version of Skyway
     * @attribute VERSION
     * @readOnly
     */
    this.VERSION = '0.3.0';
    /**
     * ICE Connection States. States that would occur are:
     * - STARTING     : ICE Connection to Peer initialized
     * - CLOSED       : ICE Connection to Peer has been closed
     * - FAILED       : ICE Connection to Peer has failed
     * - CHECKING     : ICE Connection to Peer is still in checking status
     * - DISCONNECTED : ICE Connection to Peer has been disconnected
     * - CONNECTED    : ICE Connection to Peer has been connected
     * - COMPLETED    : ICE Connection to Peer has been completed
     * @attribute ICE_CONNECTION_STATE
     * @readOnly
     */
    this.ICE_CONNECTION_STATE = {
      STARTING : 'starting',
      CHECKING : 'checking',
      CONNECTED : 'connected',
      COMPLETED : 'completed',
      CLOSED : 'closed',
      FAILED : 'failed',
      DISCONNECTED : 'disconnected'
    };
    /**
     * Peer Connection States. States that would occur are:
     * - STABLE               :	Initial stage. No local or remote description is applied
     * - HAVE_LOCAL_OFFER     :	"Offer" local description is applied
     * - HAVE_REMOTE_OFFER    : "Offer" remote description is applied
     * - HAVE_LOCAL_PRANSWER  : "Answer" local description is applied
     * - HAVE_REMOTE_PRANSWER : "Answer" remote description is applied
     * - ESTABLISHED          : All description is set and is applied
     * - CLOSED               : Connection closed.
     * @attribute PEER_CONNECTION_STATE
     * @readOnly
     */
    this.PEER_CONNECTION_STATE = {
      STABLE : 'stable',
      HAVE_LOCAL_OFFER : 'have-local-offer',
      HAVE_REMOTE_OFFER : 'have-remote-offer',
      HAVE_LOCAL_PRANSWER : 'have-local-pranswer',
      HAVE_REMOTE_PRANSWER : 'have-remote-pranswer',
      ESTABLISHED : 'established',
      CLOSED : 'closed'
    };
    /**
     * ICE Candidate Generation States. States that would occur are:
     * - GATHERING : ICE Gathering to Peer has just started
     * - DONE      : ICE Gathering to Peer has been completed
     * @attribute CANDIDATE_GENERATION_STATE
     * @readOnly
     */
    this.CANDIDATE_GENERATION_STATE = {
      GATHERING : 'gathering',
      DONE : 'done'
    };
    /**
     * Handshake Progress Steps. Steps that would occur are:
     * - ENTER   : Step 1. Received enter from Peer
     * - WELCOME : Step 2. Received welcome from Peer
     * - OFFER   : Step 3. Received offer from Peer
     * - ANSWER  : Step 4. Received answer from Peer
     * @attribute HANDSHAKE_PROGRESS
     * @readOnly
     */
    this.HANDSHAKE_PROGRESS = {
      ENTER : 'enter',
      WELCOME : 'welcome',
      OFFER : 'offer',
      ANSWER : 'answer'
    };
    /**
     * Data Channel Connection States. Steps that would occur are:
     * - NEW        : Step 1. DataChannel has been created.
     * - LOADED     : Step 2. DataChannel events has been loaded.
     * - OPEN       : Step 3. DataChannel is connected. [WebRTC Standard]
     * - CONNECTING : DataChannel is connecting. [WebRTC Standard]
     * - CLOSING    : DataChannel is closing. [WebRTC Standard]
     * - CLOSED     : DataChannel has been closed. [WebRTC Standard]
     * - ERROR      : DataChannel has an error ocurring.
     * @attribute DATA_CHANNEL_STATE
     * @readOnly
     */
    this.DATA_CHANNEL_STATE = {
      CONNECTING : 'connecting',
      OPEN   : 'open',
      CLOSING : 'closing',
      CLOSED : 'closed',
      NEW    : 'new',
      LOADED : 'loaded',
      ERROR  : 'error'
    };
    /**
     * System actions received from Signaling server. System action outcomes are:
     * - WARNING : System is warning user that the room is closing
     * - REJECT  : System has rejected user from room
     * - CLOSED  : System has closed the room
     * @attribute SYSTEM_ACTION
     * @readOnly
     */
    this.SYSTEM_ACTION = {
      WARNING : 'warning',
      REJECT : 'reject',
      CLOSED : 'close'
    };
    /**
     * State to check if Skyway initialization is ready. Steps that would occur are:
     * - INIT      : Step 1. Init state. If ReadyState fails, it goes to 0.
     * - LOADING   : Step 2. RTCPeerConnection exists. Roomserver, API ID provided is not empty
     * - COMPLETED : Step 3. Retrieval of configuration is complete. Socket.io begins connection.
     * - ERROR     : Error state. Occurs when ReadyState fails loading.
     * - API_ERROR  : API Error state. This occurs when provided APP ID or Roomserver is invalid.
     * - NO_SOCKET_ERROR         : No Socket.IO was loaded state.
     * - NO_XMLHTTPREQUEST_ERROR : XMLHttpRequest is not available in user's PC
     * - NO_WEBRTC_ERROR         : Browser does not support WebRTC error.
     * - NO_PATH_ERROR           : No path provided in init error.
     * @attribute DATA_CHANNEL_STATE
     * @readOnly
     */
    this.READY_STATE_CHANGE = {
      INIT : 0,
      LOADING : 1,
      COMPLETED : 2,
      ERROR :  -1,
      API_ERROR : -2,
      NO_SOCKET_ERROR : -3,
      NO_XMLHTTPREQUEST_ERROR : -4,
      NO_WEBRTC_ERROR : -5,
      NO_PATH_ERROR : -6
    };
    /**
     * Data Channel Transfer Type. Types are
     * - UPLOAD    : Error occurs at UPLOAD state
     * - DOWNLOAD  : Error occurs at DOWNLOAD state
     * @attribute DATA_TRANSFER_TYPE
     * @readOnly
     */
    this.DATA_TRANSFER_TYPE = {
      UPLOAD : 'upload',
      DOWNLOAD : 'download'
    };
    /**
     * Data Channel Transfer State. State that would occur are:
     * - UPLOAD_STARTED     : Data Transfer of Upload has just started
     * - DOWNLOAD_STARTED   : Data Transfer od Download has just started
     * - REJECTED           : Peer rejected User's Data Transfer request
     * - ERROR              : Error occurred when uploading or downloading file
     * - UPLOADING          : Data is uploading
     * - DOWNLOADING        : Data is downloading
     * - UPLOAD_COMPLETED   : Data Transfer of Upload has completed
     * - DOWNLOAD_COMPLETED : Data Transfer of Download has completed
     * @attribute DATA_TRANSFER_STATE
     * @readOnly
     */
    this.DATA_TRANSFER_STATE = {
      UPLOAD_STARTED : 'uploadStarted',
      DOWNLOAD_STARTED : 'downloadStarted',
      REJECTED : 'rejected',
      ERROR : 'error',
      UPLOADING : 'uploading',
      DOWNLOADING : 'downloading',
      UPLOAD_COMPLETED : 'uploadCompleted',
      DOWNLOAD_COMPLETED : 'downloadCompleted'
    };
    /**
     * TODO : ArrayBuffer and Blob in DataChannel
     * Data Channel Transfer Data type. Data Types are:
     * - BINARY_STRING : BinaryString data
     * - ARRAY_BUFFER  : ArrayBuffer data
     * - BLOB         : Blob data
     * @attribute DATA_TRANSFER_DATA_TYPE
     * @readOnly
     */
    this.DATA_TRANSFER_DATA_TYPE = {
      BINARY_STRING : 'binaryString',
      ARRAY_BUFFER : 'arrayBuffer',
      BLOB : 'blob'
    };
    /**
     * Signaling message type. These message types are fixed.
     * (Legend: S - Send only. R - Received only. SR - Can be Both).
     * Signaling types are:
     * - JOIN_ROOM : S. Join the Room
     * - IN_ROOM : R. User has already joined the Room
     * - ENTER : SR. Enter from handshake
     * - WELCOME : SR. Welcome from handshake
     * - OFFER : SR. Offer from handshake
     * - ANSWER : SR. Answer from handshake
     * - CANDIDATE : SR. Candidate received
     * - BYE : R. Peer left the room
     * - CHAT : SR. Chat message relaying
     * - REDIRECT : R. Server redirecting User
     * - ERROR : R. Server occuring an error
     * - INVITE : SR. TODO.
     * - UPDATE_USER : SR. Update of User information
     * - ROOM_LOCK : SR. Locking of Room
     * - MUTE_VIDEO : SR. Muting of User's video
     * - MUTE_AUDIO : SR. Muting of User's audio
     * - PUBLIC_MSG : SR. Sending a public broadcast message.
     * - PRIVATE_MSG : SR. Sending a private message
     * @attribute SIG_TYPE
     * @readOnly
     * @private
     */
    this.SIG_TYPE = {
      JOIN_ROOM : 'joinRoom',
      IN_ROOM : 'inRoom',
      ENTER : this.HANDSHAKE_PROGRESS.ENTER,
      WELCOME : this.HANDSHAKE_PROGRESS.WELCOME,
      OFFER : this.HANDSHAKE_PROGRESS.OFFER,
      ANSWER : this.HANDSHAKE_PROGRESS.ANSWER,
      CANDIDATE : 'candidate',
      BYE : 'bye',
      CHAT : 'chat',
      REDIRECT : 'redirect',
      ERROR : 'error',
      INVITE : 'invite',
      UPDATE_USER : 'updateUserEvent',
      ROOM_LOCK : 'roomLockEvent',
      MUTE_VIDEO : 'muteVideoEvent',
      MUTE_AUDIO : 'muteAudioEvent',
      PUBLIC_MSG : 'public',
      PRIVATE_MSG : 'private'
    };
    /**
     * Lock Action States
     * - LOCK   : Lock the room
     * - UNLOCK : Unlock the room
     * - STATUS : Get the status of the room if it's locked or not
     * @attribute LOCK_ACTION
     * @readOnly
     */
    this.LOCK_ACTION = {
      LOCK : 'lock',
      UNLOCK : 'unlock',
      STATUS : 'check'
    };
    /**
     * Video Resolutions. Resolution types are:
     * - QVGA: Width: 320 x Height: 180
     * - VGA : Width: 640 x Height: 360
     * - HD: Width: 320 x Height: 180
     * @attribute VIDEO_RESOLUTION
     * @readOnly
     */
    this.VIDEO_RESOLUTION = {
      QVGA: { width: 320, height: 180 },
      VGA: { width: 640, height: 360 },
      HD: { width: 1280, height: 720 },
      FHD: { width: 1920, height: 1080 } // Please check support
    };
    /**
     * NOTE ALEX: check if last char is '/'
     * @attribute _path
     * @type String
     * @default _serverPath
     * @final
     * @required
     * @private
     */
    this._path = null;
    /**
     * Url Skyway makes API calls to
     * @attribute _serverPath
     * @type String
     * @final
     * @required
     * @private
     */
    this._serverPath = '//api.temasys.com.sg/';
    /**
     * The Application Key ID
     * @attribute _appKey
     * @type String
     * @private
     */
    this._appKey = null;
    /**
     * The Room name
     * @attribute _roomName
     * @type String
     * @private
     */
    this._roomName = null;
    /**
     * The API key
     * @attribute _key
     * @type String
     * @private
     */
    this._key = null;
    /**
     * The actual socket that handle the connection
     * @attribute _socket
     * @required
     * @private
     */
    this._socket = null;
    /**
     * The socket version of the socket.io used
     * @attribute _socketVersion
     * @private
     */
    this._socketVersion = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @type JSON
     * @required
     * @private
     *
     * @param {String} id User Session ID
     * @param {RTCPeerConnection} peer PeerConnection object
     * @param {String} sid User Secret Session ID
     * @param {String} displayName Deprecated. User display name
     * @param {String} apiOwner Owner of the room
     * @param {Array} streams Array of User's MediaStream
     * @param {String} timestamp User's timestamp
     * @param {String} token User access token
     * @param {JSON} info Optional. User information
     */
    this._user = null;
    /**
     * @attribute _room
     * @type JSON
     * @required
     * @private
     *
     * @param {} room  Room Information, and credentials.
     * @param {String} room.id
     * @param {String} room.token
     * @param {String} room.tokenTimestamp
     * @param {String} room.displayName Displayed name
     * @param {JSON} room.signalingServer
     * @param {String} room.signalingServer.ip
     * @param {String} room.signalingServer.port
     * @param {JSON} room.pcHelper Holder for all the constraints objects used
     *   in a peerconnection lifetime. Some are initialized by default, some are initialized by
     *   internal methods, all can be overriden through updateUser. Future APIs will help user
     * modifying specific parts (audio only, video only, ...) separately without knowing the
     * intricacies of constraints.
     * @param {JSON} room.pcHelper.pcConstraints
     * @param {JSON} room.pcHelper.pcConfig Will be provided upon connection to a room
     * @param {JSON}  [room.pcHelper.pcConfig.mandatory]
     * @param {Array} [room.pcHelper.pcConfig.optional]
     *   Ex: [{DtlsSrtpKeyAgreement: true}]
     * @param {JSON} room.pcHelper.offerConstraints
     * @param {JSON} [room.pcHelper.offerConstraints.mandatory]
     *   Ex: {MozDontOfferDataChannel:true}
     * @param {Array} [room.pcHelper.offerConstraints.optional]
     * @param {JSON} room.pcHelper.sdpConstraints
     * @param {JSON} [room.pcHelper.sdpConstraints.mandatory]
     *   Ex: { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }
     * @param {Array} [room.pcHelper.sdpConstraints.optional]
     */
    this._room = null;
    /**
     * Internal array of peerconnections
     * @attribute _peerConnections
     * @required
     * @private
     */
    this._peerConnections = [];
    /**
     * Internal array of peer informations
     * @attribute _peerInformations
     * @private
     * @required
     */
    this._peerInformations = [];
    /**
     * Internal array of dataChannels
     * @attribute _dataChannels
     * @private
     * @required
     */
    this._dataChannels = [];
    /**
     * Internal array of dataChannel peers
     * @attribute _dataChannelPeers
     * @private
     * @required
     */
    this._dataChannelPeers = [];
    /**
     * The current ReadyState
     * 0 'false or failed', 1 'in process', 2 'done'
     * @attribute _readyState
     * @private
     * @required
     */
    this._readyState = 0;
    /**
     * State if Channel is opened or not
     * @attribute _channel_open
     * @private
     * @required
     */
    this._channel_open = false;
    /**
     * State if User is in room or not
     * @attribute _in_room
     * @private
     * @required
     */
    this._in_room = false;
    /**
     * State if room is locked or not
     * @attribute _room_lock
     * @private
     * @required
     */
    this._room_lock = false;
    /**
     * State if self audio is mute or not
     * @attribute _audio_mute
     * @private
     * @required
     */
    this._audio_mute = false;
    /**
     * State if self video is mute or not
     * @attribute _video_mute
     * @private
     * @required
     */
    this._video_mute = false;
    /**
     * Stores the upload data chunks
     * @attribute _uploadDataTransfers
     * @private
     * @required
     */
    this._uploadDataTransfers = {};
    /**
     * Stores the upload data session information
     * @attribute _uploadDataSessions
     * @private
     * @required
     */
    this._uploadDataSessions = {};
    /**
     * Stores the download data chunks
     * @attribute _downloadDataTransfers
     * @private
     * @required
     */
    this._downloadDataTransfers = {};
    /**
     * Stores the download data session information
     * @attribute _downloadDataSessions
     * @private
     * @required
     */
    this._downloadDataSessions = {};
    /**
     * Stores the data transfers timeout
     * @attribute _dataTransfersTimeout
     * @private
     * @required
     */
    this._dataTransfersTimeout = {};
    /**
     * Standard File Size of each chunk
     * @attribute _chunkFileSize
     * @private
     * @final
     * @required
     */
    this._chunkFileSize = 49152; // [25KB because Plugin] 60 KB Limit | 4 KB for info
    /**
     * Standard File Size of each chunk for Firefox
     * @attribute _mozChunkFileSize
     * @private
     * @final
     * @required
     */
    this._mozChunkFileSize = 16384; // Firefox the sender chunks 49152 but receives as 16384
    /**
     * If ICE trickle should be disabled or not
     * @attribute _enableIceTrickle
     * @private
     * @required
     */
    this._enableIceTrickle = true;
    /**
     * Skyway in debug mode
     * @attribute _debug
     * @protected
     */
    this._debug = false;
    /**
     * User stream settings
     * @attribute _streamSettings
     * @private
     */
    this._streamSettings = {
      audio: true,
      video: true
    };
    /**
     * Get information from server
     * @attribute _requestServerInfo
     * @type function
     * @private
     *
     * @param {String} method HTTP Method
     * @param {String} url Path url to make request to
     * @param {Function} callback Callback function after request is laoded
     * @param {JSON} params HTTP Params
     */
    this._requestServerInfo = function (method, url, callback, params) {
      var xhr = new window.XMLHttpRequest();
      console.log('XHR - Fetching infos from webserver');
      xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          console.log('XHR - Got infos from webserver.');
          if (this.status !== 200) {
            console.log('XHR - ERROR ' + this.status, false);
          }
          callback(this.status, JSON.parse(this.response || '{}'));
        }
      };
      xhr.open(method, url, true);
      if (params) {
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(params));
      } else {
        xhr.send();
      }
    };
    /**
     * Parse information from server
     * @attribute _parseInfo
     * @type function
     * @private
     * @required
     *
     * @param {JSON} info Parsed Information from the server
     * @param {} self Skyway object
     */
    this._parseInfo = function (info, self) {
      console.log(info);

      if (!info.pc_constraints && !info.offer_constraints) {
        self._trigger('readyStateChange', this.READY_STATE_CHANGE.API_ERROR);
        return;
      }
      console.log(JSON.parse(info.pc_constraints));
      console.log(JSON.parse(info.offer_constraints));

      self._key = info.cid;
      self._user = {
        id        : info.username,
        token     : info.userCred,
        timeStamp : info.timeStamp,
        displayName : info.displayName,
        apiOwner : info.apiOwner,
        streams : []
      };
      self._room = {
        id : info.room_key,
        token : info.roomCred,
        start: info.start,
        len: info.len,
        signalingServer : {
          ip : info.ipSigserver,
          port : info.portSigserver,
          protocol: info.protocol
        },
        pcHelper : {
          pcConstraints : JSON.parse(info.pc_constraints),
          pcConfig : null,
          offerConstraints : JSON.parse(info.offer_constraints),
          sdpConstraints : {
            mandatory : {
              OfferToReceiveAudio : true,
              OfferToReceiveVideo : true
            }
          }
        }
      };
      self._readyState = 2;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.COMPLETED);
      console.info('API - Parsed infos from webserver. Ready.');
    };
    /**
     * NOTE: Changed from _init to _loadInfo to prevent confusion
     * Load information from server
     * @attribute _loadInfo
     * @type function
     * @private
     * @required
     *
     * @param {} self Skyway object
     */
    this._loadInfo = function (self) {
      if (!window.io) {
        console.error('API - Socket.io not loaded.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_SOCKET_ERROR);
        return;
      }
      if (!window.XMLHttpRequest) {
        console.error('XHR - XMLHttpRequest not supported');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_XMLHTTPREQUEST_ERROR);
        return;
      }
      if (!window.RTCPeerConnection) {
        console.error('RTC - WebRTC not supported.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_WEBRTC_ERROR);
        return;
      }
      if (!this._path) {
        console.error('API - No connection info. Call init() first.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_PATH_ERROR);
        return;
      }

      self._readyState = 1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING);
      self._requestServerInfo('GET', self._path, function (status, response) {
        if (status !== 200) {
          self._readyState = 0;
          self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR);
          return;
        }
        console.info(response);
        self._parseInfo(response, self);
      });
      console.log('API - Waiting for webserver to provide infos.');
    };
  }
  this.Skyway = Skyway;
  /**
   * Let app register a callback function to an event
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.on = function (eventName, callback) {
    if ('function' === typeof callback) {
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    }
  };

  /**
   * Let app unregister a callback function from an event
   * @method off
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.off = function (eventName, callback) {
    if (callback === undefined) {
      this._events[eventName] = [];
      return;
    }
    var arr = this._events[eventName], l = arr.length;
    for (var i = 0; i < l; i++) {
      if (arr[i] === callback) {
        arr.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Trigger all the callbacks associated with an event
   * Note that extra arguments can be passed to the callback
   * which extra argument can be expected by callback is documented by each event
   * @method _trigger
   * @param {String} eventName
   * @for Skyway
   * @private
   */
  Skyway.prototype._trigger = function (eventName) {
    var args = Array.prototype.slice.call(arguments),
    arr = this._events[eventName];
    args.shift();
    for (var e in arr) {
      if (arr[e].apply(this, args) === false) {
        break;
      }
    }
  };

  /**
   * IMPORTANT: Please call this method to load all server information before joining
   * the room or doing anything else.
   * The Init function to load Skyway.
   * @method init
   * @param {} options Connection options or appID [init('APP_ID')]
   * @param {String} options.roomserver Optional. Path to the Temasys backend server
   * @param {String} options.appID AppID to identify with the Temasys backend server
   * @param {String} options.room Optional. The Roomname.
   *   If there's no room provided, default room would be used.
   * @param {String} options.region Optional. The regional server that user chooses to use.
   *   Default server: US.
   * Servers:
   * - sg : Singapore server
   * - us1 : USA server 1. Default server if region is not provided.
   * - us2 : USA server 2
   * - eu : Europe server
   * @param {String} options.iceTrickle Optional. The option to enable iceTrickle or not.
   *   Default is true.
   * @param {String} options.credentials Optional. Credentials options
   * @param {String} options.credentials.startDateTime The Start timing of the
   *   meeting in Date ISO String
   * @param {Integer} options.credentials.duration The duration of the meeting
   * @param {String} options.credentials.credentials The credentials required
   *   to set the timing and duration of a meeting.
   * Steps to generate the credentials:
   * - Hash: This hash is created by
   *   using the roomname, duration and the timestamp (in ISO String format).
   * - E.g: hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
   *   (new Date()).toISOString()).
   * - Credentials: The credentials is generated by converting the hash to a
   *   Base64 string and then encoding it to a URI string.
   * - E.g: encodeURIComponent(hash.toString(CryptoJS.enc.Base64))
   * @for Skyway
   * @required
   */
  Skyway.prototype.init = function (options) {
    var appID, room, startDateTime, duration, credentials;
    var roomserver = this._serverPath;
    var region = 'us1';
    var iceTrickle = true;

    if (typeof options === 'string') {
      appID = options;
      room = 'app-1';
    } else {
      appID = options.appID;
      roomserver = options.roomserver || roomserver;
      roomserver = (roomserver.lastIndexOf('/') !==
        (roomserver.length - 1)) ? (roomserver += '/')
        : roomserver;
      region = options.region || region;
      room = options.room || appID;
      iceTrickle = (typeof options.iceTrickle !== undefined) ?
        options.iceTrickle : iceTrickle;
      // Custom default meeting timing and duration
      // Fallback to default if no duration or startDateTime provided
      if (options.credentials) {
        startDateTime = options.credentials.startDateTime ||
          (new Date()).toISOString();
        duration = options.credentials.duration || 200;
        credentials = options.credentials.credentials;
      }
    }
    this._readyState = 0;
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.INIT);
    this._appKey = appID;
    this._roomName = room;
    console.info('ICE Trickle: ' + options.iceTrickle);
    this._enableIceTrickle = iceTrickle;
    this._path = roomserver + 'api/' + appID + '/' + room;
    this._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
    this._path += ((this._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    console.log('API - Path: ' + this._path);
    this._loadInfo(this);
  };

  /**
   * Allow Developers to set Skyway in Debug mode.
   * @method setUser
   * @param {Boolean} debug
   * @protected
   */
  Skyway.prototype.setDebug = function (debug) {
    this._debug = debug;
  };

  /**
   * Set and Update the User information
   * @method setUser
   * @param {JSON} userInfo User information set by User
   * @protected
   */
  Skyway.prototype.setUser = function (userInfo) {
    // NOTE ALEX: be smarter and copy fields and only if different
    var self = this;
    if (userInfo) {
      self._user.info = userInfo || self._user.info || {};
    }
    if (self._user._init) {
      // Prevent multiple messages at the same time
      setTimeout(function () {
        self._sendMessage({
          type : 'updateUserEvent',
          mid : self._user.sid,
          rid : self._room.id,
          userInfo : self._user.info
        });
      }, 1000);
    } else {
      self._user._init = true;
    }
  };

  /**
   * Get the User Information
   * @method getUser
   * @return {JSON} userInfo User information
   * @protected
   */
  Skyway.prototype.getUser = function () {
    return this._user.info;
  };

  /**
   * Get the Peer Information
   * @method getPeer
   * @param {String} peerID
   * @return {JSON} peerInfo Peer information
   * @protected
   */
  Skyway.prototype.getPeer = function (peerID) {
    if (!peerID) {
      return;
    }
    return this._peerInformations[peerID];
  };

  /* Syntactically private variables and utility functions */
  Skyway.prototype._events = {
    /**
     * Event fired when a successfull connection channel has been established
     * with the signaling server
     * @event channelOpen
     */
    'channelOpen' : [],
    /**
     * Event fired when the channel has been closed.
     * @event channelClose
     */
    'channelClose' : [],
    /**
     * Event fired when we received a message from the sig server..
     * @event channelMessage
     * @param {JSON} msg
     */
    'channelMessage' : [],
    /**
     * Event fired when there was an error with the connection channel to the sig server.
     * @event channelError
     * @param {String} error
     */
    'channelError' : [],
    /**
     * Event fired when user joins the room
     * @event joinedRoom
     * @param {String} roomID
     * @param {String} userID
     */
    'joinedRoom' : [],
    /**
     * Event fired whether the room is ready for use
     * @event readyStateChange
     * @param {String} readyState [Rel: Skyway.READY_STATE_CHANGE]
     */
    'readyStateChange' : [],
    /**
     * Event fired when a step of the handshake has happened. Usefull for diagnostic
     * or progress bar.
     * @event handshakeProgress
     * @param {String} step [Rel: Skyway.HANDSHAKE_PROGRESS]
     * @param {String} peerID
     */
    'handshakeProgress' : [],
    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} state [Rel: Skyway.CANDIDATE_GENERATION_STATE]
     * @param {String} peerID
     */
    'candidateGenerationState' : [],
    /**
     * Event fired during Peer Connection state change
     * @event peerConnectionState
     * @param {String} state [Rel: Skyway.PEER_CONNECTION_STATE]
     */
    'peerConnectionState' : [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} state [Rel: Skyway.ICE_CONNECTION_STATE]
     * @param {String} peerID
     */
    'iceConnectionState' : [],
    //-- per peer, local media events
    /**
     * Event fired when allowing webcam media stream fails
     * @event mediaAccessError
     * @param {String} error
     */
    'mediaAccessError' : [],
    /**
     * Event fired when allowing webcam media stream passes
     * @event mediaAccessSuccess
     * @param {Object} stream
     */
    'mediaAccessSuccess' : [],
    /**
     * Event fired when a chat message is received from other peers
     * @event chatMessage
     * @param {String}  msg
     * @param {String}  senderID
     * @param {Boolean} pvt
     */
    'chatMessage' : [],
    /**
     * Event fired when a peer joins the room
     * @event peerJoined
     * @param {String} peerID
     */
    'peerJoined' : [],
    /**
     * TODO Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerID
     */
    'peerLeft' : [],
    /**
     * TODO Event fired when a peer joins the room
     * @event presenceChanged
     * @param {JSON} users The list of users
     */
    'presenceChanged' : [],
    /**
     * TODO Event fired when a room is locked
     * @event roomLock
     * @param {Boolean} isLocked
     * @private
     */
    'roomLock' : [],

    //-- per peer, peer connection events
    /**
     * Event fired when a remote stream has become available
     * @event addPeerStream
     * @param {String} peerID
     * @param {Object} stream
     */
    'addPeerStream' : [],
    /**
     * Event fired when a remote stream has become unavailable
     * @event removePeerStream
     * @param {String} peerID
     */
    'removePeerStream' : [],
    /**
     * Event fired when a peer's video is muted
     * @event peerVideoMute
     * @param {String} peerID
     * @param {Boolean} isMuted
     *
     */
    'peerVideoMute' : [],
    /**
     * Event fired when a peer's audio is muted
     * @param {String} peerID
     * @param {Boolean} isMuted
     */
    'peerAudioMute' : [],
    //-- per user events
    /**
     * TODO Event fired when a contact is added
     * @param {String} userID
     * @private
     */
    'addContact' : [],
    /**
     * TODO Event fired when a contact is removed
     * @param {String} userID
     * @private
     */
    'removeContact' : [],
    /**
     * TODO Event fired when a contact is invited
     * @param {String} userID
     * @private
     */
    'invitePeer' : [],
    /**
     * Event fired when a DataChannel's state has changed
     * @event dataChannelState
     * @param {String} state [Rel: Skyway.DATA_CHANNEL_STATE]
     * @param {String} peerID
     */
    'dataChannelState' : [],
    /**
     * Event fired when a Peer there is a Data Transfer going on
     * @event dataTransferState
     * @param {String} state [Rel: Skyway.DATA_TRANSFER_STATE]
     * @param {String} itemID ID of the Data Transfer
     * @param {String} peerID Peer's ID
     * @param {JSON} transferInfo. Available data may vary at different state.
     * - percentage : The percetange of data being uploaded / downloaded
     * - senderID   : The sender Peer's ID
     * - data       : Blob data URL
     * - name       : Data name
     * - size       : Data size
     * - message    : Error message
     * - type       : Where the error message occurred. [Rel: Skyway.DATA_TRANSFER_TYPE]
     */
    'dataTransferState' : [],
    /**
     * Event fired when the Signalling server responds to user regarding
     * the state of the room
     * @event systemAction
     * @param {String} action [Rel: Skyway.SYSTEM_ACTION]
     * @param {String} message The reason of the action
    */
    'systemAction' : [],
    /**
     * Event fired based on what user has set for specific users
     * @event privateMessage
     * @param {JSON/String} data Data to be sent over
     * @param {String} senderID Sender
     * @param {String} peerID Targeted Peer to receive the data
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'privateMessage' : [],
    /**
     * Event fired based on what user has set for all users
     * @event publicMessage
     * @param {JSON/String} data
     * @param {String} senderID Sender
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'publicMessage' : [],
    /**
     * Event fired based on when Peer Information is updated
     * @event
     * @param {JSON} userInfo
     * @param {String} peerID
     */
    'updatedUser' : [],
    /**
     * Event fired based on when toggleLock is called
     * @event
     * @param {JSON} success
     * @param {Boolean} Room lock status. If error, it returns null
     * @param {String} Error message
     */
    'lockRoom' : []
  };

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {String} chatMsg
   * @param {String} targetPeerID
   */
  Skyway.prototype.sendChatMsg = function (chatMsg, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : chatMsg,
      mid : this._user.sid,
      sender: this._user.sid,
      rid : this._room.id,
      type : this.SIG_TYPE.CHAT
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    this._sendMessage(msg_json);
    this._trigger('chatMessage', chatMsg, this._user.sid, !!targetPeerID);
  };

  /**
   * Send a chat message via DataChannel
   * @method sendDataChannelChatMsg
   * @param {String} chatMsg
   * @param {String} targetPeerID
   */
  Skyway.prototype.sendDataChannelChatMsg = function (chatMsg, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : chatMsg,
      mid : this._user.sid,
      sender: this._user.sid,
      rid : this._room.id,
      type : this.SIG_TYPE.CHAT
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    if (targetPeerID) {
      if (this._dataChannels.hasOwnProperty(targetPeerID)) {
        this._sendDataChannel(targetPeerID, ['CHAT', 'PRIVATE', this._user.sid, chatMsg]);
      }
    } else {
      for (var peerID in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerID)) {
          this._sendDataChannel(peerID, ['CHAT', 'GROUP', this._user.sid, chatMsg]);
        }
      }
    }
    this._trigger('chatMessage', chatMsg, this._user.sid, !!targetPeerID);
  };

  /**
   * Send a private message
   * @method sendPrivateMsg
   * @param {JSON}   data
   * @param {String} targetPeerID
   * @protected
   * @beta
   */
  Skyway.prototype.sendPrivateMsg = function (data, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : data,
      mid : this._user.sid,
      rid : this._room.id,
      sender : this._user.sid,
      target: ((targetPeerID) ? targetPeerID : this._user.sid),
      type : this.SIG_TYPE.PRIVATE_MSG
    };
    this._sendMessage(msg_json);
    this._trigger('privateMessage', data, this._user.sid, targetPeerID, true);
  };

  /**
   * Send a public broadcast message
   * @method sendPublicMsg
   * @param {JSON}   data
   * @protected
   * @beta
   */
  Skyway.prototype.sendPublicMsg = function (data) {
    var msg_json = {
      cid : this._key,
      data : data,
      mid : this._user.sid,
      sender : this._user.sid,
      rid : this._room.id,
      type : this.SIG_TYPE.PUBLIC_MSG
    };
    this._sendMessage(msg_json);
    this._trigger('publicMessage', data, this._user.sid, true);
  };

  /**
   * Get the default cam and microphone
   * @method getDefaultStream
   * @param {JSON} options
   * @param {Boolean} options.audio
   * @param {Boolean} options.video
   * @param {JSON} mediaSettings
   * @param {Integer} mediaSettings.width Video width
   * @param {Integer} mediaSettings.height Video height
   * @param {String} res [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} mediaSettings.frameRate Mininum frameRate of Video
   */
  Skyway.prototype.getDefaultStream = function (options) {
    var self = this;
    self._parseStreamSettings(options);
    try {
      window.getUserMedia({
        audio: self._streamSettings.audio,
        video: self._streamSettings.video
      }, function (s) {
        self._onUserMediaSuccess(s, self);
      }, function (e) {
        self._onUserMediaError(e, self);
      });
      console.log('API [MediaStream] - Requested ' +
        ((self._streamSettings.audio) ? 'A' : '') +
        ((self._streamSettings.audio &&
          self._streamSettings.video) ? '/' : '') +
        ((self._streamSettings.video) ? 'V' : ''));
    } catch (e) {
      this._onUserMediaError(e, self);
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   * @method _onUserMediaSuccess
   * @param {MediaStream} stream The acquired stream
   * @param {} self   A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaSuccess = function (stream, self) {
    console.log('API - User has granted access to local media.');
    self._trigger('mediaAccessSuccess', stream);
    self._user.streams[stream.id] = stream;
  };

  /**
   * getUserMedia could not succeed.
   * @method _onUserMediaError
   * @param {} e error
   * @param {} self A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaError = function (e, self) {
    console.log('API - getUserMedia failed with exception type: ' + e.name);
    if (e.message) {
      console.log('API - getUserMedia failed with exception: ' + e.message);
    }
    if (e.constraintName) {
      console.log('API - getUserMedia failed because of the following constraint: ' +
        e.constraintName);
    }
    self._trigger('mediaAccessError', (e.name || e));
  };

  /**
   * Handle every incoming message. If it's a bundle, extract single messages
   * Eventually handle the message(s) to _processSingleMsg
   * @method _processingSigMsg
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._processSigMsg = function (message) {
    var msg = JSON.parse(message);
    if (msg.type === 'group') {
      console.log('API - Bundle of ' + msg.lists.length + ' messages.');
      for (var i = 0; i < msg.lists.length; i++) {
        this._processSingleMsg(msg.lists[i]);
      }
    } else {
      this._processSingleMsg(msg);
    }
  };

  /**
   * Throw an event with the received chat msg
   * @method _chatHandler
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.nick
   * @private
   */
  Skyway.prototype._chatHandler = function (msg) {
    this._trigger('chatMessage', msg.data, msg.sender, (msg.target ? true : false));
  };

  /**
   * Signaling server wants us to move out.
   * @method _redirectHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._redirectHandler = function (msg) {
    console.log('API - [Server] You are being redirected: ' + msg.info);
    this._trigger('systemAction', msg.action, msg.info);
  };

  /**
   * User Information is updated
   * @method _updateUserEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._updateUserEventHandler = function (msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'updateUserEvent\'.');
    console.info(msg);
    this._peerInformations[targetMid] = msg.userInfo || {};
    this._trigger('updatedUser', msg.userInfo || {}, targetMid);
  };

  Skyway.prototype._test = function (msg) {
    console.info(msg);
  };

  /**
   * Mute Video is Fired
   * @method _muteVideoEventHandler
   * @param {JSON} msg
   */
  Skyway.prototype._muteVideoEventHandler = function (msg) {
    console.info(msg);
    // this._trigger('peerVideoMute', msg.mid, msg.enabled);
  };

  /**
   * Mute Audio is Fired
   * @method _muteAudioEventHandler
   * @param {JSON} msg
   */
  Skyway.prototype._muteAudioEventHandler = function (msg) {
    console.info(msg);
    // this._trigger('peerAudioMute', msg.mid, msg.enabled);
  };

  /**
   * Room Lock is Fired
   * @method _roomLockEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._roomLockEventHandler = function (msg) {
    this._trigger('lockRoom', true, msg.lock);
  };

  /**
   * A peer left, let's clean the corresponding connection, and trigger an event.
   * @method _byeHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._byeHandler = function (msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'bye\'.');
    this._removePeer(targetMid);
  };

  /**
   * Throw an event with the received private msg
   * @method _privateMsgHandler
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.sender
   * @param {String} msg.target
   * @private
   */
  Skyway.prototype._privateMsgHandler = function (msg) {
    this._trigger('privateMessage', msg.data, msg.sender, msg.target, false);
  };

  /**
   * Throw an event with the received private msg
   * @method _publicMsgHandler
   * @param {JSON} msg
   * @param {String} msg.sender
   * @param {JSON/String} msg.data
   * @private
   */
  Skyway.prototype._publicMsgHandler = function (msg) {
    this._trigger('publicMessage', msg.data, msg.sender, false);
  };

  /**
   * Actually clean the peerconnection and trigger an event. Can be called by _byHandler
   * and leaveRoom.
   * @method _removePeer
   * @param {String} peerID Id of the peer to remove
   * @private
   */
  Skyway.prototype._removePeer = function (peerID) {
    this._trigger('peerLeft', peerID);
    if (this._peerConnections[peerID]) {
      this._peerConnections[peerID].close();
    }
    delete this._peerConnections[peerID];
  };

  /**
   * We just joined a room! Let's send a nice message to all to let them know I'm in.
   * @method _inRoomHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._inRoomHandler = function (msg) {
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(msg.pc_config);

    this._room.pcHelper.pcConfig = this._setFirefoxIceServers(msg.pc_config);
    this._in_room = true;
    this._user.sid = msg.sid;
    this._trigger('joinedRoom', this._room.id, this._user.sid);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    var self = this;
    console.log('API - Sending enter.');
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER);
    self._sendMessage({
      type : self.SIG_TYPE.ENTER,
      mid : self._user.sid,
      rid : self._room.id,
      agent : window.webrtcDetectedBrowser.browser,
      version : window.webrtcDetectedBrowser.version
    });
  };

  /**
   * Someone just entered the room. If we don't have a connection with him/her,
   * send him a welcome. Handshake step 2 and 3.
   * @method _enterHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._enterHandler = function (msg) {
    var targetMid = msg.mid;
    var self = this;
    // need to check entered user is new or not.
    if (!self._peerConnections[targetMid]) {
      msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
      var browserAgent = msg.agent + ((msg.version) ? ('|' + msg.version) : '');
      // should we resend the enter so we can be the offerer?
      checkMediaDataChannelSettings(false, browserAgent, function (beOfferer) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
        var params = {
          type : ((beOfferer) ? self.SIG_TYPE.ENTER : self.SIG_TYPE.WELCOME),
          mid : self._user.sid,
          rid : self._room.id,
          agent : window.webrtcDetectedBrowser.browser
        };
        if (!beOfferer) {
          console.log('API - [' + targetMid + '] Sending welcome.');
          self._trigger('peerJoined', targetMid);
          self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
          params.target = targetMid;
        }
        self._sendMessage(params);
        self.setUser();
      });
    } else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
      console.log('API - Received "enter" when Peer "' + targetMid +
        '" is already added');
      return;
    }
  };

  /**
   * We have just received a welcome. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._welcomeHandler = function (msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    this._trigger('peerJoined', targetMid);
    this._enableIceTrickle = (typeof msg.enableIceTrickle !== undefined) ?
      msg.enableIceTrickle : this._enableIceTrickle;
    if (!this._peerConnections[targetMid]) {
      this._openPeer(targetMid, msg.agent, true, msg.receiveOnly);
      this.setUser();
    }
  };

  /**
   * We have just received an offer. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._offerHandler = function (msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.OFFER, targetMid);
    console.log('Test:');
    console.log(msg);
    var offer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received offer:');
    console.dir(offer);
    var pc = this._peerConnections[targetMid];
    if (!pc) {
      this._openPeer(targetMid, msg.agent, false);
      pc = this._peerConnections[targetMid];
    }
    var self = this;
    pc.setRemoteDescription(new RTCSessionDescription(offer), function () {
      self._doAnswer(targetMid);
    }, function (err) {
      console.error(err);
    });
  };

  /**
   * We have succesfully received an offer and set it locally. This function will take care
   * of cerating and sendng the corresponding answer. Handshake step 4.
   * @method _doAnswer
   * @param {String} targetMid The peer we should connect to.
   * @private
   */
  Skyway.prototype._doAnswer = function (targetMid) {
    console.log('API - [' + targetMid + '] Creating answer.');
    var pc = this._peerConnections[targetMid];
    var self = this;
    if (pc) {
      pc.createAnswer(function (answer) {
        console.log('API - [' + targetMid + '] Created  answer.');
        console.dir(answer);
        self._setLocalAndSendMessage(targetMid, answer);
      }, function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'answer');
      }, self._room.pcHelper.sdpConstraints);
    } else {
      return;
      /* Houston ..*/
    }
  };

  /**
   * Fallback for offer or answer creation failure.
   * @method _onOfferOrAnswerError
   * @param {String} targetMid
   * @param {} error
   * @param {String} type
   * @private
   */
  Skyway.prototype._onOfferOrAnswerError = function (targetMid, error, type) {
    console.log('API - [' + targetMid + '] Failed to create an ' + type +
      '. Error code was ' + JSON.stringify(error));
  };

  /**
   * We have a peer, this creates a peerconnection object to handle the call.
   * if we are the initiator, we then starts the O/A handshake.
   * @method _openPeer
   * @param {String} targetMid The peer we should connect to.
   * @param {String} peerAgentBrowser The peer's browser
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   * @param {Boolean} receiveOnly Should they only receive?
   * @private
   */
  Skyway.prototype._openPeer = function (targetMid, peerAgentBrowser, toOffer, receiveOnly) {
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    var self = this;

    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
    if (!receiveOnly) {
      self._addLocalStream(targetMid);
    }
    // I'm the callee I need to make an offer
    if (toOffer) {
      self._createDataChannel(targetMid, function (dc){
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
        self._doCall(targetMid, peerAgentBrowser);
      });
    }
  };

  /**
   * Sends our Local MediaStream to other Peers.
   * By default, it sends all it's other stream
   * @method _addLocalStream
   * @param {String} peerID
   * @private
   */
  Skyway.prototype._addLocalStream = function (peerID) {
    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log('API - [' + peerID + '] Adding local stream.');

    if (Object.keys(this._user.streams).length > 0) {
      for (var stream in this._user.streams) {
        if (this._user.streams.hasOwnProperty(stream)) {
          this._peerConnections[peerID].addStream(this._user.streams[stream]);
        }
      }
    } else {
      console.log('API - WARNING - No stream to send. You will be only receiving.');
    }
  };

  /**
   * The remote peer advertised streams, that we are forwarding to the app. This is part
   * of the peerConnection's addRemoteDescription() API's callback.
   * @method _onRemoteStreamAdded
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   * @private
   */
  Skyway.prototype._onRemoteStreamAdded = function (targetMid, event) {
    console.log('API - [' + targetMid + '] Remote Stream added.');
    this._trigger('addPeerStream', targetMid, event.stream);
  };

  /**
   * It then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _doCall
   * @param {String} targetMid
   * @private
   */
  Skyway.prototype._doCall = function (targetMid, peerAgentBrowser) {
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var constraints = this._room.pcHelper.offerConstraints;
    var sc = this._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        constraints.mandatory[name] = sc.mandatory[name];
      }
    }
    constraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    var self = this;
    checkMediaDataChannelSettings(true, peerAgentBrowser, function (offerConstraints) {
      pc.createOffer(function (offer) {
        self._setLocalAndSendMessage(targetMid, offer);
      }, function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'offer');
      }, offerConstraints);
    }, constraints);
  };

  /**
   * Find a line in the SDP and return it
   * @method _findSDPLine
   * @param {Array} sdpLines
   * @param {Array} condition
   * @param {String} value Value to set Sdplines to
   * @return {Array} [index, line] Returns the sdpLines based on the condition
   * @private
   * @beta
   */
  Skyway.prototype._findSDPLine = function (sdpLines, condition, value) {
    for (var index in sdpLines) {
      if (sdpLines.hasOwnProperty(index)) {
        for (var c in condition) {
          if (condition.hasOwnProperty(c)) {
            if (sdpLines[index].indexOf(c) === 0) {
              sdpLines[index] = value;
              return [index, sdpLines[index]];
            }
          }
        }
      }
    }
    return [];
  };

   /**
   * Add Stereo to SDP. Requires OPUS
   * @method _addStereo
   * @param {Array} sdpLines
   * @return {Array} sdpLines Updated version with Stereo feature
   * @private
   * @beta
   */
  Skyway.prototype._addStereo = function (sdpLines) {
    var opusLineFound = false, opusPayload = 0;
    // Check if opus exists
    var rtpmapLine = this._findSDPLine(sdpLines, ['a=rtpmap:']);
    if (rtpmapLine.length) {
      if (rtpmapLine[1].split(' ')[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = (rtpmapLine[1].split(' ')[0]).split(':')[1];
      }
    }
    // Find the A=FMTP line with the same payload
    if (opusLineFound) {
      var fmtpLine = this._findSDPLine(sdpLines,
        ['a=fmtp:' + opusPayload]);
      if (fmtpLine.length) {
        sdpLines[fmtpLine[0]] = fmtpLine[1] + '; stereo=1';
      }
    }
    return sdpLines;
  };

  /**
   * Set Audio, Video and Data Bitrate in SDP
   * @method _setSDPBitrate
   * @param {Array} sdpLines
   * @return {Array} sdpLines Updated version with custom Bandwidth settings
   * @private
   * @beta
   */
  Skyway.prototype._setSDPBitrate = function (sdpLines) {
    // Find if user has audioStream
    var bandwidth = this._streamSettings.bandwidth;
    var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
    var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;
    // Find the RTPMAP with Audio Codec
    if (maLineFound && cLineFound) {
      if (bandwidth.audio) {
        var audioLine = this._findSDPLine(sdpLines,
          ['a=mid:audio','m=mid:audio']);
        sdpLines.splice(audioLine[0], 0, 'b=AS:' + bandwidth.audio);
      }
      if (bandwidth.video) {
        var videoLine = this._findSDPLine(sdpLines,
          ['a=mid:video','m=mid:video']);
        sdpLines.splice(videoLine[0], 0, 'b=AS:' + bandwidth.video);
      }
      if (bandwidth.data) {
        var dataLine = this._findSDPLine(sdpLines,
          ['a=mid:data','m=mid:data']);
        sdpLines.splice(dataLine[0], 0, 'b=AS:' + bandwidth.data);
      }
    }
    return sdpLines;
  };

  /**
   * This takes an offer or an aswer generated locally and set it in the peerconnection
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _setLocalAndSendMessage
   * @param {String} targetMid
   * @param {JSON} sessionDescription This should be provided by the peerconnection API.
   *   User might 'tamper' with it, but then , the setLocal may fail.
   * @private
   */
  Skyway.prototype._setLocalAndSendMessage = function (targetMid, sessionDescription) {
    console.log('API - [' + targetMid + '] Created ' + sessionDescription.type + '.');
    console.log(sessionDescription);
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var sdpLines = sessionDescription.sdp.split('\r\n');
    if (this._streamSettings.stereo) {
      this._addStereo(sdpLines);
      console.info('API - User has requested Stereo');
    }
    if (this._streamSettings.bandwidth) {
      sdpLines = this._setSDPBitrate(sdpLines, this._streamSettings.bandwidth);
      console.info('API - Custom Bandwidth settings');
      console.info('API - Video: ' + this._streamSettings.bandwidth.video);
      console.info('API - Audio: ' + this._streamSettings.bandwidth.audio);
      console.info('API - Data: ' + this._streamSettings.bandwidth.data);
    }
    sessionDescription.sdp = sdpLines.join('\r\n');

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    //sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);

    console.log('API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ').');

    var self = this;
    pc.setLocalDescription(
      sessionDescription,
      function () {
      console.log('API - [' + targetMid + '] Set ' + sessionDescription.type + '.');
      self._trigger('handshakeProgress', sessionDescription.type, targetMid);
      if (self._enableIceTrickle &&
        sessionDescription.type !== self.HANDSHAKE_PROGRESS.OFFER) {
        console.log('API - [' + targetMid + '] Sending ' + sessionDescription.type + '.');
        self._sendMessage({
          type : sessionDescription.type,
          sdp : sessionDescription.sdp,
          mid : self._user.sid,
          agent : window.webrtcDetectedBrowser.browser,
          target : targetMid,
          rid : self._room.id
        });
      }
    },
      function () {
      console.log('API - [' +
        targetMid + '] There was a problem setting the Local Description.');
    });
  };

  /**
   * This sets the STUN server specially for Firefox for ICE Connection
   * @method _setFirefoxIceServers
   * @param {JSON} config
   * @private
   */
  Skyway.prototype._setFirefoxIceServers = function (config) {
    if (window.webrtcDetectedBrowser.mozWebRTC) {
      // NOTE ALEX: shoul dbe given by the server
      var newIceServers = [{
          'url' : 'stun:stun.services.mozilla.com'
        }
      ];
      for (var i = 0; i < config.iceServers.length; i++) {
        var iceServer = config.iceServers[i];
        var iceServerType = iceServer.url.split(':')[0];
        if (iceServerType === 'stun') {
          if (iceServer.url.indexOf('google')) {
            continue;
          }
          iceServer.url = [iceServer.url];
          newIceServers.push(iceServer);
        } else {
          var newIceServer = {};
          newIceServer.credential = iceServer.credential;
          newIceServer.url = iceServer.url.split(':')[0];
          newIceServer.username = iceServer.url.split(':')[1].split('@')[0];
          newIceServer.url += ':' + iceServer.url.split(':')[1].split('@')[1];
          newIceServers.push(newIceServer);
        }
      }
      config.iceServers = newIceServers;
    }
    return config;
  };

  /**
   * Waits for MediaStream. Once the stream is loaded, callback is called
   * If there's not a need for stream, callback is called
   * @method _waitForMediaStream
   * @param {Function} callback
   * @param {JSON} options
   * @private
   */
  Skyway.prototype._waitForMediaStream = function (callback, options) {
    var self = this;
    if (!options) {
      callback();
      return;
    }
    self.getDefaultStream(options);
    console.log('API - requireVideo: ' +
      ((options.video) ? true : false));
    console.log('API - requireAudio: ' +
      ((options.audio) ? true : false));
    // Loop for stream
    var checkForStream = setInterval(function () {
      for (var stream in self._user.streams) {
        if (self._user.streams.hasOwnProperty(stream)) {
          var audioTracks = self._user.streams[stream].getAudioTracks();
          var videoTracks = self._user.streams[stream].getVideoTracks();
          console.info(stream);
          if (((options.video) ? (videoTracks.length > 0)
            : true) && ((options.audio) ? (audioTracks.length > 0)
            : true)) {
            clearInterval(checkForStream);
            callback();
            break;
          }
        }
      }
    }, 2000);
  };

  /**
   * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
   * All the peerconnection callbacks are set up here. This is a quite central piece.
   * @method _createPeerConnection
   * @param {String} targetMid
   * @return {RTCPeerConnection} The created peer connection object.
   * @private
   */
  Skyway.prototype._createPeerConnection = function (targetMid) {
    var pc;
    try {
      pc = new window.RTCPeerConnection(
          this._room.pcHelper.pcConfig,
          this._room.pcHelper.pcConstraints);
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.');
      console.log(
        'API - [' + targetMid + '] PC config: ');
      console.dir(this._room.pcHelper.pcConfig);
      console.log(
        'API - [' + targetMid + '] PC constraints: ' +
        JSON.stringify(this._room.pcHelper.pcConstraints));
    } catch (e) {
      console.log('API - [' + targetMid + '] Failed to create PeerConnection: ' + e.message);
      return null;
    }
    // callbacks
    // standard not implemented: onnegotiationneeded,
    var self = this;
    pc.ondatachannel = function (event) {
      var dc = event.channel || event;
      console.log('API - [' + targetMid + '] Received DataChannel -> ' +
        dc.label);
      self._createDataChannel(targetMid, function (dc){
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
      }, dc);
    };
    pc.onaddstream = function (event) {
      self._onRemoteStreamAdded(targetMid, event);
    };
    pc.onicecandidate = function (event) {
      console.dir(event);
      self._onIceCandidate(targetMid, event);
    };
    pc.oniceconnectionstatechange = function () {
      checkIceConnectionState(targetMid, pc.iceConnectionState, function (iceConnectionState) {
        console.log('API - [' + targetMid + '] ICE connection state changed -> ' +
          iceConnectionState);
        self._trigger('iceConnectionState', iceConnectionState, targetMid);
      });
    };
    // pc.onremovestream = function () {
    //   self._onRemoteStreamRemoved(targetMid);
    // };
    pc.onsignalingstatechange = function () {
      console.log('API - [' + targetMid + '] PC connection state changed -> ' +
        pc.signalingState);
      var signalingState = pc.signalingState;
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE &&
        pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        pc.hasSetOffer = true;
      } else if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE &&
        pc.hasSetOffer) {
        signalingState = self.PEER_CONNECTION_STATE.ESTABLISHED;
      }
      self._trigger('peerConnectionState', signalingState, targetMid);
    };
    pc.onicegatheringstatechange = function () {
      console.log('API - [' + targetMid + '] ICE gathering state changed -> ' +
        pc.iceGatheringState);
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
    };
    return pc;
  };

  /**
   * A candidate has just been generated (ICE gathering) and will be sent to the peer.
   * Part of connection establishment.
   * @method _onIceCandidate
   * @param {String} targetMid
   * @param {Event}  event This is provided directly by the peerconnection API.
   * @private
   */
  Skyway.prototype._onIceCandidate = function (targetMid, event) {
    if (event.candidate) {
      var msgCan = event.candidate.candidate.split(' ');
      var candidateType = msgCan[7];
      console.log('API - [' + targetMid + '] Created and sending ' +
        candidateType + ' candidate.');
      this._sendMessage({
        type : this.SIG_TYPE.CANDIDATE,
        label : event.candidate.sdpMLineIndex,
        id : event.candidate.sdpMid,
        candidate : event.candidate.candidate,
        mid : this._user.sid,
        target : targetMid,
        rid : this._room.id
      });
    } else {
      console.log('API - [' + targetMid + '] End of gathering.');
      this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.DONE, targetMid);
      // Disable Ice trickle option
      if (!this._enableIceTrickle) {
        var sessionDescription = this._peerConnections[targetMid].localDescription;
        console.log('API - [' + targetMid + '] Sending offer.');
        this._sendMessage({
          type : sessionDescription.type,
          sdp : sessionDescription.sdp,
          mid : this._user.sid,
          agent : window.webrtcDetectedBrowser.browser,
          target : targetMid,
          rid : this._room.id
        });
      }
    }
  };

  /**
   * Handling reception of a candidate. handshake done, connection ongoing.
   * @method _candidateHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._candidateHandler = function (msg) {
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if (pc) {
      if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
        console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      }
      var msgCan = msg.candidate.split(' ');
      var canType = msgCan[7];
      console.log('API - [' + targetMid + '] Received ' + canType + ' Candidate.');
      // if (canType !== 'relay' && canType !== 'srflx') {
      // trace('Skipping non relay and non srflx candidates.');
      var index = msg.label;
      var candidate = new window.RTCIceCandidate({
          sdpMLineIndex : index,
          candidate : msg.candidate
        });
      pc.addIceCandidate(candidate); //,
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      console.log('API - [' + targetMid + '] Added Candidate.');
    } else {
      console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
        'as PeerConnection not present.');
      // NOTE ALEX: if the offer was slow, this can happen
      // we might keep a buffer of candidates to replay after receiving an offer.
    }
  };

  /**
   * Handling reception of an answer (to a previous offer). handshake step 4.
   * @method _answerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._answerHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    var answer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received answer:');
    console.dir(answer);
    var pc = this._peerConnections[targetMid];
    pc.setRemoteDescription(new RTCSessionDescription(answer), function () {
      pc.remotePeerReady = true;
    }, function (err) {
      console.error(err);
    });
  };

  /**
   * Send a message to the signaling server
   * @method _sendMessage
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._sendMessage = function (message) {
    if (!this._channel_open) {
      return;
    }
    var msgString = JSON.stringify(message);
    console.log('API - [' + (message.target ? message.target : 'server') +
      '] Outgoing message: ' + message.type);
    this._socket.send(msgString);
  };

  /**
   * @method _openChannel
   * @private
   */
  Skyway.prototype._openChannel = function () {
    var self = this;
    var _openChannelImpl = function (readyState) {
      if (readyState !== 2) {
        return;
      }
      self.off('readyStateChange', _openChannelImpl);
      console.log('API - Opening channel.');
      var ip_signaling = self._room.signalingServer.protocol + '://' +
        self._room.signalingServer.ip + ':' + self._room.signalingServer.port;

      console.log('API - Signaling server URL: ' + ip_signaling);

      if (self._socketVersion >= 1) {
        self._socket = io.connect(ip_signaling, {
          forceNew : true
        });
      } else {
        self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      }

      self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      self._socket.on('connect', function () {
        self._channel_open = true;
        self._trigger('channelOpen');
      });
      self._socket.on('error', function (err) {
        console.log('API - Channel Error: ' + err);
        self._channel_open = false;
        self._trigger('channelError', err);
      });
      self._socket.on('disconnect', function () {
        self._trigger('channelClose');
      });
      self._socket.on('message', function (msg) {
        self._processSigMsg(msg);
      });
    };
    if (this._channel_open) {
      return;
    }
    if (this._readyState === 0) {
      this.on('readyStateChange', _openChannelImpl);
      this._loadInfo(this);
    } else {
      _openChannelImpl(2);
    }
  };

  /**
   * @method _closeChannel
   * @private
   */
  Skyway.prototype._closeChannel = function () {
    if (!this._channel_open) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
    this._readyState = 0; // this forces a reinit
  };

  /**
   * Create a DataChannel. Only SCTPDataChannel support
   * @method _createDataChannel
   * @param {String} peerID The PeerID of which the dataChannel is connected to
   * @param {Function} callback The callback which it returns the DataChannel object to
   * @param {RTCDataChannel} dc The DataChannel object passed inside
   * @private
   */
  Skyway.prototype._createDataChannel = function (peerID, callback, dc) {
    var self = this;
    var pc = self._peerConnections[peerID];
    var channel_name = self._user.sid + '_' + peerID;

    if (!dc) {
      if (!webrtcDetectedBrowser.isSCTPDCSupported && !webrtcDetectedBrowser.isPluginSupported) {
        console.warn('API - DataChannel [' + peerID + ']: Does not support SCTP');
      }
      dc = pc.createDataChannel(channel_name);
    } else {
      channel_name = dc.label;
    }
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.NEW, peerID);
    console.log(
      'API - DataChannel [' + peerID + ']: Binary type support is "' + dc.binaryType + '"');
    dc.onerror = function (err) {
      console.error('API - DataChannel [' + peerID + ']: Failed retrieveing DataChannel.');
      console.exception(err);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerID);
    };
    dc.onclose = function () {
      console.log('API - DataChannel [' + peerID + ']: DataChannel closed.');
      self._closeDataChannel(peerID, self);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerID);
    };
    dc.onopen = function () {
      dc.push = dc.send;
      dc.send = function (data) {
        console.log('API - DataChannel [' + peerID + ']: DataChannel is opened.');
        console.log('API - DataChannel [' + peerID + ']: Length : ' + data.length);
        dc.push(data);
      };
    };
    dc.onmessage = function (event) {
      console.log('API - DataChannel [' + peerID + ']: DataChannel message received');
      self._dataChannelHandler(event.data, peerID, self);
    };
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.LOADED, peerID);
    callback(dc);
  };

  /**
   * Check DataChannel ReadyState. If ready, it sends a 'CONN'
   * @method _checkDataChannelStatus
   * @param {DataChannel} dc
   * @private
   */
  Skyway.prototype._checkDataChannelStatus = function (dc) {
    var self = this;
    setTimeout(function () {
      console.log('API - DataChannel [' + dc.label +
        ']: Connection Status - ' + dc.readyState);
      var peerID = self._dataChannelPeers[dc.label];
      self._trigger('dataChannelState', dc.readyState, peerID);

      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        self._sendDataChannel(peerID, ['CONN', dc.label]);
      }
    }, 500);
  };

  /**
   * Sending of String Data over the DataChannels
   * @method _sendDataChannel
   * @param {String} peerID
   * @param {JSON} data
   * @private
   */
  Skyway.prototype._sendDataChannel = function (peerID, data) {
    var dc = this._dataChannels[peerID];
    if (!dc) {
      console.error('API - DataChannel [' + peerID + ']: No available existing DataChannel');
      return;
    } else {
      if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
        console.log('API - DataChannel [' + peerID + ']: Sending Data from DataChannel');
        try {
          var dataString = '';
          for (var i = 0; i < data.length; i++) {
            dataString += data[i];
            dataString += (i !== (data.length - 1)) ? '|' : '';
          }
          dc.send(dataString);
        } catch (err) {
          console.error('API - DataChannel [' + peerID + ']: Failed executing send on DataChannel');
          console.exception(err);
        }
      } else {
        console.error('API - DataChannel [' + peerID +
          ']: DataChannel is "' + dc.readyState + '"');
      }
    }
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _dataChannelPeer
   * @param {String} channel
   * @param {Skyway} self
   * @private
   * @deprecated
   */
  Skyway.prototype._dataChannelPeer = function (channel, self) {
    return self._dataChannelPeers[channel];
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _closeDataChannel
   * @param {String} peerID
   * @private
   */
  Skyway.prototype._closeDataChannel = function (peerID, self) {
    var dc = self._dataChannels[peerID];
    if (dc) {
      if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
        dc.close();
      }
      delete self._dataChannels[peerID];
      delete self._dataChannelPeers[dc.label];
    }
  };

  /**
   * The Handler for all DataChannel Protocol events
   * @method _dataChannelHandler
   * @param {String} data
   * @private
   */
  Skyway.prototype._dataChannelHandler = function (dataString, peerID, self) {
    // PROTOCOL ESTABLISHMENT
    console.dir(dataString);
    if (typeof dataString === 'string') {
      if (dataString.indexOf('|') > -1 && dataString.indexOf('|') < 6) {
        var data = dataString.split('|');
        var state = data[0];
        console.log('API - DataChannel [' + peerID + ']: Received "' + state + '"');

        switch(state) {
        case 'CONN':
          // CONN - DataChannel Connection has been established
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerID);
          break;
        case 'WRQ':
          // WRQ - Send File Request Received. For receiver to accept or not
          self._dataChannelWRQHandler(peerID, data, self);
          break;
        case 'ACK':
          // ACK - If accepted, send. Else abort
          self._dataChannelACKHandler(peerID, data, self);
          break;
        case 'ERROR':
          // ERROR - Failure in receiving data. Could be timeout
          console.log('API - Received ERROR');
          self._dataChannelERRORHandler(peerID, data, self);
          break;
        case 'CHAT':
          // CHAT - DataChannel Chat
          console.log('API - Received CHAT');
          self._dataChannelCHATHandler(peerID, data, self);
          break;
        default:
          console.log('API - DataChannel [' + peerID + ']: Invalid command');
        }
      } else {
        // DATA - BinaryString base64 received
        console.log('API - DataChannel [' + peerID + ']: Received "DATA"');
        self._dataChannelDATAHandler(peerID, dataString,
          self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, self);
      }
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: WRQ
   * The sender has sent a request to send file
   * From here, it's up to the user to accept or reject it
   * @method _dataChannelWRQHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelWRQHandler = function (peerID, data, self) {
    var itemID = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var name = data[2];
    var binarySize = parseInt(data[3], 10);
    var expectedSize = parseInt(data[4], 10);
    var timeout = parseInt(data[5], 10);
    var sendDataTransfer = this._debug || confirm('Do you want to receive "' + name + '" ?');

    if (sendDataTransfer) {
      self._downloadDataTransfers[peerID] = [];
      self._downloadDataSessions[peerID] = {
        itemID: itemID,
        name: name,
        size: binarySize,
        ackN: 0,
        receivedSize: 0,
        chunkSize: expectedSize,
        timeout: timeout
      };
      self._sendDataChannel(peerID, ['ACK', 0, window.webrtcDetectedBrowser.browser]);
      var transferInfo = {
        name : name,
        size : binarySize,
        senderID : peerID
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, itemID, peerID, transferInfo);
    } else {
      self._sendDataChannel(peerID, ['ACK', -1]);
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ACK
   * The user sends a ACK of the request [accept/reject/the current
   * index of chunk to be sent over]
   * @method _dataChannelACKHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelACKHandler = function (peerID, data, self) {
    self._clearDataChannelTimeout(peerID, true, self);

    var ackN = parseInt(data[1], 10);
    var chunksLength = self._uploadDataTransfers[peerID].length;
    var uploadedDetails = self._uploadDataSessions[peerID];
    var itemID = uploadedDetails.itemID;
    var timeout = uploadedDetails.timeout;
    var transferInfo = {};

    console.log('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);

    if (ackN > -1) {
      // Still uploading
      if (ackN < chunksLength) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
          // Load Blob as dataurl base64 string
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(peerID, [base64BinaryString]);
          self._setDataChannelTimeout(peerID, timeout, true, self);
          transferInfo = {
            percentage : (((ackN+1) / chunksLength) * 100).toFixed()
          };
          self._trigger('dataTransferState',
            self.DATA_TRANSFER_STATE.UPLOADING, itemID, peerID, transferInfo);
        };
        fileReader.readAsDataURL(self._uploadDataTransfers[peerID][ackN]);
      } else if (ackN === chunksLength) {
        transferInfo = {
          name : uploadedDetails.name
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, itemID, peerID, transferInfo);
        delete self._uploadDataTransfers[peerID];
        delete self._uploadDataSessions[peerID];
      }
    } else {
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.REJECTED, itemID, peerID);
      delete self._uploadDataTransfers[peerID];
      delete self._uploadDataSessions[peerID];
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: CHAT
   * The user receives a DataChannel CHAT message
   * @method _dataChannelCHATHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelCHATHandler = function (peerID, data) {
    var msgChatType = this._stripNonAlphanumeric(data[1]);
    var msgNick = this._stripNonAlphanumeric(data[2]);
    // Get remaining parts as the message contents.
    // Get the index of the first char of chat content
    //var start = 3 + data.slice(0, 3).join('').length;
    var msgChat = '';
    // Add all char from start to the end of dataStr.
    // This method is to allow '|' to appear in the chat message.
    for( var i = 3; i < data.length; i++ ) {
      msgChat += data[i];
    }
    console.log('API - Got DataChannel Chat Message: ' + msgChat + '.');
    console.log('API - Got a ' + msgChatType + ' chat msg from ' +
      peerID + ' (' + msgNick + ').' );

    var chatDisplay = '[DC]: ' + msgChat;
    console.log('CHAT: ' + chatDisplay);
    // Create a msg using event.data, message mid.
    var msg = {
      type: this.SIG_TYPE.CHAT,
      mid: peerID,
      sender: peerID,
      data: chatDisplay
    };
    // For private msg, create a target field with our id.
    if( msgChatType === 'PRIVATE' ) {
      msg.target = this._user.sid;
    }
    this._processSingleMsg(msg);
  };

  /**
   * DataChannel TFTP Protocol Stage: ERROR
   * The user received an error, usually an exceeded timeout.
   * @method _dataChannelERRORHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelERRORHandler = function (peerID, data, self) {
    var isUploader = data[2];
    var itemID = (isUploader) ? self._uploadDataSessions[peerID].itemID :
      self._downloadDataSessions[peerID].itemID;
    var transferInfo = {
      message : data[1],
      type : ((isUploader) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD)
    };
    self._clearDataChannelTimeout(peerID, isUploader, self);
    self._trigger('dataTransferState',
      self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
  };

  /**
   * DataChannel TFTP Protocol Stage: DATA
   * This is when the data is sent from the sender to the receiving user
   * @method _dataChannelDATAHandler
   * @param {String} peerID
   * @param {} dataString
   * @param {String} dataType [Rel: Skyway.DATA_TRANSFER_DATA_TYPE]
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelDATAHandler = function (peerID, dataString, dataType, self) {
    var chunk, transferInfo = {};
    self._clearDataChannelTimeout(peerID, false, self);
    var transferStatus = self._downloadDataSessions[peerID];
    var itemID = transferStatus.itemID;

    if(dataType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      chunk = self._base64ToBlob(dataString);
    } else if(dataType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      chunk = new Blob(dataString);
    } else if(dataType === self.DATA_TRANSFER_DATA_TYPE.BLOB) {
      chunk = dataString;
    } else {
      transferInfo = {
        message : 'Unhandled data exception: ' + dataType,
        type : self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      console.error('API - ' + transferInfo.message);
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      return;
    }
    var receivedSize = (chunk.size * (4/3));
    console.log('API - DataChannel [' + peerID + ']: Chunk size: ' + chunk.size);

    if (transferStatus.chunkSize >= receivedSize) {
      self._downloadDataTransfers[peerID].push(chunk);
      transferStatus.ackN += 1;
      transferStatus.receivedSize += receivedSize;
      var totalReceivedSize = transferStatus.receivedSize;
      var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

      self._sendDataChannel(peerID, ['ACK',
        transferStatus.ackN, self._user.sid
      ]);

      if (transferStatus.chunkSize === receivedSize) {
        transferInfo = {
          percentage : percentage
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOADING, itemID, peerID, transferInfo);
        self._setDataChannelTimeout(peerID, transferStatus.timeout, false, self);
        self._downloadDataTransfers[peerID].info = transferStatus;
      } else {
        var blob = new Blob(self._downloadDataTransfers[peerID]);
        transferInfo = {
          data : URL.createObjectURL(blob)
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, itemID, peerID, transferInfo);
        delete self._downloadDataTransfers[peerID];
        delete self._downloadDataSessions[peerID];
      }
    } else {
      transferInfo = {
        message : 'Packet not match - [Received]' +
          receivedSize + ' / [Expected]' + transferStatus.chunkSize,
        type : self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      console.error('API - DataChannel [' + peerID + ']: ' + transferInfo.message);
    }
  };

  /**
   * Set the DataChannel timeout. If exceeded, send the 'ERROR' message
   * @method _setDataChannelTimeout
   * @param {String} peerID
   * @param {Integer} timeout - no of seconds to timeout
   * @param {Boolean} isSender
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._setDataChannelTimeout = function(peerID, timeout, isSender, self) {
    if (!self._dataTransfersTimeout[peerID]) {
      self._dataTransfersTimeout[peerID] = {};
    }
    var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
      self.DATA_TRANSFER_TYPE.DOWNLOAD;
    self._dataTransfersTimeout[peerID][type] = setTimeout(function () {
      if (self._dataTransfersTimeout[peerID][type]) {
        if (isSender) {
          delete self._uploadDataTransfers[peerID];
          delete self._uploadDataSessions[peerID];
        } else {
          delete self._downloadDataTransfers[peerID];
          delete self._downloadDataSessions[peerID];
        }
        self._sendDataChannel(peerID, ['ERROR',
          'Connection Timeout. Longer than ' + timeout + ' seconds. Connection is abolished.',
          isSender
        ]);
        self._clearDataChannelTimeout(peerID, isSender, self);
      }
    }, 1000 * timeout);
  };

  /**
   * Clear the DataChannel timeout as a response is received
   * NOTE: Leticia - I keep getting repeated Timeout alerts. Anyway to stop this?
   * @method _clearDataChannelTimeout
   * @param {String} peerID
   * @param {Boolean} isSender
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._clearDataChannelTimeout = function(peerID, isSender, self) {
    if (self._dataTransfersTimeout[peerID]) {
      var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD;
      clearTimeout(self._dataTransfersTimeout[peerID][type]);
      delete self._dataTransfersTimeout[peerID][type];
    }
  };

  /**
   * Convert base64 to raw binary data held in a string.
   * Doesn't handle URLEncoded DataURIs
   * - see SO answer #6850276 for code that does this
   * This is to convert the base64 binary string to a blob
   * @author Code from devnull69 @ stackoverflow.com
   * @method _base64ToBlob
   * @param {String} dataURL
   * @private
   * @beta
   */
  Skyway.prototype._base64ToBlob = function (dataURL) {
    var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
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
   * To chunk the File (which already is a blob) into smaller blob files.
   * For now please send files below or around 2KB till chunking is implemented
   * @method _chunkFile
   * @param {Blob} blob
   * @param {Integer} blobByteSize
   * @private
   */
  Skyway.prototype._chunkFile = function (blob, blobByteSize) {
    var chunksArray = [], startCount = 0, endCount = 0;
    if(blobByteSize > this._chunkFileSize) {
      // File Size greater than Chunk size
      while((blobByteSize - 1) > endCount) {
        endCount = startCount + this._chunkFileSize;
        chunksArray.push(blob.slice(startCount, endCount));
        startCount += this._chunkFileSize;
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
   * Removes non-alphanumeric characters from a string and return it.
   * @method _stripNonAlphanumeric
   * @param {String} str String to check.
   * @return {String} strOut Updated string from non-alphanumeric characters
   * @private
   */
  Skyway.prototype._stripNonAlphanumeric = function (str) {
    var strOut = '';
    for (var i = 0; i < str.length; i++) {
      var curChar = str[i];
      console.log(i + ':' + curChar + '.');
      if (!this._alphanumeric(curChar)) {
        // If not alphanumeric, do not add to final string.
        console.log('API - Not alphanumeric, not adding.');
      } else {
        // If alphanumeric, add it to final string.
        console.log('API - Alphanumeric, so adding.');
        strOut += curChar;
      }
      console.log('API - strOut: ' + strOut + '.');
    }
    return strOut;
  };

  /**
   * Check if a text string consist of only alphanumeric characters.
   * If so, return true.
   * If not, return false.
   * @method _alphanumeric
   * @param {String} str String to check.
   * @return {Boolean} isAlphaNumeric
   * @private
   */
  Skyway.prototype._alphanumeric = function (str) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if(str.match(letterNumber)) {
      return true;
    }
    return false;
  };

  /**
   * Method to send Blob data to peers
   * @method sendBlobData
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} dataInfo.name Name of the Blob Data. Could be filename
   * @param {String} dataInfo.size Size of the Blob Data.
   * @param {String} dataInfo.timeout Timeout used for receiving response in seconds.
   *   Default is 60 seconds.
   * @param {String} targetPeerID The specific peer to send to.
   * @protected
   */
  Skyway.prototype.sendBlobData = function(data, dataInfo, targetPeerID) {
    if (!data && !dataInfo) {
      return false;
    }
    var noOfPeersSent = 0;
    dataInfo.timeout = dataInfo.timeout || 60;
    dataInfo.itemID = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var transferInfo = {};

    if (targetPeerID) {
      if (this._dataChannels.hasOwnProperty(targetPeerID)) {
        this._sendBlobDataToPeer(data, dataInfo, targetPeerID);
        noOfPeersSent = 1;
      } else {
        console.log('API - DataChannel [' + targetPeerID + '] does not exists' );
      }
    } else {
      targetPeerID = this._user.sid;
      for (var peerID in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerID)) {
          // Binary String filesize [Formula n = 4/3]
          this._sendBlobDataToPeer(data, dataInfo, peerID);
          noOfPeersSent++;
        } else {
          console.log('API - DataChannel [' + peerID + '] does not exists' );
        }
      }
    }
    if (noOfPeersSent > 0) {
      transferInfo = {
        itemID : dataInfo.itemID,
        senderID : this._user.sid,
        name : dataInfo.name,
        size : dataInfo.size,
        data : URL.createObjectURL(data)
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.UPLOAD_STARTED, dataInfo.itemID, targetPeerID, transferInfo);
    } else {
      transferInfo = {
        message : 'No available DataChannels to send Blob data',
        type : this.DATA_TRANSFER_TYPE.UPLOAD
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, itemID, targetPeerID, transferInfo);
      console.log('API - ' + transferInfo.message);
      this._uploadDataTransfers = {};
      this._uploadDataSessions = {};
    }
  };

  /**
   * Method to send Blob data to peers
   * @method _sendBlobDataToPeer
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} itemID The ID of the item to send
   * @param {String} peerID
   * @private
   */
  Skyway.prototype._sendBlobDataToPeer = function(data, dataInfo, peerID) {
    var binarySize = (dataInfo.size * (4/3)).toFixed();
    var chunkSize = (this._chunkFileSize * (4/3)).toFixed();
    if (window.webrtcDetectedBrowser.browser === 'Firefox' &&
      window.webrtcDetectedBrowser.version < 30) {
      chunkSize = this._mozChunkFileSize;
    }
    this._uploadDataTransfers[peerID] = this._chunkFile(data, dataInfo.size);
    this._uploadDataSessions[peerID] = {
      name: dataInfo.name,
      size: binarySize,
      itemID: dataInfo.itemID,
      timeout: dataInfo.timeout
    };
    this._sendDataChannel(peerID, ['WRQ',
      window.webrtcDetectedBrowser.browser,
      dataInfo.name, binarySize, chunkSize, dataInfo.timeout
    ]);
    this._setDataChannelTimeout(peerID, dataInfo.timeout, true, this);
  };

  /**
   * Handle the Lock actions
   * @method _handleLock
   * @protected
   */
  Skyway.prototype._handleLock = function (lockAction) {
    var self = this;
    var url = self._serverPath + 'rest/room/lock';
    var params = {
      api: self._appKey,
      rid: self._roomName,
      start: self._room.start,
      len: self._room.len,
      cred: self._room.token,
      action: lockAction,
      end: (new Date((new Date(self._room.start))
             .getTime() + (self._room.len * 60 * 60 * 1000))).toISOString()
    };
    self._requestServerInfo('POST', url, function (status, response) {
      if (status !== 200) {
        self._trigger('lockRoom', false, null, 'Request failed!');
        return;
      }
      console.info(response);
      if (response.status) {
        self._trigger('lockRoom', true, response.content.lock);
        if (lockAction !== self.LOCK_ACTION.STATUS) {
          self._sendMessage({
            type : self.SIG_TYPE.ROOM_LOCK,
            mid : self._user.sid,
            rid : self._room.id,
            lock : response.content.lock
          });
        }
      } else {
        self._trigger('lockRoom', false, null, response.message);
      }
    }, params);
  };

  /**
   * Lock the Room to prevent users from coming in
   * @method lockRoom
   * @protected
   * @beta
   */
  Skyway.prototype.lockRoom = function () {
    this._handleLock(this.LOCK_ACTION.LOCK);
  };

  /**
   * Unlock the Room to allow users to come in
   * @method unlockRoom
   * @protected
   * @beta
   */
  Skyway.prototype.unlockRoom = function () {
    this._handleLock(this.LOCK_ACTION.UNLOCK);
  };

  /**
   * Restart the joinRoom process to initiate Audio and Video
   * @method _restartAV
   * @param {JSON} options
   * @param {Boolean} options.audio
   * @param {Boolean} options.video
   * @protected
   * @beta
   */
  Skyway.prototype._restartAV = function (options) {
    t.leaveRoom();
    var audioConstraint = options.audio || this._streamSettings.audio;
    audioConstraint = (audioConstraint && this._streamSettings.stereo) ?
      { stereo: true } : audioConstraint;
    var videoConstraint = options.video || this._streamSettings.video;
    if (videoConstraint && typeof this._streamSettings.video === 'object') {
      videoConstraint = {};
      var constraint = this._streamSettings.video;
      var width = this.VIDEO_RESOLUTION.VGA.width;
      var height = this.VIDEO_RESOLUTION.VGA.height;
      var frameRate;
      if (constraint.mandatory) {
        width = constraint.mandatory.minWidth || width;
        height = constraint.mandatory.minHeight || height;
      }
      if (constraint.optional instanceof Array) {
        if (typeof constraint.optional[0] === 'object') {
          frameRate = constraint.optional[0].minFrameRate;
        }
      }
      videoConstraint.res = {
        width: width,
        height: height
      };
      videoConstraint.frameRate = frameRate;
    }
    t.joinRoom({
      audio: audioConstraint,
      video: videoConstraint
    });
  };

  /**
   * Enable Microphone. If Microphone is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method enableAudio
   * @protected
   */
  Skyway.prototype.enableAudio = function () {
    var hasAudioTracks = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        for (var track in this._user.streams[stream].audioTracks) {
          if (this._user.streams[stream].audioTracks.hasOwnProperty(track)) {
            this._user.streams[stream].audioTracks[track].enabled = true;
            hasAudioTracks = true;
          }
        }
      }
    }
    if (!hasAudioTracks) {
      this._restartAV({ audio: true });
    }
  };

  /**
   * Disable Microphone. If Microphone is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method disableAudio
   * @protected
   */
  Skyway.prototype.disableAudio = function () {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        for (var track in this._user.streams[stream].audioTracks) {
          if (this._user.streams[stream].audioTracks.hasOwnProperty(track)) {
            this._user.streams[stream].audioTracks[track].enabled = false;
          }
        }
      }
    }
  };

  /**
   * Enable Webcam Video. If Webcam Video is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method enableVideo
   * @protected
   */
  Skyway.prototype.enableVideo = function () {
    var hasVideoTracks = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        for (var track in this._user.streams[stream].videoTracks) {
          if (this._user.streams[stream].videoTracks.hasOwnProperty(track)) {
            this._user.streams[stream].videoTracks[track].enabled = true;
            hasVideoTracks = true;
          }
        }
      }
    }
    if (!hasVideoTracks) {
      this._restartAV({ video: true });
    }
  };

  /**
   * Disable Webcam Video. If Webcam Video is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method disableVideo
   * @protected
   */
  Skyway.prototype.disableVideo = function () {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        for (var track in this._user.streams[stream].videoTracks) {
          if (this._user.streams[stream].videoTracks.hasOwnProperty(track)) {
            this._user.streams[stream].videoTracks[track].enabled = false;
          }
        }
      }
    }
  };

  /**
   * Parse Stream settings
   * @method toggleVideo
   * @param {JSON} options
   * @protected
   */
  Skyway.prototype._parseStreamSettings = function (options) {
    options = options || {};
    this._streamSettings.bandwidth = options.bandwidth || {};
    // Check typeof options.video
    if (typeof options.video === 'object') {
      if (typeof options.video.res === 'object') {
        var width = options.video.res.width;
        var height = options.video.res.height;
        var frameRate = (typeof options.video.frameRate === 'number') ?
          options.video.frameRate : 50;
        if (!width || !height) {
          this._streamSettings.video = true;
        } else {
          this._streamSettings.video = {
            mandatory : {
              minWidth: width,
              minHeight: height
            },
            optional : [{ minFrameRate: frameRate }]
          };
        }
      }
    } else {
      options.video = (typeof options.video === 'boolean') ?
        options.video : true;
    }
    // Check typeof options.audio
    if (typeof options.audio === 'object') {
      this._streamSettings.audio = true;
      this._streamSettings.stereo = (typeof options.audio.stereo === 'boolean') ?
        options.audio.stereo : false;
    } else {
      options.audio = (typeof options.audio === 'boolean') ?
        options.audio : true;
    }
  };

  /**
   * User to join the Room
   * @method joinRoom
   * @param {JSON} options
   * @param {} options.audio This call requires audio
   * @param {Boolean} options.audio.stereo Enabled stereo or not
   * @param {} options.video This call requires video
   * @param {String} options.video.res [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.res.width Video width
   * @param {Integer} options.video.res.height Video height
   * @param {Integer} options.video.frameRate Mininum frameRate of Video
   * @param {String} options.bandwidth Bandwidth settings
   * @param {String} options.bandwidth.audio Audio Bandwidth
   * @param {String} options.bandwidth.video Video Bandwidth
   * @param {String} options.bandwidth.data Data Bandwidth
   * @protected
   */
  Skyway.prototype.joinRoom = function (options) {
    if (this._in_room) {
      return;
    }
    var self = this;
    self._waitForMediaStream(function () {
      var _sendJoinRoomMsg = function () {
        self.off('channelOpen', _sendJoinRoomMsg);
        console.log('API - Joining room: ' + self._room.id);
        self._sendMessage({
          type : self.SIG_TYPE.JOIN_ROOM,
          uid : self._user.id,
          cid : self._key,
          rid : self._room.id,
          userCred : self._user.token,
          timeStamp : self._user.timeStamp,
          apiOwner : self._user.apiOwner,
          roomCred : self._room.token,
          start : self._room.start,
          len : self._room.len
        });
        // self._user.peer = self._createPeerConnection(self._user.sid);
      };
      if (!self._channel_open) {
        self.on('channelOpen', _sendJoinRoomMsg);
        self._openChannel();
      } else {
        _sendJoinRoomMsg();
      }
    }, options);
  };

  /**
   * @method leaveRoom
   * @protected
   */
  Skyway.prototype.leaveRoom = function () {
    if (!this._in_room) {
      return;
    }
    for (var pc_index in this._peerConnections) {
      if (this._peerConnections.hasOwnProperty(pc_index)) {
        this._removePeer(pc_index);
      }
    }
    this._in_room = false;
    this._closeChannel();
  };
}).call(this);/**
 *
 * @class Skyway
 */
(function () {
  /**
   * Call 'init()' to initialize Skyway
   * @class Skyway
   * @constructor
   */
  function Skyway() {
    if (!(this instanceof Skyway)) {
      return new Skyway();
    }
    /**
     * Version of Skyway
     * @attribute VERSION
     * @readOnly
     */
    this.VERSION = '0.3.0';
    /**
     * ICE Connection States. States that would occur are:
     * - STARTING     : ICE Connection to Peer initialized
     * - CLOSED       : ICE Connection to Peer has been closed
     * - FAILED       : ICE Connection to Peer has failed
     * - CHECKING     : ICE Connection to Peer is still in checking status
     * - DISCONNECTED : ICE Connection to Peer has been disconnected
     * - CONNECTED    : ICE Connection to Peer has been connected
     * - COMPLETED    : ICE Connection to Peer has been completed
     * @attribute ICE_CONNECTION_STATE
     * @readOnly
     */
    this.ICE_CONNECTION_STATE = {
      STARTING : 'starting',
      CHECKING : 'checking',
      CONNECTED : 'connected',
      COMPLETED : 'completed',
      CLOSED : 'closed',
      FAILED : 'failed',
      DISCONNECTED : 'disconnected'
    };
    /**
     * Peer Connection States. States that would occur are:
     * - STABLE               :	Initial stage. No local or remote description is applied
     * - HAVE_LOCAL_OFFER     :	"Offer" local description is applied
     * - HAVE_REMOTE_OFFER    : "Offer" remote description is applied
     * - HAVE_LOCAL_PRANSWER  : "Answer" local description is applied
     * - HAVE_REMOTE_PRANSWER : "Answer" remote description is applied
     * - ESTABLISHED          : All description is set and is applied
     * - CLOSED               : Connection closed.
     * @attribute PEER_CONNECTION_STATE
     * @readOnly
     */
    this.PEER_CONNECTION_STATE = {
      STABLE : 'stable',
      HAVE_LOCAL_OFFER : 'have-local-offer',
      HAVE_REMOTE_OFFER : 'have-remote-offer',
      HAVE_LOCAL_PRANSWER : 'have-local-pranswer',
      HAVE_REMOTE_PRANSWER : 'have-remote-pranswer',
      ESTABLISHED : 'established',
      CLOSED : 'closed'
    };
    /**
     * ICE Candidate Generation States. States that would occur are:
     * - GATHERING : ICE Gathering to Peer has just started
     * - DONE      : ICE Gathering to Peer has been completed
     * @attribute CANDIDATE_GENERATION_STATE
     * @readOnly
     */
    this.CANDIDATE_GENERATION_STATE = {
      GATHERING : 'gathering',
      DONE : 'done'
    };
    /**
     * Handshake Progress Steps. Steps that would occur are:
     * - ENTER   : Step 1. Received enter from Peer
     * - WELCOME : Step 2. Received welcome from Peer
     * - OFFER   : Step 3. Received offer from Peer
     * - ANSWER  : Step 4. Received answer from Peer
     * @attribute HANDSHAKE_PROGRESS
     * @readOnly
     */
    this.HANDSHAKE_PROGRESS = {
      ENTER : 'enter',
      WELCOME : 'welcome',
      OFFER : 'offer',
      ANSWER : 'answer'
    };
    /**
     * Data Channel Connection States. Steps that would occur are:
     * - NEW        : Step 1. DataChannel has been created.
     * - LOADED     : Step 2. DataChannel events has been loaded.
     * - OPEN       : Step 3. DataChannel is connected. [WebRTC Standard]
     * - CONNECTING : DataChannel is connecting. [WebRTC Standard]
     * - CLOSING    : DataChannel is closing. [WebRTC Standard]
     * - CLOSED     : DataChannel has been closed. [WebRTC Standard]
     * - ERROR      : DataChannel has an error ocurring.
     * @attribute DATA_CHANNEL_STATE
     * @readOnly
     */
    this.DATA_CHANNEL_STATE = {
      CONNECTING : 'connecting',
      OPEN   : 'open',
      CLOSING : 'closing',
      CLOSED : 'closed',
      NEW    : 'new',
      LOADED : 'loaded',
      ERROR  : 'error'
    };
    /**
     * System actions received from Signaling server. System action outcomes are:
     * - WARNING : System is warning user that the room is closing
     * - REJECT  : System has rejected user from room
     * - CLOSED  : System has closed the room
     * @attribute SYSTEM_ACTION
     * @readOnly
     */
    this.SYSTEM_ACTION = {
      WARNING : 'warning',
      REJECT : 'reject',
      CLOSED : 'close'
    };
    /**
     * State to check if Skyway initialization is ready. Steps that would occur are:
     * - INIT      : Step 1. Init state. If ReadyState fails, it goes to 0.
     * - LOADING   : Step 2. RTCPeerConnection exists. Roomserver, API ID provided is not empty
     * - COMPLETED : Step 3. Retrieval of configuration is complete. Socket.io begins connection.
     * - ERROR     : Error state. Occurs when ReadyState fails loading.
     * - API_ERROR  : API Error state. This occurs when provided APP ID or Roomserver is invalid.
     * - NO_SOCKET_ERROR         : No Socket.IO was loaded state.
     * - NO_XMLHTTPREQUEST_ERROR : XMLHttpRequest is not available in user's PC
     * - NO_WEBRTC_ERROR         : Browser does not support WebRTC error.
     * - NO_PATH_ERROR           : No path provided in init error.
     * @attribute DATA_CHANNEL_STATE
     * @readOnly
     */
    this.READY_STATE_CHANGE = {
      INIT : 0,
      LOADING : 1,
      COMPLETED : 2,
      ERROR :  -1,
      API_ERROR : -2,
      NO_SOCKET_ERROR : -3,
      NO_XMLHTTPREQUEST_ERROR : -4,
      NO_WEBRTC_ERROR : -5,
      NO_PATH_ERROR : -6
    };
    /**
     * Data Channel Transfer Type. Types are
     * - UPLOAD    : Error occurs at UPLOAD state
     * - DOWNLOAD  : Error occurs at DOWNLOAD state
     * @attribute DATA_TRANSFER_TYPE
     * @readOnly
     */
    this.DATA_TRANSFER_TYPE = {
      UPLOAD : 'upload',
      DOWNLOAD : 'download'
    };
    /**
     * Data Channel Transfer State. State that would occur are:
     * - UPLOAD_STARTED     : Data Transfer of Upload has just started
     * - DOWNLOAD_STARTED   : Data Transfer od Download has just started
     * - REJECTED           : Peer rejected User's Data Transfer request
     * - ERROR              : Error occurred when uploading or downloading file
     * - UPLOADING          : Data is uploading
     * - DOWNLOADING        : Data is downloading
     * - UPLOAD_COMPLETED   : Data Transfer of Upload has completed
     * - DOWNLOAD_COMPLETED : Data Transfer of Download has completed
     * @attribute DATA_TRANSFER_STATE
     * @readOnly
     */
    this.DATA_TRANSFER_STATE = {
      UPLOAD_STARTED : 'uploadStarted',
      DOWNLOAD_STARTED : 'downloadStarted',
      REJECTED : 'rejected',
      ERROR : 'error',
      UPLOADING : 'uploading',
      DOWNLOADING : 'downloading',
      UPLOAD_COMPLETED : 'uploadCompleted',
      DOWNLOAD_COMPLETED : 'downloadCompleted'
    };
    /**
     * TODO : ArrayBuffer and Blob in DataChannel
     * Data Channel Transfer Data type. Data Types are:
     * - BINARY_STRING : BinaryString data
     * - ARRAY_BUFFER  : ArrayBuffer data
     * - BLOB         : Blob data
     * @attribute DATA_TRANSFER_DATA_TYPE
     * @readOnly
     */
    this.DATA_TRANSFER_DATA_TYPE = {
      BINARY_STRING : 'binaryString',
      ARRAY_BUFFER : 'arrayBuffer',
      BLOB : 'blob'
    };
    /**
     * Signaling message type. These message types are fixed.
     * (Legend: S - Send only. R - Received only. SR - Can be Both).
     * Signaling types are:
     * - JOIN_ROOM : S. Join the Room
     * - IN_ROOM : R. User has already joined the Room
     * - ENTER : SR. Enter from handshake
     * - WELCOME : SR. Welcome from handshake
     * - OFFER : SR. Offer from handshake
     * - ANSWER : SR. Answer from handshake
     * - CANDIDATE : SR. Candidate received
     * - BYE : R. Peer left the room
     * - CHAT : SR. Chat message relaying
     * - REDIRECT : R. Server redirecting User
     * - ERROR : R. Server occuring an error
     * - INVITE : SR. TODO.
     * - UPDATE_USER : SR. Update of User information
     * - ROOM_LOCK : SR. Locking of Room
     * - MUTE_VIDEO : SR. Muting of User's video
     * - MUTE_AUDIO : SR. Muting of User's audio
     * - PUBLIC_MSG : SR. Sending a public broadcast message.
     * - PRIVATE_MSG : SR. Sending a private message
     * @attribute SIG_TYPE
     * @readOnly
     * @private
     */
    this.SIG_TYPE = {
      JOIN_ROOM : 'joinRoom',
      IN_ROOM : 'inRoom',
      ENTER : this.HANDSHAKE_PROGRESS.ENTER,
      WELCOME : this.HANDSHAKE_PROGRESS.WELCOME,
      OFFER : this.HANDSHAKE_PROGRESS.OFFER,
      ANSWER : this.HANDSHAKE_PROGRESS.ANSWER,
      CANDIDATE : 'candidate',
      BYE : 'bye',
      CHAT : 'chat',
      REDIRECT : 'redirect',
      ERROR : 'error',
      INVITE : 'invite',
      UPDATE_USER : 'updateUserEvent',
      ROOM_LOCK : 'roomLockEvent',
      MUTE_VIDEO : 'muteVideoEvent',
      MUTE_AUDIO : 'muteAudioEvent',
      PUBLIC_MSG : 'public',
      PRIVATE_MSG : 'private'
    };
    /**
     * Lock Action States
     * - LOCK   : Lock the room
     * - UNLOCK : Unlock the room
     * - STATUS : Get the status of the room if it's locked or not
     * @attribute LOCK_ACTION
     * @readOnly
     */
    this.LOCK_ACTION = {
      LOCK : 'lock',
      UNLOCK : 'unlock',
      STATUS : 'check'
    };
    /**
     * Video Resolutions. Resolution types are:
     * - QVGA: Width: 320 x Height: 180
     * - VGA : Width: 640 x Height: 360
     * - HD: Width: 320 x Height: 180
     * @attribute VIDEO_RESOLUTION
     * @readOnly
     */
    this.VIDEO_RESOLUTION = {
      QVGA: { width: 320, height: 180 },
      VGA: { width: 640, height: 360 },
      HD: { width: 1280, height: 720 },
      FHD: { width: 1920, height: 1080 } // Please check support
    };
    /**
     * NOTE ALEX: check if last char is '/'
     * @attribute _path
     * @type String
     * @default _serverPath
     * @final
     * @required
     * @private
     */
    this._path = null;
    /**
     * Url Skyway makes API calls to
     * @attribute _serverPath
     * @type String
     * @final
     * @required
     * @private
     */
    this._serverPath = '//api.temasys.com.sg/';
    /**
     * The Application Key ID
     * @attribute _appKey
     * @type String
     * @private
     */
    this._appKey = null;
    /**
     * The Room name
     * @attribute _roomName
     * @type String
     * @private
     */
    this._roomName = null;
    /**
     * The API key
     * @attribute _key
     * @type String
     * @private
     */
    this._key = null;
    /**
     * The actual socket that handle the connection
     * @attribute _socket
     * @required
     * @private
     */
    this._socket = null;
    /**
     * The socket version of the socket.io used
     * @attribute _socketVersion
     * @private
     */
    this._socketVersion = null;
    /**
     * User Information, credential and the local stream(s).
     * @attribute _user
     * @type JSON
     * @required
     * @private
     *
     * @param {String} id User Session ID
     * @param {RTCPeerConnection} peer PeerConnection object
     * @param {String} sid User Secret Session ID
     * @param {String} displayName Deprecated. User display name
     * @param {String} apiOwner Owner of the room
     * @param {Array} streams Array of User's MediaStream
     * @param {String} timestamp User's timestamp
     * @param {String} token User access token
     * @param {JSON} info Optional. User information
     */
    this._user = null;
    /**
     * @attribute _room
     * @type JSON
     * @required
     * @private
     *
     * @param {} room  Room Information, and credentials.
     * @param {String} room.id
     * @param {String} room.token
     * @param {String} room.tokenTimestamp
     * @param {String} room.displayName Displayed name
     * @param {JSON} room.signalingServer
     * @param {String} room.signalingServer.ip
     * @param {String} room.signalingServer.port
     * @param {JSON} room.pcHelper Holder for all the constraints objects used
     *   in a peerconnection lifetime. Some are initialized by default, some are initialized by
     *   internal methods, all can be overriden through updateUser. Future APIs will help user
     * modifying specific parts (audio only, video only, ...) separately without knowing the
     * intricacies of constraints.
     * @param {JSON} room.pcHelper.pcConstraints
     * @param {JSON} room.pcHelper.pcConfig Will be provided upon connection to a room
     * @param {JSON}  [room.pcHelper.pcConfig.mandatory]
     * @param {Array} [room.pcHelper.pcConfig.optional]
     *   Ex: [{DtlsSrtpKeyAgreement: true}]
     * @param {JSON} room.pcHelper.offerConstraints
     * @param {JSON} [room.pcHelper.offerConstraints.mandatory]
     *   Ex: {MozDontOfferDataChannel:true}
     * @param {Array} [room.pcHelper.offerConstraints.optional]
     * @param {JSON} room.pcHelper.sdpConstraints
     * @param {JSON} [room.pcHelper.sdpConstraints.mandatory]
     *   Ex: { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }
     * @param {Array} [room.pcHelper.sdpConstraints.optional]
     */
    this._room = null;
    /**
     * Internal array of peerconnections
     * @attribute _peerConnections
     * @required
     * @private
     */
    this._peerConnections = [];
    /**
     * Internal array of peer informations
     * @attribute _peerInformations
     * @private
     * @required
     */
    this._peerInformations = [];
    /**
     * Internal array of dataChannels
     * @attribute _dataChannels
     * @private
     * @required
     */
    this._dataChannels = [];
    /**
     * Internal array of dataChannel peers
     * @attribute _dataChannelPeers
     * @private
     * @required
     */
    this._dataChannelPeers = [];
    /**
     * The current ReadyState
     * 0 'false or failed', 1 'in process', 2 'done'
     * @attribute _readyState
     * @private
     * @required
     */
    this._readyState = 0;
    /**
     * State if Channel is opened or not
     * @attribute _channel_open
     * @private
     * @required
     */
    this._channel_open = false;
    /**
     * State if User is in room or not
     * @attribute _in_room
     * @private
     * @required
     */
    this._in_room = false;
    /**
     * State if room is locked or not
     * @attribute _room_lock
     * @private
     * @required
     */
    this._room_lock = false;
    /**
     * State if self audio is mute or not
     * @attribute _audio_mute
     * @private
     * @required
     */
    this._audio_mute = false;
    /**
     * State if self video is mute or not
     * @attribute _video_mute
     * @private
     * @required
     */
    this._video_mute = false;
    /**
     * Stores the upload data chunks
     * @attribute _uploadDataTransfers
     * @private
     * @required
     */
    this._uploadDataTransfers = {};
    /**
     * Stores the upload data session information
     * @attribute _uploadDataSessions
     * @private
     * @required
     */
    this._uploadDataSessions = {};
    /**
     * Stores the download data chunks
     * @attribute _downloadDataTransfers
     * @private
     * @required
     */
    this._downloadDataTransfers = {};
    /**
     * Stores the download data session information
     * @attribute _downloadDataSessions
     * @private
     * @required
     */
    this._downloadDataSessions = {};
    /**
     * Stores the data transfers timeout
     * @attribute _dataTransfersTimeout
     * @private
     * @required
     */
    this._dataTransfersTimeout = {};
    /**
     * Standard File Size of each chunk
     * @attribute _chunkFileSize
     * @private
     * @final
     * @required
     */
    this._chunkFileSize = 49152; // [25KB because Plugin] 60 KB Limit | 4 KB for info
    /**
     * Standard File Size of each chunk for Firefox
     * @attribute _mozChunkFileSize
     * @private
     * @final
     * @required
     */
    this._mozChunkFileSize = 16384; // Firefox the sender chunks 49152 but receives as 16384
    /**
     * If ICE trickle should be disabled or not
     * @attribute _enableIceTrickle
     * @private
     * @required
     */
    this._enableIceTrickle = true;
    /**
     * Skyway in debug mode
     * @attribute _debug
     * @protected
     */
    this._debug = false;
    /**
     * User stream settings
     * @attribute _streamSettings
     * @private
     */
    this._streamSettings = {
      audio: true,
      video: true
    };
    /**
     * Get information from server
     * @attribute _requestServerInfo
     * @type function
     * @private
     *
     * @param {String} method HTTP Method
     * @param {String} url Path url to make request to
     * @param {Function} callback Callback function after request is laoded
     * @param {JSON} params HTTP Params
     */
    this._requestServerInfo = function (method, url, callback, params) {
      var xhr = new window.XMLHttpRequest();
      console.log('XHR - Fetching infos from webserver');
      xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          console.log('XHR - Got infos from webserver.');
          if (this.status !== 200) {
            console.log('XHR - ERROR ' + this.status, false);
          }
          callback(this.status, JSON.parse(this.response || '{}'));
        }
      };
      xhr.open(method, url, true);
      if (params) {
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(params));
      } else {
        xhr.send();
      }
    };
     /**
     * Parse information from server
     * @attribute _parseInfo
     * @type function
     * @private
     * @required
     *
     * @param {JSON} info Parsed Information from the server
     * @param {} self Skyway object
     */
    this._parseInfo = function (info, self) {
      console.log(info);

      if (!info.pc_constraints && !info.offer_constraints) {
        self._trigger('readyStateChange', this.READY_STATE_CHANGE.API_ERROR);
        return;
      }
      console.log(JSON.parse(info.pc_constraints));
      console.log(JSON.parse(info.offer_constraints));

      self._key = info.cid;
      self._user = {
        id        : info.username,
        token     : info.userCred,
        timeStamp : info.timeStamp,
        displayName : info.displayName,
        apiOwner : info.apiOwner,
        streams : []
      };
      self._room = {
        id : info.room_key,
        token : info.roomCred,
        start: info.start,
        len: info.len,
        signalingServer : {
          ip : info.ipSigserver,
          port : info.portSigserver,
          protocol: info.protocol
        },
        pcHelper : {
          pcConstraints : JSON.parse(info.pc_constraints),
          pcConfig : null,
          offerConstraints : JSON.parse(info.offer_constraints),
          sdpConstraints : {
            mandatory : {
              OfferToReceiveAudio : true,
              OfferToReceiveVideo : true
            }
          }
        }
      };
      self._readyState = 2;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.COMPLETED);
      console.info('API - Parsed infos from webserver. Ready.');
    };
    /**
     * NOTE: Changed from _init to _loadInfo to prevent confusion
     * Load information from server
     * @attribute _loadInfo
     * @type function
     * @private
     * @required
     *
     * @param {} self Skyway object
     */
    this._loadInfo = function (self) {
      if (!window.io) {
        console.error('API - Socket.io not loaded.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_SOCKET_ERROR);
        return;
      }
      if (!window.XMLHttpRequest) {
        console.error('XHR - XMLHttpRequest not supported');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_XMLHTTPREQUEST_ERROR);
        return;
      }
      if (!window.RTCPeerConnection) {
        console.error('RTC - WebRTC not supported.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_WEBRTC_ERROR);
        return;
      }
      if (!this._path) {
        console.error('API - No connection info. Call init() first.');
        self._trigger('readyStateChange', self.READY_STATE_CHANGE.NO_PATH_ERROR);
        return;
      }

      self._readyState = 1;
      self._trigger('readyStateChange', self.READY_STATE_CHANGE.LOADING);
      self._requestServerInfo('GET', self._path, function (status, response) {
        if (status !== 200) {
          self._readyState = 0;
          self._trigger('readyStateChange', self.READY_STATE_CHANGE.ERROR);
          return;
        }
        console.info(response);
        self._parseInfo(response, self);
      });
      console.log('API - Waiting for webserver to provide infos.');
    };
  }
  this.Skyway = Skyway;
  /**
   * Let app register a callback function to an event
   * @method on
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.on = function (eventName, callback) {
    if ('function' === typeof callback) {
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    }
  };

  /**
   * Let app unregister a callback function from an event
   * @method off
   * @param {String} eventName
   * @param {Function} callback
   */
  Skyway.prototype.off = function (eventName, callback) {
    if (callback === undefined) {
      this._events[eventName] = [];
      return;
    }
    var arr = this._events[eventName], l = arr.length;
    for (var i = 0; i < l; i++) {
      if (arr[i] === callback) {
        arr.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Trigger all the callbacks associated with an event
   * Note that extra arguments can be passed to the callback
   * which extra argument can be expected by callback is documented by each event
   * @method _trigger
   * @param {String} eventName
   * @for Skyway
   * @private
   */
  Skyway.prototype._trigger = function (eventName) {
    var args = Array.prototype.slice.call(arguments),
    arr = this._events[eventName];
    args.shift();
    for (var e in arr) {
      if (arr[e].apply(this, args) === false) {
        break;
      }
    }
  };

  /**
   * IMPORTANT: Please call this method to load all server information before joining
   * the room or doing anything else.
   * The Init function to load Skyway.
   * @method init
   * @param {} options Connection options or appID [init('APP_ID')]
   * @param {String} options.roomserver Optional. Path to the Temasys backend server
   * @param {String} options.appID AppID to identify with the Temasys backend server
   * @param {String} options.room Optional. The Roomname.
   *   If there's no room provided, default room would be used.
   * @param {String} options.region Optional. The regional server that user chooses to use.
   *   Default server: US.
   * Servers:
   * - sg : Singapore server
   * - us1 : USA server 1. Default server if region is not provided.
   * - us2 : USA server 2
   * - eu : Europe server
   * @param {String} options.iceTrickle Optional. The option to enable iceTrickle or not.
   *   Default is true.
   * @param {String} options.credentials Optional. Credentials options
   * @param {String} options.credentials.startDateTime The Start timing of the
   *   meeting in Date ISO String
   * @param {Integer} options.credentials.duration The duration of the meeting
   * @param {String} options.credentials.credentials The credentials required
   *   to set the timing and duration of a meeting.
   * Steps to generate the credentials:
   * - Hash: This hash is created by
   *   using the roomname, duration and the timestamp (in ISO String format).
   * - E.g: hash = CryptoJS.HmacSHA1(roomname + '_' + duration + '_' +
   *   (new Date()).toISOString()).
   * - Credentials: The credentials is generated by converting the hash to a
   *   Base64 string and then encoding it to a URI string.
   * - E.g: encodeURIComponent(hash.toString(CryptoJS.enc.Base64))
   * @for Skyway
   * @required
   */
  Skyway.prototype.init = function (options) {
    var appID, room, startDateTime, duration, credentials;
    var roomserver = this._serverPath;
    var region = 'us1';
    var iceTrickle = true;

    if (typeof options === 'string') {
      appID = options;
      room = 'app-1';
    } else {
      appID = options.appID;
      roomserver = options.roomserver || roomserver;
      roomserver = (roomserver.lastIndexOf('/') !==
        (roomserver.length - 1)) ? (roomserver += '/')
        : roomserver;
      region = options.region || region;
      room = options.room || appID;
      iceTrickle = (typeof options.iceTrickle !== undefined) ?
        options.iceTrickle : iceTrickle;
      // Custom default meeting timing and duration
      // Fallback to default if no duration or startDateTime provided
      if (options.credentials) {
        startDateTime = options.credentials.startDateTime ||
          (new Date()).toISOString();
        duration = options.credentials.duration || 200;
        credentials = options.credentials.credentials;
      }
    }
    this._readyState = 0;
    this._trigger('readyStateChange', this.READY_STATE_CHANGE.INIT);
    this._appKey = appID;
    this._roomName = room;
    console.info('ICE Trickle: ' + options.iceTrickle);
    this._enableIceTrickle = iceTrickle;
    this._path = roomserver + 'api/' + appID + '/' + room;
    this._path += (credentials) ? ('/' + startDateTime + '/' +
      duration + '?&cred=' + credentials) : '';
    this._path += ((this._path.indexOf('?&') > -1) ?
      '&' : '?&') + 'rg=' + region;
    console.log('API - Path: ' + this._path);
    this._loadInfo(this);
  };

  /**
   * Allow Developers to set Skyway in Debug mode.
   * @method setUser
   * @param {Boolean} debug
   * @protected
   */
  Skyway.prototype.setDebug = function (debug) {
    this._debug = debug;
  };

  /**
   * Set and Update the User information
   * @method setUser
   * @param {JSON} userInfo User information set by User
   * @protected
   */
  Skyway.prototype.setUser = function (userInfo) {
    // NOTE ALEX: be smarter and copy fields and only if different
    var self = this;
    if (userInfo) {
      self._user.info = userInfo || self._user.info || {};
    }
    if (self._user._init) {
      // Prevent multiple messages at the same time
      setTimeout(function () {
        self._sendMessage({
          type : 'updateUserEvent',
          mid : self._user.sid,
          rid : self._room.id,
          userInfo : self._user.info
        });
      }, 1000);
    } else {
      self._user._init = true;
    }
  };

  /**
   * Get the User Information
   * @method getUser
   * @return {JSON} userInfo User information
   * @protected
   */
  Skyway.prototype.getUser = function () {
    return this._user.info;
  };

  /**
   * Get the Peer Information
   * @method getPeer
   * @param {String} peerID
   * @return {JSON} peerInfo Peer information
   * @protected
   */
  Skyway.prototype.getPeer = function (peerID) {
    if (!peerID) {
      return;
    }
    return this._peerInformations[peerID];
  };

  /* Syntactically private variables and utility functions */
  Skyway.prototype._events = {
    /**
     * Event fired when a successfull connection channel has been established
     * with the signaling server
     * @event channelOpen
     */
    'channelOpen' : [],
    /**
     * Event fired when the channel has been closed.
     * @event channelClose
     */
    'channelClose' : [],
    /**
     * Event fired when we received a message from the sig server..
     * @event channelMessage
     * @param {JSON} msg
     */
    'channelMessage' : [],
    /**
     * Event fired when there was an error with the connection channel to the sig server.
     * @event channelError
     * @param {String} error
     */
    'channelError' : [],
    /**
     * Event fired when user joins the room
     * @event joinedRoom
     * @param {String} roomID
     * @param {String} userID
     */
    'joinedRoom' : [],
    /**
     * Event fired whether the room is ready for use
     * @event readyStateChange
     * @param {String} readyState [Rel: Skyway.READY_STATE_CHANGE]
     */
    'readyStateChange' : [],
    /**
     * Event fired when a step of the handshake has happened. Usefull for diagnostic
     * or progress bar.
     * @event handshakeProgress
     * @param {String} step [Rel: Skyway.HANDSHAKE_PROGRESS]
     * @param {String} peerID
     */
    'handshakeProgress' : [],
    /**
     * Event fired during ICE gathering
     * @event candidateGenerationState
     * @param {String} state [Rel: Skyway.CANDIDATE_GENERATION_STATE]
     * @param {String} peerID
     */
    'candidateGenerationState' : [],
    /**
     * Event fired during Peer Connection state change
     * @event peerConnectionState
     * @param {String} state [Rel: Skyway.PEER_CONNECTION_STATE]
     */
    'peerConnectionState' : [],
    /**
     * Event fired during ICE connection
     * @iceConnectionState
     * @param {String} state [Rel: Skyway.ICE_CONNECTION_STATE]
     * @param {String} peerID
     */
    'iceConnectionState' : [],
    //-- per peer, local media events
    /**
     * Event fired when allowing webcam media stream fails
     * @event mediaAccessError
     * @param {String} error
     */
    'mediaAccessError' : [],
    /**
     * Event fired when allowing webcam media stream passes
     * @event mediaAccessSuccess
     * @param {Object} stream
     */
    'mediaAccessSuccess' : [],
    /**
     * Event fired when a chat message is received from other peers
     * @event chatMessage
     * @param {String}  msg
     * @param {String}  senderID
     * @param {Boolean} pvt
     */
    'chatMessage' : [],
    /**
     * Event fired when a peer joins the room
     * @event peerJoined
     * @param {String} peerID
     */
    'peerJoined' : [],
    /**
     * TODO Event fired when a peer leaves the room
     * @event peerLeft
     * @param {String} peerID
     */
    'peerLeft' : [],
    /**
     * TODO Event fired when a peer joins the room
     * @event presenceChanged
     * @param {JSON} users The list of users
     */
    'presenceChanged' : [],
    /**
     * TODO Event fired when a room is locked
     * @event roomLock
     * @param {Boolean} isLocked
     * @private
     */
    'roomLock' : [],

    //-- per peer, peer connection events
    /**
     * Event fired when a remote stream has become available
     * @event addPeerStream
     * @param {String} peerID
     * @param {Object} stream
     */
    'addPeerStream' : [],
    /**
     * Event fired when a remote stream has become unavailable
     * @event removePeerStream
     * @param {String} peerID
     */
    'removePeerStream' : [],
    /**
     * TODO Event fired when a peer's video is muted
     * @event peerVideoMute
     * @param {String} peerID
     * @param {Boolean} isMuted
     * @private
     *
     */
    'peerVideoMute' : [],
    /**
     * TODO Event fired when a peer's audio is muted
     * @param {String} peerID
     * @param {Boolean} isMuted
     * @private
     */
    'peerAudioMute' : [],
    //-- per user events
    /**
     * TODO Event fired when a contact is added
     * @param {String} userID
     * @private
     */
    'addContact' : [],
    /**
     * TODO Event fired when a contact is removed
     * @param {String} userID
     * @private
     */
    'removeContact' : [],
    /**
     * TODO Event fired when a contact is invited
     * @param {String} userID
     * @private
     */
    'invitePeer' : [],
    /**
     * Event fired when a DataChannel's state has changed
     * @event dataChannelState
     * @param {String} state [Rel: Skyway.DATA_CHANNEL_STATE]
     * @param {String} peerID
     */
    'dataChannelState' : [],
    /**
     * Event fired when a Peer there is a Data Transfer going on
     * @event dataTransferState
     * @param {String} state [Rel: Skyway.DATA_TRANSFER_STATE]
     * @param {String} itemID ID of the Data Transfer
     * @param {String} peerID Peer's ID
     * @param {JSON} transferInfo. Available data may vary at different state.
     * - percentage : The percetange of data being uploaded / downloaded
     * - senderID   : The sender Peer's ID
     * - data       : Blob data URL
     * - name       : Data name
     * - size       : Data size
     * - message    : Error message
     * - type       : Where the error message occurred. [Rel: Skyway.DATA_TRANSFER_TYPE]
     */
    'dataTransferState' : [],
    /**
     * Event fired when the Signalling server responds to user regarding
     * the state of the room
     * @event systemAction
     * @param {String} action [Rel: Skyway.SYSTEM_ACTION]
     * @param {String} message The reason of the action
    */
    'systemAction' : [],
    /**
     * Event fired based on what user has set for specific users
     * @event privateMessage
     * @param {JSON/String} data Data to be sent over
     * @param {String} senderID Sender
     * @param {String} peerID Targeted Peer to receive the data
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'privateMessage' : [],
    /**
     * Event fired based on what user has set for all users
     * @event publicMessage
     * @param {JSON/String} data
     * @param {String} senderID Sender
     * @param {Boolean} isSelf Check if message is sent to self
     */
    'publicMessage' : [],
    /**
     * Event fired based on when Peer Information is updated
     * @event
     * @param {JSON} userInfo
     * @param {String} peerID
     */
    'updatedUser' : [],
    /**
     * Event fired based on when toggleLock is called
     * @event
     * @param {JSON} success
     * @param {Boolean} Room lock status. If error, it returns null
     * @param {String} Error message
     */
    'lockRoom' : []
  };

  /**
   * Send a chat message
   * @method sendChatMsg
   * @param {String} chatMsg
   * @param {String} targetPeerID
   */
  Skyway.prototype.sendChatMsg = function (chatMsg, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : chatMsg,
      mid : this._user.sid,
      sender: this._user.sid,
      rid : this._room.id,
      type : this.SIG_TYPE.CHAT
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    this._sendMessage(msg_json);
    this._trigger('chatMessage', chatMsg, this._user.sid, !!targetPeerID);
  };

  /**
   * Send a chat message via DataChannel
   * @method sendDataChannelChatMsg
   * @param {String} chatMsg
   * @param {String} targetPeerID
   */
  Skyway.prototype.sendDataChannelChatMsg = function (chatMsg, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : chatMsg,
      mid : this._user.sid,
      sender: this._user.sid,
      rid : this._room.id,
      type : this.SIG_TYPE.CHAT
    };
    if (targetPeerID) {
      msg_json.target = targetPeerID;
    }
    if (targetPeerID) {
      if (this._dataChannels.hasOwnProperty(targetPeerID)) {
        this._sendDataChannel(targetPeerID, ['CHAT', 'PRIVATE', this._user.sid, chatMsg]);
      }
    } else {
      for (var peerID in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerID)) {
          this._sendDataChannel(peerID, ['CHAT', 'GROUP', this._user.sid, chatMsg]);
        }
      }
    }
    this._trigger('chatMessage', chatMsg, this._user.sid, !!targetPeerID);
  };

  /**
   * Send a private message
   * @method sendPrivateMsg
   * @param {JSON}   data
   * @param {String} targetPeerID
   * @protected
   */
  Skyway.prototype.sendPrivateMsg = function (data, targetPeerID) {
    var msg_json = {
      cid : this._key,
      data : data,
      mid : this._user.sid,
      rid : this._room.id,
      sender : this._user.sid,
      target: ((targetPeerID) ? targetPeerID : this._user.sid),
      type : this.SIG_TYPE.PRIVATE_MSG
    };
    this._sendMessage(msg_json);
    this._trigger('privateMessage', data, this._user.sid, targetPeerID, true);
  };

  /**
   * Send a public broadcast message
   * @method sendPublicMsg
   * @param {JSON}   data
   * @protected
   */
  Skyway.prototype.sendPublicMsg = function (data) {
    var msg_json = {
      cid : this._key,
      data : data,
      mid : this._user.sid,
      sender : this._user.sid,
      rid : this._room.id,
      type : this.SIG_TYPE.PUBLIC_MSG
    };
    this._sendMessage(msg_json);
    this._trigger('publicMessage', data, this._user.sid, true);
  };

  /**
   * Get the default cam and microphone
   * @method getDefaultStream
   * @param {JSON} options
   * @param {Boolean} options.audio
   * @param {Boolean} options.video
   * @param {JSON} mediaSettings
   * @param {Integer} mediaSettings.width Video width
   * @param {Integer} mediaSettings.height Video height
   * @param {String} res [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} mediaSettings.frameRate Mininum frameRate of Video
   */
  Skyway.prototype.getDefaultStream = function (options) {
    var self = this;
    self._parseStreamSettings(options);
    try {
      window.getUserMedia({
        audio: self._streamSettings.audio,
        video: self._streamSettings.video
      }, function (s) {
        self._onUserMediaSuccess(s, self);
      }, function (e) {
        self._onUserMediaError(e, self);
      });
      console.log('API [MediaStream] - Requested ' +
        ((self._streamSettings.audio) ? 'A' : '') +
        ((self._streamSettings.audio &&
          self._streamSettings.video) ? '/' : '') +
        ((self._streamSettings.video) ? 'V' : ''));
    } catch (e) {
      this._onUserMediaError(e, self);
    }
  };

  /**
   * Stream is available, let's throw the corresponding event with the stream attached.
   * @method _onUserMediaSuccess
   * @param {MediaStream} stream The acquired stream
   * @param {} self   A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaSuccess = function (stream, self) {
    console.log('API - User has granted access to local media.');
    self._trigger('mediaAccessSuccess', stream);
    self._user.streams[stream.id] = stream;
  };

  /**
   * getUserMedia could not succeed.
   * @method _onUserMediaError
   * @param {} e error
   * @param {} self A convenience pointer to the Skyway object for callbacks
   * @private
   */
  Skyway.prototype._onUserMediaError = function (e, self) {
    console.log('API - getUserMedia failed with exception type: ' + e.name);
    if (e.message) {
      console.log('API - getUserMedia failed with exception: ' + e.message);
    }
    if (e.constraintName) {
      console.log('API - getUserMedia failed because of the following constraint: ' +
        e.constraintName);
    }
    self._trigger('mediaAccessError', (e.name || e));
  };

  /**
   * Handle every incoming message. If it's a bundle, extract single messages
   * Eventually handle the message(s) to _processSingleMsg
   * @method _processingSigMsg
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._processSigMsg = function (message) {
    var msg = JSON.parse(message);
    if (msg.type === 'group') {
      console.log('API - Bundle of ' + msg.lists.length + ' messages.');
      for (var i = 0; i < msg.lists.length; i++) {
        this._processSingleMsg(msg.lists[i]);
      }
    } else {
      this._processSingleMsg(msg);
    }
  };

  /**
   * This dispatch all the messages from the infrastructure to their respective handler
   * @method _processingSingleMsg
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._processSingleMsg = function (msg) {
    this._trigger('channelMessage', msg);
    var origin = msg.mid;
    if (!origin || origin === this._user.sid) {
      origin = 'Server';
    }
    console.log('API - [' + origin + '] Incoming message: ' + msg.type);
    if (msg.mid === this._user.sid &&
      msg.type !== this.SIG_TYPE.REDIRECT &&
      msg.type !== this.SIG_TYPE.IN_ROOM &&
      msg.type !== this.SIG_TYPE.CHAT) {
      console.log('API - Ignoring message: ' + msg.type + '.');
      return;
    }
    switch (msg.type) {
    //--- BASIC API Msgs ----
    case this.SIG_TYPE.PUBLIC_MSG:
      this._privateMsgHandler(msg);
      break;
    case this.SIG_TYPE.PRIVATE_MSG:
      this._privateMsgHandler(msg);
      break;
    case this.SIG_TYPE.IN_ROOM:
      this._inRoomHandler(msg);
      break;
    case this.SIG_TYPE.ENTER:
      this._enterHandler(msg);
      break;
    case this.SIG_TYPE.WELCOME:
      this._welcomeHandler(msg);
      break;
    case this.SIG_TYPE.OFFER:
      this._offerHandler(msg);
      break;
    case this.SIG_TYPE.ANSWER:
      this._answerHandler(msg);
      break;
    case this.SIG_TYPE.CANDIDATE:
      this._candidateHandler(msg);
      break;
    case this.SIG_TYPE.BYE:
      this._byeHandler(msg);
      break;
    case this.SIG_TYPE.CHAT:
      this._chatHandler(msg);
      break;
    case this.SIG_TYPE.REDIRECT:
      this._redirectHandler(msg);
      break;
    case this.SIG_TYPE.ERROR:
      // this._errorHandler(msg);
      // location.href = '/?error=' + msg.kind;
      break;
      //--- ADVANCED API Msgs ----
    case this.SIG_TYPE.UPDATE_USER:
      this._updateUserEventHandler(msg);
      break;
    case this.SIG_TYPE.MUTE_VIDEO:
      console.info(msg);
      console.info(this._test);
      //this._muteVideoEventHandler(msg);
      break;
    case this.SIG_TYPE.MUTE_AUDIO:
      console.info(msg);
      console.info(this._muteAudioEventHandler);
      //this._muteAudioEventHandler(msg);
      break;
    case this.SIG_TYPE.ROOM_LOCK:
      this._roomLockEventHandler(msg);
      break;
    case this.SIG_TYPE.INVITE:
      // this._inviteHandler();
      break;
    default:
      console.log('API - [' + msg.mid + '] Unsupported message type received: ' + msg.type);
      break;
    }
  };

  /**
   * Throw an event with the received chat msg
   * @method _chatHandler
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.nick
   * @private
   */
  Skyway.prototype._chatHandler = function (msg) {
    this._trigger('chatMessage', msg.data, msg.sender, (msg.target ? true : false));
  };

  /**
   * Signaling server wants us to move out.
   * @method _redirectHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._redirectHandler = function (msg) {
    console.log('API - [Server] You are being redirected: ' + msg.info);
    this._trigger('systemAction', msg.action, msg.info);
  };

  /**
   * User Information is updated
   * @method _updateUserEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._updateUserEventHandler = function (msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'updateUserEvent\'.');
    console.info(msg);
    this._peerInformations[targetMid] = msg.userInfo || {};
    this._trigger('updatedUser', msg.userInfo || {}, targetMid);
  };

  /**
   * Room Lock is Fired
   * @method _roomLockEventHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._roomLockEventHandler = function (msg) {
    this._trigger('lockRoom', true, msg.lock);
  };

  /**
   * A peer left, let's clean the corresponding connection, and trigger an event.
   * @method _byeHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._byeHandler = function (msg) {
    var targetMid = msg.mid;
    console.log('API - [' + targetMid + '] received \'bye\'.');
    this._removePeer(targetMid);
  };

  /**
   * Throw an event with the received private msg
   * @method _privateMsgHandler
   * @param {JSON} msg
   * @param {String} msg.data
   * @param {String} msg.sender
   * @param {String} msg.target
   * @private
   */
  Skyway.prototype._privateMsgHandler = function (msg) {
    this._trigger('privateMessage', msg.data, msg.sender, msg.target, false);
  };

  /**
   * Throw an event with the received private msg
   * @method _publicMsgHandler
   * @param {JSON} msg
   * @param {String} msg.sender
   * @param {JSON/String} msg.data
   * @private
   */
  Skyway.prototype._publicMsgHandler = function (msg) {
    this._trigger('publicMessage', msg.data, msg.sender, false);
  };

  /**
   * Actually clean the peerconnection and trigger an event. Can be called by _byHandler
   * and leaveRoom.
   * @method _removePeer
   * @param {String} peerID Id of the peer to remove
   * @private
   */
  Skyway.prototype._removePeer = function (peerID) {
    this._trigger('peerLeft', peerID);
    if (this._peerConnections[peerID]) {
      this._peerConnections[peerID].close();
    }
    delete this._peerConnections[peerID];
  };

  /**
   * We just joined a room! Let's send a nice message to all to let them know I'm in.
   * @method _inRoomHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._inRoomHandler = function (msg) {
    console.log('API - We\'re in the room! Chat functionalities are now available.');
    console.log('API - We\'ve been given the following PC Constraint by the sig server: ');
    console.dir(msg.pc_config);

    this._room.pcHelper.pcConfig = this._setFirefoxIceServers(msg.pc_config);
    this._in_room = true;
    this._user.sid = msg.sid;
    this._trigger('joinedRoom', this._room.id, this._user.sid);

    // NOTE ALEX: should we wait for local streams?
    // or just go with what we have (if no stream, then one way?)
    // do we hardcode the logic here, or give the flexibility?
    // It would be better to separate, do we could choose with whom
    // we want to communicate, instead of connecting automatically to all.
    var self = this;
    console.log('API - Sending enter.');
    self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER);
    self._sendMessage({
      type : self.SIG_TYPE.ENTER,
      mid : self._user.sid,
      rid : self._room.id,
      agent : window.webrtcDetectedBrowser.browser,
      version : window.webrtcDetectedBrowser.version
    });
  };

  /**
   * Someone just entered the room. If we don't have a connection with him/her,
   * send him a welcome. Handshake step 2 and 3.
   * @method _enterHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._enterHandler = function (msg) {
    var targetMid = msg.mid;
    var self = this;
    // need to check entered user is new or not.
    if (!self._peerConnections[targetMid]) {
      msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
      var browserAgent = msg.agent + ((msg.version) ? ('|' + msg.version) : '');
      // should we resend the enter so we can be the offerer?
      checkMediaDataChannelSettings(false, browserAgent, function (beOfferer) {
        self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.ENTER, targetMid);
        var params = {
          type : ((beOfferer) ? self.SIG_TYPE.ENTER : self.SIG_TYPE.WELCOME),
          mid : self._user.sid,
          rid : self._room.id,
          agent : window.webrtcDetectedBrowser.browser
        };
        if (!beOfferer) {
          console.log('API - [' + targetMid + '] Sending welcome.');
          self._trigger('peerJoined', targetMid);
          self._trigger('handshakeProgress', self.HANDSHAKE_PROGRESS.WELCOME, targetMid);
          params.target = targetMid;
        }
        self._sendMessage(params);
        self.setUser();
      });
    } else {
      // NOTE ALEX: and if we already have a connection when the peer enter,
      // what should we do? what are the possible use case?
      console.log('API - Received "enter" when Peer "' + targetMid +
        '" is already added');
      return;
    }
  };

  /**
   * We have just received a welcome. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._welcomeHandler = function (msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.WELCOME, targetMid);
    this._trigger('peerJoined', targetMid);
    this._enableIceTrickle = (typeof msg.enableIceTrickle !== undefined) ?
      msg.enableIceTrickle : this._enableIceTrickle;
    if (!this._peerConnections[targetMid]) {
      this._openPeer(targetMid, msg.agent, true, msg.receiveOnly);
      this.setUser();
    }
  };

  /**
   * We have just received an offer. If there is no existing connection with this peer,
   * create one, then set the remotedescription and answer.
   * @method _offerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._offerHandler = function (msg) {
    var targetMid = msg.mid;
    msg.agent = (!msg.agent) ? 'Chrome' : msg.agent;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.OFFER, targetMid);
    console.log('Test:');
    console.log(msg);
    var offer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received offer:');
    console.dir(offer);
    var pc = this._peerConnections[targetMid];
    if (!pc) {
      this._openPeer(targetMid, msg.agent, false);
      pc = this._peerConnections[targetMid];
    }
    var self = this;
    pc.setRemoteDescription(new RTCSessionDescription(offer), function () {
      self._doAnswer(targetMid);
    }, function (err) {
      console.error(err);
    });
  };

  /**
   * We have succesfully received an offer and set it locally. This function will take care
   * of cerating and sendng the corresponding answer. Handshake step 4.
   * @method _doAnswer
   * @param {String} targetMid The peer we should connect to.
   * @private
   */
  Skyway.prototype._doAnswer = function (targetMid) {
    console.log('API - [' + targetMid + '] Creating answer.');
    var pc = this._peerConnections[targetMid];
    var self = this;
    if (pc) {
      pc.createAnswer(function (answer) {
        console.log('API - [' + targetMid + '] Created  answer.');
        console.dir(answer);
        self._setLocalAndSendMessage(targetMid, answer);
      }, function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'answer');
      }, self._room.pcHelper.sdpConstraints);
    } else {
      return;
      /* Houston ..*/
    }
  };

  /**
   * Fallback for offer or answer creation failure.
   * @method _onOfferOrAnswerError
   * @param {String} targetMid
   * @param {} error
   * @param {String} type
   * @private
   */
  Skyway.prototype._onOfferOrAnswerError = function (targetMid, error, type) {
    console.log('API - [' + targetMid + '] Failed to create an ' + type +
      '. Error code was ' + JSON.stringify(error));
  };

  /**
   * We have a peer, this creates a peerconnection object to handle the call.
   * if we are the initiator, we then starts the O/A handshake.
   * @method _openPeer
   * @param {String} targetMid The peer we should connect to.
   * @param {String} peerAgentBrowser The peer's browser
   * @param {Boolean} toOffer Wether we should start the O/A or wait.
   * @param {Boolean} receiveOnly Should they only receive?
   * @private
   */
  Skyway.prototype._openPeer = function (targetMid, peerAgentBrowser, toOffer, receiveOnly) {
    console.log('API - [' + targetMid + '] Creating PeerConnection.');
    var self = this;

    self._peerConnections[targetMid] = self._createPeerConnection(targetMid);
    if (!receiveOnly) {
      self._addLocalStream(targetMid);
    }
    // I'm the callee I need to make an offer
    if (toOffer) {
      self._createDataChannel(targetMid, function (dc){
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
        self._doCall(targetMid, peerAgentBrowser);
      });
    }
  };

  /**
   * Sends our Local MediaStream to other Peers.
   * By default, it sends all it's other stream
   * @method _addLocalStream
   * @param {String} peerID
   * @private
   */
  Skyway.prototype._addLocalStream = function (peerID) {
    // NOTE ALEX: here we could do something smarter
    // a mediastream is mainly a container, most of the info
    // are attached to the tracks. We should iterates over track and print
    console.log('API - [' + peerID + '] Adding local stream.');

    if (Object.keys(this._user.streams).length > 0) {
      for (var stream in this._user.streams) {
        if (this._user.streams.hasOwnProperty(stream)) {
          this._peerConnections[peerID].addStream(this._user.streams[stream]);
        }
      }
    } else {
      console.log('API - WARNING - No stream to send. You will be only receiving.');
    }
  };

  /**
   * The remote peer advertised streams, that we are forwarding to the app. This is part
   * of the peerConnection's addRemoteDescription() API's callback.
   * @method _onRemoteStreamAdded
   * @param {String} targetMid
   * @param {Event}  event      This is provided directly by the peerconnection API.
   * @private
   */
  Skyway.prototype._onRemoteStreamAdded = function (targetMid, event) {
    console.log('API - [' + targetMid + '] Remote Stream added.');
    this._trigger('addPeerStream', targetMid, event.stream);
  };

  /**
   * It then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _doCall
   * @param {String} targetMid
   * @private
   */
  Skyway.prototype._doCall = function (targetMid, peerAgentBrowser) {
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var constraints = this._room.pcHelper.offerConstraints;
    var sc = this._room.pcHelper.sdpConstraints;
    for (var name in sc.mandatory) {
      if (sc.mandatory.hasOwnProperty(name)) {
        constraints.mandatory[name] = sc.mandatory[name];
      }
    }
    constraints.optional.concat(sc.optional);
    console.log('API - [' + targetMid + '] Creating offer.');
    var self = this;
    checkMediaDataChannelSettings(true, peerAgentBrowser, function (offerConstraints) {
      pc.createOffer(function (offer) {
        self._setLocalAndSendMessage(targetMid, offer);
      }, function (error) {
        self._onOfferOrAnswerError(targetMid, error, 'offer');
      }, offerConstraints);
    }, constraints);
  };

  /**
   * Find a line in the SDP and return it
   * @method _findSDPLine
   * @param {Array} sdpLines
   * @param {Array} condition
   * @param {String} value Value to set Sdplines to
   * @return {Array} [index, line] Returns the sdpLines based on the condition
   * @private
   * @beta
   */
  Skyway.prototype._findSDPLine = function (sdpLines, condition, value) {
    for (var index in sdpLines) {
      if (sdpLines.hasOwnProperty(index)) {
        for (var c in condition) {
          if (condition.hasOwnProperty(c)) {
            if (sdpLines[index].indexOf(c) === 0) {
              sdpLines[index] = value;
              return [index, sdpLines[index]];
            }
          }
        }
      }
    }
    return [];
  };

   /**
   * Add Stereo to SDP. Requires OPUS
   * @method _addStereo
   * @param {Array} sdpLines
   * @return {Array} sdpLines Updated version with Stereo feature
   * @private
   * @beta
   */
  Skyway.prototype._addStereo = function (sdpLines) {
    var opusLineFound = false, opusPayload = 0;
    // Check if opus exists
    var rtpmapLine = this._findSDPLine(sdpLines, ['a=rtpmap:']);
    if (rtpmapLine.length) {
      if (rtpmapLine[1].split(' ')[1].indexOf('opus/48000/') === 0) {
        opusLineFound = true;
        opusPayload = (rtpmapLine[1].split(' ')[0]).split(':')[1];
      }
    }
    // Find the A=FMTP line with the same payload
    if (opusLineFound) {
      var fmtpLine = this._findSDPLine(sdpLines,
        ['a=fmtp:' + opusPayload]);
      if (fmtpLine.length) {
        sdpLines[fmtpLine[0]] = fmtpLine[1] + '; stereo=1';
      }
    }
    return sdpLines;
  };

  /**
   * Set Audio, Video and Data Bitrate in SDP
   * @method _setSDPBitrate
   * @param {Array} sdpLines
   * @return {Array} sdpLines Updated version with custom Bandwidth settings
   * @private
   * @beta
   */
  Skyway.prototype._setSDPBitrate = function (sdpLines) {
    // Find if user has audioStream
    var bandwidth = this._streamSettings.bandwidth;
    var maLineFound = this._findSDPLine(sdpLines, ['m=', 'a=']).length;
    var cLineFound = this._findSDPLine(sdpLines, ['c=']).length;
    // Find the RTPMAP with Audio Codec
    if (maLineFound && cLineFound) {
      if (bandwidth.audio) {
        var audioLine = this._findSDPLine(sdpLines,
          ['a=mid:audio','m=mid:audio']);
        sdpLines.splice(audioLine[0], 0, 'b=AS:' + bandwidth.audio);
      }
      if (bandwidth.video) {
        var videoLine = this._findSDPLine(sdpLines,
          ['a=mid:video','m=mid:video']);
        sdpLines.splice(videoLine[0], 0, 'b=AS:' + bandwidth.video);
      }
      if (bandwidth.data) {
        var dataLine = this._findSDPLine(sdpLines,
          ['a=mid:data','m=mid:data']);
        sdpLines.splice(dataLine[0], 0, 'b=AS:' + bandwidth.data);
      }
    }
    return sdpLines;
  };

  /**
   * This takes an offer or an aswer generated locally and set it in the peerconnection
   * it then sends it to the peer. Handshake step 3 (offer) or 4 (answer)
   * @method _setLocalAndSendMessage
   * @param {String} targetMid
   * @param {JSON} sessionDescription This should be provided by the peerconnection API.
   *   User might 'tamper' with it, but then , the setLocal may fail.
   * @private
   */
  Skyway.prototype._setLocalAndSendMessage = function (targetMid, sessionDescription) {
    console.log('API - [' + targetMid + '] Created ' + sessionDescription.type + '.');
    console.log(sessionDescription);
    var pc = this._peerConnections[targetMid];
    // NOTE ALEX: handle the pc = 0 case, just to be sure
    var sdpLines = sessionDescription.sdp.split('\r\n');
    if (this._streamSettings.stereo) {
      this._addStereo(sdpLines);
      console.info('API - User has requested Stereo');
    }
    if (this._streamSettings.bandwidth) {
      sdpLines = this._setSDPBitrate(sdpLines, this._streamSettings.bandwidth);
      console.info('API - Custom Bandwidth settings');
      console.info('API - Video: ' + this._streamSettings.bandwidth.video);
      console.info('API - Audio: ' + this._streamSettings.bandwidth.audio);
      console.info('API - Data: ' + this._streamSettings.bandwidth.data);
    }
    sessionDescription.sdp = sdpLines.join('\r\n');

    // NOTE ALEX: opus should not be used for mobile
    // Set Opus as the preferred codec in SDP if Opus is present.
    //sessionDescription.sdp = preferOpus(sessionDescription.sdp);

    // limit bandwidth
    //sessionDescription.sdp = this._limitBandwidth(sessionDescription.sdp);

    console.log('API - [' + targetMid + '] Setting local Description (' +
      sessionDescription.type + ').');

    var self = this;
    pc.setLocalDescription(
      sessionDescription,
      function () {
      console.log('API - [' + targetMid + '] Set ' + sessionDescription.type + '.');
      self._trigger('handshakeProgress', sessionDescription.type, targetMid);
      if (self._enableIceTrickle &&
        sessionDescription.type !== self.HANDSHAKE_PROGRESS.OFFER) {
        console.log('API - [' + targetMid + '] Sending ' + sessionDescription.type + '.');
        self._sendMessage({
          type : sessionDescription.type,
          sdp : sessionDescription.sdp,
          mid : self._user.sid,
          agent : window.webrtcDetectedBrowser.browser,
          target : targetMid,
          rid : self._room.id
        });
      }
    },
      function () {
      console.log('API - [' +
        targetMid + '] There was a problem setting the Local Description.');
    });
  };

  /**
   * This sets the STUN server specially for Firefox for ICE Connection
   * @method _setFirefoxIceServers
   * @param {JSON} config
   * @private
   */
  Skyway.prototype._setFirefoxIceServers = function (config) {
    if (window.webrtcDetectedBrowser.mozWebRTC) {
      // NOTE ALEX: shoul dbe given by the server
      var newIceServers = [{
          'url' : 'stun:stun.services.mozilla.com'
        }
      ];
      for (var i = 0; i < config.iceServers.length; i++) {
        var iceServer = config.iceServers[i];
        var iceServerType = iceServer.url.split(':')[0];
        if (iceServerType === 'stun') {
          if (iceServer.url.indexOf('google')) {
            continue;
          }
          iceServer.url = [iceServer.url];
          newIceServers.push(iceServer);
        } else {
          var newIceServer = {};
          newIceServer.credential = iceServer.credential;
          newIceServer.url = iceServer.url.split(':')[0];
          newIceServer.username = iceServer.url.split(':')[1].split('@')[0];
          newIceServer.url += ':' + iceServer.url.split(':')[1].split('@')[1];
          newIceServers.push(newIceServer);
        }
      }
      config.iceServers = newIceServers;
    }
    return config;
  };

  /**
   * Waits for MediaStream. Once the stream is loaded, callback is called
   * If there's not a need for stream, callback is called
   * @method _waitForMediaStream
   * @param {Function} callback
   * @param {JSON} options
   * @private
   */
  Skyway.prototype._waitForMediaStream = function (callback, options) {
    var self = this;
    if (!options) {
      callback();
      return;
    }
    self.getDefaultStream(options);
    console.log('API - requireVideo: ' +
      ((options.video) ? true : false));
    console.log('API - requireAudio: ' +
      ((options.audio) ? true : false));
    // Loop for stream
    var checkForStream = setInterval(function () {
      for (var stream in self._user.streams) {
        if (self._user.streams.hasOwnProperty(stream)) {
          var audioTracks = self._user.streams[stream].getAudioTracks();
          var videoTracks = self._user.streams[stream].getVideoTracks();
          console.info(stream);
          if (((options.video) ? (videoTracks.length > 0)
            : true) && ((options.audio) ? (audioTracks.length > 0)
            : true)) {
            clearInterval(checkForStream);
            callback();
            break;
          }
        }
      }
    }, 2000);
  };

  /**
   * Create a peerconnection to communicate with the peer whose ID is 'targetMid'.
   * All the peerconnection callbacks are set up here. This is a quite central piece.
   * @method _createPeerConnection
   * @param {String} targetMid
   * @return {RTCPeerConnection} The created peer connection object.
   * @private
   */
  Skyway.prototype._createPeerConnection = function (targetMid) {
    var pc;
    try {
      pc = new window.RTCPeerConnection(
          this._room.pcHelper.pcConfig,
          this._room.pcHelper.pcConstraints);
      console.log(
        'API - [' + targetMid + '] Created PeerConnection.');
      console.log(
        'API - [' + targetMid + '] PC config: ');
      console.dir(this._room.pcHelper.pcConfig);
      console.log(
        'API - [' + targetMid + '] PC constraints: ' +
        JSON.stringify(this._room.pcHelper.pcConstraints));
    } catch (e) {
      console.log('API - [' + targetMid + '] Failed to create PeerConnection: ' + e.message);
      return null;
    }
    // callbacks
    // standard not implemented: onnegotiationneeded,
    var self = this;
    pc.ondatachannel = function (event) {
      var dc = event.channel || event;
      console.log('API - [' + targetMid + '] Received DataChannel -> ' +
        dc.label);
      self._createDataChannel(targetMid, function (dc){
        self._dataChannels[targetMid] = dc;
        self._dataChannelPeers[dc.label] = targetMid;
        self._checkDataChannelStatus(dc);
      }, dc);
    };
    pc.onaddstream = function (event) {
      self._onRemoteStreamAdded(targetMid, event);
    };
    pc.onicecandidate = function (event) {
      console.dir(event);
      self._onIceCandidate(targetMid, event);
    };
    pc.oniceconnectionstatechange = function () {
      checkIceConnectionState(targetMid, pc.iceConnectionState, function (iceConnectionState) {
        console.log('API - [' + targetMid + '] ICE connection state changed -> ' +
          iceConnectionState);
        self._trigger('iceConnectionState', iceConnectionState, targetMid);
      });
    };
    // pc.onremovestream = function () {
    //   self._onRemoteStreamRemoved(targetMid);
    // };
    pc.onsignalingstatechange = function () {
      console.log('API - [' + targetMid + '] PC connection state changed -> ' +
        pc.signalingState);
      var signalingState = pc.signalingState;
      if (pc.signalingState !== self.PEER_CONNECTION_STATE.STABLE &&
        pc.signalingState !== self.PEER_CONNECTION_STATE.CLOSED) {
        pc.hasSetOffer = true;
      } else if (pc.signalingState === self.PEER_CONNECTION_STATE.STABLE &&
        pc.hasSetOffer) {
        signalingState = self.PEER_CONNECTION_STATE.ESTABLISHED;
      }
      self._trigger('peerConnectionState', signalingState, targetMid);
    };
    pc.onicegatheringstatechange = function () {
      console.log('API - [' + targetMid + '] ICE gathering state changed -> ' +
        pc.iceGatheringState);
      self._trigger('candidateGenerationState', pc.iceGatheringState, targetMid);
    };
    return pc;
  };

  /**
   * A candidate has just been generated (ICE gathering) and will be sent to the peer.
   * Part of connection establishment.
   * @method _onIceCandidate
   * @param {String} targetMid
   * @param {Event}  event This is provided directly by the peerconnection API.
   * @private
   */
  Skyway.prototype._onIceCandidate = function (targetMid, event) {
    if (event.candidate) {
      var msgCan = event.candidate.candidate.split(' ');
      var candidateType = msgCan[7];
      console.log('API - [' + targetMid + '] Created and sending ' +
        candidateType + ' candidate.');
      this._sendMessage({
        type : this.SIG_TYPE.CANDIDATE,
        label : event.candidate.sdpMLineIndex,
        id : event.candidate.sdpMid,
        candidate : event.candidate.candidate,
        mid : this._user.sid,
        target : targetMid,
        rid : this._room.id
      });
    } else {
      console.log('API - [' + targetMid + '] End of gathering.');
      this._trigger('candidateGenerationState', this.CANDIDATE_GENERATION_STATE.DONE, targetMid);
      // Disable Ice trickle option
      if (!this._enableIceTrickle) {
        var sessionDescription = this._peerConnections[targetMid].localDescription;
        console.log('API - [' + targetMid + '] Sending offer.');
        this._sendMessage({
          type : sessionDescription.type,
          sdp : sessionDescription.sdp,
          mid : this._user.sid,
          agent : window.webrtcDetectedBrowser.browser,
          target : targetMid,
          rid : this._room.id
        });
      }
    }
  };

  /**
   * Handling reception of a candidate. handshake done, connection ongoing.
   * @method _candidateHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._candidateHandler = function (msg) {
    var targetMid = msg.mid;
    var pc = this._peerConnections[targetMid];
    if (pc) {
      if (pc.iceConnectionState === this.ICE_CONNECTION_STATE.CONNECTED) {
        console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
          'as we are already connected to this peer.');
        return;
      }
      var msgCan = msg.candidate.split(' ');
      var canType = msgCan[7];
      console.log('API - [' + targetMid + '] Received ' + canType + ' Candidate.');
      // if (canType !== 'relay' && canType !== 'srflx') {
      // trace('Skipping non relay and non srflx candidates.');
      var index = msg.label;
      var candidate = new window.RTCIceCandidate({
          sdpMLineIndex : index,
          candidate : msg.candidate
        });
      pc.addIceCandidate(candidate); //,
      // NOTE ALEX: not implemented in chrome yet, need to wait
      // function () { trace('ICE  -  addIceCandidate Succesfull. '); },
      // function (error) { trace('ICE  - AddIceCandidate Failed: ' + error); }
      //);
      console.log('API - [' + targetMid + '] Added Candidate.');
    } else {
      console.log('API - [' + targetMid + '] Received but not adding Candidate ' +
        'as PeerConnection not present.');
      // NOTE ALEX: if the offer was slow, this can happen
      // we might keep a buffer of candidates to replay after receiving an offer.
    }
  };

  /**
   * Handling reception of an answer (to a previous offer). handshake step 4.
   * @method _answerHandler
   * @param {JSON} msg
   * @private
   */
  Skyway.prototype._answerHandler = function (msg) {
    var targetMid = msg.mid;
    this._trigger('handshakeProgress', this.HANDSHAKE_PROGRESS.ANSWER, targetMid);
    var answer = new window.RTCSessionDescription(msg);
    console.log('API - [' + targetMid + '] Received answer:');
    console.dir(answer);
    var pc = this._peerConnections[targetMid];
    pc.setRemoteDescription(new RTCSessionDescription(answer), function () {
      pc.remotePeerReady = true;
    }, function (err) {
      console.error(err);
    });
  };

  /**
   * Send a message to the signaling server
   * @method _sendMessage
   * @param {JSON} message
   * @private
   */
  Skyway.prototype._sendMessage = function (message) {
    if (!this._channel_open) {
      return;
    }
    var msgString = JSON.stringify(message);
    console.log('API - [' + (message.target ? message.target : 'server') +
      '] Outgoing message: ' + message.type);
    this._socket.send(msgString);
  };

  /**
   * @method _openChannel
   * @private
   */
  Skyway.prototype._openChannel = function () {
    var self = this;
    var _openChannelImpl = function (readyState) {
      if (readyState !== 2) {
        return;
      }
      self.off('readyStateChange', _openChannelImpl);
      console.log('API - Opening channel.');
      var ip_signaling = self._room.signalingServer.protocol + '://' +
        self._room.signalingServer.ip + ':' + self._room.signalingServer.port;

      console.log('API - Signaling server URL: ' + ip_signaling);

      if (self._socketVersion >= 1) {
        self._socket = io.connect(ip_signaling, {
          forceNew : true
        });
      } else {
        self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      }

      self._socket = window.io.connect(ip_signaling, {
          'force new connection' : true
        });
      self._socket.on('connect', function () {
        self._channel_open = true;
        self._trigger('channelOpen');
      });
      self._socket.on('error', function (err) {
        console.log('API - Channel Error: ' + err);
        self._channel_open = false;
        self._trigger('channelError', err);
      });
      self._socket.on('disconnect', function () {
        self._trigger('channelClose');
      });
      self._socket.on('message', function (msg) {
        self._processSigMsg(msg);
      });
    };
    if (this._channel_open) {
      return;
    }
    if (this._readyState === 0) {
      this.on('readyStateChange', _openChannelImpl);
      this._loadInfo(this);
    } else {
      _openChannelImpl(2);
    }
  };

  /**
   * @method _closeChannel
   * @private
   */
  Skyway.prototype._closeChannel = function () {
    if (!this._channel_open) {
      return;
    }
    this._socket.disconnect();
    this._socket = null;
    this._channel_open = false;
    this._readyState = 0; // this forces a reinit
  };

  /**
   * Create a DataChannel. Only SCTPDataChannel support
   * @method _createDataChannel
   * @param {String} peerID The PeerID of which the dataChannel is connected to
   * @param {Function} callback The callback which it returns the DataChannel object to
   * @param {RTCDataChannel} dc The DataChannel object passed inside
   * @private
   */
  Skyway.prototype._createDataChannel = function (peerID, callback, dc) {
    var self = this;
    var pc = self._peerConnections[peerID];
    var channel_name = self._user.sid + '_' + peerID;

    if (!dc) {
      if (!webrtcDetectedBrowser.isSCTPDCSupported && !webrtcDetectedBrowser.isPluginSupported) {
        console.warn('API - DataChannel [' + peerID + ']: Does not support SCTP');
      }
      dc = pc.createDataChannel(channel_name);
    } else {
      channel_name = dc.label;
    }
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.NEW, peerID);
    console.log(
      'API - DataChannel [' + peerID + ']: Binary type support is "' + dc.binaryType + '"');
    dc.onerror = function (err) {
      console.error('API - DataChannel [' + peerID + ']: Failed retrieveing DataChannel.');
      console.exception(err);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.ERROR, peerID);
    };
    dc.onclose = function () {
      console.log('API - DataChannel [' + peerID + ']: DataChannel closed.');
      self._closeDataChannel(peerID, self);
      self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.CLOSED, peerID);
    };
    dc.onopen = function () {
      dc.push = dc.send;
      dc.send = function (data) {
        console.log('API - DataChannel [' + peerID + ']: DataChannel is opened.');
        console.log('API - DataChannel [' + peerID + ']: Length : ' + data.length);
        dc.push(data);
      };
    };
    dc.onmessage = function (event) {
      console.log('API - DataChannel [' + peerID + ']: DataChannel message received');
      self._dataChannelHandler(event.data, peerID, self);
    };
    self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.LOADED, peerID);
    callback(dc);
  };

  /**
   * Check DataChannel ReadyState. If ready, it sends a 'CONN'
   * @method _checkDataChannelStatus
   * @param {DataChannel} dc
   * @private
   */
  Skyway.prototype._checkDataChannelStatus = function (dc) {
    var self = this;
    setTimeout(function () {
      console.log('API - DataChannel [' + dc.label +
        ']: Connection Status - ' + dc.readyState);
      var peerID = self._dataChannelPeers[dc.label];
      self._trigger('dataChannelState', dc.readyState, peerID);

      if (dc.readyState === self.DATA_CHANNEL_STATE.OPEN) {
        self._sendDataChannel(peerID, ['CONN', dc.label]);
      }
    }, 500);
  };

  /**
   * Sending of String Data over the DataChannels
   * @method _sendDataChannel
   * @param {String} peerID
   * @param {JSON} data
   * @private
   */
  Skyway.prototype._sendDataChannel = function (peerID, data) {
    var dc = this._dataChannels[peerID];
    if (!dc) {
      console.error('API - DataChannel [' + peerID + ']: No available existing DataChannel');
      return;
    } else {
      if (dc.readyState === this.DATA_CHANNEL_STATE.OPEN) {
        console.log('API - DataChannel [' + peerID + ']: Sending Data from DataChannel');
        try {
          var dataString = '';
          for (var i = 0; i < data.length; i++) {
            dataString += data[i];
            dataString += (i !== (data.length - 1)) ? '|' : '';
          }
          dc.send(dataString);
        } catch (err) {
          console.error('API - DataChannel [' + peerID + ']: Failed executing send on DataChannel');
          console.exception(err);
        }
      } else {
        console.error('API - DataChannel [' + peerID +
          ']: DataChannel is "' + dc.readyState + '"');
      }
    }
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _dataChannelPeer
   * @param {String} channel
   * @param {Skyway} self
   * @private
   * @deprecated
   */
  Skyway.prototype._dataChannelPeer = function (channel, self) {
    return self._dataChannelPeers[channel];
  };

  /**
   * To obtain the Peer that it's connected to from the DataChannel
   * @method _closeDataChannel
   * @param {String} peerID
   * @private
   */
  Skyway.prototype._closeDataChannel = function (peerID, self) {
    var dc = self._dataChannels[peerID];
    if (dc) {
      if (dc.readyState !== self.DATA_CHANNEL_STATE.CLOSED) {
        dc.close();
      }
      delete self._dataChannels[peerID];
      delete self._dataChannelPeers[dc.label];
    }
  };

  /**
   * The Handler for all DataChannel Protocol events
   * @method _dataChannelHandler
   * @param {String} data
   * @private
   */
  Skyway.prototype._dataChannelHandler = function (dataString, peerID, self) {
    // PROTOCOL ESTABLISHMENT
    console.dir(dataString);
    if (typeof dataString === 'string') {
      if (dataString.indexOf('|') > -1 && dataString.indexOf('|') < 6) {
        var data = dataString.split('|');
        var state = data[0];
        console.log('API - DataChannel [' + peerID + ']: Received "' + state + '"');

        switch(state) {
        case 'CONN':
          // CONN - DataChannel Connection has been established
          self._trigger('dataChannelState', self.DATA_CHANNEL_STATE.OPEN, peerID);
          break;
        case 'WRQ':
          // WRQ - Send File Request Received. For receiver to accept or not
          self._dataChannelWRQHandler(peerID, data, self);
          break;
        case 'ACK':
          // ACK - If accepted, send. Else abort
          self._dataChannelACKHandler(peerID, data, self);
          break;
        case 'ERROR':
          // ERROR - Failure in receiving data. Could be timeout
          console.log('API - Received ERROR');
          self._dataChannelERRORHandler(peerID, data, self);
          break;
        case 'CHAT':
          // CHAT - DataChannel Chat
          console.log('API - Received CHAT');
          self._dataChannelCHATHandler(peerID, data, self);
          break;
        default:
          console.log('API - DataChannel [' + peerID + ']: Invalid command');
        }
      } else {
        // DATA - BinaryString base64 received
        console.log('API - DataChannel [' + peerID + ']: Received "DATA"');
        self._dataChannelDATAHandler(peerID, dataString,
          self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING, self);
      }
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: WRQ
   * The sender has sent a request to send file
   * From here, it's up to the user to accept or reject it
   * @method _dataChannelWRQHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelWRQHandler = function (peerID, data, self) {
    var itemID = this._user.sid + this.DATA_TRANSFER_TYPE.DOWNLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var name = data[2];
    var binarySize = parseInt(data[3], 10);
    var expectedSize = parseInt(data[4], 10);
    var timeout = parseInt(data[5], 10);
    var sendDataTransfer = this._debug || confirm('Do you want to receive "' + name + '" ?');

    if (sendDataTransfer) {
      self._downloadDataTransfers[peerID] = [];
      self._downloadDataSessions[peerID] = {
        itemID: itemID,
        name: name,
        size: binarySize,
        ackN: 0,
        receivedSize: 0,
        chunkSize: expectedSize,
        timeout: timeout
      };
      self._sendDataChannel(peerID, ['ACK', 0, window.webrtcDetectedBrowser.browser]);
      var transferInfo = {
        name : name,
        size : binarySize,
        senderID : peerID
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.DOWNLOAD_STARTED, itemID, peerID, transferInfo);
    } else {
      self._sendDataChannel(peerID, ['ACK', -1]);
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: ACK
   * The user sends a ACK of the request [accept/reject/the current
   * index of chunk to be sent over]
   * @method _dataChannelACKHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelACKHandler = function (peerID, data, self) {
    self._clearDataChannelTimeout(peerID, true, self);

    var ackN = parseInt(data[1], 10);
    var chunksLength = self._uploadDataTransfers[peerID].length;
    var uploadedDetails = self._uploadDataSessions[peerID];
    var itemID = uploadedDetails.itemID;
    var timeout = uploadedDetails.timeout;
    var transferInfo = {};

    console.log('API - DataChannel Received "ACK": ' + ackN + ' / ' + chunksLength);

    if (ackN > -1) {
      // Still uploading
      if (ackN < chunksLength) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
          // Load Blob as dataurl base64 string
          var base64BinaryString = fileReader.result.split(',')[1];
          self._sendDataChannel(peerID, [base64BinaryString]);
          self._setDataChannelTimeout(peerID, timeout, true, self);
          transferInfo = {
            percentage : (((ackN+1) / chunksLength) * 100).toFixed()
          };
          self._trigger('dataTransferState',
            self.DATA_TRANSFER_STATE.UPLOADING, itemID, peerID, transferInfo);
        };
        fileReader.readAsDataURL(self._uploadDataTransfers[peerID][ackN]);
      } else if (ackN === chunksLength) {
        transferInfo = {
          name : uploadedDetails.name
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.UPLOAD_COMPLETED, itemID, peerID, transferInfo);
        delete self._uploadDataTransfers[peerID];
        delete self._uploadDataSessions[peerID];
      }
    } else {
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.REJECTED, itemID, peerID);
      delete self._uploadDataTransfers[peerID];
      delete self._uploadDataSessions[peerID];
    }
  };

  /**
   * DataChannel TFTP Protocol Stage: CHAT
   * The user receives a DataChannel CHAT message
   * @method _dataChannelCHATHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelCHATHandler = function (peerID, data) {
    var msgChatType = this._stripNonAlphanumeric(data[1]);
    var msgNick = this._stripNonAlphanumeric(data[2]);
    // Get remaining parts as the message contents.
    // Get the index of the first char of chat content
    //var start = 3 + data.slice(0, 3).join('').length;
    var msgChat = '';
    // Add all char from start to the end of dataStr.
    // This method is to allow '|' to appear in the chat message.
    for( var i = 3; i < data.length; i++ ) {
      msgChat += data[i];
    }
    console.log('API - Got DataChannel Chat Message: ' + msgChat + '.');
    console.log('API - Got a ' + msgChatType + ' chat msg from ' +
      peerID + ' (' + msgNick + ').' );

    var chatDisplay = '[DC]: ' + msgChat;
    console.log('CHAT: ' + chatDisplay);
    // Create a msg using event.data, message mid.
    var msg = {
      type: this.SIG_TYPE.CHAT,
      mid: peerID,
      sender: peerID,
      data: chatDisplay
    };
    // For private msg, create a target field with our id.
    if( msgChatType === 'PRIVATE' ) {
      msg.target = this._user.sid;
    }
    this._processSingleMsg(msg);
  };

  /**
   * DataChannel TFTP Protocol Stage: ERROR
   * The user received an error, usually an exceeded timeout.
   * @method _dataChannelERRORHandler
   * @param {String} peerID
   * @param {Array} data
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelERRORHandler = function (peerID, data, self) {
    var isUploader = data[2];
    var itemID = (isUploader) ? self._uploadDataSessions[peerID].itemID :
      self._downloadDataSessions[peerID].itemID;
    var transferInfo = {
      message : data[1],
      type : ((isUploader) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD)
    };
    self._clearDataChannelTimeout(peerID, isUploader, self);
    self._trigger('dataTransferState',
      self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
  };

  /**
   * DataChannel TFTP Protocol Stage: DATA
   * This is when the data is sent from the sender to the receiving user
   * @method _dataChannelDATAHandler
   * @param {String} peerID
   * @param {} dataString
   * @param {String} dataType [Rel: Skyway.DATA_TRANSFER_DATA_TYPE]
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._dataChannelDATAHandler = function (peerID, dataString, dataType, self) {
    var chunk, transferInfo = {};
    self._clearDataChannelTimeout(peerID, false, self);
    var transferStatus = self._downloadDataSessions[peerID];
    var itemID = transferStatus.itemID;

    if(dataType === self.DATA_TRANSFER_DATA_TYPE.BINARY_STRING) {
      chunk = self._base64ToBlob(dataString);
    } else if(dataType === self.DATA_TRANSFER_DATA_TYPE.ARRAY_BUFFER) {
      chunk = new Blob(dataString);
    } else if(dataType === self.DATA_TRANSFER_DATA_TYPE.BLOB) {
      chunk = dataString;
    } else {
      transferInfo = {
        message : 'Unhandled data exception: ' + dataType,
        type : self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      console.error('API - ' + transferInfo.message);
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      return;
    }
    var receivedSize = (chunk.size * (4/3));
    console.log('API - DataChannel [' + peerID + ']: Chunk size: ' + chunk.size);

    if (transferStatus.chunkSize >= receivedSize) {
      self._downloadDataTransfers[peerID].push(chunk);
      transferStatus.ackN += 1;
      transferStatus.receivedSize += receivedSize;
      var totalReceivedSize = transferStatus.receivedSize;
      var percentage = ((totalReceivedSize / transferStatus.size) * 100).toFixed();

      self._sendDataChannel(peerID, ['ACK',
        transferStatus.ackN, self._user.sid
      ]);

      if (transferStatus.chunkSize === receivedSize) {
        transferInfo = {
          percentage : percentage
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOADING, itemID, peerID, transferInfo);
        self._setDataChannelTimeout(peerID, transferStatus.timeout, false, self);
        self._downloadDataTransfers[peerID].info = transferStatus;
      } else {
        var blob = new Blob(self._downloadDataTransfers[peerID]);
        transferInfo = {
          data : URL.createObjectURL(blob)
        };
        self._trigger('dataTransferState',
          self.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED, itemID, peerID, transferInfo);
        delete self._downloadDataTransfers[peerID];
        delete self._downloadDataSessions[peerID];
      }
    } else {
      transferInfo = {
        message : 'Packet not match - [Received]' +
          receivedSize + ' / [Expected]' + transferStatus.chunkSize,
        type : self.DATA_TRANSFER_TYPE.DOWNLOAD
      };
      self._trigger('dataTransferState',
        self.DATA_TRANSFER_STATE.ERROR, itemID, peerID, transferInfo);
      console.error('API - DataChannel [' + peerID + ']: ' + transferInfo.message);
    }
  };

  /**
   * Set the DataChannel timeout. If exceeded, send the 'ERROR' message
   * @method _setDataChannelTimeout
   * @param {String} peerID
   * @param {Integer} timeout - no of seconds to timeout
   * @param {Boolean} isSender
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._setDataChannelTimeout = function(peerID, timeout, isSender, self) {
    if (!self._dataTransfersTimeout[peerID]) {
      self._dataTransfersTimeout[peerID] = {};
    }
    var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
      self.DATA_TRANSFER_TYPE.DOWNLOAD;
    self._dataTransfersTimeout[peerID][type] = setTimeout(function () {
      if (self._dataTransfersTimeout[peerID][type]) {
        if (isSender) {
          delete self._uploadDataTransfers[peerID];
          delete self._uploadDataSessions[peerID];
        } else {
          delete self._downloadDataTransfers[peerID];
          delete self._downloadDataSessions[peerID];
        }
        self._sendDataChannel(peerID, ['ERROR',
          'Connection Timeout. Longer than ' + timeout + ' seconds. Connection is abolished.',
          isSender
        ]);
        self._clearDataChannelTimeout(peerID, isSender, self);
      }
    }, 1000 * timeout);
  };

  /**
   * Clear the DataChannel timeout as a response is received
   * NOTE: Leticia - I keep getting repeated Timeout alerts. Anyway to stop this?
   * @method _clearDataChannelTimeout
   * @param {String} peerID
   * @param {Boolean} isSender
   * @param {Skyway} self
   * @private
   */
  Skyway.prototype._clearDataChannelTimeout = function(peerID, isSender, self) {
    if (self._dataTransfersTimeout[peerID]) {
      var type = (isSender) ? self.DATA_TRANSFER_TYPE.UPLOAD :
        self.DATA_TRANSFER_TYPE.DOWNLOAD;
      clearTimeout(self._dataTransfersTimeout[peerID][type]);
      delete self._dataTransfersTimeout[peerID][type];
    }
  };

  /**
   * Convert base64 to raw binary data held in a string.
   * Doesn't handle URLEncoded DataURIs
   * - see SO answer #6850276 for code that does this
   * This is to convert the base64 binary string to a blob
   * @author Code from devnull69 @ stackoverflow.com
   * @method _base64ToBlob
   * @param {String} dataURL
   * @private
   * @beta
   */
  Skyway.prototype._base64ToBlob = function (dataURL) {
    var byteString = atob(dataURL.replace(/\s\r\n/g, ''));
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
   * To chunk the File (which already is a blob) into smaller blob files.
   * For now please send files below or around 2KB till chunking is implemented
   * @method _chunkFile
   * @param {Blob} blob
   * @param {Integer} blobByteSize
   * @private
   */
  Skyway.prototype._chunkFile = function (blob, blobByteSize) {
    var chunksArray = [], startCount = 0, endCount = 0;
    if(blobByteSize > this._chunkFileSize) {
      // File Size greater than Chunk size
      while((blobByteSize - 1) > endCount) {
        endCount = startCount + this._chunkFileSize;
        chunksArray.push(blob.slice(startCount, endCount));
        startCount += this._chunkFileSize;
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
   * Removes non-alphanumeric characters from a string and return it.
   * @method _stripNonAlphanumeric
   * @param {String} str String to check.
   * @return {String} strOut Updated string from non-alphanumeric characters
   * @private
   */
  Skyway.prototype._stripNonAlphanumeric = function (str) {
    var strOut = '';
    for (var i = 0; i < str.length; i++) {
      var curChar = str[i];
      console.log(i + ':' + curChar + '.');
      if (!this._alphanumeric(curChar)) {
        // If not alphanumeric, do not add to final string.
        console.log('API - Not alphanumeric, not adding.');
      } else {
        // If alphanumeric, add it to final string.
        console.log('API - Alphanumeric, so adding.');
        strOut += curChar;
      }
      console.log('API - strOut: ' + strOut + '.');
    }
    return strOut;
  };

  /**
   * Check if a text string consist of only alphanumeric characters.
   * If so, return true.
   * If not, return false.
   * @method _alphanumeric
   * @param {String} str String to check.
   * @return {Boolean} isAlphaNumeric
   * @private
   */
  Skyway.prototype._alphanumeric = function (str) {
    var letterNumber = /^[0-9a-zA-Z]+$/;
    if(str.match(letterNumber)) {
      return true;
    }
    return false;
  };

  /**
   * Method to send Blob data to peers
   * @method sendBlobData
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} dataInfo.name Name of the Blob Data. Could be filename
   * @param {String} dataInfo.size Size of the Blob Data.
   * @param {String} dataInfo.timeout Timeout used for receiving response in seconds.
   *   Default is 60 seconds.
   * @param {String} targetPeerID The specific peer to send to.
   * @protected
   */
  Skyway.prototype.sendBlobData = function(data, dataInfo, targetPeerID) {
    if (!data && !dataInfo) {
      return false;
    }
    var noOfPeersSent = 0;
    dataInfo.timeout = dataInfo.timeout || 60;
    dataInfo.itemID = this._user.sid + this.DATA_TRANSFER_TYPE.UPLOAD +
      (((new Date()).toISOString().replace(/-/g, '').replace(/:/g, ''))).replace('.', '');
    var transferInfo = {};

    if (targetPeerID) {
      if (this._dataChannels.hasOwnProperty(targetPeerID)) {
        this._sendBlobDataToPeer(data, dataInfo, targetPeerID);
        noOfPeersSent = 1;
      } else {
        console.log('API - DataChannel [' + targetPeerID + '] does not exists' );
      }
    } else {
      targetPeerID = this._user.sid;
      for (var peerID in this._dataChannels) {
        if (this._dataChannels.hasOwnProperty(peerID)) {
          // Binary String filesize [Formula n = 4/3]
          this._sendBlobDataToPeer(data, dataInfo, peerID);
          noOfPeersSent++;
        } else {
          console.log('API - DataChannel [' + peerID + '] does not exists' );
        }
      }
    }
    if (noOfPeersSent > 0) {
      transferInfo = {
        itemID : dataInfo.itemID,
        senderID : this._user.sid,
        name : dataInfo.name,
        size : dataInfo.size,
        data : URL.createObjectURL(data)
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.UPLOAD_STARTED, dataInfo.itemID, targetPeerID, transferInfo);
    } else {
      transferInfo = {
        message : 'No available DataChannels to send Blob data',
        type : this.DATA_TRANSFER_TYPE.UPLOAD
      };
      this._trigger('dataTransferState',
        this.DATA_TRANSFER_STATE.ERROR, itemID, targetPeerID, transferInfo);
      console.log('API - ' + transferInfo.message);
      this._uploadDataTransfers = {};
      this._uploadDataSessions = {};
    }
  };

  /**
   * Method to send Blob data to peers
   * @method _sendBlobDataToPeer
   * @param {Blob} data - The Blob data to be sent over
   * @param {JSON} dataInfo - The Blob data information
   * @param {String} itemID The ID of the item to send
   * @param {String} peerID
   * @private
   */
  Skyway.prototype._sendBlobDataToPeer = function(data, dataInfo, peerID) {
    var binarySize = (dataInfo.size * (4/3)).toFixed();
    var chunkSize = (this._chunkFileSize * (4/3)).toFixed();
    if (window.webrtcDetectedBrowser.browser === 'Firefox' &&
      window.webrtcDetectedBrowser.version < 30) {
      chunkSize = this._mozChunkFileSize;
    }
    this._uploadDataTransfers[peerID] = this._chunkFile(data, dataInfo.size);
    this._uploadDataSessions[peerID] = {
      name: dataInfo.name,
      size: binarySize,
      itemID: dataInfo.itemID,
      timeout: dataInfo.timeout
    };
    this._sendDataChannel(peerID, ['WRQ',
      window.webrtcDetectedBrowser.browser,
      dataInfo.name, binarySize, chunkSize, dataInfo.timeout
    ]);
    this._setDataChannelTimeout(peerID, dataInfo.timeout, true, this);
  };

  /**
   * Handle the Lock actions
   * @method _handleLock
   * @protected
   */
  Skyway.prototype._handleLock = function (lockAction) {
    var self = this;
    var url = self._serverPath + 'rest/room/lock';
    var params = {
      api: self._appKey,
      rid: self._roomName,
      start: self._room.start,
      len: self._room.len,
      cred: self._room.token,
      action: lockAction,
      end: (new Date((new Date(self._room.start))
             .getTime() + (self._room.len * 60 * 60 * 1000))).toISOString()
    };
    self._requestServerInfo('POST', url, function (status, response) {
      if (status !== 200) {
        self._trigger('lockRoom', false, null, 'Request failed!');
        return;
      }
      console.info(response);
      if (response.status) {
        self._trigger('lockRoom', true, response.content.lock);
        if (lockAction !== self.LOCK_ACTION.STATUS) {
          self._sendMessage({
            type : self.SIG_TYPE.ROOM_LOCK,
            mid : self._user.sid,
            rid : self._room.id,
            lock : response.content.lock
          });
        }
      } else {
        self._trigger('lockRoom', false, null, response.message);
      }
    }, params);
  };

  /**
   * Restart the joinRoom process to initiate Audio and Video
   * @method _handleAV
   * @param {String} mediaType
   * @param {Boolean} isEnabled
   * @param {Boolean} hasMedia
   * @protected
   * @beta
   */
  Skyway.prototype._handleAV = function (mediaType, isEnabled, hasMedia) {
    if (mediaType !== 'audio' && mediaType !== 'video') {
      return;
    }
    this._sendMessage({
      type : ((mediaType === 'audio') ? this.SIG_TYPE.MUTE_AUDIO :
        this.SIG_TYPE.MUTE_VIDEO),
      mid : this._user.sid,
      rid : this._room.id,
      enabled : isEnabled
    });
    if (hasMedia === false) {
      t.leaveRoom();
      t.joinRoom({
        audio: (mediaType === 'audio') ? true :
          this._streamSettings.audio,
        video: (mediaType === 'video') ? true :
          this._streamSettings.video
      });
    }
  };

  /**
   * Lock the Room to prevent users from coming in
   * @method lockRoom
   * @protected
   * @beta
   */
  Skyway.prototype.lockRoom = function () {
    this._handleLock(this.LOCK_ACTION.LOCK);
  };

  /**
   * Unlock the Room to allow users to come in
   * @method unlockRoom
   * @protected
   * @beta
   */
  Skyway.prototype.unlockRoom = function () {
    this._handleLock(this.LOCK_ACTION.UNLOCK);
  };

  /**
   * Enable Microphone. If Microphone is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method enableAudio
   * @protected
   */
  Skyway.prototype.enableAudio = function () {
    var hasAudioTracks = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getAudioTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = true;
            hasAudioTracks = true;
          }
        }
      }
    }
    this._handleAV('audio', true, hasAudioTracks);
  };

  /**
   * Disable Microphone. If Microphone is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method disableAudio
   * @protected
   */
  Skyway.prototype.disableAudio = function () {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getAudioTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = false;
          }
        }
      }
    }
    this._handleAV('audio', false);
  };

  /**
   * Enable Webcam Video. If Webcam Video is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method enableVideo
   * @protected
   */
  Skyway.prototype.enableVideo = function () {
    var hasVideoTracks = false;
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getVideoTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = true;
            hasVideoTracks = true;
          }
        }
      }
    }
    this._handleAV('video', true, hasVideoTracks);
  };

  /**
   * Disable Webcam Video. If Webcam Video is not enabled from the
   * beginning, user would have to reinitate the joinRoom
   * process
   * @method disableVideo
   * @protected
   */
  Skyway.prototype.disableVideo = function () {
    for (var stream in this._user.streams) {
      if (this._user.streams.hasOwnProperty(stream)) {
        var tracks = this._user.streams[stream].getVideoTracks();
        for (var track in tracks) {
          if (tracks.hasOwnProperty(track)) {
            tracks[track].enabled = false;
          }
        }
      }
    }
    this._handleAV('video', false);
  };

  /**
   * Parse Stream settings
   * @method _parseStreamSettings
   * @param {JSON} options
   * @protected
   */
  Skyway.prototype._parseStreamSettings = function (options) {
    options = options || {};
    this._streamSettings.bandwidth = options.bandwidth || {};
    // Check typeof options.video
    if (typeof options.video === 'object') {
      if (typeof options.video.res === 'object') {
        var width = options.video.res.width;
        var height = options.video.res.height;
        var frameRate = (typeof options.video.frameRate === 'number') ?
          options.video.frameRate : 50;
        if (!width || !height) {
          this._streamSettings.video = true;
        } else {
          this._streamSettings.video = {
            mandatory : {
              minWidth: width,
              minHeight: height
            },
            optional : [{ minFrameRate: frameRate }]
          };
        }
      }
    } else {
      options.video = (typeof options.video === 'boolean') ?
        options.video : true;
    }
    // Check typeof options.audio
    if (typeof options.audio === 'object') {
      this._streamSettings.audio = true;
      this._streamSettings.stereo = (typeof options.audio.stereo === 'boolean') ?
        options.audio.stereo : false;
    } else {
      options.audio = (typeof options.audio === 'boolean') ?
        options.audio : true;
    }
  };

  /**
   * User to join the Room
   * @method joinRoom
   * @param {JSON} options
   * @param {} options.audio This call requires audio
   * @param {Boolean} options.audio.stereo Enabled stereo or not
   * @param {} options.video This call requires video
   * @param {String} options.video.res [Rel: Skyway.VIDEO_RESOLUTION]
   * @param {Integer} options.video.res.width Video width
   * @param {Integer} options.video.res.height Video height
   * @param {Integer} options.video.frameRate Mininum frameRate of Video
   * @param {String} options.bandwidth Bandwidth settings
   * @param {String} options.bandwidth.audio Audio Bandwidth
   * @param {String} options.bandwidth.video Video Bandwidth
   * @param {String} options.bandwidth.data Data Bandwidth
   * @protected
   */
  Skyway.prototype.joinRoom = function (options) {
    if (this._in_room) {
      return;
    }
    var self = this;
    self._waitForMediaStream(function () {
      var _sendJoinRoomMsg = function () {
        self.off('channelOpen', _sendJoinRoomMsg);
        console.log('API - Joining room: ' + self._room.id);
        self._sendMessage({
          type : self.SIG_TYPE.JOIN_ROOM,
          uid : self._user.id,
          cid : self._key,
          rid : self._room.id,
          userCred : self._user.token,
          timeStamp : self._user.timeStamp,
          apiOwner : self._user.apiOwner,
          roomCred : self._room.token,
          start : self._room.start,
          len : self._room.len
        });
        // self._user.peer = self._createPeerConnection(self._user.sid);
      };
      if (!self._channel_open) {
        self.on('channelOpen', _sendJoinRoomMsg);
        self._openChannel();
      } else {
        _sendJoinRoomMsg();
      }
    }, options);
  };

  /**
   * @method leaveRoom
   * @protected
   */
  Skyway.prototype.leaveRoom = function () {
    if (!this._in_room) {
      return;
    }
    for (var pc_index in this._peerConnections) {
      if (this._peerConnections.hasOwnProperty(pc_index)) {
        this._removePeer(pc_index);
      }
    }
    this._in_room = false;
    this._closeChannel();
  };
}).call(this);