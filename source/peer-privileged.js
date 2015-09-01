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
 * @public
 * @component Peer
 * @for Skylink
 * @since 0.6.1
 */
Skylink.prototype.getUnprivilegedPeers = function(){
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
	log.log('Enquired signaling for unprivileged peers');
};