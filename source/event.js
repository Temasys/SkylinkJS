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

Event.on = function(event, callback, context){
	return this;
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

Event.trigger = function(event, callback, context){
	return this;
};

Event.emit = function(event, callback, context){
	return this;
};

//Delegate all event functions to the object
Event.mixin = function(object){
	return object;
}