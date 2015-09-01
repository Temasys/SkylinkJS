var SkylinkDemo = new Skylink();
SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
var Config = {
  apiKey:"fa152f2f-ad7a-46d1-a3be-cb0dffc617b5",
  defaultRoom:"MY_DEFAULT_ROOM",
  audioCodec: document.getElementById('codec').value
};

//--------
SkylinkDemo.on('readyStateChange', function(state)
{
  console.log("readyStateChange");
  if (state === SkylinkDemo.READY_STATE_CHANGE.COMPLETED)
  {
    SkylinkDemo.joinRoom(
    {
      audio: true,
      video: true
    });
  }
});
//--------
SkylinkDemo.on('mediaAccessSuccess', function(stream)
{
  console.log("mediaAccessSuccess");
  attachMediaStream(document.getElementById("myVideo"), stream);
});
//--------
SkylinkDemo.on('incomingStream', function(peerId, stream, isSelf, peerInfo)
{
  if (!isSelf)
  {
    console.log("addPeerStream");
    var DOMRemoteVideo = document.createElement('video');
    DOMRemoteVideo.setAttribute("style", "width: 320px; height: 240px;");
    if (window.webrtcDetectedBrowser !== 'IE') {
      DOMRemoteVideo.setAttribute("autoplay", "autoplay");
    }
    DOMRemoteVideo.setAttribute("id", "remote_" + peerId);
    var DOMcontainer = document.getElementById("remoteContainer");
    DOMcontainer.appendChild(DOMRemoteVideo);
    attachMediaStream(DOMRemoteVideo, stream);
    DOMRemoteVideo.onclick = function () {
      SkylinkDemo.refreshConnection(peerId);
    };
  }

});
//--------
SkylinkDemo.on('streamEnded', function(peerID, peerInfo, isSelf)
{
  if (!isSelf)
  {
    console.log("streamEnded");
    var DOMvideo = document.getElementById("remote_" + peerID);
    // fix for domvideo not defined
    if (DOMvideo) {
      var DOMcontainer = document.getElementById("remoteContainer");
      DOMvideo.src = '';
      DOMcontainer.removeChild(DOMvideo);
    }
  }

});
//--------
SkylinkDemo.on('peerLeft', function(peerID)
{
  console.log("peerLeft");
  var DOMvideo = document.getElementById("remote_" + peerID);
  // fix for domvideo not defined
  if (DOMvideo) {
    var DOMcontainer = document.getElementById("remoteContainer");
    DOMvideo.src = '';
    DOMcontainer.removeChild(DOMvideo);
  }
});

function init(){
    SkylinkDemo.init(Config);
}



