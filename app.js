// original variable, to be populated by the main webserver
var webserver = { ip: '54.251.99.180', port: '8080' }

// status variables:
var gotChannel  = false;
var gotStream   = false;
var started     = false;

// get the variables needed for connecting to skyway
var path = 'http://' + webserver.ip + ":" + webserver.port + '/';
path += "room/MomentMedia";
path += '?client=native';
xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if(this.readyState == this.DONE) {
    if( this.status == 200 ) { // success
      // this call the main app
      console.log( this.response );
      Proceed( JSON.parse(this.response) );
    } else { // failure
      console.log( "XHR  - ERROR " + this.status, false );
    }
  }
}
xhr.open( 'GET', path, true );
console.log( 'APP: fetching infos from webserver' );
xhr.send(  );
console.log( 'APP: waiting for webserver answer.' );

//------------------------------------------------------------------
function Proceed( Info ) {
  var _key =        Info.cid;
  var _user = {
    id:             Info.username,
    token:          Info.userCred,
    tokenTimestamp: Info.tokenTempCreated,
    displayName:    Info.displayName,
    streams:        [] 
  }; 
  var _room = {
    id:             Info.room_key,
    token:          Info.roomCred,
    tokenTimestamp: Info.timeStamp,
    signalingServer: {
      ip:           Info.ipSigserver,
      port:         Info.portSigserver
    },
    pcHelper: {
      pcConstraints:    JSON.parse(Info.pc_constraints),
      pcConfig:         null,
      offerConstraints: JSON.parse(Info.offer_constraints),
      sdpConstraints:{'mandatory':{'OfferToReceiveAudio':true,'OfferToReceiveVideo':true}}
    }
  };

  var nbPeers = 0;
  var t       = new Temasys( _key, _user, _room );
  function blink(){
    $("#LED").attr("src","green-led.png");
    setTimeout(function(){$("#LED").attr("src","grey-led.png");},500);
  }
  function maybeJoin( t ){
    if( !started && gotChannel && gotStream ){
      started = true;
      t.joinRoom();
    }
  }
  t.on("channelOpen", function(){
     console.log( 'APP: channel is now open.' );
     gotChannel = true;
     maybeJoin( t );
  });
  t.on("channelMessage", function(){ console.log( 'APP: msg in, blink!' ); blink(); });
  t.on("addPeerStream",  function(args){
     nbPeers += 1;
     attachMediaStream( $('#videoRemote' + nbPeers)[0], args[1] );
  });
  t.on("mediaAccessSuccess", function(args){
    console.log( 'APP: got access to local media.' )
    attachMediaStream( $('#videoLocal1')[0], args[0] );
    gotStream = true;
    maybeJoin( t );
  });
  // start the waterfall
  console.log( 'APP: trying to to open a channel with the signalling server.' )
  t.openChannel();
  console.log( 'APP: trying to to get access to local media.' )
  t.getDefaultStream();
};
