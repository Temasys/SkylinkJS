var Temasys = (function() {

	/* Basic event system */

	var events = [
		"chatMessage", // msg, room, user
		"presenceChanged", // users, room,
		"userJoined", // user, room
		"userLeft", // user, room
		"connectionStatusChanged", // status, room
		"userVideoStatusChanged", // status, room, user
		"userAudioStatusChanged", // status, room, user
		"connectionStatusChanged", // status, room
		"roomStatusChanged", // status, room
		"mediaAccessError", // error,
		"volumeChanged" // volume
	];

	this.on = function(eventName, callback) {
		events[eventName] = events[eventName] || [];
		events[eventName].push(callback);
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

	this.setVolume = function (volume) {

	};

	/* Backend API */

	this.authenticate(email, password) {

	};

	this.getContacts = function (status) {

	};

	this.getUser = function () {

	};

	this.inviteContact = function (contact) {

	};

	return this;

})();
