/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-template */
const formatRtx = (str) => {
  (str.match(/a=rtpmap:.*\ rtx\/.*\r\n/gi) || []).forEach((line) => {
    const payload = (line.split('a=rtpmap:')[1] || '').split(' ')[0] || '';
    const fmtpLine = (str.match(new RegExp('a=fmtp:' + payload + '\ .*\r\n', 'gi')) || [])[0];

    if (!fmtpLine) {
      str = str.replace(new RegExp(line, 'g'), '');
      return;
    }

    const codecPayload = (fmtpLine.split(' apt=')[1] || '').replace(/\r\n/gi, '');
    const rtmpLine = str.match(new RegExp('a=rtpmap:' + codecPayload + '\ .*\r\n', 'gi'));

    if (!rtmpLine) {
      str = str.replace(new RegExp(line, 'g'), '');
      str = str.replace(new RegExp(fmtpLine, 'g'), '');
    }
  });

  return str;
};

// Remove unmapped fmtp and rtcp-fb lines
const formatFmtpRtcpFb = (str) => {
  (str.match(/a=(fmtp|rtcp-fb):.*\ rtx\/.*\r\n/gi) || []).forEach((line) => {
    const payload = (line.split('a=' + (line.indexOf('rtcp') > 0 ? 'rtcp-fb' : 'fmtp'))[1] || '').split(' ')[0] || '';
    const rtmpLine = str.match(new RegExp('a=rtpmap:' + payload + '\ .*\r\n', 'gi'));

    if (!rtmpLine) {
      str = str.replace(new RegExp(line, 'g'), '');
    }
  });

  return str;
};

const removeSDPUnknownAptRtx = (targetMid, sessionDescription) => {
  const mediaLines = sessionDescription.sdp.split('m=');

  // Remove unmapped rtx lines
  // Remove rtx or apt= lines that prevent connections for browsers without VP8 or VP9 support
  // See: https://bugs.chromium.org/p/webrtc/issues/detail?id=3962
  for (let m = 0; m < mediaLines.length; m += 1) {
    mediaLines[m] = formatRtx(mediaLines[m]);
    mediaLines[m] = formatFmtpRtcpFb(mediaLines[m]);
  }

  return mediaLines.join('m=');
};

export default removeSDPUnknownAptRtx;
