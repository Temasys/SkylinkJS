import { parseUNIXTimeStamp } from '../../../../utils/helpers';

const parseDecryptedMessageData = (message, targetMid) => ({
  targetPeerId: targetMid,
  senderPeerId: message.peerSessionId || message.mid,
  content: message.data,
  timeStamp: parseUNIXTimeStamp(message.timeStamp),
  isPrivate: false,
  isDataChannel: false,
});

export default parseDecryptedMessageData;
