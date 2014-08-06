var Demo = Demo || {};

Demo.Elements = {
  apiSettingsDisplay: '.api-settings-display',
  loadingDisplay: '.loading-display',
  videoDisplay: '.video-display',
  videoPorts: '.video-ports',
  videoPortItem: '.video-port-item',
  userPorts: '.user-ports',
  userPortVideo: '.user-port-video',
  radioItem: '.radio-item',
  userApiKey: '#user-api-key',
  userApiRoom: '#user-api-room',
  startApiCall: '#start-api-call'
};

Demo.Margins = {
  userPortVideo: [-12, -15]
};

Demo.Paddings = {
  userPorts: [12, 15]
};

Demo._onresize = function () {
  if (!window.jQuery) {
    return;
  }
  var windowHeight = $(window).outerHeight();
  var windowWidth  = $(window).outerWidth();
  var userPortWidth = (windowWidth * 0.25) - (Demo.Paddings.userPorts[1] * 2) - 5;
  var userPortVideoWidth = windowWidth * 0.25;
  var userPortHeight = windowHeight - (Demo.Paddings.userPorts[0] * 2);
  var userPortVideoHeight = userPortHeight * 0.25;
  var videoPortWidth = windowWidth * 0.75;
  var videoPortItemHeight = (windowHeight- 5) / 2;

  // Set Height
  $('body').height(windowHeight);
  $(Demo.Elements.videoPorts).height(windowHeight);
  $(Demo.Elements.videoPortItem).height(videoPortItemHeight);
  $(Demo.Elements.userPorts).height(userPortHeight);
  $(Demo.Elements.userPortVideo).height(userPortVideoHeight);

  // Set Width
  $('body').width(windowWidth);
  $(Demo.Elements.videoPorts).width(videoPortWidth);
  $(Demo.Elements.videoPortItem).width(videoPortWidth);
  $(Demo.Elements.userPorts).width(userPortWidth);
  $(Demo.Elements.userPortVideo).width(userPortVideoWidth);

  // Set Margin
  $(Demo.Elements.userPortVideo).css('margin', Demo.Margins.userPortVideo[0] +
    'px ' + Demo.Margins.userPortVideo[1] + 'px 0');

  // Set Padding
  $(Demo.Elements.userPorts).css('padding', Demo.Paddings.userPorts[0] +
    'px ' + Demo.Paddings.userPorts[1] + 'px');
};

window.onload = function () {
  Demo._onresize();
};
window.onresize = function () {
  Demo._onresize();
};