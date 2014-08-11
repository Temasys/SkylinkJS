
#browserify tests/*.js | testling -x "open -a /Applications/Google\ Chrome.app";
#browserify tests/*.js | testling -x "google-chrome ";

grunt jshint;
#Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
    OS='Linux'
    browserify tests/*.js | testling -x "google-chrome ";
    ;;
  'FreeBSD')
    OS='FreeBSD'
    alias ls='ls -G'
	browserify tests/*.js | testling -x "google-chrome ";
    ;;
  'MINGW32_NT-6.1')
    OS='Windows'
	browserify tests/events_test.js | testling -x "start chrome "
    ;;
  'Darwin') 
    OS='Mac'
    browserify tests/*.js | testling -x "open -a /Applications/Google\ Chrome.app";
    ;;
  'AIX') ;;
  *) echo "OS $OS not recognized";;
esac
