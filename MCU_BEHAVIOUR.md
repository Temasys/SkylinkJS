# MCU Behaviour

* The MCU platform uses AWS' autoscaling capabilities. Due to limitations to the scaling speed, during periods where the usage rises sharply, it can take some time for an MCU to be made available to your room. 
* We estimate that the max waiting time should be around 30 seconds.

#### Suggested implementation
* One way of handling the potential wait time is to show a loader after `joinRoom` is called. It is also good practise to hide views at this point so that the user does not make any call actions when the MCU is not yet available.
* The `SkylinkConstants.EVENTS.SERVER_PEER_JOINED` event indicates when the `MCU` has successfully connected to the local peer.
* A handler can be attached to the `SkylinkConstants.EVENTS.SERVER_PEER_JOINED` event to hide the loader and show the view.

#### Sample code
```
const skylink = new Skylink(config);
const showloader = () => {
    // show a loader and hide the view from the client
}
const hideloader = () => {
    // hide the loader and display the view on the client
}

// PEER_JOINED event with isSelf=true will always trigger before SERVER_PEER_JOINED event
// PEER_JOINED event with isSelf=false will trigger after the SERVER_PEER_JOINED event indicating that a remote peer has joined the room
SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.PEER_JOINED, () => {
    // handle peer joined events as usual
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.ON_INCOMING_STREAM, () => {
    // handle stream events as usual
});

SkylinkEventManager.addEventListener(SkylinkConstants.EVENTS.SERVER_PEER_JOINED, () => {
    // hideloader();
});

skylink.joinRoom(joinRoomOptions);
showloader();
```
* You can also reference our complete sample codes [here](demos/collection)

