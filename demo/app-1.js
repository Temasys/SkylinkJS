//--------------------
// PURE GUI
//--------------------

//--------
$('#chatMessage').keyup(function(e){ if(e.keyCode == 13) $(this).trigger("enterKey"); });
//--------

//--------
function blink(){
  $(".channel").css("background-color","00FF00");
  setTimeout(function(){$(".channel").css("background-color","green")},500);
};
//--------
function addPeer( peer ){
  var newListEntry = '<li id="user' + peer.id + '" class="badQuality">'
    + '<div style="text-align:center;"><h4>' + peer.displayName + '</h4>';
  for( var i=0; i<6; i++) newListEntry += '<div class="circle ' + i + '"></div>';
  newListEntry += '</div></li>'
  $("#contactList ul.active").append( newListEntry );
  $("#user" + peer.id + " .0").css("background-color","green");
};
//--------
function rmPeer( peerID ){ $("#user" + peerID).remove(); };
//--------
$(":button").hide();

//--------------------
// GUI to API
//--------------------

$("#gumBtn"         ).click( function(e){ console.log(window.webrtcDetectedBrowser);t.getDefaultStream(); } );
$("#joinRoomBtn"    ).click( function(e){ t.joinRoom();         } );
$("#leaveRoomBtn"   ).click( function(e){ t.leaveRoom();        } );
$('#chatMessage').bind("enterKey", function(e) {
  t.sendChatMsg( $('#chatMessage').val() );
  $('#chatMessage').val('');
});

//--------------------
// API to GUI
//--------------------

// get the variables needed to connect to skyway
var roomserver = 'http://54.251.99.180:8080/';
var apikey = 'apitest';
var room  = null;
var t = new Skyway();
t.init(roomserver, apikey, room);

//--------
t.on("channelOpen", function(){ $(".channel").css("background-color","green"); });
//--------
t.on("channelClose", function(){
  $("#joinRoomBtn" ).show();
  $("#leaveRoomBtn" ).hide();
  $(".channel").css("background-color","red");
 });
//--------
t.on("joinedRoom", function(){ $("#joinRoomBtn"   ).hide(); $("#leaveRoomBtn").show(); });
//--------
t.on("channelMessage", blink);
//--------
t.on("chatMessage", function ( msg, nick, isPvt ) {
  var newEntry = '<li class="thatsMe"> <div class="user">' + nick + '</div>'
    + '<div class="time">' + (new Date()).getHours() + ':' + (new Date()).getMinutes() + ':'
    + (new Date()).getSeconds() + '</div>'
    + '<div class="message">' + (isPvt?"<i>[pvt msg] ":"") + msg + (isPvt?"</i>":"")
    + '</div></li>'
  $('#chatLog').append( newEntry );
});
//--------
t.on("peerJoined", function(id){ addPeer({ id: id , displayName: id }); });
//--------
var nbPeers = 0;
t.on("addPeerStream", function(peerID, stream){
  nbPeers += 1;
  if( nbPeers > 2 ){
    alert( "We only support up to 2 streams in this demo" );
    nbPeers -= 1;
    return;
  }
  var videoElmnt = $("#videoRemote1")[0];
  if( videoElmnt.src.substring(0,4) == 'blob' ) videoElmnt = $("#videoRemote2")[0];
  videoElmnt.peerID = peerID;
  attachMediaStream( videoElmnt, stream );
});
//--------
t.on("mediaAccessSuccess", function(stream){
  attachMediaStream( $('#videoLocal1')[0], stream ); $("#gumBtn").hide();
});
//--------
t.on("readyStateChange", function(state){
  if(!state) return; $("#joinRoomBtn").show(); $("#gumBtn").show();
  $("#channelStatus").show();
});
//--------
t.on("peerLeft", function(peerID){
  nbPeers -= 1;
  $("video").each( function(){
    if( this.peerID == peerID ){
      this.poster  = '/default.png';
      this.src = '';
    }
  });
 rmPeer( peerID );
});
//--------
t.on("handshakeProgress", function(state, user){
  var stage = 0;
  switch( state ){
    case 'welcome': stage = 1; break;
    case 'offer'  : stage = 2; break;
    case 'answer' : stage = 3; break;
  }
  for( var i=0; i<=stage; i++ )
    $("#user" + user + " ." + i ).css("background-color","green");
});
//--------
t.on("candidateGenerationState",function(state, user){
  var color = "yellow";
  switch( state ){
    case 'done': color = 'green'; break;
  }
  $("#user" + user + " .4" ).css("background-color",color);
});
//--------
t.on("iceConnectionState",function(state, user){
  var color = 'yellow';
  switch( state ){
    case 'new': case 'closed': case 'failed': color = 'red';    break;
    case 'checking':  case 'disconnected':    color = 'yellow'; break;
    case 'connected': case 'completed':       color = 'green';
  }
  $("#user" + user + " .5" ).css("background-color",color);
  if( state == 'checking' ){
    setTimeout( function(){
      if( $('#user' + user + " .5" ).css("background-color") == 'yellow' )
        rmPeer( user );
    }, 30000 );
  }
});

