/**
 * Handles the datachannel connection.
 * @class Datachannel
 * @since 0.7.0
 */
/**
 * Example:
 * 
 * new Datachannel(channel, peerId, {
 *   // There can only be 1 for each peer. This is used for sending messages.
 *   persistent: [Boolean],
 *   bufferMode: {
 *     mode: [Constants.Datachannel.BUFFER_MODE],
 *     flushTimeout: [Number],
 *     closingFlushTimeout: [Number]
 *   }
 * });
 */
function Datachannel (datachannel, peerId, settings) {
  var ref = utils.extendEvents(this);

  /**
   * The datachannel ID.
   * @attribute id
   * @type String
   * @readOnly
   * @for Datachannel
   * @since 0.7.0
   */
  ref.id = datachannel.label;

  /**
   * The flag if datachannel connection is persistent.
   * @attribute persistent
   * @type Boolean
   * @readOnly
   * @for Datachannel
   * @since 0.7.0
   */
  ref.persistent = settings.persistent === true;

  /**
   * The datachannel states.
   * @attribute states
   * @param {Boolean} connected The flag if datachannel is connected.
   * @param {String} state The datachannel state.
   * @type JSON
   * @readOnly
   * @for Datachannel
   * @since 0.7.0
   */
  ref.states = {
    connected: false,
    /**
     * Event emitted when datachannel state has changed.
     * @event state
     * @param {String} state The state.
     * @param {Error} [error] The error.
     * @for Datachannel
     * @since 0.7.0
     */
    state: null
  };

  /**
   * The datachannel settings.
   * @attribute settings
   * @param {Number} [bufferedAmount] The buffered amount in bytes.
   * @param {Number} [bufferedAmountLowThreshold] The buffered amount low threshold in bytes.
   * @param {Number} id The datachannel connection streaming ID.
   * @param {Boolean} ordered The flag if datachannel packets are sent in ordered fashion (TCP over UDP).
   * @param {String} binaryType The data binary type.
   * - Reference `Constants.Datachannel.BINARY_TYPE` for the list of available values.
   * @param {Number} [maxPacketLifeTime] The maximum time window in ms which transmission or re-transmission may occur.
   * - This is only used when `.ordered` is disabled.
   * @param {Number} [maxRetransmits] The maximum number of re-transmissions to occur.
   * - This is only used when `.ordered` is disabled.
   * @for Datachannel
   * @since 0.7.0
   */
  ref.settings = {
    id: datachannel.id,
    ordered: typeof datachannel.ordered === 'boolean' ? datachannel.ordered : datachannel.reliable,
    binaryType: datachannel.binaryType || (utils.isPlugin() ? Constants.Datachannel.BINARY_TYPE.INT8ARRAY :
      Constants.Datachannel.BINARY_TYPE.BLOB),
    maxPacketLifeTime: typeof datachannel.maxPacketLifeTime === 'number' ? datachannel.maxPacketLifeTime : null,
    maxRetransmits: typeof datachannel.maxRetransmits === 'number' ? datachannel.maxRetransmits : null,
    bufferedAmount: null,
    /**
     * Event emitted when datachannel data buffer amount threshold is low.
     * @event bufferedAmountLow
     * @param {JSON} settings The settings.
     * - Object signature matches `Datachannel.settings`. 
     * @for Datachannel
     * @since 0.7.0
     */
    bufferedAmountLowThreshold: null
  };

  // The datachannel connection
  ref._datachannel = datachannel;
  // The datachannel buffer settings
  ref._buffer = {
    polling: settings.bufferMode.mode !== Constants.Datachannel.BUFFER_MODE.THRESHOLD,
    flushTimeout: settings.bufferMode.flushTimeout,
    closingFlushTimeout: settings.bufferMode.finalFlushTimeout,
    timestamp: 0
  };
  // The peer ID
  ref._peerId = peerId;

  var fnOnOpen = function () {
    console.log('Datachannel [' + ref._peerId + '][' + ref.id + ']: Connected state ->', true);
    ref.states.connected = true;
    ref.states.state = Constants.Datachannel.STATE.CONNECTED;
    ref._emit('state', Constants.Datachannel.STATE.CONNECTED);
  };

  if (datachannel.readyState === 'open') {
    // Set some time to append data before starting transfers
    setTimeout(fnOnOpen, 1);

  } else {
    datachannel.onopen = fnOnOpen;
    ref.states.state = datachannel.readyState;
    ref._emit('state', datachannel.readyState);
  }
  
  var fnOnClose = function () {
    console.log('Datachannel [' + ref._peerId + '][' + ref.id + ']: Connected state ->', false);
    ref.states.connected = false;
    ref.states.state = Constants.Datachannel.STATE.DISCONNECTED;
    ref._emit('state', Constants.Datachannel.STATE.DISCONNECTED);
  };

  // Fixes for Firefox bug (49 is working) -> https://bugzilla.mozilla.org/show_bug.cgi?id=1118398
  if (window.webrtcDetectedBrowser === 'firefox' && window.webrtcDetectedVersion < 49) {
    var closed = false;
    var block = 0;

    datachannel.onclose = function () {
      if (!closed) {
        closed = true;
        fnOnClose();
      }
    };

    var interval = setInterval(function () {
      if (datachannel.readyState === Constants.Datachannel.STATE.DISCONNECTED || closed || block === 5) {
        clearInterval(interval);

        if (!closed) {
          closed = true;
          fnOnClose();
        }

      // After 5 seconds when state is "closed", it's actually closed on Firefox's end.
      } else if (datachannel.readyState === 'closing') {
        block++;
      }
    }, 1000);

  } else {
    datachannel.onclose = fnOnClose;
  }

  datachannel.onmessage = function (evt) {
    ref._emit('data', evt.data);
  };

  datachannel.onbufferedamountlow = function () {
    console.debug('Datachannel [' + ref._peerId + '][' + ref.id + ']: Buffered amount is low ->', datachannel.bufferedAmount);
    ref.settings.bufferedAmount = parseInt(datachannel.bufferedAmount || '0', 10) || 0;
    ref.settings.bufferedAmountLowThreshold = parseInt(datachannel.bufferedAmountLowThreshold || '0', 10) || 0;
    ref._emit('bufferedAmountLow', ref.settings);
  };

  // Handle RTCDataChannel.onerror event
  datachannel.onerror = function (evt) {
    console.error('Datachannel [' + ref._peerId + '][' + ref.id + ']: Error received ->', evt.error);
    ref._emit('state', evt.error || new Error('Datachannel error occurred.'));
  };

  console.info('Datachannel [' + ref._peerId + '][' + ref.id + ']: Initialised');
};

