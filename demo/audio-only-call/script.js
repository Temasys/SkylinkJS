var SkylinkDemo = new Skylink();

SkylinkDemo.on("incomingStream", function(peerId, stream, isSelf, peerInfo) {
  var peer = document.createElement("div");
  peer.id = peerId;

  var peerVoice = document.createElement("video");
  peerVoice.autoplay = true;
  peerVoice.controls = true;
  peerVoice.muted = isSelf;
  peerVoice.poster = "../assets/img/user.png";
  peerVoice.setAttribute("playsinline", true);

  var peerName = document.createElement("span");
  peerName.innerHTML = isSelf ? "Me" : peerId;
  peerName.className = "peer-name";

  document.getElementById("js-peers-container").appendChild(peer);
  peerVoice.className = "peer-audio";

  if (isSelf) {
    peer.className = "avatar local-avatar";
  } else {
    peer.className = "avatar remote-avatar";
  }

  peer.appendChild(peerVoice);
  peer.appendChild(peerName);

  attachMediaStream(peerVoice, stream);

  setTimeout(function() {
    peerVoice.removeAttribute("controls");
  });
});

SkylinkDemo.on("peerLeft", function(peerId, peerInfo, isSelf) {
  var elm = document.getElementById(peerId);
  if (elm) {
    elm.remove();
  } else {
    console.error("Peer audio element for " + peerId + " does not exists");
  }
});

SkylinkDemo.init(config, function(error, success) {
  if (error) {
    console.error("Init failed", error);
  } else {
    SkylinkDemo.joinRoom({
      audio: true,
      video: false
    });

    document.getElementById("add-peer").addEventListener("click", function() {
      window.open(window.location.href, "_blank");
    });
  }
});
