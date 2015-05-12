/*
Event module for other classes to use.

Usage: 
	var peer = new Peer(peerId);
	Event.mixin(peer);
	peer.on('incomingStream',function(stream){
		attachMediaStream(vidElement,stream);
	});
*/

var Event = {
	listeners:{
		on: {},
		once: {}
	}
};

Event.on = function(event, fct){
	this._events = this._events || {};
	this._events[event] = this._events[event]	|| [];
	this._events[event].push(fct);
};

Event.off = function(event, callback, context){
	return this;
};

Event.offAll = function(event, callback, context){
	return this;
}

Event.once = function(event, callback, context){
	return this;
};

Event.trigger = function(event){
	this._events = this._events || {};
	if( event in this._events === false  )	return;
	for(var i = 0; i < this._events[event].length; i++){
		this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
	}
};

Event.emit = function(event, callback, context){
	return this;
};

//Delegate all event functions to the object
//TODO: check to exclude mixin function
Event.mixin = function(object){
	for (var method in Event){
		if (Event.hasOwnProperty(method)){
			if (typeof object === 'function'){
				object.prototype[method]=Event[method];	
			}
			else{
				object[method]=Event[method];
			}
		}
	}
	return object;
}

