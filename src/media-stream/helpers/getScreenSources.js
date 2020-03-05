import logger from '../../logger';

const getScreenSources = () => new Promise((resolve) => {
  const { navigator, AdapterJS } = window;
  const outputSources = {
    mediaSource: [],
    mediaSourceInput: [],
  };

  // For chrome android 59+ has screensharing support behind chrome://flags (needs to be enabled by user)
  // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=487935
  if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
    if (AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 59) {
      outputSources.mediaSource = ['screen'];
    }
    resolve(outputSources);
    return null;
  }

  // TODO: Check if AdapterJS.webrtcDetectedType === 'plugin' is needed for IE/Safari Commercial support. If they do not support gDM method, then we will need a plugin

  if ((AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 34)
      || (AdapterJS.webrtcDetectedBrowser === 'firefox' && AdapterJS.webrtcDetectedVersion >= 38)
      || (AdapterJS.webrtcDetectedBrowser === 'opera' && AdapterJS.webrtcDetectedVersion >= 21)) {
    // Just warn users for those who did not configure the Opera screensharing extension settings, it will not work!
    if (AdapterJS.webrtcDetectedBrowser === 'opera' && !(AdapterJS.extensionInfo
        && AdapterJS.extensionInfo.opera && AdapterJS.extensionInfo.opera.extensionId)) {
      logger.log.WARN('Please ensure that your application allows Opera screensharing!');
    }

    outputSources.mediaSource = ['window', 'screen'];

    // Chrome 52+ and Opera 39+ supports tab and audio
    // Reference: https://developer.chrome.com/extensions/desktopCapture
    if ((AdapterJS.webrtcDetectedBrowser === 'chrome' && AdapterJS.webrtcDetectedVersion >= 52)
        || (AdapterJS.webrtcDetectedBrowser === 'opera' && AdapterJS.webrtcDetectedVersion >= 39)) {
      outputSources.mediaSource.push('tab', 'audio');

      // Firefox supports some other sources
      // Reference: http://fluffy.github.io/w3c-screen-share/#screen-based-video-constraints
      //            https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
      //            https://bugzilla.mozilla.org/show_bug.cgi?id=1037405
      //            https://bugzilla.mozilla.org/show_bug.cgi?id=1313758
    } else if (AdapterJS.webrtcDetectedBrowser === 'firefox') {
      outputSources.mediaSource.push('browser', 'camera', 'application');
    }
  }
  resolve(outputSources);
  return null;
});

export default getScreenSources;
