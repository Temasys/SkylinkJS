/**
 * Workaround Edge fixes which is temporarily and works for now due to the audio track + video track rendering issue
 * And Edge current does not support re-negotiation for now in the SDK.
 */
(function () {
  if (window.webrtcDetectedBrowser === 'edge' && window.webrtcDetectedBrowser < 15.15019) {
    var attachMediaStream_base = attachMediaStream;

    attachMediaStream = function (elm, stream) {
      if (elm && stream && typeof elm.tagName === 'string' && elm.tagName.toUpperCase() === 'VIDEO' &&
        stream.getAudioTracks().length > 0 && stream.getVideoTracks().length > 0) {
        try {
          var audioStream = new MediaStream();
          var videoStream = new MediaStream();

          stream.getTracks().forEach(function (t) {
            if (t.kind === 'audio') {
              audioStream.addTrack(t);
            } else {
              videoStream.addTrack(t);
            }
          });

          attachMediaStream_base(elm, videoStream);

          var audioElm = document.createElement('audio');
          audioElm.id = 'audio-' + Math.random() + '-' + Date.now();
          audioElm.style.visibility = 'hidden';
          audioElm.style.height = 0;
          audioElm.style.width = 0;
          audioElm.autoplay = true;
          audioElm.muted = !!elm.muted;

          document.body.appendChild(audioElm);

          attachMediaStream_base(audioElm, audioStream);

          var endedInterval = setInterval(function () {
            if (typeof stream.elementRecordedTime === 'undefined') {
              stream.elementRecordedTime = 0;
            }
            if (stream.elementRecordedTime === stream.currentTime) {
              clearInterval(endedInterval);
              document.body.removeChild(audioElm);
            } else {
              stream.elementRecordedTime = stream.currentTime;
            }
          }, 1000);
        } catch (e) {
          console.error('Failed appending workaround for Edge ->', e);
          attachMediaStream_base(elm, stream);
        }
      } else {
        attachMediaStream_base(elm, stream);
      } 
    };
  }
})();