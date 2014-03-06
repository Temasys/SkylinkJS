// original variable, to be populated by the main webserver
var webserver = { ip: '54.251.99.180', port: '8080' }
var owner = 'agouaillard';
var rid   = 'agouaillard';

// status variables:
var gotInfo     = false;
var Info        = null;
var gotStream   = false;
var localStream = null;
var started     = false;

// get the variables needed for connecting to skyway
var path = 'http://' + webserver.ip + ":" + webserver.port + '/';
path += owner + '/room/' + rid;
path += '?client=native';
xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if(this.readyState == this.DONE) {
    if( this.status == 200 ) { // success
      // this call the main app
      console.log( this.response );
      Info = JSON.parse(this.response);
      gotInfo = true;
      maybeProceed();
    } else { // failure
      console.log( "XHR  - ERROR " + this.status, false );
    }
  }
}
xhr.open( 'GET', path, true );
console.log( 'APP: fetching infos from webserver' );
xhr.send(  );
console.log( 'APP: waiting for webserver answer.' );

doGetUserMedia();









//----------------------------------------------------------------------------------------------
// GUM - LOCAL MEDIA STREAM
//
function doGetUserMedia(){
  try {
    getUserMedia(
    {
      'audio': true,
      'video': true
    },
    onUserMediaSuccess,
    function(mediaError){onUserMediaError(mediaError);}
    );
    console.log( 'APP  - Requested: A/V.' );
  } catch (e) {
    handleGetUserMediaFailure(e)
  }
};
//----------------------------------------------------------------------------------------------
function handleGetUserMediaFailure(e) {
  var alert_msg = '';
  alert_msg += "getUserMedia() failed. Is this a WebRTC capable browser?";
  alert( alert_msg );
  console.log( 'APP  - getUserMedia failed with exception type: ' + e.name );
  if( e.message )
    console.log( 'APP  - getUserMedia failed with exception: ' + e.message );
  if( e.constraintName )
    console.log( 'APP  - getUserMedia failed because of the following constraint: '
      + e.constraintName );
};
//----------------------------------------------------------------------------------------------
function onUserMediaSuccess(stream) {
  console.log( 'GUM  - User has granted access to local media.' );
  localStream = stream;
  attachMediaStream( $('#videoLocal1')[0], stream );
  gotStream = true;
  maybeProceed();
};
//----------------------------------------------------------------------------------------------
function onUserMediaError(e)
{
  var alert_msg = '';
  alert_msg += "getUserMedia() failed. Is this a WebRTC capable browser?";
  alert( alert_msg );
  console.log( 'APP  - getUserMedia failed with exception type: ' + e.name );
  if( e.message )
    console.log( 'APP  - getUserMedia failed with exception: ' + e.message );
  if( e.constraintName )
    console.log( 'APP  - getUserMedia failed because of the following constraint: '
      + e.constraintName );
};

function Proceed( ) {

  var vars = Info;

  // "notOwnerHost": true,
  // "privateOwner": false,
  // "in_room": true,
  // "isLocked": false,
  // "LogServerUrl": "Http://54.251.99.180:5000"

  var key =         vars.cid;

  var user = {
    id:             vars.username,
    token:          vars.userCred,
    tokenTimestamp: vars.tokenTempCreated,
    displayName:    vars.displayName,
    streams:        [] 
  }; 

  var room = {
    id:             vars.room_key,
    token:          vars.roomCred,
    tokenTimestamp: vars.timeStamp,
    signalingServer: {
      ip:           vars.ipSigserver,
      port:         vars.portSigserver
    },
    pcHelper: {
      pcConstraints:    JSON.parse(vars.pc_constraints),
      pcConfig:         null,
      offerConstraints: JSON.parse(vars.offer_constraints),
      sdpConstraints:   {
        'mandatory': {
          'OfferToReceiveAudio':true,
          'OfferToReceiveVideo':true 
        }
      }
    }
  };

  // hack
  user.streams.push( localStream );

  //-----------------------------------------
  //  start our API and run
  //-----------------------------------------

  var nbPeers = 0;
  var t = new Temasys(key, user, room);
  console.log( 'APP: trying to to open a channel with the signalling server.' )
  t.on("channelOpen", function(){ console.log( 'APP: channel is now open.' ); t.joinRoom() });
  t.on("channelMessage", function(){ console.log( 'APP: msg in.' ); });
  t.on("addPeerStream", function(args){ nbPeers += 1; attachMediaStream( $('#videoRemote' + nbPeers)[0], args[1] ); });
  // start the cascade
  t.openChannel();
};

function maybeProceed(){
  if(!started && gotInfo && gotStream)
    Proceed();
};
