var SkylinkDemo = new Skylink();

//--------
SkylinkDemo.on("mediaAccessSuccess", function(stream) {
  console.log("mediaAccessSuccess");
  attachMediaStream(document.getElementById("myVideo"), stream);
});
//--------
SkylinkDemo.on("incomingStream", function(peerId, stream, isSelf, peerInfo) {
  if (!isSelf) {
    console.log("addPeerStream");
    var DOMRemoteVideoContainer = document.getElementById(peerId);

    if (!DOMRemoteVideoContainer) {
      var DOMRemoteVideoContainer = document.createElement("div");
      DOMRemoteVideoContainer.setAttribute("id", peerId);
      DOMRemoteVideoContainer.className = "video-avatar video-remote-avatar";

      DOMRemoteVideo = document.createElement("video");
      DOMRemoteVideo.autoplay = true;
      DOMRemoteVideo.controls = true;
      DOMRemoteVideo.muted = true; //isSelf;
      DOMRemoteVideo.poster = "../assets/img/user.png";
      DOMRemoteVideo.setAttribute("playsinline", true);
      DOMRemoteVideo.setAttribute("id", "remote_" + peerId);
      DOMRemoteVideo.className = "peer-video";

      DOMRemoteVideoContainer.appendChild(DOMRemoteVideo);

      var DOMcontainer = document.getElementById("js-peers-container");
      DOMcontainer.appendChild(DOMRemoteVideoContainer);
      DOMRemoteVideo.onclick = function() {
        SkylinkDemo.refreshConnection(peerId);
      };

      setTimeout(function() {
        DOMRemoteVideo.removeAttribute("controls");
      });
    }
    attachMediaStream(DOMRemoteVideo, stream);
  }
});
//--------
SkylinkDemo.on("streamEnded", function(peerID, peerInfo, isSelf) {
  if (!isSelf) {
    console.log("streamEnded");
    var DOMvideoContainer = document.getElementById(peerID);
    // fix for domvideo not defined
    if (DOMvideoContainer) {
      var DOMcontainer = document.getElementById("js-peers-container");
      DOMcontainer.removeChild(DOMvideoContainer);
    }
  }
});
//--------
SkylinkDemo.on("peerLeft", function(peerID) {
  console.log("peerLeft");
  var DOMvideoContainer = document.getElementById(peerID);
  // fix for domvideo not defined
  if (DOMvideoContainer) {
    var DOMcontainer = document.getElementById("js-peers-container");
    DOMcontainer.removeChild(DOMvideoContainer);
  }
});

setTimeout(function() {
  document.getElementById("myVideo").removeAttribute("controls");
});

SkylinkDemo.init(config, function(error, success) {
  if (success) {
    SkylinkDemo.joinRoom({
      audio: true,
      video: true
    });
    document.getElementById("add-peer").addEventListener("click", function() {
      window.open(window.location.href, "_blank");
    });
  }
});
