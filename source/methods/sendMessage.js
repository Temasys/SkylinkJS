/**
 * <blockquote class="info">
 *   Note that broadcasted events from <a href="#method_muteStream"><code>muteStream()</code> method</a>,
 *   <a href="#method_stopStream"><code>stopStream()</code> method</a>,
 *   <a href="#method_stopScreen"><code>stopScreen()</code> method</a>,
 *   <a href="#method_sendMessage"><code>sendMessage()</code> method</a>,
 *   <a href="#method_unlockRoom"><code>unlockRoom()</code> method</a> and
 *   <a href="#method_lockRoom"><code>lockRoom()</code> method</a> may be queued when
 *   sent within less than an interval.
 * </blockquote>
 * Function that sends a message to Peers via the Signaling socket connection.
 * @method sendMessage
 * @param {String|JSON} message The message.
 * @param {String|Array} [targetPeerId] The target Peer ID to send message to.
 * - When provided as an Array, it will send the message to only Peers which IDs are in the list.
 * - When not provided, it will broadcast the message to all connected Peers in the Room.
 * @example
 *   // Example 1: Broadcasting to all Peers
 *   skylinkDemo.sendMessage("Hi all!");
 *
 *   // Example 2: Sending to specific Peers
 *   var peersInExclusiveParty = [];
 *
 *   skylinkDemo.on("peerJoined", function (peerId, peerInfo, isSelf) {
 *     if (isSelf) return;
 *     if (peerInfo.userData.exclusive) {
 *       peersInExclusiveParty.push(peerId);
 *     }
 *   });
 *
 *   function updateExclusivePartyStatus (message) {
 *     skylinkDemo.sendMessage(message, peersInExclusiveParty);
 *   }
 * @trigger <ol class="desc-seq">
 *   <li>Sends socket connection message to all targeted Peers via Signaling server. <ol>
 *   <li><a href="#event_incomingMessage"><code>incomingMessage</code> event</a> triggers parameter payload
 *   <code>message.isDataChannel</code> value as <code>false</code>.</li></ol></li></ol>
 * @for Skylink
 * @since 0.4.0
 */
Skylink.prototype.sendMessage = function(message, targetPeerId) {
  var listOfPeers = Object.keys(this._peerInformations);
  var isPrivate = false;

  if (Array.isArray(targetPeerId)) {
    listOfPeers = targetPeerId;
    isPrivate = true;
  } else if (targetPeerId && typeof targetPeerId === 'string') {
    listOfPeers = [targetPeerId];
    isPrivate = true;
  }

  if (!this._inRoom || !this._socket || !this._user) {
    this._log.error('Unable to send message as User is not in Room. ->', message);
    return;
  }

  // Loop out unwanted Peers
  for (var i = 0; i < listOfPeers.length; i++) {
    var peerId = listOfPeers[i];

    if (!this._peerInformations[peerId]) {
      this._log.error([peerId, 'Socket', null, 'Dropping of sending message to Peer as ' +
        'Peer session does not exists']);
      listOfPeers.splice(i, 1);
      i--;
    } else if (peerId === 'MCU') {
      listOfPeers.splice(i, 1);
      i--;
    } else if (isPrivate) {
      this._log.debug([peerId, 'Socket', null, 'Sending private message to Peer']);

      this._sendChannelMessage({
        cid: this._key,
        data: message,
        mid: this._user.sid,
        rid: this._room.id,
        target: peerId,
        type: this._SIG_MESSAGE_TYPE.PRIVATE_MESSAGE
      });
    }
  }

  if (listOfPeers.length === 0) {
    this._log.warn('Currently there are no Peers to send message to (unless the message is queued and ' +
      'there are Peer connected by then).');
  }

  if (!isPrivate) {
    this._log.debug([null, 'Socket', null, 'Broadcasting message to Peers']);

    this._sendChannelMessage({
      cid: this._key,
      data: message,
      mid: this._user.sid,
      rid: this._room.id,
      type: this._SIG_MESSAGE_TYPE.PUBLIC_MESSAGE
    });
  } else {
    this._trigger('incomingMessage', {
      content: message,
      isPrivate: isPrivate,
      targetPeerId: targetPeerId || null,
      listOfPeers: listOfPeers,
      isDataChannel: false,
      senderPeerId: this._user.sid
    }, this._user.sid, this.getPeerInfo(), true);
  }
};