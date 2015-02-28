 var skylink = new Skylink(),
  $callee = document.getElementById('callee'),
  $status = document.getElementById('status'),
  $video = document.getElementById('video'),
  calling = false,
  status = 'Idle',
  room = null,
  peers = 0,
  timeout = null;

	//skylink.setLogLevel(skylink.LOG_LEVEL.INFO); 

  skylink.on('incomingStream', function (peerId, stream, isSelf, peerInfo) {
	 if(!calling && defaultRoom !== room) {
     
      // replace with your own UI logic
      var vid = document.createElement('video');
      vid.autoplay = true;
      vid.muted = isSelf;
      vid.id = peerId;
      $video.appendChild(vid);
      attachMediaStream(vid, stream);
     
      if(!isSelf) {
        updateStatus('in call');
      }
    }
  });

  skylink.on('peerJoined', function (peerId, peerInfo, isSelf) {
    peers++;

    if(!isSelf && calling) {
       room = generateRoomId();
       skylink.setUserData({
         id: defaultRoom,
         room: room
       });

       setTimeout(function() {
         skylink.sendMessage('/joincall');
         console.log('Call request sent. Room ' + room);
       }, 1000);
    }

    console.log('peerJoined ' + peerId + ' isSelf: ' + isSelf);
    updateStatus();
  });

  skylink.on('peerLeft', function (peerId, peerInfo, isSelf) {
    peers--;

    var vid = document.getElementById(peerId);
    if(vid) {
      $video.removeChild(vid);
    }

    console.log('peerLeft ' + peerId + ' isSelf: ' + isSelf);
    updateStatus();
  });

  skylink.on('incomingMessage', function (message, peerId, peerInfo) {
    
      if(message.content === '/joincall') {
        if(!calling) {
          if(incomingCallRequest(peerInfo.userData.id)) {
            skylink.sendMessage('/accept');
          }
          else {
            skylink.sendMessage('/hangup');
          }
        }
      }
    
      else if (message.content === '/accept') {
        updateStatus('Call starting');
        calling = false;
        clearTimeout(timeout);
        skylink.joinRoom(room = peerInfo.userData.room, {audio: true, video: true});
      }
    
      else if(message.content === '/hangup') {
        updateStatus('Call ended');
        calling = false;
        clearTimeout(timeout);
        skylink.joinRoom(room = defaultRoom);
      }
    
  });

  skylink.on('mediaAccessError', function() {
    setTimeout(function() {
      skylink.sendMessage('/hangup');
      updateStatus('Media access denied');
    }, 1000);
  });

  skylink.init({
    apiKey: 'cd7819c8-8513-4c3f-8ed1-bc1a35bc13ba', // replace this API key with your own. It's free! Sign up at http://developers.temasys.com.sg
    defaultRoom: defaultRoom = generateRoomId() // use your apps user id instead of a generated one
  }, function() {
    skylink.joinRoom(room = defaultRoom);
    updateStatus('Ready');
  });


  function hangUp() {
    skylink.sendMessage('/hangup');
  }

  function call() {
    calling = true;
    room = $callee.value;
    skylink.joinRoom(room);
    
    timeout = setTimeout(function() {
       if(calling) {
         skylink.sendMessage('/hangup');
         updateStatus('Nobody picked up');
       }
    }, 20*1000);
    
    updateStatus('Calling');
  }

  function incomingCallRequest(userid) {
    // replace with your own UI action or alert (Sound? Notification API?)
    return confirm(userid + ' is calling. Pick up?');
  }

  function updateStatus(text) {
    status = text || status;
    $status.textContent = 'Id: ' + defaultRoom + " - " + status + ' - Peers: ' + peers;
    if(text) {
      console.log(text);
    }
  }

  function generateRoomId() {
    var d = new Date().getTime();
    var uuid = 'xxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  };