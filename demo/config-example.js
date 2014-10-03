/**************************** Note **********************************
 Save your api settings like apiKey, defaultRoom and room and save it
 in a file called [config.js]
*********************************************************************/
var SkywayDemo = new Skyway();
SkywayDemo.setLogLevel(SkywayDemo.LOG_LEVEL.DEBUG);
SkywayDemo.init({
	apiKey: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
	defaultRoom: "MY_DEFAULT_ROOM"
});