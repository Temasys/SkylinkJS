#!/bin/sh

test="$1";
browser="$2";

# karma should only run a single test suite here
# Temporary solution: use different karma config files
# Possible to accept argument to karma and load only specific files ?
karma start tests/gen/$browser.$test.conf.js

#After test was run, close all remaining bots and node processes

kill_browser(){
	if [ $browser == "chrome" ]; 
	then
		killall -9 "Google Chrome"
	elif [ $browser == "firefox" ];
	then
		killall -9 "Firefox"
	elif [ $browser == "Opera" ];
	then
		killall -9 "Opera"
	elif [ $browser == "Safari" ];
	then
		killall -9 "Safari"
	fi
}

kill_browser
killall -9 node