grunt karma #generate configs

for filename in tests/gen/chrome.event.conf.js; do
  karma start $filename
done
