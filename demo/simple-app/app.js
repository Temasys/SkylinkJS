
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

var media_callback = function(error, success){
  if (error){
    console.log('media callback error');
  }
  else{
    console.log('media callback success');
  }
}

var join_callback = function(error, success){
  if (error){
    console.log('join callback error');
  }
  else{
    console.log('join callback success');
  }
}

SkylinkDemo.getUserMedia(/*media_callback*/);

SkylinkDemo.joinRoom(/*join_callback*/);

/*
//--------
SkylinkDemo.on('readyStateChange', function(state)
{
  console.log("readyStateChange");
  var join_callback = function(error, success){
    if (error){
      console.log('callback error');
    }
    else{
      console.log('callback success');
    }
  }
  if (state === SkylinkDemo.READY_STATE_CHANGE.COMPLETED)
  {
    SkylinkDemo.joinRoom(
    {
      audio: true,
      video: true
    },join_callback);
  }
});

*/