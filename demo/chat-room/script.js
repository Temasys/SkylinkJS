// Create our Skylink object
var userList;
var messageList;
  
(function()
{
  //Get Object by ID
  userList = document.getElementById("UserList");
  messageList = document.getElementById("MessageList");
  var userInputName = document.getElementById("UserNameInput");
  var userInputRoom = document.getElementById("RoomNameInput");
  var userInputMessage = document.getElementById("MessageInput");
  var userInputMessageButton = document.getElementById("MessageInputButton");
  
  //Input Events  
  userInputName.addEventListener("keypress", function()
  {
    if (event.keyCode == 13)
    {
      setName(userInputName.value);
      userInputName.value='';
    }
  });
  userInputRoom.addEventListener("keypress", function()
  {
    if (event.keyCode == 13)
    {
      setRoom(userInputRoom.value);
      userInputRoom.value='';
      
    }
  });
  function getTextAndSend()
  {
    sendMessage(userInputMessage.value);
    userInputMessage.value='';
  }
  userInputMessage.addEventListener("keypress", function()
  {
    if (event.keyCode == 13)
      getTextAndSend();
  });
  userInputMessageButton.addEventListener("click", function()
  {
    getTextAndSend();
  });
})();

SkylinkDemo.on('readyStateChange', function (state, error)
{
  if(state === SkylinkDemo.READY_STATE_CHANGE.COMPLETED)
  {//Skylink has been initialized we can join the default room
    var displayName = 'User_' + Math.floor((Math.random() * 1000) + 1);
    SkylinkDemo.joinRoom({
      userData: displayName,
      audio: false,
      video: false
    });
    var div = document.createElement('div');
    div.className = "alert alert-info msg-date";
    div.innerHTML = '<strong>Join Room "'+ROOMNAME+'"</strong>';  
    messageList.appendChild(div);
  }
  else if (state === SkylinkDemo.READY_STATE_CHANGE.ERROR)
  {//An error occured, let's find what
    for (var errorCode in SkylinkDemo.READY_STATE_CHANGE_ERROR)
    {
      if (SkylinkDemo.READY_STATE_CHANGE_ERROR[errorCode] === error.errorCode)
      {
        var div = document.createElement('div');
        div.className = "alert alert-danger msg-date";
        div.innerHTML = '<strong>Impossible to connect to Skylink: '+errorCode+'</strong>';  
        messageList.appendChild(div);
        break;
      }
    }
  }
});

//New User in the room, we add it to the user list
SkylinkDemo.on('peerJoined', function(peerId, peerInfo, isSelf)
{
  console.log("Peer Joined");
  var div = document.createElement('div');
  div.className = "media conversation";
  div.id = "User_"+peerId;
  div.innerHTML = '<div class="media-body">'+
          '<h5 id="UserTitle_'+peerId+'" class="media-heading">'+peerInfo.userData+((isSelf)?" (You)":"")+'</h5>'+
          '<small>'+peerId+'</small>'+
      '</div>';  
  userList.appendChild(div);
});


//User in the room changed his name
SkylinkDemo.on('peerUpdated', function(peerId, peerInfo, isSelf)
{
  document.getElementById("UserTitle_"+peerId).innerHTML = peerInfo.userData+((isSelf)?" (You)":"");
});

//User in the room left
SkylinkDemo.on('peerLeft', function(peerId, peerInfo, isSelf)
{
  document.getElementById("User_"+peerId).remove();
});

//User in the room (including us) sent a message
SkylinkDemo.on('incomingMessage', function(message, peerId, peerInfo, isSelf)
{
  var Name = peerInfo.userData + ((isSelf)?" (You)":"");
  addMessage(Name,message.content);
});

function setName(newName)
{
  if(newName != undefined)
  {
    newName = newName.trim();//Protection for empty user name
    if(newName != '')
    {
      console.log("Change User Name to "+newName);
      SkylinkDemo.setUserData(newName);
    }
  }
}
function setRoom(newRoom)
{
  if(newRoom != undefined)
  {
    newRoom = newRoom.trim();//Protection for joining room with empty name
    if(newRoom != '')
    {
      console.log("Change Room To "+newRoom);
      SkylinkDemo.joinRoom(newRoom);
      var div = document.createElement('div');
      div.className = "alert alert-info msg-date";
      div.innerHTML = '<strong>Join Room "'+newRoom+'"</strong>';  
      messageList.appendChild(div);
    }
  }
  
}
function sendMessage(message)
{
  if(message != undefined)
  {
    message = message.trim();//Protection for empty message
    if(message != '')
    {
      SkylinkDemo.sendP2PMessage(message);
    }
  }
}
function addMessage(user,message,className)
{
  var timestamp = new Date();
  var div = document.createElement('div');
  div.className = "media msg";
  div.innerHTML = '<div class="media-body">'+
        '<small class="pull-right time">'+
          '<i class="fa fa-clock-o"></i>'+timestamp.getHours()+':' + timestamp.getMinutes()+
        '</small>'+
        '<h5 class="media-heading">'+user+'</h5>'+
      '<small class="col-lg-10">'+message+'</small>'+
    '</div>';  
  messageList.appendChild(div);
  messageList.scrollTop = messageList.scrollHeight;
}
