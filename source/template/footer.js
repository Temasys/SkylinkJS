
  if(typeof exports !== 'undefined') {
    // Prevent breaking code
    module.exports = {
      Skylink: Skylink,
      SkylinkLogs: SkylinkLogs
    };
  } else if (globals) {
    globals.Skylink = Skylink;
    globals.SkylinkLogs = SkylinkLogs;
  } else if (window) {
    window.Skylink = Skylink;
    window.SkylinkLogs = SkylinkLogs;
  }

  if (refThis) {
    refThis.Skylink = Skylink;
  }
})(this);
