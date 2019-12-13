/* eslint-disable prefer-template,no-param-reassign */
import PeerData from '../../peer-data';
import Skylink from '../../index';
import logger from '../../logger';

const removeSDPCodecs = (targetMid, sessionDescription, roomKey) => {
  const state = Skylink.getSkylinkState(roomKey);
  const audioSettings = PeerData.getCurrentSessionInfo(state.room).settings.audio;
  const initOptions = Skylink.getInitOptions();

  const parseFn = (type, codec) => {
    const payloadList = sessionDescription.sdp.match(new RegExp('a=rtpmap:(\\d*)\\ ' + codec + '.*', 'gi'));

    if (!(Array.isArray(payloadList) && payloadList.length > 0)) {
      logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type, `Not removing ${codec} as it does not exists.`]);
      return;
    }

    for (let i = 0; i < payloadList.length; i += 1) {
      const payload = payloadList[i].split(' ')[0].split(':')[1];

      logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Removing "' + codec + '" payload ->'], payload);

      sessionDescription.sdp = sessionDescription.sdp.replace(new RegExp('a=rtpmap:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(new RegExp('a=fmtp:' + payload + '\\ .*\\r\\n', 'g'), '');
      sessionDescription.sdp = sessionDescription.sdp.replace(new RegExp('a=rtpmap:\\d+ rtx\\/\\d+\\r\\na=fmtp:\\d+ apt=' + payload + '\\r\\n', 'g'), '');

      // Remove the m-line codec
      const sdpLines = sessionDescription.sdp.split('\r\n');

      for (let j = 0; j < sdpLines.length; j += 1) {
        if (sdpLines[j].indexOf('m=' + type) === 0) {
          const parts = sdpLines[j].split(' ');

          if (parts.indexOf(payload) >= 3) {
            parts.splice(parts.indexOf(payload), 1);
          }

          sdpLines[j] = parts.join(' ');
          break;
        }
      }

      sessionDescription.sdp = sdpLines.join('\r\n');
    }
  };

  if (initOptions.disableVideoFecCodecs) {
    if (state.hasMCU) {
      logger.log.WARN([targetMid, 'RTCSessionDesription', sessionDescription.type,
        'Not removing "ulpfec" or "red" codecs as connected to MCU to prevent connectivity issues.']);
    } else {
      parseFn('video', 'red');
      parseFn('video', 'ulpfec');
    }
  }

  if (initOptions.disableComfortNoiseCodec && audioSettings && typeof audioSettings === 'object' && audioSettings.stereo) {
    parseFn('audio', 'CN');
  }

  if (window.webrtcDetectedBrowser === 'edge' && (((state.peerInformations[targetMid] || {}).agent || {}).name || 'unknown').name !== 'edge') {
    // eslint-disable-next-line no-useless-escape
    sessionDescription.sdp = sessionDescription.sdp.replace(/a=rtcp-fb:.*\ x-message\ .*\r\n/gi, '');
  }

  return sessionDescription.sdp;
};

export default removeSDPCodecs;
