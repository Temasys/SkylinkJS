#!/bin/sh
#TODO: Auto access webcam for bot (not client)

open_new_tab() {
        pwd=`pwd`
        osascript -e "tell application \"Terminal\"" \
        -e "tell application \"System Events\" to keystroke \"t\" using {command down}" \
        -e "do script \"cd $pwd; clear; $1;\" in front window" \
        -e "end tell"
        > /dev/null
}

run_without_bot(){
    test="$1";
    client="$2";
    open_new_tab "./test-client.sh $test $client"
    if [ $client == "chrome" ];
    then
        browserify tests/bot/"donothing-bot.js" | testling -x "open -a /Applications/Google\ Chrome.app"
    elif [ $client == "firefox" ]; 
    then
        browserify tests/bot/"donothing-bot.js" | testling -x "open -a /Applications/Firefox.app"
    elif [ $client == "opera" ]; 
    then
        browserify tests/bot/"donothing-bot.js" | testling -x "open -a /Applications/Opera.app"
    elif [ $client == "safari" ]; 
    then
        browserify tests/bot/"donothing-bot.js" | testling -x "open -a /Applications/Safari.app"
    fi
}

run_with_bot(){
    test="$1";
    bot="$2";
    client="$3";
    #open_new_tab "osascript click.scpt"
    open_new_tab "./test-client.sh $test $client"
    if [ $bot == "chrome" ];
    then
        browserify tests/bot/"$test.js" | testling -x "open -a /Applications/Google\ Chrome.app"
    elif [ $bot == "firefox" ]; 
    then
        browserify tests/bot/"$test.js" | testling -x "open -a /Applications/Firefox.app"
    elif [ $bot == "opera" ]; 
    then
        browserify tests/bot/"$test.js" | testling -x "open -a /Applications/Opera.app"
    elif [ $bot == "safari" ]; 
    then
        browserify tests/bot/"$test.js" | testling -x "open -a /Applications/Safari.app"
    fi
}

# run(){
#     #TODO: Determine whether bot is needed then run accordingly
# }

close_tab(){
    echo "closing tab"
    #TODO: Close all other terminal tabs either right here or let them kill themselves
}

run_without_bot event firefox

# run_with_bot async chrome chrome 
# run_without_bot helper chrome
# run_with_bot async firefox firefox
# run_without_bot helper opera
