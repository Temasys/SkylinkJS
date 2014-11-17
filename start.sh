#Must be run in background
sleep 1
#Detect the platform (similar to $OSTYPE)
OS="`uname`"
case $OS in
  'Linux')
    OS='Linux'
    google-chrome http://localhost:8081/demo/index.html
    ;;
  'FreeBSD')
    OS='FreeBSD'
    alias ls='ls -G'
	google-chrome http://localhost:8081/demo/index.html
    ;;
  'MINGW32_NT-6.1')
    OS='Windows'
	start chrome "http://localhost:8081/demo/index.html"
    ;;
  'Darwin')
    OS='Mac'
    open -a /Applications/Google\ Chrome.app http://192.168.1.64:8081/demo/patient-doctor
    ;;
  'AIX') ;;
  *) echo "OS $OS not recognized";;
esac