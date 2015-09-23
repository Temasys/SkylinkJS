/**
 * The types of Privileged states available
 * @attribute PRIVILEGED_STATE
 * @type JSON
 * @param {String} ENQUIRED Privileged peer already enquired signaling for list of peers
 * @param {String} RECEIVED Privileged peer received list of peers from signaling
 * @param {String} ERROR Error happened during peer introduction
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.PRIVILEGED_STATE = {
	ENQUIRED: 'enquired',
	RECEIVED: 'received',
	ERROR: 'error'
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
 * List of peers retrieved from signaling
 * @attribute _peerList
 * @type Object
 * @default null
 * @private
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerList = null;

/**
 * For privileged user to enquire signaling to return the list of peers under the same parent.
 * @method getPeers
 * @param {Boolean} [showAll=false] If true, include privileged peers in the list. False by default.
 * @param {Function} [callback] Callback when peer list was returned
 * @public
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.getPeers = function(showAll, callback){
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

	// Only callback is provided
	if (typeof showAll === 'function'){
		callback = showAll;
		showAll = false;
	}

	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.GET_PEERS,
		privilegedKey: self._appKey,
		parentKey: self._parentKey,
		showAll: showAll || false
	});
	self._trigger('privilegedStateChange',self.PRIVILEGED_STATE.ENQUIRED, self._user.sid, null, null, null);
	log.log('Enquired signaling for peers within the realm');

	if (typeof callback === 'function'){
		self.once('privilegedStateChange', function(state, privilegedPeerId, sendingPeerId, receivingPeerId, peerList){
			callback(null, peerList);
		}, function(state, privilegedPeerId, sendingPeerId, receivingPeerId, peerList){
			return state === self.PRIVILEGED_STATE.RECEIVED;
		});
	}

};

/**
 * For privileged peer to introduce 2 peers to each other
 * @method introducePeer
 * @param {String} sendingPeerId Id of the peer who sends enter
 * @param {String} receivingPeerId Id of the peer who receives enter
 * @public
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.introducePeer = function(sendingPeerId, receivingPeerId){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	});
	self._trigger('privilegedStateChange', self.PRIVILEGED_STATE.INTRODUCE, self._user.sid, sendingPeerId, receivingPeerId, self._peerList);
	log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};

