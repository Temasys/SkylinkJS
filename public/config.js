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
  appKey: '1a6a8a99-e93d-4e59-bc3d-4276bb76e26c',
  defaultRoom: getParameterByName('room'),
  enableDataChannel: true, // Disable this and sendBlobData(), sendP2PMessage() and sendURLData() will NOT work!
  enableIceTrickle: true,
  audioFallback: true,
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
