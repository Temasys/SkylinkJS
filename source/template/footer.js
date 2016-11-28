
  if(typeof exports !== 'undefined') {
    // Prevent breaking code
    module.exports = {
      Skylink: Skylink
    };
  }

  if (refThis) {
    refThis.Skylink = Skylink;
  }

  if (window) {
    window.Skylink = Skylink;
  }

})(this);
