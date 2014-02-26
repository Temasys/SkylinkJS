var Temasys = (function() {

	/* Basic event system */

	var events = [
		"chatMessage", // msg, room, user
		"presenceChanged", // users, room,
		"userJoined", // user, room
		"userLeft", // user, room
		"addStream", // stream, user, room
		"removeStream", // user, room
		"connectionStatus", // status, room
		"userVideoMute", // status, room, user
		"userAudioMute", // status, room, user
		"connectionState", // state, room
		"roomLock", // status, room
		"mediaAccessError" // error
	];

	this.on = function(eventName, callback) {
		if ('function' === typeof callback) {
			events[eventName] = events[eventName] || [];
			events[eventName].push(callback);
		}
	};

	this.off = function(eventName, callback) {
		var c = -1,
			arr = events[eventName];
		for(var e in arr) {
			if(arr[e] === callback) {
				continue;
			}
			c++;
		}
		arr.splice(c, 1);
	};

	this.trigger = function(eventName) {
		var args = Array.prototype.slice.call(arguments),
			arr = events[eventName];
		args.shift();
		for (e in arr) {
			if(!arr[e](args)) {
				continue;
			}
		}
	};

	/* Signaling */

	this.openChannel = function (username) {

	};

	this.closeChannel = function () {

	};

	this.joinRoom = function (roomName) {

	};

	this.leaveRoom = function () {

	};

	this.toggleLock = function () {

	};

	this.toggleMic = function (status) {

	};

	this.toggleVideo = function (status) {

	};

	this.sendMessage = function (msg) {

	};

	/* Backend API */

	this.authenticate = function (email, password) {

	};

	this.getContacts = function (status) {

	};

	this.getUser = function () {

	};

	this.inviteContact = function (contact) {

	};

	return this;

})();
