#grunt karma #generate configs
grunt test

for filename in tests/gen/conf/firefox.stream-methods.conf.js; do
  karma start $filename
done
