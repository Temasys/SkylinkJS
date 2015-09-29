grunt jshint;
type="$1";
param="$2";

#Detect the type of test to run
function get_test () {
  echo "$1"
  echo "$type"
  echo "$param"
  case "$type" in
    test)
      echo "Running test '$param'..";
      case "$param" in
        event)
          browserify tests/tests/event.js | testling -x "$1";
          ;;
        socket)
          browserify tests/tests/socket.js | testling -x "$1";
          ;;
        api)
          browserify tests/tests/api.js | testling -x "$1";
          ;;
        webrtc)
          browserify tests/tests/webrtc.js | testling -x "$1";
          ;;
        peer)
          browserify tests/tests/peer.js | testling -x "$1";
          ;;
        message)
          browserify tests/tests/message.js | testling -x "$1";
          ;;
        transfer)
          browserify tests/tests/transfer.js | testling -x "$1";
          ;;
        async)
          browserify tests/tests/async.js | testling -x "$1";
          ;;
        debug)
          browserify tests/tests/debug.js | testling -x "$1";
          ;;
        stream)
          browserify tests/tests/stream.js | testling -x "$1";
          ;;
        sdp)
          browserify tests/tests/sdp.js | testling -x "$1";
          ;;
        helper)
          browserify tests/tests/helper.js | testling -x "$1";
          ;;
        screenshare)
          browserify tests/tests/screenshare.js | testling -x "$1";
          ;;
        *)
          echo "Test '$param' not found.";
      esac
      ;;
    bot)
      echo "Running bot for test '$param'..";
      case "$param" in
        webrtc)
          browserify tests/bots/webrtc.js | testling -x "$1";
          ;;
        peer)
          browserify tests/bots/peer.js | testling -x "$1";
          ;;
        message)
          browserify tests/bots/message.js | testling -x "$1";
          ;;
        transfer)
          browserify tests/bots/transfer.js | testling -x "$1";
          ;;
        async)
          browserify tests/bots/async.js | testling -x "$1";
          ;;
        sdp)
          browserify tests/bots/sdp.js | testling -x "$1";
          ;;
        stream)
          browserify tests/bots/stream.js | testling -x "$1";
          ;;
        screenshare)
          browserify tests/bots/screenshare.js | testling -x "$1";
          ;;
        *)
          echo "Bot '$param' not found.";
      esac
      ;;
    *)
      echo "Command '$type' not found.";
  esac
}

#Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  Linux)
    OS="Linux"
    get_test "google-chrome ";
    ;;
  FreeBSD)
    OS="FreeBSD"
    alias ls="ls -G"
    get_test "google-chrome ";
    ;;
  MINGW32_NT-6.1)
    OS="Windows"
    get_test "start 'C:/Program Files/Google/Chrome/Application/chrome.exe'";
    ;;
  Darwin)
    OS='Mac'
    get_test "open -a /Applications/Google\ Chrome.app";
    ;;
  AIX) ;;
  *) echo "OS $OS not recognized";;
esac
