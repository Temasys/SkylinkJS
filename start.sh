#Must be run in background
sleep 1
#Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
    OS='Linux'
    google-chrome https://localhost:8082/demos/collection/kitchensink/index.html
    ;;
  'FreeBSD')
    OS='FreeBSD'
    alias ls='ls -G'
	google-chrome https://localhost:8082/demos/collection/kitchensink/index.html
    ;;
  'MINGW32_NT-6.1')
    OS='Windows'
	start chrome "https://localhost:8082/demos/collection/kitchensink/index.html"
    ;;
  'Darwin')
    OS='Mac'
    open -a /Applications/Google\ Chrome.app https://localhost:8082/demos/collection/kitchensink/index.html
    ;;
  'AIX') ;;
  *) echo "OS $OS not recognized";;
esac
