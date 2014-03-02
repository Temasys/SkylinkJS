var webserver = {
  ip: '54.251.99.180',
  port: '8080'
}
var owner = 'agouaillard';
var rid   = 'agouaillard';

var path = 'http://' + webserver.ip + ":" + webserver.port + '/';
path += owner + '/room/' + rid;
path += '?client=native';

xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
  if(this.readyState == this.DONE) {

    if( this.status == 200 ) { // success

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
console.log( 'APP: wating for webserver answer.' );

// got the info from the web server, proceed
function Proceed( vars ) {
  // parse the result int objects for the API
  console.dir( vars );
 
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
    displayName:    vars.displayName 
  }; 

  var room = {
    id:             vars.room_key,
    token:          vars.roomCred,
    tokenTimestamp: vars.timeStamp,
    signalingServer: {
      ip:           vars.ipSigserver,
      port:         vars.portSigserver
    }
  };

  // start our API
  var t = new Temasys(key, user, room);
  console.log( 'APP: trying to to open a channel with the signalling server.' )
  t.openChannel();
  // on channel open, joinRoom
}