/**
 * Method to send data. Please provide the fn always for sequence.
 */
Datachannel.prototype._send = function (data, control, fn) {
  var ref = this;
  var size = data.byteLength || data.length || data.size || 0;

  if (size === 0) {
    console.error('Datachannel [' + ref._peerId + '][' + ref.id + ']: Failed sending as received 0 data size ->', data);
    fn(new Error('Data size is 0'));
    return;
  }

  var fnSend = function () {
    if (control) {
      // Mechanism: (polling ? 8 : 0.5) * dataSize. For safe mode, fixing: 81920.
      ref._datachannel.bufferedAmountLowThreshold = 81920;

      // Fixes: https://jira.temasys.com.sg/browse/TWP-569
      if (parseInt(ref._datachannel.bufferedAmount, 10) >= 81920) {
        // Polling mechanism
        if (ref._buffer.polling) {
          setTimeout(fnSend, 250);

        // Buffer amount low mechanism
        } else {
          ref.once('_bufferedAmountLow', fnSend);
        }
        return;
      }
    }

    try {
      console.debug('Datachannel [' + ref._peerId + '][' + ref.id + ']: Sending data of size ->', size);
      ref._datachannel.send(data);

    } catch (error) {
      console.error('Datachannel [' + ref._peerId + '][' + ref.id + ']: Failed sending ->', error);
      fn(error);
      return;
    }

    // NOTE: We are setting timestamps only for direct data transfers without ACK, because with ACK
    //   there is some form of reliability knowing it has failed, but not for direct transfers since
    //   the data could be pushed to the datachannel buffer or network buffer.
    if (control) {
      ref._buffer.timestamp = Date.now();
      setTimeout(fn, ref._buffer.flushTimeout);
      return;
    }

    fn();
  };

  fnSend();
};

/**
 * Method to disconnect datachannel.
 * @method disconnect
 * @return {Promise} Returns `()` for success.
 * @for Datachannel
 * @since 0.7.0
 */
Datachannel.prototype.disconnect = function () {
  var ref = this;

  return new Promise(function (resolve) {
    var fnDisconnect = function () {
      if ([Constants.Datachannel.STATE.DISCONNECTING,
        Constants.Datachannel.STATE.DISCONNECTED].indexOf(ref._datachannel.readyState) === -1) {
        var now = Date.now();
        // Prevent the Datachannel from closing if there is an ongoing buffer sent
        // Use the polling interval here because the bufferedamountlow event is just an indication of
        // "ready" to send next packet because threshold is lower now
        // See Firefox case where it has to be really fast enough: https://bugzilla.mozilla.org/show_bug.cgi?id=933297
        if (parseInt(ref._datachannel.bufferedAmount, 10) > 0) {
          console.warn('Datachannel [' + ref._peerId + '][' + ref.id + ']: Waiting for buffer event to complete before closing');
          setTimeout(fnDisconnect, 250);
          return;
        }

        // Prevent closing too fast if the packet has been sent within last than expected time interval
        if ((now - ref._buffer.timestamp) >= ref._buffer.closingFlushTimeout) {
          console.warn('Datachannel [' + ref._peerId + '][' + ref.id + ']: Waiting for packet to flush in network buffer before closing');
          setTimeout(fnDisconnect, (now - ref._buffer.timestamp) - ref._buffer.closingFlushTimeout);
          return;
        }

        console.log('Datachannel [' + ref._peerId + '][' + ref.id + ']: Closing connection');

        // Safari's Promise problem, doesn't seem to trigger it
        if (window.webrtcDetectedBrowser !== 'safari') {
          ref.once('state', function () {
            resolve();
          }, function (state) {
            return state === Constants.Datachannel.STATE.DISCONNECTED;
          });
        }

        ref.states.state = Constants.Datachannel.STATE.DISCONNECTING;
        ref._emit('state', Constants.Datachannel.STATE.DISCONNECTING);
        ref._datachannel.close();

        if (window.webrtcDetectedBrowser === 'safari') {
          setTimeout(resolve, 10);
        }
        return;
      }
      
      console.warn('Datachannel [' + ref._peerId + '][' + ref.id + ']: Connected state is already false');
      resolve();
    };

    fnDisconnect();
  });
};