grunt jshint;
browserify tests/events_test.js | testling -x "'C:/Program Files/Google/Chrome/Application/chrome.exe'"
browserify tests/webrtc_p1-firefox_test.js | testling -x "'C:/Program Files/Mozilla Firefox/firefox.exe'"
browserify tests/webrtc_p2-chrome_test.js | testling -x "'C:/Program Files/Google/Chrome/Application/chrome.exe'"