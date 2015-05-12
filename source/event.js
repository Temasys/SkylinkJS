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

Event.prototype.on = function(event, callback, context){
	return this;
};

Event.prototype.off = function(event, callback, context){
	return this;
};

Event.prototype.offAll = function(event, callback, context){
	return this;
}

Event.prototype.once = function(event, callback, context){
	return this;
};

Event.prototype.trigger = function(event, callback, context){
	return this;
};

Event.prototype.emit = function(event, callback, context){
	return this;
};

//Delegate all event functions to the object
Event.mixin = function(object){
	return object;
}



