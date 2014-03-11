function blink(){
  $("#LED").attr("src","green-led.png");
  setTimeout(function(){$("#LED").attr("src","grey-led.png");},500);
};

// this is arbitrary, but in this implementation, we only join the room
// once the channel has been open AND we have a stream.
// we coul djoin the room without a stream, and be in receive-only mode
function maybeJoin( t ){
  if( !started && gotChannel && gotStream )
    $("#joinRoomBtn").show();
}

$(":button").hide();

$("#gumBtn"         ).click( function(e){ t.getDefaultStream(); } );
$("#openChannelBtn" ).click( function(e){ t.openChannel();      } );
$("#joinRoomBtn"    ).click( function(e){ t.joinRoom();         } );
$("#leaveRoomBtn"   ).click( function(e){ t.leaveRoom();        } );

var gotChannel = false;
var gotStream  = false;
var started    = false;

// get the variables needed to connect to skyway
var roomserver = 'http://54.251.99.180:8080/';
var owner = 'MomentMedia';
var room  = null;

var nbPeers = 0;
var t = new Temasys( roomserver, owner, room );
t.on("channelOpen", function(){
   gotChannel = true; maybeJoin( t ); $("#openChannelBtn").hide(); $("joinRoomBtn").show();
});
t.on("joinedRoom", function(){
  $("#joinRoomBtn").hide(); $("#leaveRoomBtn").show();
});
t.on("channelMessage", function(){ blink(); });
t.on("addPeerStream",  function(args){
   // NOTE ALEX: this is over simplified. Better create a new video element, whose id is
   // the peerid, so we can find them when the peer leave
   nbPeers += 1;
  $("#videoRemote" + nbPeers)[0].peerID = args[0];
  attachMediaStream( $('#videoRemote' + nbPeers)[0], args[1] );
});
t.on("mediaAccessSuccess", function(args){
  attachMediaStream( $('#videoLocal1')[0], args[0] );
  gotStream = true; maybeJoin( t ); $("#gumBtn").hide();
});
t.on("readystateChange", function(args){
  if(!args[0]) return;
  $("#openChannelBtn").show(); $("#gumBtn").show(); 
});
t.on("peerLeft", function(args){
  $("video").each( function(){
    if( $(this).peerID == args[0] ) $(this).currentSrc = '';
  });
});
  
