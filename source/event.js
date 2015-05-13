var Event = {
	on: function(event, callback){
		this.listeners = this.listeners || {};
		this.listeners.on = this.listeners.on || {};
		this.listeners.on[event] = this.listeners.on[event] || [];
    	this.listeners.on[event].push(callback);
		return this;
	},
	off: function(event, callback){
		return this;
	},
	once: function(event, callback){
		this.listeners = this.listeners || {};
		this.listeners.once = this.listeners.once || {};
		this.listeners.once[event] = this.listeners.once[event] || [];
    	this.listeners.once[event].push(callback);
		return this;
	},
	trigger: function(event){
		var args = Array.prototype.slice.call(arguments,1);
		var onListeners = this.listeners ? (this.listeners.on ? this.listeners.on[event] : []) : [];
		var onceListeners = this.listeners ? (this.listeners.once ? this.listeners.once[event] : []) : [];

	    for (var i=0; i<onListeners.length; i++) {
	    	onListeners[i].apply(this, args);
	    }

	    for (var i=0; i<onceListeners.length; i++){
	    	onceListeners[i].apply(this, args);
	    	onceListeners.splice(i,1);
	    	i--;
	    }

		return this;
	},
	mixin: function(object){
		var methods = ['on','off','once','trigger'];
		for (var i=0; i<methods.length; i++){
			if (Event.hasOwnProperty(methods[i]) ){
				if (typeof object === 'function'){
					object.prototype[methods[i]]=Event[methods[i]];	
				}
				else{
					object[methods[i]]=Event[methods[i]];
				}
			}
		}
		return object;
	}
};