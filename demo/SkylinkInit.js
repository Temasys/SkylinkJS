(function()
{
  if(Config.apiKey === undefined)
    alert('No API configured, create one at "http://developer.temasys.com.sg" and fill the config.js file');
  else
  {
    //------------------------------------------
    //Initialize Global Skylink Object
    SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
    SkylinkDemo.init(
    {
      apiKey: Config.apiKey,
      defaultRoom: Config.defaultRoom || 'default'
    });
  }
})();
