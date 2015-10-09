var DataChannel = function(channel){
	'use strict';
	var self = this;
	var id = channel.label;
	var reliable = false;
	var readyState = 'connecting';
	var channelType = 'generic';
	var objectRef = channel;

	Event.mixin(this);

	objectRef.onopen = function(event){
		this._trigger('connected', event);
	};

	objectRef.onmessage = function(event){
		this._trigger('message', event);
	};

	objectRef.onclose = function(event){
		this._trigger('disconnected', event);
	};

	objectRef.onerror = function(event){
		this._trigger('error', event);
	};
};

DataChannel.prototype.disconnect = function(){
	var self = this;
	objectRef.close();
}