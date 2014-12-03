
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
    DOMRemoteVideo.setAttribute("autoplay", "autoplay");
    DOMRemoteVideo.setAttribute("id", "remote_" + peerId);
    var DOMcontainer = document.getElementById("remoteContainer");
    DOMcontainer.appendChild(DOMRemoteVideo);
    attachMediaStream(DOMRemoteVideo, stream);
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
