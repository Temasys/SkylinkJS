//$(document).ready(function () {
stream = null;

audioTrackList = document.getElementById('audioTrackList');
videoTrackList = document.getElementById('videoTrackList');
output = document.getElementById('output');


addToOption = function (element, list) {
  for (var i = 0; i < list.length; i++) {
    element.innerHTML += '<option value="' + list[i].id + '">' +
      list[i].label + '</option>';
  }
};

stopStream = function () {
  if (stream) {
    stream.stop();
  }
};

function handler(event, data) {
  console.log(event, data);

  if (event === 'stream:start') {
    stream.attachElement(document.getElementById('stream'));
  }
};

getStream = function() {
  stopStream();

  var options = {
    audio: true,
    video: true
  };
  if (audioTrackList.value) {
    options.audio = {
      sourceId: audioTrackList.value
    };
  }
  if (videoTrackList.value) {
    options.video = {
      sourceId: videoTrackList.value
    };
  }

  stream = new Stream(null, options, handler);
};

bindStream = function () {
  stopStream();

  getUserMedia({
    audio: true,
    video: true
  }, function (data) {
    stream = new Stream(data, {}, handler);
  }, function (error) {
    console.error('exception occurred:', error);
  });
};

stopAudioTrack = function () {
  stream.stopAudio();
};

muteAudioTrack = function () {
  stream.muteAudio();
};

unmuteAudioTrack = function () {
  stream.unmuteAudio();
};

stopVideoTrack = function () {
  stream.stopVideo();
};

muteVideoTrack = function () {
  stream.muteVideo();
};

unmuteVideoTrack = function () {
  stream.unmuteVideo();
};

StreamGetSources(function (sources) {
  // Add to list
  addToOption(audioTrackList, sources.audio);
  addToOption(videoTrackList, sources.video);
});

//});