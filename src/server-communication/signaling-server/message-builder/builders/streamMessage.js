import { SIG_MESSAGE_TYPE } from '../../../../constants';

/**
 * Function that builds the 'stream' socket message.
 * @param {String} roomKey - The room rid.
 * @param {SkylinkUser} user - The peer sending the streamMessage.
 * @param {MediaStream} stream - The media stream.
 * @param {String} status - The stream status.
 * @param {Object} options
 * @param {String} options.isScreensharing - The flag if the ended stream is a screensharing stream.
 * @returns {JSON}
 * @memberof SignalingMessageBuilder
 */
const streamMessage = (roomKey, user, stream, status, options) => ({
  type: SIG_MESSAGE_TYPE.STREAM,
  mid: user.sid,
  rid: roomKey,
  status,
  streamId: stream.id,
  settings: options,
});

export default streamMessage;
