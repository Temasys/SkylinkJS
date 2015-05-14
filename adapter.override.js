if (window.navigator.mozGetUserMedia) {
  var tempGetUserMedia = window.navigator.getUserMedia;

  window.navigator.getUserMedia = function (constraints, successCb, failureCb) {
    constraints = constraints || {};

    if (constraints.video ? !!constraints.video.mediaSource : false) {
      constraints.video.mediaSource = 'window';
      constraints.video.mozMediaSource = 'window';
    }

    window.test = constraints;

    tempGetUserMedia(constraints, successCb, failureCb);
  };

  window.getUserMedia = window.navigator.getUserMedia;

  window.hasMultiStreamSupport = window.webrtcDetectedVersion > 37;

} else if (window.navigator.webkitGetUserMedia) {
  var tempGetUserMedia = window.navigator.getUserMedia;

  /* Listener that shows if extension is installed */
  window.addEventListener('message', function (event) {
    if (event.data == 'PermissionDeniedError') {
      window.chromeCallback(event.data);
    }

    if (event.data == 'rtcmulticonnection-extension-loaded') {
        console.log('loaded extension');
    }

    if (event.data.sourceId) {
      console.log('got sourceId ' + event.data.sourceId);
      window.chromeCallback(null, event.data.sourceId);
    }
  });

  window.navigator.getUserMedia = function (constraints, successCb, failureCb) {
    constraints = constraints || {};

    if (constraints.video ? !!constraints.video.mediaSource : false) {
      if (window.webrtcDetectedBrowser !== 'chrome') {
        throw new Error('Current browser does not support screensharing');
      }

      window.chromeCallback = function(error, sourceId) {
        if(!error) {
          constraints.video.mandatory = constraints.video.mandatory || {};
          constraints.video.mandatory.chromeMediaSource = 'desktop';
          constraints.video.mandatory.maxWidth = window.screen.width > 1920 ? window.screen.width : 1920;
          constraints.video.mandatory.maxHeight = window.screen.height > 1080 ? window.screen.height : 1080;

          if (sourceId) {
            constraints.video.mandatory.chromeMediaSourceId = sourceId;
          }
          window.test = constraints;

          delete constraints.video.mediaSource;

          tempGetUserMedia(constraints, successCb, failureCb);

        } else {
          throw new Error('Failed retrieving selected screen');
        }
      };

      window.postMessage('get-sourceId', '*');

    } else {
      window.test = constraints;

      tempGetUserMedia(constraints, successCb, failureCb);
    }
  };

  window.getUserMedia = window.navigator.getUserMedia;

  window.hasMultiStreamSupport = window.webrtcDetectedVersion > 39;

} else {
  var tempGetUserMedia = window.navigator.getUserMedia;

  window.navigator.getUserMedia = function (constraints, successCb, failureCb) {
    constraints = constraints || {};

    if (constraints.video ? !!constraints.video.mediaSource : false) {
      // check if plugin is ready
      if(AdapterJS.WebRTCPlugin.pluginState === 4) {
        // check if screensharing feature is available
        if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature &&
          !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
          // set the constraints
          constraints.video.optional = constraints.video.optional || [];
          constraints.video.optional.push({
            sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey || 'Screensharing'
          });

          delete constraints.video.mediaSource;
        } else {
          throw new Error('The plugin installed does not support screensharing');
        }
      } else {
        throw new Error('The plugin is currently not yet available');
      }
    }

    window.test = constraints;

    tempGetUserMedia(constraints, successCb, failureCb);
  };

  window.getUserMedia = window.navigator.getUserMedia;

  if (!!window.AdapterJS.WebRTCPlugin.plugin) {
    var parts = (window.AdapterJS.WebRTCPlugin.plugin.version || '0.0.0').split('.');

    if ( parseInt(parts[0], 10) > 0 ) {
      window.hasMultiStreamSupport = true;
    } else if ( parseInt(parts[1], 10) > 8 ) {
      window.hasMultiStreamSupport = true;

    } else if ( parseInt(parts[2], 10) > 829) {
      window.hasMultiStreamSupport = true;
    } else {
      window.hasMultiStreamSupport = false;
    }

  } else {
    window.hasMultiStreamSupport = false;
  }
}