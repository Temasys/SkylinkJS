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

// Setup App Key for Privileged User Feature (for Privileged App Key + Auto Introduce Enabled)
if (window.location.pathname === '/demo/privileged/auto-priv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';

// Setup App Key for Privileged User Feature (for non-Privileged App Key + Auto Introduce Enabled)
} else if (window.location.pathname === '/demo/privileged/auto-unpriv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';

// Setup App Key for Privileged User Feature (for Privileged App Key + Auto Introduce Disabled)
} else if (window.location.pathname === '/demo/privileged/unauto-priv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';

// Setup App Key for Privileged User Feature (for non-Privileged App Key + Auto Introduce Disabled)
} else if (window.location.pathname === '/demo/privileged/unauto-unpriv/') {
  config.appKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
}