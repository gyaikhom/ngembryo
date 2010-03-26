#! /bin/bash

echo "" > ng.js;

for x in utils models annotation icon iconManager layerManager labelRenderer marker2D region2D engine cookieManager overlays IIPManager dialogManager orientations layers resources toolbar controlManager tipper content ngembryo;
  do
  sed -e "s/console.info/\/\/console.info/g" $x.js | sed -e "s/console.log/\/\/console.log/g" | sed -e "s/console.warn/\/\/console.warn/g" | sed -e "s/console.debug/\/\/console.debug/g" >> ng.js;
done;

# Download yuicompressor from http://developer.yahoo.com/yui/compressor/
java -jar yuicompressor-2.4.2.jar ng.js -o temp.js;

cat header.js temp.js > ngc.js

rm temp.js;
rm ng.js;