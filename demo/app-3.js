//------------
// Create our Skyway object
var SkywayDemo = new Skyway();

////////////////////////////////////
///////TO FILL
var APPID = XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX;
var SECRETID = "XXXXXXXXXXXXX";
var ROOMNAME = "demo";
var SKYWAYSERVER = "http://sgbeta.signaling.temasys.com.sg:8018/";
///////
///////////////////////////////////

(function() {
  var now = new Date().toISOString();
  var hash = CryptoJS.HmacSHA1(ROOMNAME+"_500_"+now,SECRETID);//room : demo, duration: 500h
  var credentials = encodeURIComponent(hash.toString(CryptoJS.enc.Base64));
  SkywayDemo.init({
    roomserver: SKYWAYSERVER,
    appID: APPID,
    room: ROOMNAME,
    region: "sg",
    credentials : {
      startDateTime: now,
      duration: 500,
      credentials: credentials,
   }
 });
})();

//--------
SkywayDemo.on('readyStateChange', function (state){
	console.log("readyStateChange");
  if(state === SkywayDemo.READY_STATE_CHANGE.COMPLETED) {
    // SkywayDemo.getDefaultStream();
    SkywayDemo.joinRoom({
	  	audio: true,
	  	video: true
	  });
  }
});
//--------
SkywayDemo.on('mediaAccessSuccess',function (stream){
  console.log("mediaAccessSuccess");
  attachMediaStream(document.getElementById("myVideo"),stream);
});
//--------
SkywayDemo.on('addPeerStream', function (peerID, stream){
  console.log("addPeerStream");
  var div = document.createElement('video');
  div.setAttribute("style", "width: 640px; height: 480px;");
  div.setAttribute("autoplay","autoplay");
  div.setAttribute("id", "remote_"+peerID);
  document.body.appendChild(div);
  attachMediaStream(div, stream);
});
//--------
SkywayDemo.on('peerLeft', function (peerID){
  console.log("peerLeft");
  var DOMvideo = document.getElementById("remote_"+peerID);
  DOMvideo.src = '';
  document.body.removeChild(DOMvideo);  
});