var Event = {
	
	on: function(event, callback){
		this.listeners.on[event] = this.listeners.on[event] || [];
    	this.listeners.on[event].push(callback);
		return this;
	},

	off: function(event, callback){

		if (typeof callback === 'undefined'){

			this.listeners.on[event]=[];
			this.listeners.once[event]=[];
		}
		else{
			if (this.listeners.on[event]){
				for (var i=0; i<this.listeners.on[event].length; i++){
					if (this.listeners.on[event][i] === callback){
						this.listeners.on[event].splice(i,1);
						break;
					}
				}
			}
		
			if (this.listeners.once[event]){
				for (var i=0; i<this.listeners.once[event].length; i++){
					if (this.listeners.once[event][i] === callback){
						this.listeners.once[event].splice(i,1);
						break;
					}
				}
			}
		}
		return this;
	},

	once: function(event, callback){
		this.listeners.once[event] = this.listeners.once[event] || [];
    	this.listeners.once[event].push(callback);
		return this;
	},

	trigger: function(event){
		var args = Array.prototype.slice.call(arguments,1);

		if (this.listeners.on[event]){
			for (var i=0; i<this.listeners.on[event].length; i++) {
		    	this.listeners.on[event][i].apply(this, args);
		    }
		}

		if (this.listeners.once[event]){
			for (var i=0; i<this.listeners.once[event].length; i++){
		    	this.listeners.once[event][i].apply(this, args);
		    	this.listeners.once[event].splice(i,1);
		    	i--;
		    }
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

		object.listeners = {
			on: {},
			once: {}
		}

		return object;
	}
};