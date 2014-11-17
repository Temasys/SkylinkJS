  var skylink = new Skylink();
  skylink.init({
    apiKey: '5ad4c5f3-94ce-4f8a-b1dc-c9fee5332700',
    defaultRoom: "MY_DEFAULT_ROOM"
  });
  skylink.setLogLevel(skylink.LOG_LEVEL.ERROR);
  var room = '';

  window.onload = function(){
     self = document.getElementById('self') || '';
     peer = document.getElementById('peer') || '';
     myvideo = document.getElementById('myvideo') || '';
  }

  JOINED_NOT_CALLING = "User _peer joined room _room";
  RECEIVING_CALL = "Ringing. _peer is calling";
  IN_CALL = "In call with _peer";
  MAKING_CALL = "Calling _peer";
  UPDATE_NAME = "You are now identified as _name";
  PEER_LEFT = "_peer left the room _room";
  JOINING_ROOM = "Joining room _room";

  skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
    addMessage(JOINED_NOT_CALLING, peerId, skylink._selectedRoom);
    if(isSelf) {
      return;
    }

    //Turns on video only when peer joins
    skylink.enableVideo();
    
    //Create video element for peer
    var vid = document.createElement('video');
    vid.id = peerId;
    vid.autoplay = true;
    document.body.appendChild(vid);
  });

  skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
      addMessage("Peer left: "+peerId);
      //return to own room;
      if (isSelf){
        enter();
        return;
      } 
      
      var vid = document.getElementById(peerId);
      document.body.removeChild(vid);
      enter();
  });

  skylink.on('incomingStream', function(peerId, stream, isSelf) {
    
    //Already attached on mediaAccessSuccess
    if(isSelf){
      attachMediaStream(myvideo,stream);
    };
    
    //Attach peer stream
    var vid = document.getElementById(peerId);
    attachMediaStream(vid, stream);
  });

  //Create own video element and attach stream to it
  skylink.on('mediaAccessSuccess', function(stream) {
    if (!document.getElementById('myvideo')){
      var myvid = document.createElement('video');
      myvid.id = 'myvideo';
      myvid.autoplay=true;
      document.body.appendChild(myvid);
    }
    var myvid = document.getElementById('myvideo');
    attachMediaStream(myvid, stream);
  });

  skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf){
    if (message.content == 'stop'){
      //enter();
    }
  });

  function enter(){
      room = self.value;
      //Join own room. Audio/video disabled by default
      skylink.joinRoom(room, {
        audio: false,
        video: false
      });
  }

  function call(){
      console.log("Called");
      //skylink.leaveRoom();
      room = peer.value;

      //Join peer's room & send own video stream
      skylink.joinRoom(room,{
          audio: false,
          video: true
      });
  }

  function stop(){
      console.log("Stopped");
      //Leave current room
      skylink.leaveRoom();

      skylink.sendMessage('stop');
  }

  function addMessage(message, peer, room, name) {
    console.log("Added message");
    var mapObj={
      _peer: peer,
      _room: room,
      _name: name
    }

    message = message.replace(/_peer|_room|_name/gi, function(matched){
      return mapObj[matched];
    });

    var status = document.getElementById('status');
    div = document.createElement('div');
    div.innerHTML = message;
    status.appendChild(div);
  }

  function setName(){
    console.log("Set name");
    skylink.setUserData(self.value);
    addMessage(UPDATE_NAME, null, null, self.value);
  }

  function clean(){
    console.log("Cleaned");
    var status = document.getElementById('status');
    while(status.hasChildNodes()){
      status.removeChild(status.firstChild);
    }
  }

  function enterAndUpdate(){
    console.log("Updated");
    enter();
    setName();
  }











