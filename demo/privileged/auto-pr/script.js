// config
var SkylinkDemo = new Skylink();
var Config = {
  //apiKey: "2fab4375-b0f0-439f-a674-9c4ba7b7926b", // auto-unpr 
  apiKey: "1eccac42-c2fa-47e0-82e4-2f2277fa20e2", // auto-pr
  //apiKey: "cd671d8c-e16a-4394-b144-7c6b092fc3d1", // unauto-pr
  //apiKey: "777bd768-0934-4588-b151-2aedb3d4f312", // unauto-unpr
  defaultRoom:"MY_DEFAULT_ROOM"
};

// script

// init
(function()
{
  SkylinkDemo.setLogLevel(SkylinkDemo.LOG_LEVEL.DEBUG);
  SkylinkDemo.init(Config);
})();