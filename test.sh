echo "Running test '$1'";
grunt jshint;

#Detect the type of test to run
function get_test()
{
  case "$1" in
    event)
      echo "events-test";
      ;;
    start-bot)
      echo "start-bot";
      ;;
    webrtc)
      echo "webrtc-test";
      ;;
    *)
      echo "Command not found.";
  esac
}

#Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
    OS='Linux'
    browserify tests/$(get_test $1).js | testling -x "google-chrome ";
    ;;
  'FreeBSD')
    OS='FreeBSD'
    alias ls='ls -G'
    browserify tests/$(get_test $1).js | testling -x "google-chrome ";
    ;;
  'MINGW32_NT-6.1')
    OS='Windows'
    browserify tests/$(get_test $1).js | testling -x "'C:/Program Files/Google/Chrome/Application/chrome.exe'";
   ;;
  'Darwin')
    OS='Mac'
  browserify tests/$(get_test $1).js | testling -x "open -a /Applications/Google\ Chrome.app";
    ;;
  'AIX') ;;
  *) echo "OS $OS not recognized";;
esac