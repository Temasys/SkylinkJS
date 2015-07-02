#grunt karma #generate configs
grunt test

for filename in tests/gen/conf/*.js; do
  karma start $filename
done
