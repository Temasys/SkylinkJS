import sendMessageToDataChannel from '../../../peer-connection/helpers/data-channel/sendMessageToDataChannel';
import { DATA_CHANNEL_MESSAGE_TYPE, DC_PROTOCOL_TYPE } from '../../../constants';

const sendACKProtocol = (roomKey, peerId, sender, ackN, channelProp) => {
  sendMessageToDataChannel(roomKey, peerId, {
    type: DC_PROTOCOL_TYPE.ACK,
    sender,
    ackN,
  }, channelProp, DATA_CHANNEL_MESSAGE_TYPE.PROTOCOL);
};

export default sendACKProtocol;
