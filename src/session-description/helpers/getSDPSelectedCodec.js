/* eslint-disable prefer-destructuring,no-continue */
import logger from '../../logger/index';

const getSDPSelectedCodec = (targetMid, sessionDescription, type, beSilentOnParseLogs) => {
  // TODO implement getSDPSelectedCodec
  const codecInfo = {
    name: null,
    implementation: null,
    clockRate: null,
    channels: null,
    payloadType: null,
    params: null,
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return codecInfo;
  }

  sessionDescription.sdp.split('m=').forEach((mediaItem, index) => {
    if (index === 0 || mediaItem.indexOf(`${type} `) !== 0) {
      return;
    }

    const codecs = (mediaItem.split('\r\n')[0] || '').split(' ');
    // Remove audio[0] 65266[1] UDP/TLS/RTP/SAVPF[2]
    codecs.splice(0, 3);

    for (let i = 0; i < codecs.length; i += 1) {
      const match = mediaItem.match(new RegExp(`a=rtpmap:${codecs[i]}.*\r\n`, 'gi'));

      if (!match) {
        continue;
      }

      // Format: codec/clockRate/channels
      const parts = ((match[0] || '').replace(/\r\n/g, '').split(' ')[1] || '').split('/');

      // Ignore rtcp codecs, dtmf or comfort noise
      if (['red', 'ulpfec', 'telephone-event', 'cn', 'rtx'].indexOf(parts[0].toLowerCase()) > -1) {
        continue;
      }

      codecInfo.name = parts[0];
      codecInfo.clockRate = parseInt(parts[1], 10) || 0;
      codecInfo.channels = parseInt(parts[2] || '1', 10) || 1;
      codecInfo.payloadType = parseInt(codecs[i], 10);
      codecInfo.params = '';

      // Get the list of codec parameters
      const params = mediaItem.match(new RegExp(`a=fmtp:${codecs[i]}.*\r\n`, 'gi')) || [];
      params.forEach((paramItem) => {
        codecInfo.params += paramItem.replace(new RegExp(`a=fmtp:${codecs[i]}`, 'gi'), '').replace(/ /g, '').replace(/\r\n/g, '');
      });
      break;
    }
  });

  if (!beSilentOnParseLogs) {
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type,
      `Parsing session description "${type}" codecs ->`], codecInfo);
  }

  return codecInfo;
};

export default getSDPSelectedCodec;
