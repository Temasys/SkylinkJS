function openNewTab{
	param([string]$script);
	cmd /c start powershell.exe -noexit -command $script
}

function runWithoutBot{
	param([string]$test, [string]$client);
	openNewTab -script "./test-client.ps1 -test $test -client $client"
	If ($client -eq "chrome"){
		browserify tests/bot/donothing-bot.js | testling -x "start chrome.exe"
	}
	Elseif ($client -eq "firefox"){
		browserify tests/bot/donothing-bot.js | testling -x "start firefox.exe"
	}
	Elseif ($client -eq "opera"){
		browserify tests/bot/donothing-bot.js | testling -x "start opera.exe"
	}
	Elseif ($client -eq "ie"){
		browserify tests/bot/donothing-bot.js | testling -x "start ie.exe"
	}
}

function runWithBot{

	param([string]$test, [string]$bot, [string]$client);
	openNewTab -script "./test-client.ps1 -test $test -client $client"
	If ($client -eq "chrome"){
		browserify tests/bot/"$test-bot.js" | testling -x "start chrome.exe"
	}
	Elseif ($client -eq "firefox"){
		browserify tests/bot/"$test-bot.js" | testling -x "start firefox.exe"
	}
	Elseif ($client -eq "opera"){
		browserify tests/bot/"$test-bot.js" | testling -x "start opera.exe"
	}
	Elseif ($client -eq "ie"){
		browserify tests/bot/"$test-bot.js" | testling -x "start ie.exe"
	}

}

grunt karma
runWithoutBot -test event -client chrome

