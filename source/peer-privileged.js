/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key, as
 *   only Users connecting using the App Key with this flag enabled (which we call Privileged Users / Peers)
 *   can retrieve the list of Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about Privileged App Key feature here</a>.
 * </blockquote>
 * Contains the list of <a href="#method_getPeers"><code>getPeers()</code> method</a> retrieval states.
 * @attribute GET_PEERS_STATE
 * @param {String} ENQUIRED <small>Value <code>"enquired"</code></small>
 *   The state when retrieving the list of Peer IDs from Signaling.
 * @param {String} RECEIVED <small>Value <code>"received"</code></small>
 *   The state when the list of Peer IDs has been successfully retrieved from Signaling.
 * @type JSON
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.GET_PEERS_STATE = {
	ENQUIRED: 'enquired',
	RECEIVED: 'received'
};

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key, as only Users connecting
 *   using the App Key with this flag enabled (which we call Privileged Users / Peers)
 *   can introduce Peers in the same App space from other Rooms.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about Privileged App Key feature here</a>.
 * </blockquote>
 * Contains the list of <a href="#method_introducePeer"><code>introducePeer</code> method</a> introduction states.
 * @attribute INTRODUCE_STATE
 * @param {String} INTRODUCING <small>Value <code>"enquired"</code></small>
 *   The state when request to introduce the pair of Peers has been made to the Signaling.
 * @param {String} ERROR <small>Value <code>"error"</code></small>
 *   The state when request to introduce the pair of Peers has failed.
 * @readOnly
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.INTRODUCE_STATE = {
	INTRODUCING: 'introducing',
	ERROR: 'error'
};

/**
 * Stores the flag that indicates if "autoIntroduce" is enabled.
 * If enabled, the Peers connecting the same Room will receive each others "enter" message ping.
 * @attribute _autoIntroduce
 * @type Boolean
 * @default true
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._autoIntroduce = true;

/**
 * Stores the flag that indicates if "isPrivileged" is enabled.
 * If enabled, the User has Privileged features which has the ability to retrieve the list of
 *   Peers in the same App space with <code>getPeers()</code> method
 *   and introduce Peers to each other with <code>introducePeer</code> method.
 * @attribute isPrivileged
 * @type Boolean
 * @default false
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._isPrivileged = false;

/**
 * Stores the list of Peers retrieved from the Signaling from <code>getPeers()</code> method.
 * @attribute _peerList
 * @type JSON
 * @private
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype._peerList = null;

/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key, as
 *   only Users connecting using the App Key with this flag enabled (which we call Privileged Users / Peers)
 *   can retrieve the list of Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about Privileged App Key feature here</a>.
 * </blockquote>
 * Function that retrieves the list of Peer IDs from Rooms within in the same App space.
 * @method getPeers
 * @param {Boolean} [showAll=false] The flag that indicates if Signaling should also retrieve
 *   the list of the Privileged Peer IDs.
 * <small>By default, the Signaling doesn't return the Privileged Peer IDs</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature matches the <code>peerList</code> parameter payload received in the
 *      <a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>Retrieves the list of Peers ID in the App space.<ul>
 *     <li>Triggers <a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a>
 *       with parameter payload <code>state</code> as <code>ENQUIRED</code>.</li>
 *     <li>If retrieval of the list of Peer IDs is successful, it triggers <a href="#event_getPeersStateChange">
 *       <code>getPeersStateChange</code> event</a> with parameter payload <code>state</code> as
 *       <code>RECEIVED</code> after <code>ENQUIRED</code>.</li>
 *   </ul></li></ol>
 * @example
 *   skylinkDemo.on("getPeersStateChange", function (state, privilegedPeerId, peerList) {
 *		 if (state === skylinkDemo.GET_PEERS_STATE.RECEIVED) {
 *       // Display list
 *     }
 *   });
 *
 *   skylinkDemo.getPeers();
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

	// Only callback is provided
	if (typeof showAll === 'function'){
		callback = showAll;
		showAll = false;
	}

	self._sendChannelMessage({
		type: self._SIG_MESSAGE_TYPE.GET_PEERS,
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
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled and
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key, as only Users connecting
 *   using the App Key with this flag enabled (which we call Privileged Users / Peers)
 *   can introduce Peers in the same App space from other Rooms.
 *   <a href="http://support.temasys.com.sg/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about Privileged App Key feature here</a>.
 * </blockquote>
 * Function that introduces a pair of Peers to start Peer connection with each other.
 * @method introducePeer
 * @param {String} sendingPeerId The Peer ID of the Peer that will start Peer connection with <code>receivingPeerId</code>.
 * @param {String} receivingPeerId The Peer ID of the Peer that will be connected with <code>sendingPeerId</code>.
 * @trigger <ol class="desc-seq">
 *   <li>Introduces a Peer to another Peer.<ul>
 *     <li>If introduction of Peer to Peer is successful, it triggers <a href="#event_introduceStateChange">
 *       <code>introduceStateChange</code> event</a> with parameter payload <code>state</code> as
 *       <code>INTRODUCING</code>.</li>
  *     <li>If introduction of Peer to Peer had failed, it triggers <a href="#event_introduceStateChange">
 *       <code>introduceStateChange</code> event</a> with parameter payload <code>state</code> as
 *       <code>ERROR</code>.</li>
 *   </ul></li></ol>
 * @example
 *   skylinkDemo.on("introduceStateChange", function (state, privilegedPeerId, sendingPeerId, receivingPeerId) {
 *	   if (state === skylinkDemo.INTRODUCE_STATE.INTRODUCING) {
 *       // Display to UI that "sendingPeerId" is introducing (or connecting) to "receivingPeerId"
 *     }
 *   });
 *
 *   skylinkDemo.on("getPeersStateChange", function (state, privilegedPeerId, peerList) {
 *		 if (state === skylinkDemo.GET_PEERS_STATE.RECEIVED) {
 *       skylinkDemo.introducePeer(peerList.roomA[0], peerList.roomB[0]);
 *     }
 *   });
 *
 *   skylinkDemo.getPeers();
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

