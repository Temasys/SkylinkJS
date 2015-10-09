param([string]$test, [string]$client)

karma start tests/gen/$client.$test.conf.js

function killBrowser{
	
}

killBrowser
#kill all node processes too