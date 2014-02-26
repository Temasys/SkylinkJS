(function(exports) {

	function Temasys() {
		if (!(this instanceof Temasys)) return new Temasys();

		// Constructor work...
	}

	exports.Temasys = Temasys;


	/* Syntactically private variables and utility functions */

	Temasys.prototype._events = {
		"chatMessage": [], // msg, room, user
		"presenceChanged": [], // users, room,
		"userJoined": [], // user, room
		"userLeft": [], // user, room
		"addStream": [], // stream, user, room
		"removeStream": [], // user, room
		"userVideoMute": [], // status, room, user
		"userAudioMute": [], // status, room, user
		"signalingConnectionState": [], // state, room
		"userConnectionState": [], // state, user, room
		"roomLock": [], // status, room
		"mediaAccessError": [] // error,
	};



	/* Basic event system */

	Temasys.prototype.on = function(eventName, callback) {
		if ('function' === typeof callback) {
			this._events[eventName] = this._events[eventName] || [];
			this._events[eventName].push(callback);
		}
	};

	Temasys.prototype.off = function(eventName, callback) {
		if(callback === undefined) {
			this._events[eventName] = [];
			return;
		}
		var arr = this._events[eventName],
			l = arr.length,
			e = false;
		for(var i = 0; i < l; i++) {
			if(arr[i] === callback) {
				arr.splice(i, 1);
				break;
			}
		}
	};

	Temasys.prototype.trigger = function(eventName) {
		var args = Array.prototype.slice.call(arguments),
			arr = this._events[eventName];
		args.shift();
		for (e in arr) {
			if(arr[e](args) === false) {
				break;
			}
		}
	};


	/* Signaling */

	Temasys.prototype.openChannel = function (username) {

	};

	Temasys.prototype.closeChannel = function () {

	};

	Temasys.prototype.toggleLock = function () {

	};

	Temasys.prototype.toggleMic = function (status) {

	};

	Temasys.prototype.toggleVideo = function (status) {

	};

	Temasys.prototype.sendMessage = function (msg) {

	};


	/* Backend API */

	Temasys.prototype.authenticate = function (email, password) {

	};

	Temasys.prototype.joinRoom = function (roomName) {

	};

	Temasys.prototype.leaveRoom = function () {

	};

	Temasys.prototype.getContacts = function (status) {

	};

	Temasys.prototype.getUser = function () {

	};

	Temasys.prototype.inviteContact = function (contact) {

	};

})(this);
