$('#chatMessage').keyup(function(e){ if(e.keyCode == 13) $(this).trigger("enterKey"); });
//--------

$('#chatMessage').bind("enterKey", function(e){
  t.sendChatMsg( $('#chatMessage').val() );
  $('#chatMessage').val('');
});

// get the variables needed to connect to skyway
var t = new Skyway();
t.init(
  'http://sgbeta.signaling.temasys.com.sg:8018/',
  'fcc1ef3a-8b75-47a5-8325-3e34cabf768d',
  'app-0'
);

//--------
t.on("chatMessage", function ( msg, nick, isPvt )  {
  var newEntry = '<li class="thatsMe"> <div class="user">' + nick + '</div>'
    + '<div class="time">' + (new Date()).getHours() + ':' + (new Date()).getMinutes() + ':'
    + (new Date()).getSeconds() + '</div>'
    + '<div class="message">' + (isPvt?"<i>[pvt msg] ":"") + msg + (isPvt?"</i>":"")
    + '</div></li>'
  $('#chatLog').append( newEntry );
});
//--------
var nbPeers = 0;
t.on("addPeerStream", function(peerID, stream) {
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
  attachMediaStream( $('#videoLocal1')[0], stream );
  t.joinRoom();
});
//--------
t.on("readyStateChange", function(args){ t.getDefaultStream(); });
//--------
t.on("peerLeft", function(args){
  nbPeers -= 1;
  $("video").each( function(){
    if( this.peerID == args ){
      this.enabled = false; this.currentSrc = ''; this.poster = '/default.png';
    }
  });
});