import logger from '../../logger';

const getSDPCodecsSupport = (targetMid, sessionDescription) => {
  const codecs = { audio: {}, video: {} };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return codecs;
  }

  const sdpLines = sessionDescription.sdp.split('\r\n');
  let mediaType = '';

  for (let i = 0; i < sdpLines.length; i += 1) {
    /* eslint-disable prefer-destructuring */
    /* eslint-disable no-continue */
    if (sdpLines[i].indexOf('m=') === 0) {
      mediaType = (sdpLines[i].split('m=')[1] || '').split(' ')[0];
      continue;
    }

    if (sdpLines[i].indexOf('a=rtpmap:') === 0) {
      const parts = (sdpLines[i].split(' ')[1] || '').split('/');
      const codec = (parts[0] || '').toLowerCase();
      const info = parts[1] + (parts[2] ? `/${parts[2]}` : '');

      if (['ulpfec', 'red', 'telephone-event', 'cn', 'rtx'].indexOf(codec) > -1) {
        continue;
      }

      codecs[mediaType][codec] = codecs[mediaType][codec] || [];

      if (codecs[mediaType][codec].indexOf(info) === -1) {
        codecs[mediaType][codec].push(info);
      }
    }
  }

  logger.log.INFO([targetMid || null, 'RTCSessionDescription', sessionDescription.type, 'Parsed codecs support ->'], codecs);
  return codecs;
};

export default getSDPCodecsSupport;
