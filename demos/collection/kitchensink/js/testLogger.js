(function() {
  var oldLog = console.log;
  var logger = document.getElementById("log");
  var errorLogger = document.getElementById("errorLogger");
  console.log = function(message) {
    oldLog(message);
    var str = message;
    var startIndex = str.indexOf("(");
    var lastIndex = str.lastIndexOf(")");
    var result = str.slice(startIndex + 1, lastIndex);
    if (startIndex !== -1 && lastIndex !== -1) {
      logger.innerHTML +=
        "<pre style='color: green' id=" +
        result +
        ">" +
        result +
        "</pre>";
      logger.scrollTop = logger.scrollHeight;
    }
  };
  var oldError = console.error;
  console.error = function(message) {
    oldError(message);
    errorLogger.innerHTML +=
      "<pre id='error' style=" +
      "color:red;" +
      "id=" +
      message +
      ">" +
      message +
      "</pre>";
    errorLogger.scrollTop = errorLogger.scrollHeight;
  };
})();
