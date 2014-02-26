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
		if(callback === undefined) {
			events[eventName] = [];
			return;
		}
		var arr = events[eventName],
			l = arr.length,
			e = false;
		for(var i = 0; i < l; i++) {
			if(arr[i] === callback) {
				arr.splice(i, 1);
				break;
			}
		}
	};

	this.trigger = function(eventName) {
		var args = Array.prototype.slice.call(arguments),
			arr = events[eventName];
		args.shift();
		for (e in arr) {
			if(arr[e](args) === false) {
				break;
			}
		}
	};

	/* Signaling */

	this.openChannel = function (username) {

	};

	this.closeChannel = function () {

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

	this.joinRoom = function (roomName) {

	};

	this.leaveRoom = function () {

	};

	this.getContacts = function (status) {

	};

	this.getUser = function () {

	};

	this.inviteContact = function (contact) {

	};

	return this;

})();
