/* eslint-disable */
/**************************** Note **********************************
 Save your api settings like appKey, defaultRoom and room and save it
 in a file called [config.js]
 *********************************************************************/
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

if (!getParameterByName('room')) {
  window.location.search = '?room=' + (new Date()).getTime();
}

const config = {
  // appKey: getParameterByName('appKey') || '6198a7fa-b8b0-4b0a-8079-4642198c8601',
  appKey: getParameterByName('appKey') || 'c7ae7e8a-2e24-43a5-85c6-d4dafbdfecb6',
  defaultRoom: getParameterByName('room'),
  enableIceTrickle: !getParameterByName('enableIceTrickle'),
  audioFallback: !!getParameterByName('audioFallback'),
  enableDataChannel: true,
  forceSSL: true,
};

/**
 * For using credentials based authentication
 */
const secret = null; // 'xxxxx' Use App Key secret
const duration = 2; // 2 hours. Default is 24 for CORS auth
const startDateTimeStamp = (new Date ()).toISOString();

if (secret) {
  const genHashForCredentials = CryptoJS.HmacSHA1(config.defaultRoom + '_' + duration + '_' + startDateTimeStamp, secret);
  const credentials = encodeURIComponent(genHashForCredentials.toString(CryptoJS.enc.Base64));

  config.credentials = {
    duration: duration,
    startDateTime: startDateTimeStamp,
    credentials: credentials
  };
}

export default config;
