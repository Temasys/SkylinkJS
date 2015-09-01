/**
 * The types of Privileged states available
 * @attribute PRIVILEGED_STATE
 * @type JSON
 * @param {String} ENQUIRED Privileged peer already enquired signaling for list of unprivileged peers
 * @param {String} RECEIVED Privileged peer received list of unprivileged peers from signaling
 * @param {String} INTRODUCED Privileged peer introduced 2 unprivileged peers to each other
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.PRIVILEGED_STATE = {
	ENQUIRED: 'enquired',
	RECEIVED: 'received',
	INTRODUCED: 'introduced'
};

/**
 * Whether this user automatically introduce to other peers.
 * @attribute _autoIntroduce
 * @type Boolean
 * @default true
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._autoIntroduce = true;

/**
 * Whether this user is a privileged user.
 * @attribute isPrivileged
 * @type Boolean
 * @default false
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._isPrivileged = false;

/**
 * Parent key in case the current key is alias.
 * If the current key is not alias, this is the same as _appKey
 * @attribute _parentKey
 * @type String
 * @default null
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._parentKey = null;

/**
 * For privileged user to enquire signaling to return the list of unprivileged peers under the same parent.
 * @method getUnprivilegedPeers
 * @param {Function} [callback] Callback when unprivileged peer list was returned
 * @public
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.getUnprivilegedPeers = function(callback){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	if (!self._appKey){
		log.warn('App key is not defined. Please authenticate again.');
		return;	
	}
	if (!self._parentKey){
		log.warn('Parent key is not defined. Please authenticate again.');
		return;	
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.GET_UNPRIVILEGED,
		privilegedKey: self._appKey,
		parentKey: self._parentKey
	});
	self._trigger('privilegedStateChange',self.PRIVILEGED_STATE.ENQUIRED, self._user.sid, null, null, null);
	log.log('Enquired signaling for unprivileged peers');

	if (typeof callback === 'function'){
		self.once('privilegedStateChange', function(state, privilegedPeerId, sendingPeerId, receivingPeerId, unprivilegedPeerList){
			callback(null, unprivilegedPeerList);
		}, function(state, privilegedPeerId, sendingPeerId, receivingPeerId, unprivilegedPeerList){
			return state === self.PRIVILEGED_STATE.RECEIVED;
		});
	}

};

/**
 * For privileged peer to introduce 2 unprivileged peers to each other
 * @method introduce
 * @param {String} sendingPeerId Id of the peer who sends enter
 * @param {String} receivingPeerId Id of the peer who receives enter
 * @public
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.introduce = function(sendingPeerId, receivingPeerId){
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	});
	log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};

