/**
 * <blockquote class="info">
 *   Note that this feature requires <code>"isPrivileged"</code> flag to be enabled for the App Key
 *   provided in the <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * Function that retrieves the list of Peer IDs from Rooms within the same App space.
 * @method getPeers
 * @param {Boolean} [showAll=false] The flag if Signaling server should also return the list of privileged Peer IDs.
 * <small>By default, the Signaling server does not include the list of privileged Peer IDs in the return result.</small>
 * @param {Function} [callback] The callback function fired when request has completed.
 *   <small>Function parameters signature is <code>function (error, success)</code></small>
 *   <small>Function request completion is determined by the <a href="#event_getPeersStateChange">
 *   <code>getPeersStateChange</code> event</a> triggering <code>state</code> parameter payload value as
 *   <code>RECEIVED</code> for request success.</small>
 *   [Rel: Skylink.GET_PEERS_STATE]
 * @param {Error|String} callback.error The error result in request.
 *   <small>Defined as <code>null</code> when there are no errors in request</small>
 *   <small>Object signature is the <code>getPeers()</code> error when retrieving list of Peer IDs from Rooms
 *   within the same App space.</small>
 * @param {JSON} callback.success The success result in request.
 *   <small>Defined as <code>null</code> when there are errors in request</small>
 *   <small>Object signature matches the <code>peerList</code> parameter payload received in the
 *   <a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a>.</small>
 * @trigger <ol class="desc-seq">
 *   <li>If App Key provided in the <a href="#method_init"><code>init()</code> method</a> is not
 *   a Privileged enabled Key: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Retrieves the list of Peer IDs from Rooms within the same App space. <ol>
 *   <li><a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>ENQUIRED</code>.</li>
 *   <li>If received list from Signaling server successfully: <ol>
 *   <li><a href="#event_getPeersStateChange"><code>getPeersStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>RECEIVED</code>.</li></ol></li></ol>
 * @example
 *   // Example 1: Retrieving the un-privileged Peers
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(function (error, success) {
 *        if (error) return;
 *        console.log("The list of only un-privileged Peers in the same App space ->", success);
 *     });
 *   });
 *
 *   // Example 2: Retrieving the all Peers (privileged or un-privileged)
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(true, function (error, success) {
 *        if (error) return;
 *        console.log("The list of all Peers in the same App space ->", success);
 *     });
 *   });
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.getPeers = function(showAll, callback){
	var self = this;
	if (!self._isPrivileged){
		log.warn('Please upgrade your key to privileged to use this function');
		return;
	}
	if (!self._initOptions.appKey){
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
 *   <code>"autoIntroduce"</code> flag to be disabled for the App Key provided in the
 *   <a href="#method_init"><code>init()</code> method</a>, as only Users connecting using
 *   the App Key with this flag enabled (which we call privileged Users / Peers) can retrieve the list of
 *   Peer IDs from Rooms within the same App space.
 *   <a href="http://support.temasys.io/support/solutions/articles/12000012342-what-is-a-privileged-key-">
 *   Read more about privileged App Key feature here</a>.
 * </blockquote>
 * Function that selects and introduces a pair of Peers to start connection with each other.
 * @method introducePeer
 * @param {String} sendingPeerId The Peer ID to be connected with <code>receivingPeerId</code>.
 * @param {String} receivingPeerId The Peer ID to be connected with <code>sendingPeerId</code>.
 * @trigger <ol class="desc-seq">
 *   <li>If App Key provided in the <a href="#method_init"><code>init()</code> method</a> is not
 *   a Privileged enabled Key: <ol><li><b>ABORT</b> and return error.</li></ol></li>
 *   <li>Starts sending introduction request for the selected pair of Peers to the Signaling server. <ol>
 *   <li><a href="#event_introduceStateChange"><code>introduceStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>INTRODUCING</code>.</li>
 *   <li>If received errors from Signaling server: <ol>
 *   <li><a href="#event_introduceStateChange"><code>introduceStateChange</code> event</a> triggers parameter
 *   payload <code>state</code> value as <code>ERROR</code>.</li></ol></li></ol></li></ol>
 * @example
 *   // Example 1: Introduce a pair of Peers
 *   skylinkDemo.on("introduceStateChange", function (state, privilegedPeerId, sendingPeerId, receivingPeerId) {
 *	   if (state === skylinkDemo.INTRODUCE_STATE.INTRODUCING) {
 *       console.log("Peer '" + sendingPeerId + "' has been introduced to '" + receivingPeerId + "'");
 *     }
 *   });
 *
 *   skylinkDemo.joinRoom(function (jRError, jRSuccess) {
 *     if (jRError) return;
 *     skylinkDemo.getPeers(function (gPError, gPSuccess) {
 *        if (gPError) return;
 *        skylinkDemo.introducePeer(gPSuccess.roomName[0], gPSuccess.roomName[1]);
 *     });
 *   });
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

	var introduceMsg = {
		type: self._SIG_MESSAGE_TYPE.INTRODUCE,
		sendingPeerId: sendingPeerId,
		receivingPeerId: receivingPeerId
	};

	self._sendChannelMessage(introduceMsg);
	self._handleStatsSession(introduceMsg);
	self._trigger('introduceStateChange', self.INTRODUCE_STATE.INTRODUCING, self._user.sid, sendingPeerId, receivingPeerId, null);
	log.log('Introducing',sendingPeerId,'to',receivingPeerId);
};

