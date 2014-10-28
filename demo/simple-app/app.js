//------------
// Create our Skylink object
var SkylinkDemo = new Skylink();

////////////////////////////////////
///////TO FILL
var APPKEYID = XXXXXXXX - XXXX - XXXX - XXXX - XXXXXXXXXXXX;
var ROOMNAME = "demo";
var SKYLINKSERVER = "http://api.temasys.com.sg/";
///////
///////////////////////////////////

(function()
{
  SkylinkDemo.init(
  {
    roomserver: SKYLINKSERVER,
    apiKey: APPKEYID,
    defaultRoom: ROOMNAME,
    region: "sg"
  });
})();

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
SkylinkDemo.on('incomingStream', function(peerID, stream, isSelf)
{
  if (!isSelf)
  {
    console.log("addPeerStream");
    var DOMRemoteVideo = document.createElement('video');
    DOMRemoteVideo.setAttribute("style", "width: 320px; height: 240px;");
    DOMRemoteVideo.setAttribute("autoplay", "autoplay");
    DOMRemoteVideo.setAttribute("id", "remote_" + peerID);
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
