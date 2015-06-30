var availableRooms = ['test1', 'test2'];

var room1, room2;

var stream1, stream2;

var videoListDom1 = document.getElementById('videoList1');
var videoListDom2 = document.getElementById('videoList2');

var audioTrackListDom = document.getElementById('audioTrackList');
var videoTrackListDom = document.getElementById('videoTrackList');


StreamGetSources(function (sources) {
  sources.audio.forEach(function (value) {
    var option = document.createElement('option');
    option.value = value.id;
    option.innerHTML = value.label;

    audioTrackListDom.appendChild(option);
  });

  sources.video.forEach(function (value) {
    var option = document.createElement('option');
    option.value = value.id;
    option.innerHTML = value.label;

    videoTrackListDom.appendChild(option);
  });
});

function getStream(defer) {
  var stream = new Stream(null, {
    audio: {
      sourceId: audioTrackListDom.value
    },
    video: {
      sourceId: videoTrackListDom.value
    }

  }, function (event, data) {
    if (event === 'stream:start') {
      defer(stream);
    }
  });
}

function attachStream(stream, data) {
  var room = data.roomName || data.name;
  var peerId = data.id || 'main';
  var userId = data.userId;

  var video = document.createElement('video');
  video.autoplay = 'autoplay';

  if (stream.sourceType === 'local') {
    video.style.opacity = '0.5';

    if (room === 'test1' ? stream.id !== stream1.id : stream.id !== stream2.id) {
      video.style.border = 'solid 2px red';
    }

  } else {
    if (peerId !== 'main') {
      video.style.border = 'solid 2px red';
    }
  }

  var videoDom = document.createElement('div');
  videoDom.className = 'video-item';
  videoDom.id = room + '-' + userId + '-' + peerId;
  videoDom.innerHTML = '<span style="position: absolute;">' + userId + '</span>';

  if (room === 'test1') {
    videoListDom1.appendChild(videoDom);
  } else {
    videoListDom2.appendChild(videoDom);
  }

  videoDom.appendChild(video);
  stream.attachElement(video);
}

function handler(event, data) {
  if (event === 'room:ready') {
    getStream(function (stream) {
      if (data.name === 'test1') {
        stream1 = stream;
        room1.join(stream);
      } else {
        stream2 = stream;
        room2.join(stream);
      }
    });
  }

  if (event === 'room:join') {
    console.info('data', data);
    if (data.name === 'test1') {
      attachStream(stream1, data);
    } else {
      attachStream(stream2, data);
    }
  }

  if (event === 'peer:stream' && data.sourceType === 'remote') {
    attachStream(data.stream, data);
  }

  if (event === 'room:leave') {
    if (data.name === 'test1') {
      stream1.stop();
      videoListDom1.innerHTML = '';
    } else {
      stream2.stop();
      videoListDom2.innerHTML = '';
    }
  }

  if (event === 'peer:disconnect') {
    var id = data.roomName + '-' + data.userId + '-' + (data.id || '');
    var element = document.getElementById(id);

    if (data.roomName === 'test1') {
      videoListDom1.removeChild(element);
    } else {
      videoListDom2.removeChild(element);
    }
  }
}

joinRoom = function (name) {
  switch (name) {
  case 'test1':
    if (!room1) {
      room1 = new Room(name, handler);
    } else {
      throw new Error('You have already joined room1');
    }
    break;
  case 'test2':
    if (!room2) {
      room2 = new Room(name, handler);
    } else {
      throw new Error('You have already joined room2');
    }
  }
}

leaveRoom = function (name) {
  switch (name) {
  case 'test1':
    if (room1) {
      room1.leave();
    } else {
      throw new Error('You are not in room1');
    }
    break;
  case 'test2':
    if (room2) {
      room2.leave();
    } else {
      throw new Error('You are not in room2');
    }
  }
}

sendStream = function (name) {
  switch (name) {
  case 'test1':
    if (room1) {
      getStream(function (stream) {
        room1.addStreamConnection(stream);
      });

    } else {
      throw new Error('You are not in room1');
    }
    break;
  case 'test2':
    if (room2) {
      getStream(function (stream) {
        room2.addStreamConnection(stream);
      });

    } else {
      throw new Error('You are not in room2');
    }
  }
}
