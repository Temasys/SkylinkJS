grunt karma #generate configs

for filename in tests/gen/*.js; do
  karma start $filename
done
