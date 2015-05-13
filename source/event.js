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
	on: function(event, callback, context){
		this.listeners.on[event] = this.listeners.on[event] || [];
    	this.listeners.on[event].push(callback);
		return this;
	},
	off: function(event, callback, context){
		return this;
	},
	once: function(event, callback, context){
		return this;
	},
	trigger: function(event, callback, context){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
		}

		/*var listeners = this.listeners.on || [];
	    for (var i = 0; i < listeners.length; i++) {
	      try {
	        listeners[i].apply(this, args);
	        
	      } catch(error) {
	        throw error;
	      }
	    }*/
		return this;
	},
	//Delegate all event functions to the object
	//TODO: check to exclude mixin function
	mixin: function(object){
		for (var method in Event){
			if (Event.hasOwnProperty(method) ){
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
};