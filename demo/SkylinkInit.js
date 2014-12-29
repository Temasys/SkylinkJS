(function()
{
  if(Config.apiKey === undefined)
    alert('No API configured, create one at "http://developer.temasys.com.sg" and fill the config.js file');
  else
  {
    var join_callback = function(error, success){
      if (error){
        console.log('callback error');
      }
      else{
        console.log('callback success');
      }
    }

    //------------------------------------------
    //Initialize Global Skylink Object
    SkylinkDemo.init(
    {
      apiKey: Config.apiKey,
      defaultRoom: Config.defaultRoom || 'default'
    }, join_callback);
  }
})();
