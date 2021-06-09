import createDataChannel from './createDataChannel';
import refreshDataChannel from './refreshDataChannel';
import closeDataChannel from './closeDataChannel';
import sendMessageToDataChannel from './sendMessageToDataChannel';

class DataChannel {
  static createDataChannel(params) {
    createDataChannel(params);
  }

  static closeDataChannel(roomKey, peerId, channelProp) {
    closeDataChannel(roomKey, peerId, channelProp);
  }

  static refreshDataChannel(state, peerId) {
    refreshDataChannel(state, peerId);
  }

  static sendMessageToDataChannel(roomKey, peerId, data, channelProperty, type) {
    sendMessageToDataChannel(roomKey, peerId, data, channelProperty, type);
  }
}

export default DataChannel;
