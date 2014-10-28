/**************************** Note **********************************
 Save your api settings like apiKey, defaultRoom and room and save it
 in a file called [config.js]
*********************************************************************/
var SkylinkDemo = new Skylink();
SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
SkylinkDemo.init({
	apiKey: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
	defaultRoom: "MY_DEFAULT_ROOM"
});
