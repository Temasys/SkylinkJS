/**
 * The types of get peers states available
 * @attribute GET_PEERS_STATE
 * @type JSON
 * @param {String} ENQUIRED Privileged peer already enquired signaling for list of peers
 * @param {String} RECEIVED Privileged peer received list of peers from signaling
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.GET_PEERS_STATE = {
	ENQUIRED: 'enquired',
	RECEIVED: 'received',
};

/**
 * The types of peer introduction states available
 * @attribute INTRODUCE_STATE
 * @type JSON
 * @param {String} INTRODUCING Privileged peer sent the introduction signal
 * @param {String} ERROR Error happened during peer introduction
 * @readOnly
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.INTRODUCE_STATE = {
	INTRODUCING: 'introducing',
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
 *   Default signature: function(error object, success object)
 * @example
 *
 *   // To get list of unprivileged peers only
 *   SkylinkDemo.getPeers();
 *
 *   // To get list of all peers, including other privileged peers
 *   SkylinkDemo.getPeers(true);
 *
 *   // To get a list of unprivileged peers then invoke the callback
 *   SkylinkDemo.getPeers(function(error, success){
 *     if (error){
 *       console.log('Error happened. Can not retrieve list of peers');
 *     }
 *     else{
 *       console.log('Success fully retrieved list of peers', success);
 *     }
 *   });
 *   
 *   // To get a list of all peers then invoke the callback
 *   SkylinkDemo.getPeers(true, function(error, success){
 *     if (error){
 *       console.log('Error happened. Can not retrieve list of peers');
 *     }
 *     else{
 *       console.log('Success fully retrieved list of peers', success);
 *     }
 *   });
 *   
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
	self._trigger('getPeersStateChange',self.GET_PEERS_STATE.ENQUIRED, self._user.sid, null);

	log.log('Enquired server for peers within the realm');

	if (typeof callback === 'function'){
		self.once('getPeersStateChange', function(state, privilegedPeerId, peerList){
			callback(null, peerList);
		}, function(state, privilegedPeerId, peerList){
			return state === self.GET_PEERS_STATE.RECEIVED;
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
		self._trigger('introduceStateChange', self.INTRODUCE_STATE.ERROR, self._user.sid, sendingPeerId, receivingPeerId, 'notPrivileged');
		return;
	}
	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	});
	self._trigger('introduceStateChange', self.INTRODUCE_STATE.INTRODUCING, self._user.sid, sendingPeerId, receivingPeerId, null);
	log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};

