import logger from '../../../../logger/index';

/* eslint-disable no-param-reassign */
const parseVideoE2EDelay = (state, output, prop, peerConnection, peerId, beSilentOnLogs) => {
  const { raw } = output;
  const { AdapterJS, document } = window;
  // Chrome / Plugin (Inbound e2e stats)
  // FIXME: conditions seem to never be fulilled
  if (prop.indexOf('ssrc_') === 0 && raw[prop].mediaType === 'video') {
    const captureStartNtpTimeMs = parseInt(raw[prop].googCaptureStartNtpTimeMs || '0', 10);
    const remoteStream = peerConnection.getRemoteStreams()[0]; // is deprecated

    if (!(captureStartNtpTimeMs > 0 && prop.indexOf('_recv') > 0 && remoteStream
      && document && typeof document.getElementsByTagName === 'function')) {
      return;
    }

    try {
      let elements = document.getElementsByTagName(AdapterJS.webrtcDetectedType === 'plugin' ? 'object' : 'video');

      if (AdapterJS.webrtcDetectedType !== 'plugin' && elements.length === 0) {
        elements = document.getElementsByTagName('audio');
      }

      for (let e = 0; e < elements.length; e += 1) {
        let videoStreamId = null;

        // For Plugin case where they use the <object> element
        if (AdapterJS.webrtcDetectedType === 'plugin') {
          // Precautionary check to return if there is no children like <param>, which means something is wrong..
          if (!(elements[e].children && typeof elements[e].children === 'object'
            && typeof elements[e].children.length === 'number' && elements[e].children.length > 0)) {
            break;
          }

          // Retrieve the "streamId" parameter
          for (let ec = 0; ec < elements[e].children.length; ec += 1) {
            if (elements[e].children[ec].name === 'streamId') {
              videoStreamId = elements[e].children[ec].value || null;
              break;
            }
          }

          // For Chrome case where the srcObject can be obtained and determine the streamId
        } else {
          videoStreamId = (elements[e].srcObject && (elements[e].srcObject.id || elements[e].srcObject.label)) || null;
        }

        if (videoStreamId && videoStreamId === (remoteStream.id || remoteStream.label)) {
          output.video.receiving.e2eDelay = ((new Date()).getTime() + 2208988800000) - captureStartNtpTimeMs - elements[e].currentTime * 1000;
          break;
        }
      }
    } catch (error) {
      if (!beSilentOnLogs) {
        logger.log.WARN([peerId, 'RTCStatsReport', null, 'Failed retrieving e2e delay ->'], error);
      }
    }
  }
};

export default parseVideoE2EDelay;
