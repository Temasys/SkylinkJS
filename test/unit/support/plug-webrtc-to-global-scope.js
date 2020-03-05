const AdapterJS = require('adapterjs');
const wrtc = require('wrtc');

export default (global) => {
  global.RTCPeerConnection = wrtc.RTCPeerConnection;
  global.RTCRtpSender = wrtc.RTCRtpSender;
  global.RTCRtpSender = wrtc.RTCRtpSender;
  global.AdapterJS = AdapterJS;
  global.MediaStream = wrtc.MediaStream;
  global.MediaStreamTrack = wrtc.MediaStreamTrack;
  global.MediaStream = { getUserMedia: wrtc.getUserMedia };
}
