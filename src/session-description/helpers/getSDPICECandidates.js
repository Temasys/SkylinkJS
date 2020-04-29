import logger from '../../logger/index';

const getSDPICECandidates = (targetMid, sessionDescription, beSilentOnParseLogs) => {
  const { RTCIceCandidate } = window;
  // TODO: implement getSDPICECandidates
  const candidates = {
    host: [],
    srflx: [],
    relay: [],
  };

  if (!(sessionDescription && sessionDescription.sdp)) {
    return candidates;
  }

  sessionDescription.sdp.split('m=').forEach((mediaItem, index) => {
    // Ignore the v=0 lines etc..
    if (index === 0) {
      return;
    }

    // Remove a=mid: and \r\n
    const sdpMid = ((mediaItem.match(/a=mid:.*\r\n/gi) || [])[0] || '').replace(/a=mid:/gi, '').replace(/\r\n/, '');
    const sdpMLineIndex = index - 1;

    (mediaItem.match(/a=candidate:.*\r\n/gi) || []).forEach((item) => {
      // Remove \r\n for candidate type being set at the end of candidate DOM string.
      const canType = (item.split(' ')[7] || 'host').replace(/\r\n/g, '');
      candidates[canType] = candidates[canType] || [];
      candidates[canType].push(new RTCIceCandidate({
        sdpMid,
        sdpMLineIndex,
        // Remove initial "a=" in a=candidate
        candidate: (item.split('a=')[1] || '').replace(/\r\n/g, ''),
      }));
    });
  });

  if (!beSilentOnParseLogs) {
    logger.log.INFO([targetMid, 'RTCSessionDesription', sessionDescription.type,
      'Parsing session description ICE candidates ->'], candidates);
  }

  return candidates;
};

export default getSDPICECandidates;
