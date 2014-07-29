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
    ;;
  'WindowsNT')
    OS='Windows'
    ;;
  'darwin') 
    OS='Mac'
    open -a /Applications/Google\ Chrome.app http://localhost:8081/demo/index.html
    ;;
  'SunOS')
    OS='Solaris'
    ;;
  'AIX') ;;
  *) ;;
esac