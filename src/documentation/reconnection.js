/**
 * @namespace Reconnection
 * @example
 * Example 1: Reconnecting when there is a socket disconnect
 *
 * // Add listener to sessionDisconnect event
 * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SESSION_DISCONNECT, evt => {
 *    let onlineInterval = null;
 *    const reconnect = () => {
 *      // Detect when there is an internet connection
 *      // If this check is not present, the leaveRoom will fail if the socket disconnect is due to there being no internet access
 *      if (window.navigator.onLine) {
 *        clearInterval(onlineInterval);
 *
 *       // leaveRoom to clear the state then joinRoom again
 *       skylink.leaveRoom(roomName)
 *       .then(() => skylink.joinRoom(joinRoomOptions))
 *       .catch((err) =>{
 *          // handle error
 *        })
 *      } else {
 *        // do something - ui indicator that reconnect is in progress, etc
 *      }
 *    }
 *
 *    if (!onlineInterval) {
 *      onlineInterval = setInterval(reconnect, 1000);
 *     }
 * });
 *
 * Example 2: Reconnecting when there is an MCU disconnect
 *
 * // Add listener to serverPeerLeft event
 * SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SERVER_PEER_LEFT, evt => {
 *  // this check is important because a leaveRoom initiated by the client will also trigger a SERVER_PEER_LEFT event
 *  if (leaveRoom initiated by local client) {
 *    // do nothing
 *   } else {
 *    // implement leaveRoom and joinRoom reconnect logic
 *    }
 *  });
 */
