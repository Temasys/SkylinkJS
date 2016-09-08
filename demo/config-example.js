/**************************** Note **********************************
 Save your api settings like appKey, defaultRoom and room and save it
 in a file called [config.js]
*********************************************************************/
var config = {
  appKey: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  defaultRoom: 'MY_DEFAULT_ROOM',
  enableDataChannel: true, // Disable this and sendBlobData(), sendP2PMessage() and sendURLData() will NOT work!
  enableIceTrickle: true,
  audioFallback: true,
  forceSSL: true
};

/**
 * For using credentials based authentication
 */
var secret = null; // 'xxxxx' Use App Key secret
var duration = 2; // 2 hours. Default is 24 for CORS auth
var startDateTimeStamp = (new Date ()).toISOString();

// Setup App Key for Privileged User Feature (for Privileged App Key + Auto Introduce Enabled)
if (window.location.pathname === '/demo/privileged/auto-priv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
  secret = null; // 'xxxxx' Use App Key secret

// Setup App Key for Privileged User Feature (for non-Privileged App Key + Auto Introduce Enabled)
} else if (window.location.pathname === '/demo/privileged/auto-unpriv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
  secret = null; // 'xxxxx' Use App Key secret

// Setup App Key for Privileged User Feature (for Privileged App Key + Auto Introduce Disabled)
} else if (window.location.pathname === '/demo/privileged/unauto-priv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
  secret = null; // 'xxxxx' Use App Key secret

// Setup App Key for Privileged User Feature (for non-Privileged App Key + Auto Introduce Disabled)
} else if (window.location.pathname === '/demo/privileged/unauto-unpriv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
  secret = null; // 'xxxxx' Use App Key secret
}

if (secret) {
  var genHashForCredentials = CryptoJS.HmacSHA1(config.defaultRoom + '_' + duration + '_' + startDateTimeStamp, secret);
  var credentials = encodeURIComponent(genHashForCredentials.toString(CryptoJS.enc.Base64));

  config.credentials = {
    duration: duration,
    startDateTime: startDateTimeStamp,
    credentials: credentials
  };
}