var Demo = Demo || {};

Demo.API = {
  defaultApiKey: 'fcc1ef3a-8b75-47a5-8325-3e34cabf768d',
  peers: 0
};

Demo.Skyway = new Skyway();

Demo.Skyway.on('readyStateChange', function (state) {
  if (state === Demo.Skyway.READY_STATE_CHANGE.COMPLETED) {
    Demo.Skyway.joinRoom({
      audio: { stereo: true },
      video: {
        res: Demo.Skyway.VIDEO_RESOLUTION.HD,
        frameRate: 50
      },
      bandwidth: {
        audio: 50,
        video: 256,
        data: 1638400
      }
    });
  }
});

Demo.Skyway.on('joinedRoom', function (state) {
  $(Demo.Elements.videoDisplay).fadeIn();
  $(Demo.Elements.loadingDisplay).fadeOut();
});

Demo.Skyway.on('mediaAccessSuccess', function (stream) {
  attachMediaStream( $(Demo.Elements.userPortVideo)[0], stream );
});

Demo.Skyway.on('addPeerStream', function (peerId, stream) {
  Demo.API.peers += 1;
  if (Demo.API.peers > 2) {
    console.error('Demo - This demo only holds 2 peers');
    Demo.API.peers -= 1;
  } else {
    var element = $(Demo.Elements.videoPortItem)[Demo.API.peers - 1]
      .getElementsByTagName('video')[0];
    attachMediaStream(element, stream );
    element.id = peerId;
    $(element).slideDown();
  }
});

Demo.Skyway.on('peerLeft', function (peerId) {
  Demo.API.peers -= 1;
  $('#' + peerId).fadeOut();
});

$(document).ready(function() {
  //--
  $(Demo.Elements.apiSettingsDisplay).fadeIn();
  $(Demo.Elements.userApiKey).val(Demo.API.defaultApiKey);
  //--
  $(Demo.Elements.radioItem).click(function () {
    $(Demo.Elements.radioItem).removeClass('selected');
    $(this).addClass('selected');
    if ($(this).attr('data') === 'temasys') {
      $(Demo.Elements.userApiKey).val(Demo.API.defaultApiKey);
      $(Demo.Elements.userApiKey)[0].disabled = true;
    } else {
      $(Demo.Elements.userApiKey).val('');
      $(Demo.Elements.userApiKey)[0].disabled = false;
    }
  });
  //--
  $(Demo.Elements.startApiCall).click(function () {
    if ($(Demo.Elements.userApiKey).val() === '') {
      alert('Please enter an API Key');
    } else if ($(Demo.Elements.userApiRoom).val() === '') {
      alert('Please enter a Room');
    } else {
      $(Demo.Elements.apiSettingsDisplay).fadeOut();
      $(Demo.Elements.loadingDisplay).fadeIn();
      var apiKey = $(Demo.Elements.userApiKey).val();
      var room = $(Demo.Elements.userApiRoom).val();
      Demo.Skyway.init({
        appKey: apiKey,
        room: room
      });
    }
  });
});